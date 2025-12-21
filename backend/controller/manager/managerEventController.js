import Event from "../../models/eventModel.js";
import Post from "../../models/postModel.js";
import Comment from "../../models/commentModel.js";
import Like from "../../models/likeModel.js";
import Registration from "../../models/registrationsModel.js";
import Notification from "../../models/notificationModel.js";
import User from "../../models/userModel.js";
import { invalidateCacheByPattern, invalidateCache } from '../../utils/cacheHelper.js';
import mongoose from 'mongoose';

export async function createEvent(req, res) {
    const { name, description, categories, activities, prepare, location, thumbnail, images, capacity, startDate, endDate, rewards, requirements } = req.body;
    const organizerId = req.user._id;
    try {
        if (!name || !description || !location || !capacity || !startDate || !endDate) {
            return res.status(400).json({success: false, message: "Missing required fields"});
        }
        const newEvent = new Event({
            name,
            description,
            managerId: organizerId,
            categories,
            activities,
            prepare,
            location,
            thumbnail,
            images,
            capacity,
            startDate,
            endDate,
            rewards,
            requirements
        })
        let saved = await newEvent.save();
        saved = await saved.populate('managerId', 'username email avatar');
        saved = await saved.populate('categories');
        
        // Invalidate admin dashboard cache as it tracks pending events
        await invalidateCache('dashboard:admin');
        await invalidateCache(`dashboard:manager:${organizerId}`);
        
        res.status(201).json({success: true, event: saved});
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({success: false, message: "Failed to create event"});
    }
}

export async function updateEvent(req, res) {
    const eventId = req.params.id;
    const managerId = req.user._id;
    
    try {
        // Check if event exists and belongs to manager
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({success: false, message: "Event not found"});
        }
        
        // Check ownership
        if (event.managerId.toString() !== managerId.toString()) {
            return res.status(403).json({success: false, message: "Unauthorized to update this event"});
        }
        
        const data = {...req.body, updatedAt: Date.now()};
        const updatedEvent = await Event.findByIdAndUpdate(eventId, data, {new: true, runValidators: true})
            .populate('managerId', 'username email avatar')
            .populate('categories');
        
        // Xóa cache sau khi update event
        await invalidateCacheByPattern('events:*');        // Xóa tất cả danh sách events
        await invalidateCacheByPattern('search:events:*'); // Xóa cache tìm kiếm events
        await invalidateCacheByPattern(`event:detail:*`);  // Xóa tất cả cache chi tiết events
        await invalidateCache(`dashboard:manager:${managerId}`); // Update manager dashboard stats
            
        res.status(200).json({success: true, event: updatedEvent});
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({success: false, message: "Failed to update event"});
    }
}

export async function deleteEvent(req, res) {
    const eventId = req.params.id;
    const managerId = req.user._id;
    
    try {
        // Check if event exists and belongs to manager
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({success: false, message: "Event not found"});
        }
        
        // Check ownership
        if (event.managerId.toString() !== managerId.toString()) {
            return res.status(403).json({success: false, message: "Unauthorized to delete this event"});
        }
        
        const postIds = await Post.find({ eventId }).distinct('_id');
        
        // Get all comment IDs to delete their likes
        const commentIds = await Comment.find({ 
            $or: [
                { eventId },
                { postId: { $in: postIds } }
            ]
        }).distinct('_id');
        
        const [
            deletedComments,
            deletedLikes,
            deletedRegistrations,
            deletedNotifications,
            updatedUsers,
            deletedPosts,
            deletedEvent
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
                    { likeableId: { $in: postIds.map(id => id.toString()) }, likeableType: 'post' },
                    { likeableId: { $in: commentIds.map(id => id.toString()) }, likeableType: 'comment' }
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
            
            Post.deleteMany({ eventId }),
            
            Event.findByIdAndDelete(eventId)
        ]);
        
        // Xóa cache sau khi delete event
        await invalidateCacheByPattern('events:*');
        await invalidateCacheByPattern('search:events:*');
        await invalidateCacheByPattern(`event:detail:*`);
        await invalidateCache(`dashboard:manager:${managerId}`); // Update manager dashboard stats
        
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

export async function getEventsByManager(req, res) {
    const managerId = req.user._id; // Get from authenticated user, not params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const [events, total] = await Promise.all([
            await Event.find({managerId})
            .populate('managerId', 'username email avatar')
            .populate('categories')
            .sort({ createdAt: -1 })
            .lean(),
            Event.countDocuments({managerId})
        ]);
        if(!events || events.length === 0) {
            return res.status(404).json({ success: false, message: "No events found for this manager" });
        }
        res.status(200).json({
            success: true,
            events,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    }
    catch(err){
        console.error("Error fetching events by manager ID:", err);
        res.status(500).json({success: false, message: "Server error" });
    }   
}

export async function getTotalConfirmedVolunteers(req, res) {
    try {
        const managerId = req.user._id;
        
        // Lấy tất cả event IDs của manager (tối ưu với distinct)
        const eventIds = await Event.find({ managerId }).distinct('_id');
        
        if (!eventIds || eventIds.length === 0) {
            return res.status(404).json({
                success: false,
                totalVolunteers: 0,
                totalEvents: 0,
                message: "No events found for this manager"
            });
        }
        
        // Đếm tổng số registration đã được duyệt (confirmed hoặc completed)
        const totalConfirmedVolunteers = await Registration.countDocuments({
            eventId: { $in: eventIds },
            status: { $in: ['confirmed', 'completed'] }
        });
        
        res.status(200).json({
            success: true,
            totalVolunteers: totalConfirmedVolunteers,
            totalEvents: eventIds.length
        });
    } catch (error) {
        console.error("Error getting total confirmed volunteers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get total confirmed volunteers"
        });
    }
}

/**
 * Mark an event as completed early
 * This allows managers to complete events before the scheduled end date
 */
export async function completeEventEarly(req, res) {
    const eventId = req.params.id;
    const managerId = req.user._id;
    
    try {
        // Check if event exists and belongs to manager
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({success: false, message: "Event not found"});
        }
        
        // Check ownership
        if (event.managerId.toString() !== managerId.toString()) {
            return res.status(403).json({success: false, message: "Unauthorized to complete this event"});
        }
        
        // Only approved events can be completed early
        if (event.status !== 'approved') {
            return res.status(400).json({
                success: false, 
                message: `Cannot complete event. Current status: ${event.status}. Only approved events can be completed.`
            });
        }
        
        // Update event status to completed
        event.status = 'completed';
        event.updatedAt = Date.now();
        await event.save();
        
        // Note: Registrations remain as 'confirmed' - manager must manually mark volunteers as completed
        
        // Populate for response
        const updatedEvent = await Event.findById(eventId)
            .populate('managerId', 'username email avatar')
            .populate('categories');
        
        // Invalidate caches
        await invalidateCacheByPattern('events:*');
        await invalidateCacheByPattern('search:events:*');
        await invalidateCacheByPattern(`event:detail:*`);
        await invalidateCache(`dashboard:manager:${managerId}`);
        
        res.status(200).json({
            success: true, 
            message: "Event completed successfully. You can now mark volunteers as completed.",
            event: updatedEvent
        });
    } catch (error) {
        console.error("Error completing event early:", error);
        res.status(500).json({success: false, message: "Failed to complete event"});
    }
}