import { Dialog } from 'radix-ui';
import React, { useState, useEffect } from 'react';
import Notification from './Notification';
import styles from './NotificationDialog.module.css';
import { X, Bell } from 'lucide-react';
const NotificationDialog = ({ children, open, onOpenChange }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Fetch notifications from API
    const mockNotifications = [
      {
        _id: '1',
        sender: { _id: '101', name: 'Sarah Johnson', avatar: '/avatar.png' },
        type: 'like',
        content: 'Sarah Johnson liked your post "Community Garden Project"',
        post: { _id: 'post1', title: 'Community Garden Project' },
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
      },
      {
        _id: '2',
        sender: { _id: '102', name: 'Michael Chen', avatar: '/avatar.png' },
        type: 'comment',
        content:
          'Michael Chen commented: "Great initiative! I would love to join this event."',
        post: { _id: 'post2', title: 'Food Drive Initiative' },
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
      },
      {
        _id: '3',
        sender: { _id: '103', name: 'Emily Rodriguez', avatar: '/avatar.png' },
        type: 'like',
        content: 'Emily Rodriguez liked your post "Weekend Beach Cleanup"',
        post: { _id: 'post3', title: 'Weekend Beach Cleanup' },
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago
      },
      {
        _id: '4',
        sender: { _id: '104', name: 'David Park', avatar: '/avatar.png' },
        type: 'comment_reply',
        content:
          'David Park replied to your comment on "Tree Planting Campaign"',
        post: { _id: 'post4', title: 'Tree Planting Campaign' },
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
      },
      {
        _id: '5',
        sender: { _id: '105', name: 'Admin Team', avatar: '/avatar.png' },
        type: 'registration_status_update',
        relatedStatus: 'approved',
        content:
          'Your registration for "Beach Cleanup 2025" has been approved! See you there.',
        event: { _id: 'event1', title: 'Beach Cleanup 2025' },
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      },
      {
        _id: '6',
        sender: { _id: '106', name: 'Jessica Martinez', avatar: '/avatar.png' },
        type: 'like',
        content: 'Jessica Martinez liked your post',
        post: { _id: 'post5', title: 'Homeless Shelter Support' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
      },
      {
        _id: '7',
        sender: { _id: '107', name: 'Alex Thompson', avatar: '/avatar.png' },
        type: 'comment',
        content:
          'Alex Thompson commented: "This is exactly what our community needs!"',
        post: { _id: 'post6', title: 'Community Library Renovation' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      },
      {
        _id: '8',
        sender: {
          _id: '108',
          name: 'Event Coordinator',
          avatar: '/avatar.png',
        },
        type: 'event_status_update',
        relatedStatus: 'confirmed',
        content:
          'Event "Park Maintenance Day" has been confirmed for next Saturday',
        event: { _id: 'event2', title: 'Park Maintenance Day' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
      },
      {
        _id: '9',
        sender: { _id: '109', name: 'Lisa Anderson', avatar: '/avatar.png' },
        type: 'new_post',
        content:
          'Lisa Anderson created a new event: "Senior Center Activities"',
        post: { _id: 'post7', title: 'Senior Center Activities' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
      },
      {
        _id: '10',
        sender: { _id: '110', name: 'Tom Wilson', avatar: '/avatar.png' },
        type: 'like',
        content: 'Tom Wilson liked your post "Youth Mentorship Program"',
        post: { _id: 'post8', title: 'Youth Mentorship Program' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 300), // 5 hours ago
      },
      {
        _id: '11',
        sender: { _id: '111', name: 'Admin Team', avatar: '/avatar.png' },
        type: 'registration_status_update',
        relatedStatus: 'pending',
        content:
          'Your registration for "Food Bank Volunteer Day" is pending review',
        event: { _id: 'event3', title: 'Food Bank Volunteer Day' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 360), // 6 hours ago
      },
      {
        _id: '12',
        sender: { _id: '112', name: 'Maria Garcia', avatar: '/avatar.png' },
        type: 'comment',
        content: 'Maria Garcia commented: "Count me in! This sounds amazing!"',
        post: { _id: 'post9', title: 'Animal Shelter Support' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 420), // 7 hours ago
      },
      {
        _id: '13',
        sender: { _id: '113', name: 'James Brown', avatar: '/avatar.png' },
        type: 'like',
        content: 'James Brown liked your post',
        post: { _id: 'post10', title: 'Environmental Workshop' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 480), // 8 hours ago
      },
      {
        _id: '14',
        sender: { _id: '114', name: 'Event Manager', avatar: '/avatar.png' },
        type: 'event_status_update',
        relatedStatus: 'completed',
        content:
          'Event "Community Cleanup" has been successfully completed! Thank you for participating.',
        event: { _id: 'event4', title: 'Community Cleanup' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 540), // 9 hours ago
      },
      {
        _id: '15',
        sender: { _id: '115', name: 'Rachel Lee', avatar: '/avatar.png' },
        type: 'comment_reply',
        content:
          'Rachel Lee replied to your comment: "Thanks for the support!"',
        post: { _id: 'post11', title: 'School Supply Drive' },
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 600), // 10 hours ago
      },
    ];
    setNotifications(mockNotifications);
  }, []);
  const handleMarkAsRead = async (notificationId) => {
    // API call to mark as read
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    // API call to mark all as read
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

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
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className={styles.notificationList}>
            {filteredNotifications.length === 0 ? (
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
