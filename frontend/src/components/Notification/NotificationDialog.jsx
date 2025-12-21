import { Dialog } from 'radix-ui';
import React, { useState } from 'react';
import Notification from './Notification';
import styles from './NotificationDialog.module.css';
import { X, Bell, BellRing } from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '../../hooks/useNotifications';
import { usePushNotifications } from '../../hooks/usePushNotifications';

const NotificationDialog = ({ children, open, onOpenChange }) => {
  const [filter, setFilter] = useState('all'); // all, unread

  // Fetch notifications (fetching a reasonable amount for the dropdown)
  const { data: notificationsData, isLoading } = useNotifications({
    limit: 50,
  });
  const notifications = notificationsData?.notifications || [];
  const serverUnreadCount = notificationsData?.unreadCount || 0;

  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  const {
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    loading: pushLoading,
    permission,
  } = usePushNotifications();

  const handleMarkAsRead = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  // We can use the server count, but for the filter tab logic matching the list,
  // we might want the count of the *fetched* unread if we are only showing those.
  // However, showing total unread count is usually expected.
  // Let's use the local count of the fetched items to be consistent with what's shown,
  // or use server count if we trust it matches the UX expectation.
  // Given we fetch 50, if there are more, the list might be incomplete.
  // For now, let's use the list's unread count to match the displayed items.
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={styles['noti-dialog-overlay']} />
        <Dialog.Content className={styles['noti-dialog-content']}>
          <div className={styles['noti-dialog-header']}>
            <Dialog.Title className={styles['noti-dialog-title']}>
              Notifications
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className={styles['noti-dialog-close']}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
          <div className={styles.filters}>
            <button
              className={`${styles.filterTab} ${
                filter === 'all' ? styles.filterTabActive : ''
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`${styles.filterTab} ${
                filter === 'unread' ? styles.filterTabActive : ''
              }`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button
                className={styles.markAllRead}
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending
                  ? 'Marking...'
                  : 'Mark all as read'}
              </button>
            )}
          </div>

          {/* Push Notification Opt-in */}
          <div className={styles.pushOptIn}>
            {permission !== 'denied' && (
              <button
                className={isSubscribed ? styles.disablePushButton : styles.enablePushButton}
                onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
                disabled={pushLoading}
              >
                <BellRing size={16} />
                {pushLoading 
                  ? (isSubscribed ? 'Disabling...' : 'Enabling...') 
                  : (isSubscribed ? 'Disable Push Notifications' : 'Enable Push Notifications')}
              </button>
            )}
            {permission === 'denied' && (
              <p className={styles.permissionDeniedText}>
                Push notifications are blocked by browser settings.
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className={styles.notificationList}>
            {isLoading ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={48} color="#d1d5db" />
                <p className={styles.emptyText}>
                  {filter === 'unread'
                    ? 'No unread notifications'
                    : 'No notifications yet'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <Notification
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            )}
          </div>
          <Dialog.Description></Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NotificationDialog;
