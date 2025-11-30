import React from 'react';
import styles from './Notification.module.css';
import { getNotificationIcon } from './notificationConfig';
import { formatDistanceToNow } from 'date-fns';

const Notification = ({ notification, onMarkAsRead }) => {
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
          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
        </span>
      </div>
      {!notification.isRead && <div className={styles.unreadDot} />}
    </div>
  );
};

export default Notification;
