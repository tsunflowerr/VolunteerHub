import User from "../../models/userModel.js"
import bcrypt from "bcrypt"
import mongoose from "mongoose"
import Post from "../../models/postModel.js"
import Registration from "../../models/registrationsModel.js"
import Comment from "../../models/commentModel.js"
import Like from "../../models/likeModel.js"
import Notification from "../../models/notificationModel.js"

export async function getUserProfile(req, res) {
    try {
        const user = await User.findById(req.user._id).select("-password")
        if(!user) {
            return res.status(404).json({success: false, message: "User not found"})
        }
        res.status(200).json({success: true, user})
    } catch(err) {
        console.error("Error fetching user profile:", err)
        res.status(500).json({success:false, message:"Server error"})
    }
}

export async function updateUserProfile(req, res) {
    const {username, email, avatar, phone_number} = req.body
    try {
        const existingUser = await User.findOne({email, _id: {$ne: req.user._id}})
        if(existingUser) {
            return res.status(400).json({success: false, message: "Email already in use"})
        }
        const user = await User.findByIdAndUpdate(req.user._id, {username, email, avatar, phone_number}, {new: true}).select("-password")
        res.status(200).json({success: true, user})
    } catch(err) {
        console.error("Error updating user profile:", err)
        res.status(500).json({success:false, message:"Server error"})
    }
}

export async function deleteUser(req, res) {
    try {
        const userId = req.user._id;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        const deleteUser = await User.findByIdAndDelete(userObjectId);
        if (!deleteUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        
        // Step 1: Get all events managed by this user
        const userEvents = await Event.find({ managerId: userObjectId }).select('_id').lean();
        const eventIds = userEvents.map(e => e._id);
        
        // Step 2: Get all posts in those events
        const eventPosts = await Post.find({ eventId: { $in: eventIds } }).select('_id').lean();
        const eventPostIds = eventPosts.map(p => p._id);
        const eventPostIdsStr = eventPostIds.map(id => id.toString());

        const commentsByUserPosts = await Comment.find({ postId: { $in: eventPostIds } }).select('_id').lean();
        const commentsByUserPostIds = commentsByUserPosts.map(c => c._id);
        
        // Step 3: Cascade delete everything in parallel
        await Promise.all([
            // Delete user's events
            Event.deleteMany({ managerId: userObjectId }),
            
            // Delete posts in user's events
            Post.deleteMany({ eventId: { $in: eventIds } }),
            
            // Delete user's own posts
            Post.deleteMany({ author: userObjectId }),
            
            // Delete comments in user's event posts
            Comment.deleteMany({
                $or: [
                    { eventId: { $in: eventIds } },
                    { postId: { $in: eventPostIds } },
                    { author: userObjectId } // User's comments
                ]
            }),
            
            // Delete likes related to user's events/posts/comments
            Like.deleteMany({
                $or: [
                    { userId: userObjectId }, // User's likes
                    { likeableId: { $in: eventIds.map(id => id.toString()) }, likeableType: 'event' },
                    { likeableId: { $in: eventPostIdsStr }, likeableType: 'post' },
                    { likeableId: { $in: commentsByUserPostIds.map(id => id.toString()) }, likeableType: 'comment' }
                ]
            }),
            
            // Delete registrations
            Registration.deleteMany({
                $or: [
                    { userId: userObjectId },
                    { eventId: { $in: eventIds } }
                ]
            }),
            
            // Delete notifications
            Notification.deleteMany({
                $or: [
                    { sender: userObjectId },
                    { recipient: userObjectId },
                    { event: { $in: eventIds } },
                    { post: { $in: eventPostIds } }
                ]
            }),
            
            // Remove user from other users' bookmarks
            User.updateMany(
                { bookmarks: userObjectId },
                { $pull: { bookmarks: userObjectId } }
            )
        ]);
        
        res.status(200).json({ success: true, message: "User and all related data deleted successfully" });
    } catch(err) {
        console.error("Error deleting user:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export async function changePassword(req, res) {
    const {current_password, new_password, confirm_new_password} = req.body
    if(new_password !== confirm_new_password) {
        return res.status(400).json({success: false, message: "New password and confirmation do not match"})
    }
    try {
        const user = await User.findById(req.user._id).select("password")
        if(!user) {
            return res.status(404).json({success: false, message: "User not found"})
        }
        const isMatch = await bcrypt.compare(current_password, user.password)
        if(!isMatch) {
            return res.status(400).json({success: false, message: "Current password is incorrect"})
        }
        user.password = await bcrypt.hash(new_password, 10)
        await user.save()
        res.status(200).json({success: true, message: "Password changed successfully"})
    } catch(err) {
        console.error("Error changing password:", err)
        res.status(500).json({success:false, message:"Server error"})
    }
}

export async function getUserById(req, res) {
    const userId = req.params.id
    try {
        const user = await User.findById(userId).select("-password")
        if(!user) {
            return res.status(404).json({success: false, message: "User not found"})
        }
        res.status(200).json({success: true, user})
    } catch(err) {
        console.error("Error fetching user:", err)
        res.status(500).json({success:false, message:"Server error"})
    }
}

export async function getUserBookMarks(req, res) {
    try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId)
        .select('bookmarks')
        .populate({
            path: 'bookmarks',
            select: "name description managerId category thumbnail images likesCount viewCount startDate endDate location capacity status createdAt",
            populate: [
                { path: 'managerId', select: 'username avatar' },
                { path: 'category', select: 'name slug' }
            ]
        });
        if(!user) {
            return res.status(404).json({success:false, message:"User not found"})
        }
        res.status(200).json({success:true, bookmarks: user.bookmarks});
    }
    catch(error) {
        console.log('Error fetching user bookmarks:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}


