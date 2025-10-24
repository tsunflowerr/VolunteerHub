import Post from '../../models/postModel.js';
import Event from '../../models/eventModel.js';
import Comment from '../../models/commentModel.js';
import Like from '../../models/likeModel.js';
import Notification from '../../models/notificationModel.js';

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
        saved = await saved.populate('author', 'username email avatar');

        // Increase postsCount in Event
        await Event.findByIdAndUpdate(eventId, { $inc: { postsCount: 1 } });

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
    try {
        const posts = await Post.find({ eventId })
            .populate('author', 'username email avatar')
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, posts, count: posts.length });
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
        
    
        const deletedComments = await Comment.deleteMany({ postId: postId });
        const deletedLikes = await Like.deleteMany({ 
            likeableId: postId.toString(), 
            likeableType: 'post' 
        });
        const deletedNotifications = await Notification.deleteMany({ post: postId });
        await Post.findByIdAndDelete(postId);
        await Event.findByIdAndUpdate(eventId, { 
            $inc: { postsCount: -1 }
        });
        await Event.updateOne(
            { _id: eventId, postsCount: { $lt: 0 } },
            { $set: { postsCount: 0 } }
        );
        
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
