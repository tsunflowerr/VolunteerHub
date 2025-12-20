import Post from '../../models/postModel.js';
import Event from '../../models/eventModel.js';
import Comment from '../../models/commentModel.js';
import Like from '../../models/likeModel.js';
import Notification from '../../models/notificationModel.js';
import redisClient from '../../config/redis.js';
import mongoose from 'mongoose';
import { invalidateCache, invalidateCacheByPattern } from '../../utils/cacheHelper.js';
import { createAndSendNotification } from '../../utils/notificationHelper.js';

export async function createPost(req, res) {
    try {
        const eventId = req.params.eventId;
        const { title, content, image } = req.body;
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }
        
        if(event.status === 'pending' || event.status === 'rejected' || event.status === 'draft') {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot create post when event is not approved' 
            });
        }
   
        const post = new Post({
            title,
            content,
            author: req.user._id,
            image: image || [],
            eventId
        });

        let saved = await post.save();
        saved = await saved.populate('author', 'username email avatar role');

        await Event.findByIdAndUpdate(
            eventId, 
            { $inc: { postsCount: 1 } }
        );

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
            await createAndSendNotification(
                {
                    recipient: event.managerId,
                    sender: req.user._id,
                    type: 'new_post',
                    content: `A new post has been created in your event "${event.name}".`,
                    event: eventId,
                },
                {
                    title: 'New Post! 📝',
                    body: `${req.user.username} created a post in "${event.name}"`,
                    icon: req.user.avatar || '/default-avatar.png',
                }
            );
            try {
                await redisClient.setEx(cacheKey, 300, '1');
            }
            catch(err) {
                console.error('Redis error:', err);
            }
        }

        // Invalidate caches when postsCount changes (affects trending score)
        await invalidateCache(`event:detail:${eventId}`);
        await invalidateCacheByPattern('events:trending:*');

        res.status(201).json({
            success: true,
            post: saved
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

export async function getAllPosts(req, res) {
    const eventId = req.params.eventId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const event = await Event.findById(eventId);
        if(!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        const [posts, total] = await Promise.all([
            Post.find({ eventId })
                .populate('author', 'username email avatar role')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Post.countDocuments({ eventId })
        ]);

        // Check if user has liked these posts
        if (req.user) {
            const postIds = posts.map(p => p._id);
            const likes = await Like.find({
                userId: req.user._id,
                likeableId: { $in: postIds },
                likeableType: 'post'
            }).select('likeableId').lean();

            const likedPostIds = new Set(likes.map(l => l.likeableId.toString()));

            posts.forEach(post => {
                post.isLiked = likedPostIds.has(post._id.toString());
            });
        } else {
             posts.forEach(post => {
                post.isLiked = false;
            });
        }

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

export async function getSpecificPost(req, res) {
    try {
        const { eventId, postId } = req.params;
        
        const event = await Event.findById(eventId);
        if(!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        
        const post = await Post.findOne({ _id: postId, eventId })
            .populate('author', 'username email avatar role')
            .lean();

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check if user has liked this post
        if (req.user) {
            const like = await Like.findOne({
                userId: req.user._id,
                likeableId: post._id,
                likeableType: 'post'
            }).lean();

            post.isLiked = !!like;
        } else {
            post.isLiked = false;
        }

        res.status(200).json({ 
            success: true, 
            post
        });
    } catch (error) {
        console.error('Error fetching specific post:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

export async function getAllMediaFromPost(req, res) {
    try {
        const { eventId } = req.params;
        
        const event = await Event.findById(eventId);
        if(!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Find all posts in this event that have images
        const postsWithMedia = await Post.find({ 
            eventId, 
            image: { $exists: true, $not: { $size: 0 } } 
        })
        .select('image author createdAt title')
        .populate('author', 'username avatar role')
        .sort({ createdAt: -1 })
        .lean();

        // Flatten the structure to return a list of media items
        const media = postsWithMedia.reduce((acc, post) => {
            if (post.image && Array.isArray(post.image)) {
                post.image.forEach(imgUrl => {
                    acc.push({
                        url: imgUrl,
                        type: imgUrl.includes('video') ? 'video' : 'image', // Basic check, ideally store type
                        postId: post._id,
                        postTitle: post.title,
                        author: post.author,
                        createdAt: post.createdAt
                    });
                });
            }
            return acc;
        }, []);

        res.status(200).json({ 
            success: true, 
            media
        });

    } catch (error) {
        console.error('Error fetching event media:', error);
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
        
        const updatedPost = await Post.findOneAndUpdate(
            {
                _id: postId,
                eventId: eventId,
                author: req.user._id
            },
            updateData,
            { new: true, runValidators: true }
        ).populate('author', 'username email avatar role');
        
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
    try {
        const { eventId, postId } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        const post = await Post.findOne({ _id: postId, eventId: eventId }).populate('eventId');
        if(!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        
        const event = post.eventId;
        const isAdmin = userRole === 'admin';
        const isManager = userRole === 'manager' && event.managerId.toString() === userId.toString();
        const isAuthor = post.author.toString() === userId.toString();
        
        if (!isAdmin && !isManager && !isAuthor) {
            return res.status(403).json({ 
                success: false, 
                message: 'Unauthorized: You do not have permission to delete this post' 
            });
        }
        
        const [deletedComments, deletedLikes, deletedNotifications] = await Promise.all([
            Comment.deleteMany({ postId: postId }),
            Like.deleteMany({ 
                likeableId: postId.toString(), 
                likeableType: 'post' 
            }),
            Notification.deleteMany({ post: postId })
        ]);
        
        await Promise.all([
            Post.findByIdAndDelete(postId),
            Event.findByIdAndUpdate(eventId, { 
                $inc: { postsCount: -1 }
            })
        ]);

        // Invalidate caches when postsCount changes (affects trending score)
        await invalidateCache(`event:detail:${eventId}`);
        await invalidateCacheByPattern('events:trending:*');
        
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
        console.error('Error deleting post:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}
