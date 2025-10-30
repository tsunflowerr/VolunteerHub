import Post from '../../models/postModel.js';
import Event from '../../models/eventModel.js';
import Comment from '../../models/commentModel.js';
import Like from '../../models/likeModel.js';
import Notification from '../../models/notificationModel.js';
import redisClient from '../../config/redis.js';
import mongoose from 'mongoose';

export async function createPost(req, res) {
    // 🔒 START TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const eventId = req.params.eventId;
        const { title, content, image } = req.body;
        
        const event = await Event.findById(eventId).session(session);
        if (!event) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        if(event.status === 'pending' || event.status === 'rejected' || event.status === 'draft') {
            await session.abortTransaction();
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot create post when event is not approved' 
            });
        }
        
        // 🔹 Step 1: Create post (với session)
        const post = new Post({
            title,
            content,
            author: req.user._id,
            image: image || [],
            eventId
        });

        let saved = await post.save({ session });
        saved = await saved.populate('author', 'username email avatar');

        // 🔹 Step 2: Increase postsCount in Event (với session)
        await Event.findByIdAndUpdate(
            eventId, 
            { $inc: { postsCount: 1 } },
            { session }
        );

        // 🔹 Step 3: Create notification (với session, nếu cần)
        let shouldSendNotification = true;
        const cacheKey = `new_post_event_${eventId}:${req.user._id}`;
        try {
            const isRecent = await redisClient.exists(cacheKey);
            if(isRecent) {
                shouldSendNotification = false;
            }
        } catch(err) {
            console.error('Redis error:', err);
        }
        
        if(shouldSendNotification) {
            const newNotification = new Notification({
                recipient: event.managerId,
                sender: req.user._id,
                type: 'new_post',
                content: `A new post has been created in your event "${event.name}".`,
                event: eventId,
            });
            await newNotification.save({ session });
            try {
                await redisClient.setEx(cacheKey, 300, '1');
            }
            catch(err) {
                console.error('Redis error:', err);
            }
        }

        // ✅ Tất cả thành công → COMMIT
        await session.commitTransaction();

        res.status(201).json({
            success: true,
            post: saved
        });
    } catch (error) {
        // ❌ Có lỗi → ROLLBACK tất cả
        await session.abortTransaction();
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    } finally {
        // 🔓 Đóng session
        session.endSession();
    }
}

export async function getAllPosts(req, res) {
    const eventId = req.params.eventId;
    const {page = 1, limit = 10} = req.query;
    try {
        const [posts, total] = await Promise.all([
            Post.find({ eventId })
                .populate('author', 'username email avatar')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Post.countDocuments({ eventId })
        ]);
        res.status(200).json({ 
            success: true, 
            posts,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function updatePost(req, res) {
    try {
        const { eventId, postId } = req.params;
        const { title, content, image } = req.body;
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        const now = new Date();
        if (event.endDate && now > event.endDate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot update post after event has ended' 
            });
        }

        const updateData = {
            ...(title && { title }),
            ...(content && { content }),
            ...(image !== undefined && { image }),
            updatedAt: new Date()
        };
        
        const updatedPost = await Post.findByIdAndUpdate(
            {
                _id: postId,
                eventId: eventId,
                author: req.user._id
            },
            updateData,
            { new: true, runValidators: true }
        ).populate('author', 'username email avatar');
        if (!updatedPost) {
            return res.status(404).json({ success: false, message: 'Post not found or you are not the author' });
        }
        res.status(200).json({ success: true, post: updatedPost });
        
    } catch(error) {
        console.error('Error updating post:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function deletePost(req, res) {
    // 🔒 START TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { eventId, postId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        const post = await Post.findOne({ _id: postId, eventId: eventId }).populate('eventId').session(session);
        if(!post) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        
        const event = post.eventId;
        const isAdmin = userRole === 'admin';
        const isManager = userRole === 'manager' && event.managerId.toString() === userId.toString();
        const isAuthor = post.author.toString() === userId.toString();
        
        if (!isAdmin && !isManager && !isAuthor) {
            await session.abortTransaction();
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized: You do not have permission to delete this post' 
            });
        }
        
        // 🔹 CASCADE DELETE (tất cả với session)
        const [deletedComments, deletedLikes, deletedNotifications] = await Promise.all([
            Comment.deleteMany({ postId: postId }, { session }),
            Like.deleteMany({ 
                likeableId: postId.toString(), 
                likeableType: 'post' 
            }, { session }),
            Notification.deleteMany({ post: postId }, { session }),
            Post.findByIdAndDelete(postId, { session })
        ]);
        
        // Update event postsCount
        await Event.findByIdAndUpdate(eventId, { 
            $inc: { postsCount: -1 },
            $max: { postsCount: 0 }  
        }, { session });
        
        // ✅ Tất cả thành công → COMMIT
        await session.commitTransaction();
        
        res.status(200).json({ 
            success: true, 
            message: 'Post and all related data deleted successfully',
            details: {
                comments: deletedComments.deletedCount,
                likes: deletedLikes.deletedCount,
                notifications: deletedNotifications.deletedCount
            }
        });
        
    } catch(error) {
        // ❌ Có lỗi → ROLLBACK tất cả
        await session.abortTransaction();
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    } finally {
        // 🔓 Đóng session
        session.endSession();
    }
}
