import Like from '../../models/likeModel.js';
import Post from '../../models/postModel.js';
import Comment from '../../models/commentModel.js';
import Event from '../../models/eventModel.js';
import mongoose from 'mongoose';
import Notification from '../../models/notificationModel.js';
import redisClient from '../../config/redis.js';
import { invalidateCache, invalidateCacheByPattern } from '../../utils/cacheHelper.js';

export async function likeEvent(req, res) {
    try {
        const {eventId} = req.params;
        const userId = req.user._id;
        
        const isLike = await Like.findOne({userId, likeableId: eventId, likeableType: 'event'});
        
        // UNLIKE: Xóa like và giảm count
        if(isLike) {
            await Like.deleteOne({_id: isLike._id});
            const event = await Event.findByIdAndUpdate(
                eventId, 
                {$inc: {likesCount: -1}}, 
                {new: true}
            );
            if(!event) {
                return res.status(404).json({success: false, message: 'Event not found'});
            }
            
            // Invalidate caches when likesCount changes
            await invalidateCache(`event:detail:${eventId}`);
            await invalidateCacheByPattern('events:trending:*');
            
            return res.status(200).json({success: true, action: 'unliked', totalLikes: event.likesCount});
        }
        
        // LIKE: Tạo like + tăng count + notification
        const newLike = new Like({userId, likeableId: eventId, likeableType: 'event'});
        await newLike.save();
        
        const event = await Event.findByIdAndUpdate(
            eventId, 
            {$inc: {likesCount: 1}}, 
            {new: true, select: 'likesCount name managerId'}
        );
        if(!event) {
            return res.status(404).json({success: false, message: 'Event not found'});
        }
        
        // Notification - FIXED LOGIC
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
            }

            if(shouldSendNotification) {
                const newNotification = new Notification({
                    sender: userId,
                    recipient: event.managerId,
                    type: 'like',
                    content: `${req.user.username} liked your event "${event.name}".`,
                    event: eventId,
                });
                await newNotification.save();
                
                try {
                    await redisClient.setEx(cacheKey, 300, '1');
                } catch (redisError) {
                    console.error('Redis setEx error:', redisError);
                }
            }
        }
        
        // Invalidate caches when likesCount changes (affects trending score)
        await invalidateCache(`event:detail:${eventId}`);
        await invalidateCacheByPattern('events:trending:*');
        
        return res.status(200).json({success: true, action: 'liked', totalLikes: event.likesCount});
    } catch (error) {
        console.error('Error in likeEvent:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export async function likePost(req, res) {
    try {
        const {postId} = req.params;
        const userId = req.user._id;
        
        const isLike = await Like.findOne({userId, likeableId: postId, likeableType: 'post'});
        
        // UNLIKE
        if(isLike) {
            await Like.deleteOne({_id: isLike._id});
            const post = await Post.findByIdAndUpdate(
                postId, 
                {$inc: {likesCount: -1}}, 
                {new: true}
            );
            if(!post) {
                return res.status(404).json({success: false, message: 'Post not found'});
            }
            
            return res.status(200).json({success: true, action: 'unliked', totalLikes: post.likesCount});
        }
        
        // LIKE
        const newLike = new Like({userId, likeableId: postId, likeableType: 'post'});
        await newLike.save();
        
        const post = await Post.findByIdAndUpdate(
            postId, 
            {$inc: {likesCount: 1}}, 
            {new: true, select: 'likesCount author eventId'}
        );
        if(!post) {
            return res.status(404).json({success: false, message: 'Post not found'});
        }

        // Notification
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
                    event: post.eventId,
                });
                await newNotification.save();
                
                try {
                    await redisClient.setEx(cacheKey, 300, '1');
                } catch (redisError) {
                    console.error('Redis setEx error:', redisError);
                }
            }
        }
        
        return res.status(200).json({success: true, action: 'liked', totalLikes: post.likesCount});
    } catch (error) {
        console.error('Error in likePost:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export async function likeComment(req, res) {
    try {
        const {commentId} = req.params;
        const userId = req.user._id;
        
        const isLike = await Like.findOne({userId, likeableId: commentId, likeableType: 'comment'});
        
        // UNLIKE
        if(isLike) {
            await Like.deleteOne({_id: isLike._id});
            const comment = await Comment.findByIdAndUpdate(
                commentId, 
                {$inc: {likesCount: -1}}, 
                {new: true}
            );
            if(!comment) {
                return res.status(404).json({success: false, message: 'Comment not found'});
            }
            
            return res.status(200).json({success: true, action: 'unliked', totalLikes: comment.likesCount});
        }
        
        // LIKE
        const newLike = new Like({userId, likeableId: commentId, likeableType: 'comment'});
        await newLike.save();
        
        const comment = await Comment.findByIdAndUpdate(
            commentId, 
            {$inc: {likesCount: 1}}, 
            {new: true, select: 'likesCount author postId eventId'}
        );
        if(!comment) {
            return res.status(404).json({success: false, message: 'Comment not found'});
        }
        
        // Notification
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
            }
            
            if(shouldSendNotification) {
                const newNotification = new Notification({
                    sender: userId,
                    recipient: comment.author,
                    type: 'like',
                    content: `${req.user.username} liked your comment.`,
                    post: comment.postId,
                    event: comment.eventId,
                });
                await newNotification.save();
                
                try {
                    await redisClient.setEx(cacheKey, 300, '1');
                } catch (redisError) {
                    console.error('Redis setEx error:', redisError);
                }
            }
        }
        
        return res.status(200).json({success: true, action: 'liked', totalLikes: comment.likesCount});
    } catch (error) {
        console.error('Error in likeComment:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}