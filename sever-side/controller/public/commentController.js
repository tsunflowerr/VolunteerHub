import Comment from '../../models/commentModel.js';
import Post from "../../models/postModel.js";
import Event from "../../models/eventModel.js";
import NotificationModel from '../../models/notificationModel.js';
import Like from '../../models/likeModel.js';
import redisClient from '../../config/redis.js';

async function checkEventStatus(eventId) {
    const event = await Event.findById(eventId).select('status endDate');
    if (!event) {
        return { success: false, status: 404, message: 'Event not found' };
    }
    if (event.status !== 'approved') {
        return { success: false, status: 400, message: 'Cannot comment when event is not approved' };
    }
    if (event.endDate && new Date() > event.endDate) {
        return { success: false, status: 400, message: 'Cannot comment after event has ended' };
    }
    return { success: true };
}


export async function addComment(req, res) {
    try {
        const {eventId, postId} = req.params;  
        const {content} = req.body;
        if(!content || !content.trim()) {
            return res.status(400).json({success: false, message: 'Content is required'});
        }

        const eventCheck = await checkEventStatus(eventId);
        if (!eventCheck.success) {
            return res.status(eventCheck.status).json({ success: false, message: eventCheck.message });
        }

        const post = await Post.findOne({_id: postId, eventId})
        if(!post) {
            return res.status(404).json({success: false, message: 'Post not found in this event'});
        }
        const comment = new Comment({
            postId,
            eventId,
            content: content.trim(),
            author: req.user._id,
        });

        const saved = await comment.save();
        await saved.populate('author', 'username email avatar');

        await Post.findByIdAndUpdate(postId, {$inc: {commentsCount: 1}});

        const cacheKey = `comment_notification:${req.user._id}:${post.author}:comment:${postId}`;
        try {
            const isRecent = await redisClient.exists(cacheKey)
            if(!isRecent) {
                const newNotification = new NotificationModel({
                    sender: req.user._id,
                    recipient: post.author,
                    type: 'comment',
                    content: `${req.user.username} commented on your post "${post.title}".`,
                    post: postId,
                });
                await newNotification.save();
                await redisClient.setEx(cacheKey, 300, '1');
            }
        } catch (redisError) {
            console.error('Redis error:', redisError);
            const newNotification = new NotificationModel({
                sender: req.user._id,
                recipient: post.author,
                type: 'comment',
                content: `${req.user.username} commented on your post "${post.title}".`,
                post: postId,
            });
            await newNotification.save();
        }
        res.status(201).json({success: true, comment: saved});
    }
    catch(error) {
        console.error('Error adding comment:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export async function replyComment(req, res) {
    try {
        const {eventId, postId, commentId} = req.params;
        const {content} = req.body;
        
        if(!content || !content.trim()) {
            return res.status(400).json({success: false, message: 'Content is required'});
        }

        const eventCheck = await checkEventStatus(eventId);
        if (!eventCheck.success) {
            return res.status(eventCheck.status).json({ success: false, message: eventCheck.message });
        }

        const parentComment = await Comment.findOne({_id: commentId, postId, eventId})
        if(!parentComment) {
            return res.status(404).json({success: false, message: 'Parent comment not found'});
        }

        const reply = new Comment({
            postId,
            eventId,
            content: content.trim(),
            author: req.user._id,
            parentComment: commentId,
        });

        const saved = await reply.save();
        await saved.populate('author', 'username email avatar');
        await Post.findByIdAndUpdate(postId, {$inc: {commentsCount: 1}});

        const cacheKey = `comment_reply_notification:${req.user._id}:${parentComment.author}:comment_reply:${postId}`;
        try {
            const isRecent = await redisClient.exists(cacheKey);
            if(!isRecent) {
                const newNotification = new NotificationModel({
                    sender: req.user._id,
                    recipient: parentComment.author,
                    type: 'comment_reply',
                    content: `${req.user.username} replied to your comment.`,
                    post: postId,
                });
                await newNotification.save();
                await redisClient.setEx(cacheKey, 300, '1');
            }
        } catch (redisError) {
            console.error('Redis error:', redisError);
            const newNotification = new NotificationModel({
                sender: req.user._id,
                recipient: parentComment.author,
                type: 'comment_reply',
                content: `${req.user.username} replied to your comment.`,
                post: postId,
            });
            await newNotification.save();
        }

        res.status(201).json({success: true, comment: saved});
    }
    catch(error) {
        console.error('Error replying to comment:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export async function getCommentsByPost(req, res) {
    try {
        const {postId} = req.params;
        const {page = 1, limit = 20} = req.query;
        const comments = await Comment.find({postId, parentComment: null})
            .populate('author', 'username email avatar')
            .sort({createdAt: -1})
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const commentIds = comments.map(c => c._id);
        const replies = await Comment.find({parentComment: {$in: commentIds}})
            .populate('author', 'username email avatar')
            .sort({createdAt: 1})
            .lean();

        const repliesMap = {};
        replies.forEach(reply => {
            const parentId = reply.parentComment.toString();
            if(!repliesMap[parentId]) {
                repliesMap[parentId] = [];
            }
            repliesMap[parentId].push(reply);
        });

        const commentsWithReplies = comments.map(comment => ({
            ...comment,
            replies: repliesMap[comment._id.toString()] || []
        }));

        const total = await Comment.countDocuments({postId, parentComment: null});

        res.status(200).json({
            success: true, 
            comments: commentsWithReplies,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch(error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export async function updateComment(req, res) {
    try {
        const {commentId} = req.params;
        const {content} = req.body; 
        
        if(!content || !content.trim()) {
            return res.status(400).json({success: false, message: "Content is required"});
        }

        const comment = await Comment.findOneAndUpdate(
            {_id: commentId, author: req.user._id},
            {content: content.trim()},
            {new: true, runValidators: true}
        ).populate('author', 'username email avatar');

        if(!comment) {
            return res.status(404).json({success: false, message: 'Comment not found or unauthorized'});
        }

        res.status(200).json({success: true, comment});
    }
    catch(error) {
        console.error('Error updating comment:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}

export async function deleteComment(req, res) {
    try {   
        const {commentId} = req.params;
        
        const comment = await Comment.findById(commentId).select('author postId eventId parentComment');
        if(!comment) {
            return res.status(404).json({success: false, message: 'Comment not found'});
        }
        const isOwner = comment.author.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        let isManager = false;
        if(!isOwner && !isAdmin) {
            const event = await Event.findById(comment.eventId).select('managerId');
            isManager = event && event.managerId.toString() === req.user._id.toString();
        }

        if(!isOwner && !isAdmin && !isManager) {
            return res.status(403).json({success: false, message: 'You are not authorized to delete this comment'});
        }

        // Get all child comments (replies)
        const childComments = await Comment.find({parentComment: commentId}).select('_id');
        const allCommentIds = [commentId, ...childComments.map(c => c._id)];
        const totalDeleteCount = allCommentIds.length;
        
        console.log(`🗑️ Deleting comment and ${childComments.length} replies`);

        // CASCADE DELETE
        // 1. Delete all likes for this comment and its replies
        const deletedLikes = await Like.deleteMany({
            likeableId: { $in: allCommentIds.map(id => id.toString()) },
            likeableType: 'comment'
        });
        console.log(`   ✅ Deleted ${deletedLikes.deletedCount} likes`);

        // 2. Delete all notifications for this comment and its replies
        const deletedNotifications = await NotificationModel.deleteMany({
            $or: [
                { content: { $regex: commentId.toString() } },
                ...childComments.map(c => ({ content: { $regex: c._id.toString() } }))
            ]
        });
        console.log(`   ✅ Deleted ${deletedNotifications.deletedCount} notifications`);

        // 3. Delete the comment and all replies
        await Comment.deleteMany({
            $or: [
                {_id: commentId},
                {parentComment: commentId}
            ]
        });
        console.log(`   ✅ Deleted ${totalDeleteCount} comments`);

        // 4. Update post comment count
        await Post.findByIdAndUpdate(comment.postId, {$inc: {commentsCount: -totalDeleteCount}});

        res.status(200).json({
            success: true, 
            message: 'Comment and all related data deleted successfully',
            details: {
                comments: totalDeleteCount,
                likes: deletedLikes.deletedCount,
                notifications: deletedNotifications.deletedCount
            }
        });
    }
    catch(error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({success: false, message: 'Server error'});
    }
}
