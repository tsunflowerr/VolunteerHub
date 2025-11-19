import React from 'react';
import styles from './Notification.module.css';
import { getNotificationIcon } from './notificationConfig';

const Notification = ({ notification, onMarkAsRead }) => {

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div
      className={`${styles.notificationItem} ${
        !notification.isRead ? styles.unread : ''
      }`}
      onClick={() => onMarkAsRead(notification._id)}
    >
      <div className={styles.iconContainer}>
        {getNotificationIcon(notification.type, notification.relatedStatus)}
      </div>
      <div className={styles.notificationContent}>
        <p className={styles.notificationText}>{notification.content}</p>
        <span className={styles.timestamp}>
          {getTimeAgo(notification.createdAt)}
        </span>
      </div>
      {!notification.isRead && <div className={styles.unreadDot} />}
    </div>
  );
};

export default Notification;
