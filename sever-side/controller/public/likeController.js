import Like from '../../models/likeModel.js';
import Post from '../../models/postModel.js';
import Comment from '../../models/commentModel.js';
import Event from '../../models/eventModel.js';
import mongoose from 'mongoose';
import Notification from '../../models/notificationModel.js';
import redisClient from '../../config/redis.js';

export async function likeEvent(req, res) {
    // 🔒 START TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const {eventId} = req.params;
        const userId = req.user._id;
        
        const isLike = await Like.findOne({userId, likeableId: eventId, likeableType: 'event'}).session(session);
        
        // UNLIKE: Xóa like và giảm count
        if(isLike) {
            await Like.deleteOne({_id: isLike._id}, { session });
            const event = await Event.findByIdAndUpdate(
                eventId, 
                {$inc: {likesCount: -1}}, 
                {new: true, session}
            );
            if(!event) {
                await session.abortTransaction();
                return res.status(404).json({success: false, message: 'Event not found'});
            }
            
            // ✅ COMMIT
            await session.commitTransaction();
            return res.status(200).json({success: true, action: 'unliked', totalLikes: event.likesCount});
        }
        
        // LIKE: Tạo like + tăng count + notification
        const newLike = new Like({userId, likeableId: eventId, likeableType: 'event'});
        await newLike.save({ session });
        
        const event = await Event.findByIdAndUpdate(
            eventId, 
            {$inc: {likesCount: 1}}, 
            {new: true, select: 'likesCount name managerId', session}
        );
        if(!event) {
            await session.abortTransaction();
            return res.status(404).json({success: false, message: 'Event not found'});
        }
        
        // Notification (với session) - FIXED LOGIC
        // Không gửi notification nếu user tự like event của mình
        if(!userId.equals(event.managerId)) {
            const cacheKey = `like_notification:${userId}:${event.managerId}:like:${eventId}`;
            let shouldSendNotification = true;
            
            try {
                const isRecent = await redisClient.exists(cacheKey);
                if(isRecent) {
                    shouldSendNotification = false;
                }
            } catch(redisError) {
                console.error('Redis error:', redisError);
                // Fallback: vẫn gửi notification nếu Redis lỗi
            }

            if(shouldSendNotification) {
                const newNotification = new Notification({
                    sender: userId,
                    recipient: event.managerId,
                    type: 'like',
                    content: `${req.user.username} liked your event "${event.name}".`,
                    event: eventId,
                });
                await newNotification.save({ session });
                
                try {
                    await redisClient.setEx(cacheKey, 300, '1');
                } catch (redisError) {
                    console.error('Redis setEx error:', redisError);
                }
            }
        }
        
        // ✅ COMMIT
        await session.commitTransaction();
        return res.status(200).json({success: true, action: 'liked', totalLikes: event.likesCount});
    } catch (error) {
        // ❌ ROLLBACK
        await session.abortTransaction();
        console.error('Error in likeEvent:', error);
        res.status(500).json({success: false, message: 'Server error'});
    } finally {
        // 🔓 Đóng session
        session.endSession();
    }
}

