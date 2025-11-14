import webpush from 'web-push';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

/**
 * Helper function to generate notification content based on type and status
 * @param {String} type - Notification type (event_status_update, registration_status_update, etc.)
 * @param {String} status - Related status (approved, rejected, confirmed, cancelled, completed)
 * @param {String} username - Username of the sender
 * @param {String} resourceName - Name of the event/post/comment
 * @returns {Object} { content, title, body }
 */
export function generateNotificationContent(type, status, username, resourceName) {
    const content = {};
    
    switch (type) {
        case 'event_status_update':
            switch (status) {
                case 'approved':
                    content.content = `Your event "${resourceName}" has been approved.`;
                    content.title = 'Event Approved! ✅';
                    content.body = `Your event "${resourceName}" has been approved.`;
                    break;
                case 'rejected':
                    content.content = `Your event "${resourceName}" has been rejected.`;
                    content.title = 'Event Rejected ❌';
                    content.body = `Your event "${resourceName}" has been rejected.`;
                    break;
                case 'cancelled':
                    content.content = `Your event "${resourceName}" has been cancelled.`;
                    content.title = 'Event Cancelled 🚫';
                    content.body = `Your event "${resourceName}" has been cancelled.`;
                    break;
                case 'completed':
                    content.content = `Your event "${resourceName}" has been completed.`;
                    content.title = 'Event Completed 🎉';
                    content.body = `Your event "${resourceName}" has been completed.`;
                    break;
            }
            break;
            
        case 'registration_status_update':
            switch (status) {
                case 'confirmed':
                    content.content = `Your registration for the event "${resourceName}" has been confirmed.`;
                    content.title = 'Registration Confirmed! ✅';
                    content.body = `Your registration for "${resourceName}" has been confirmed.`;
                    break;
                case 'cancelled':
                    content.content = `Your registration for the event "${resourceName}" has been cancelled.`;
                    content.title = 'Registration Cancelled ❌';
                    content.body = `Your registration for "${resourceName}" has been cancelled.`;
                    break;
                case 'completed':
                    content.content = `Your registration for the event "${resourceName}" has been completed.`;
                    content.title = 'Registration Completed 🎉';
                    content.body = `Your registration for "${resourceName}" has been completed.`;
                    break;
                case 'pending':
                    content.content = `You have successfully registered for the event "${resourceName}". Current status: Pending approval.`;
                    content.title = 'Registration Successful! ✅';
                    content.body = `You have just registered for the event "${resourceName}".`;
                    break;
            }
            break;
            
        case 'like':
            content.content = `${username} liked your ${resourceName}.`;
            content.title = 'New Like! ❤️';
            content.body = `${username} liked your ${resourceName}.`;
            break;
            
        case 'comment':
            content.content = `${username} commented on your post "${resourceName}".`;
            content.title = 'New Comment! 💬';
            content.body = `${username} commented on your post.`;
            break;
            
        case 'comment_reply':
            content.content = `${username} replied to your comment.`;
            content.title = 'New Reply! 💬';
            content.body = `${username} replied to your comment.`;
            break;
            
        case 'new_post':
            content.content = `A new post has been created in your event "${resourceName}".`;
            content.title = 'New Post! 📝';
            content.body = `A new post has been created in your event "${resourceName}".`;
            break;
            
        default:
            content.content = 'You have a new notification.';
            content.title = 'New Notification';
            content.body = 'You have a new notification.';
    }
    
    return content;
}

/**
 * Helper function to create notification for event manager about new registration
 * @param {String} username - Username of the volunteer
 * @param {String} eventName - Name of the event
 * @returns {Object} { content, title, body }
 */
export function generateNewRegistrationContent(username, eventName) {
    return {
        content: `${username} has just registered for the event "${eventName}" that you manage.`,
        title: 'New Volunteer Registered! 🧑‍🤝‍🧑',
        body: `${username} just registered for your event.`
    };
}

export async function createAndSendNotification(notificationData, pushPayload) {
    try {
        await Notification.create(notificationData);
        const recipientUser = await User.findById(notificationData.recipient).select('pushSubscription').lean();

        if (!recipientUser || !recipientUser.pushSubscription) {
            console.log(`User ${notificationData.recipient} does not have a push subscription.`);
            return;
        }

        const subscription = recipientUser.pushSubscription;
        const payload = JSON.stringify(pushPayload);

        await webpush.sendNotification(subscription, payload);
        console.log(`Successfully sent notification to user ${notificationData.recipient}.`);

    } catch (error) {
        if (error.statusCode === 410) { 
            console.log(`Subscription for user ${notificationData.recipient} has expired. Removing from DB.`);
            await User.findByIdAndUpdate(notificationData.recipient, { $set: { pushSubscription: null } });
        } else {
            console.error(`Error sending notification to user ${notificationData.recipient}:`, error);
        }
    }
}
