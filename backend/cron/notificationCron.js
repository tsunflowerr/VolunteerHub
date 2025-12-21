import cron from 'node-cron';
import NotificationModel from '../models/notificationModel.js';

const cleanupReadNotifications = async () => {
  console.log('⏳ Running scheduled cleanup for old read notifications...');
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const result = await NotificationModel.deleteMany({
      isRead: true,
      createdAt: { $lt: oneDayAgo },
    });

    if (result.deletedCount > 0) {
      console.log(`✅ Deleted ${result.deletedCount} old read notifications.`);
    } else {
      console.log('ℹ️ No old read notifications to delete.');
    }
  } catch (error) {
    console.error('❌ Error in notification cleanup cron job:', error);
  }
};

export const initNotificationCronJobs = () => {
  // Run immediately on startup to clean up
  cleanupReadNotifications();

  // Run every day at midnight: 0 0 * * *
  cron.schedule('0 0 * * *', () => {
    cleanupReadNotifications();
  });

  console.log(
    '🕒 Notification Cron Jobs initialized (Schedule: Daily at midnight + Immediate check)'
  );
};