export async function likePost(req, res) {
    // 🔒 START TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const {postId} = req.params;
        const userId = req.user._id;
        
        const isLike = await Like.findOne({userId, likeableId: postId, likeableType: 'post'}).session(session);
        
        // UNLIKE
        if(isLike) {
            await Like.deleteOne({_id: isLike._id}, { session });
            const post = await Post.findByIdAndUpdate(
                postId, 
                {$inc: {likesCount: -1}}, 
                {new: true, session}
            );
            if(!post) {
                await session.abortTransaction();
                return res.status(404).json({success: false, message: 'Post not found'});
            }
            
            // ✅ COMMIT
            await session.commitTransaction();
            return res.status(200).json({success: true, action: 'unliked', totalLikes: post.likesCount});
        }
        
        // LIKE
        const newLike = new Like({userId, likeableId: postId, likeableType: 'post'});
        await newLike.save({ session });
        
        const post = await Post.findByIdAndUpdate(
            postId, 
            {$inc: {likesCount: 1}}, 
            {new: true, select: 'likesCount author', session}
        );
        if(!post) {
            await session.abortTransaction();
            return res.status(404).json({success: false, message: 'Post not found'});
        }

        // Notification (với session)
        // Không gửi notification nếu user tự like post của mình
        if(!userId.equals(post.author)) {
            const cacheKey = `like_notification:${userId}:${post.author}:like:${postId}`;
            let shouldSendNotification = true;
            
            try {
                const isRecent = await redisClient.exists(cacheKey);
                if (isRecent) {
                    shouldSendNotification = false;
                }
            } catch (redisError) {
                console.error('Redis error:', redisError);
            }
            
            if(shouldSendNotification) {
                const newNotification = new Notification({
                    sender: userId,
                    recipient: post.author,
                    type: 'like',
                    content: `${req.user.username} liked your post.`,
                    post: postId,
                });
                await newNotification.save({ session });
                
                try {
                    await redisClient.setEx(cacheKey, 300, '1');
                } catch (redisError) {
                    console.error('Redis setEx error:', redisError);
                }
            }
        }
        
        // ✅ COMMIT
        await session.commitTransaction();
        return res.status(200).json({success: true, action: 'liked', totalLikes: post.likesCount});
    } catch (error) {
        // ❌ ROLLBACK
        await session.abortTransaction();
        console.error('Error in likePost:', error);
        res.status(500).json({success: false, message: 'Server error'});
    } finally {
        // 🔓 Đóng session
        session.endSession();
    }
}

export async function likeComment(req, res) {
    // 🔒 START TRANSACTION
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const {commentId} = req.params;
        const userId = req.user._id;
        
        const isLike = await Like.findOne({userId, likeableId: commentId, likeableType: 'comment'}).session(session);
        
        // UNLIKE
        if(isLike) {
            await Like.deleteOne({_id: isLike._id}, { session });
            const comment = await Comment.findByIdAndUpdate(
                commentId, 
                {$inc: {likesCount: -1}}, 
                {new: true, session}
            );
            if(!comment) {
                await session.abortTransaction();
                return res.status(404).json({success: false, message: 'Comment not found'});
            }
            
            // ✅ COMMIT
            await session.commitTransaction();
            return res.status(200).json({success: true, action: 'unliked', totalLikes: comment.likesCount});
        }
        
        // LIKE
        const newLike = new Like({userId, likeableId: commentId, likeableType: 'comment'});
        await newLike.save({ session });
        
        const comment = await Comment.findByIdAndUpdate(
            commentId, 
            {$inc: {likesCount: 1}}, 
            {new: true, select: 'likesCount author postId', session}
        );
        if(!comment) {
            await session.abortTransaction();
            return res.status(404).json({success: false, message: 'Comment not found'});
        }
        
        // Notification (với session)
        // Không gửi notification nếu user tự like comment của mình
        if(!userId.equals(comment.author)) {
            const cacheKey = `like_notification:${userId}:${comment.author}:like:${commentId}`;
            let shouldSendNotification = true;
            
            try {
                const isRecent = await redisClient.exists(cacheKey);
                if (isRecent) {
                    shouldSendNotification = false;
                }
            } catch (redisError) {
                console.error('Redis error:', redisError);
                // Fallback: vẫn gửi notification nếu Redis lỗi
            }
            
            if(shouldSendNotification) {
                const newNotification = new Notification({
                    sender: userId,
                    recipient: comment.author,
                    type: 'like',
                    content: `${req.user.username} liked your comment.`,
                    post: comment.postId,
                });
                await newNotification.save({ session });
                
                try {
                    await redisClient.setEx(cacheKey, 300, '1');
                } catch (redisError) {
                    console.error('Redis setEx error:', redisError);
                }
            }
        }
        
        // ✅ COMMIT
        await session.commitTransaction();
        return res.status(200).json({success: true, action: 'liked', totalLikes: comment.likesCount});
    } catch (error) {
        // ❌ ROLLBACK
        await session.abortTransaction();
        console.error('Error in likeComment:', error);
        res.status(500).json({success: false, message: 'Server error'});
    } finally {
        // 🔓 Đóng session
        session.endSession();
    }
}