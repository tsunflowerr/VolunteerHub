import Notification from '../../models/notificationModel.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all notifications for current user with pagination
 * @route   GET /api/users/notifications
 * @access  Private
 */
export async function getNotifications(req, res) {
    try {
        const { page = 1, limit = 5, isRead } = req.query;
        const userId = req.user._id;

        // Build query filter
        const filter = { recipient: userId };
        if (isRead !== undefined) {
            filter.isRead = isRead === 'true';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query with pagination and populate sender info
        const [notifications, total] = await Promise.all([
            Notification.find(filter)
                .populate('sender', 'username email avatar')
                .populate('post', 'title')
                .populate('event', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Notification.countDocuments(filter)
        ]);

        // Get unread count
        const unreadCount = await Notification.countDocuments({ 
            recipient: userId, 
            isRead: false 
        });

        res.status(200).json({
            success: true,
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalNotifications: total,
                limit: parseInt(limit)
            },
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching notifications' 
        });
    }
}

/**
 * @desc    Mark a single notification as read
 * @route   PATCH /api/users/notifications/:notificationId/read
 * @access  Private
 */
export async function markAsRead(req, res) {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid notification ID' 
            });
        }

        // Find and update notification (ensure it belongs to the user)
        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipient: userId },
            { isRead: true },
            { new: true }
        )
        .populate('sender', 'username email avatar')
        .populate('post', 'title')
        .populate('event', 'title')
        .lean();

        if (!notification) {
            return res.status(404).json({ 
                success: false, 
                message: 'Notification not found or access denied' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating notification' 
        });
    }
}

/**
 * @desc    Mark all notifications as read for current user
 * @route   PATCH /api/users/notifications/read-all
 * @access  Private
 */
export async function markAllAsRead(req, res) {
    try {
        const userId = req.user._id;

        // Update all unread notifications for the user
        const result = await Notification.updateMany(
            { recipient: userId, isRead: false },
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while updating notifications' 
        });
    }
}

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/users/notifications/:notificationId
 * @access  Private
 */
export async function deleteNotification(req, res) {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid notification ID' 
            });
        }

        // Find and delete notification (ensure it belongs to the user)
        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: userId
        });

        if (!notification) {
            return res.status(404).json({ 
                success: false, 
                message: 'Notification not found or access denied' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting notification' 
        });
    }
}

/**
 * @desc    Delete all notifications for current user
 * @route   DELETE /api/users/notifications/all
 * @access  Private
 */
export async function deleteAllNotifications(req, res) {
    try {
        const userId = req.user._id;

        // Delete all notifications for the user
        const result = await Notification.deleteMany({ recipient: userId });

        res.status(200).json({
            success: true,
            message: 'All notifications deleted successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error deleting all notifications:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while deleting notifications' 
        });
    }
}

/**
 * @desc    Get unread notifications count
 * @route   GET /api/users/notifications/unread/count
 * @access  Private
 */
export async function getUnreadCount(req, res) {
    try {
        const userId = req.user._id;

        const unreadCount = await Notification.countDocuments({
            recipient: userId,
            isRead: false
        });

        res.status(200).json({
            success: true,
            unreadCount
        });
    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error while fetching unread count' 
        });
    }
}
