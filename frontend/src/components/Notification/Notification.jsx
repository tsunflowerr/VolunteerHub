import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Notification.module.css';
import { getNotificationIcon } from './notificationConfig';
import { formatDistanceToNow } from 'date-fns';

const Notification = ({ notification, onMarkAsRead }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onMarkAsRead(notification._id);

    const getId = (obj) => obj?._id || obj;
    const eventId = getId(notification.event);
    const postId = getId(notification.post);

    if (
      ['like', 'comment', 'comment_reply', 'new_post'].includes(
        notification.type
      )
    ) {
      if (eventId && postId) {
        navigate(`/events/${eventId}/discussion/posts/${postId}`);
      } else if (eventId) {
        navigate(`/events/${eventId}/discussion`);
      }
    } else if (notification.type === 'event_status_update') {
      if (eventId) {
        navigate(`/manager/events/${eventId}`);
      }
    } else if (notification.type === 'registration_status_update') {
      if (eventId) {
        navigate(`/events/${eventId}`);
      }
    }
  };

  return (
    <div
      className={`${styles.notificationItem} ${
        !notification.isRead ? styles.unread : ''
      }`}
      onClick={handleClick}
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
