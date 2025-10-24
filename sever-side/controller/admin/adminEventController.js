import Event from "../../models/eventModel.js";
import Post from "../../models/postModel.js";
import Comment from "../../models/commentModel.js";
import Like from "../../models/likeModel.js";
import Registration from "../../models/registrationsModel.js";
import Notification from "../../models/notificationModel.js";
import User from "../../models/userModel.js";
import redisClient from '../../config/redis.js';
import { createAndSendNotification } from '../../utils/notificationHelper.js';

export async function getPendingEvents(req, res) {
    try{
        const events = await Event.find({status: 'pending'})
            .populate('managerId', 'username email avatar')
            .populate('category', 'name slug')
            .sort({ createdAt: -1 });
            
        if(!events || events.length === 0) {
            return res.status(404).json({ success: false, message: "No pending events found" });
        }
        res.status(200).json({ success: true, events });
    } catch (error) {
        console.error("Error fetching pending events:", error);
        res.status(500).json({ success: false, message: "Failed to fetch pending events" });
    }
}

export async function updateStatusEvent(req, res) { 
    const eventId = req.params.id;
    const { status } = req.body; // expected values: "approved", "rejected", "cancelled", "completed"
    try {
        if (!['approved', 'rejected', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event not found" });
        }
        
        // Prevent changing status if already approved/rejected
        if (status === 'approved' && event.status === 'rejected') {
            return res.status(400).json({ success: false, message: "Cannot approve a rejected event" });
        }
        
        const updatedEvent = await Event.findByIdAndUpdate(eventId, { status }, { new: true });
        
        const notificationData = {
            recipient: updatedEvent.managerId,
            sender: req.user._id,
            type: status,
            content: `Your event "${updatedEvent.name}" has been ${status}.`,
            event: eventId,
        };
        const adminPushPayload = {
            title: `Event ${status.charAt(0).toUpperCase() + status.slice(1)}!`,
            body: `Your event "${updatedEvent.name}" has been ${status}.`,
            icon: req.user.avatar || '/default-avatar.png'
        };
        const cacheKey = `event:${eventId}:${status}`;
        let shouldSendNotification = true;
        try {
            const isRecent = await redisClient.get(cacheKey);
            if (isRecent) {
                shouldSendNotification = false;
            }
        } catch (error) {
            console.error("Error checking Redis cache:", error);
        }

        if(shouldSendNotification) {
            createAndSendNotification(notificationData, adminPushPayload);
            try {
                await redisClient.setEx(cacheKey, 300, '1');
            }
            catch(redisError) {
                console.error("Error setting Redis cache:", redisError);
            }
        }
        res.status(200).json({ success: true, event: updatedEvent });
    } catch (error) {
        console.error("Error updating event status:", error);
        res.status(500).json({ success: false, message: "Failed to update event status" });
    }
}

export async function deleteEvent(req, res) {
    const eventId = req.params.id;
    
    try {
        // Admin can delete any event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({success: false, message: "Event not found"});
        }
        
        const postIds = await Post.find({ eventId }).distinct('_id');
        const postIdsStr = postIds.map(id => id.toString());
        const [
            deletedComments,
            deletedLikes,
            deletedRegistrations,
            deletedNotifications,
            updatedUsers,
            deletedPosts
        ] = await Promise.all([
            Comment.deleteMany({ 
                $or: [
                    { eventId },
                    { postId: { $in: postIds } }
                ]
            }),
            
            Like.deleteMany({
                $or: [
                    { likeableId: eventId.toString(), likeableType: 'event' },
                    { likeableId: { $in: postIdsStr }, likeableType: 'post' }
                ]
            }),
            Registration.deleteMany({ eventId }),
            
            Notification.deleteMany({ 
                $or: [
                    { event: eventId },
                    { post: { $in: postIds } }
                ]
            }),
            
            User.updateMany(
                { bookmarks: eventId },
                { $pull: { bookmarks: eventId } }
            ),
            
            Post.deleteMany({ eventId })
        ]);
        
        await Event.findByIdAndDelete(eventId);
        
        res.status(200).json({
            success: true, 
            message: "Event and all related data deleted successfully",
            details: {
                comments: deletedComments.deletedCount,
                likes: deletedLikes.deletedCount,
                registrations: deletedRegistrations.deletedCount,
                notifications: deletedNotifications.deletedCount,
                posts: deletedPosts.deletedCount,
                bookmarks: updatedUsers.modifiedCount
            }
        });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({success: false, message: "Failed to delete event"});
    }
}
