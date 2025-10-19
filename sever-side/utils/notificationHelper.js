import webpush from 'web-push';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

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
