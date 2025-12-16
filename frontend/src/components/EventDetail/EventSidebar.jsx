import {
  Users,
  Bookmark,
  BookmarkCheck,
  Check,
  Ellipsis,
  X,
  MessageSquare,
  Settings,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './EventDetail.module.css';
import { useToggleBookmark } from '../../hooks/useUser';
import useAuth from '../../hooks/useAuth';
import {
  useRegisterEvent,
  useUnregisterEvent,
  useMyRegistrations,
} from '../../hooks/useEvents';
import { checkPermission, RESOURCES, ACTIONS } from '../../utilities/abac';

const EventSidebar = ({
  event,
  userState = 'none',
  onRegister,
  onCancel,
  onGoToDiscussion,
  previewMode = false,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isBookmarked,
    toggleBookmark,
    isLoading: isBookmarkLoading,
  } = useToggleBookmark(event._id);

  const {
    data: registrationsData,
    isLoading: isLoadingRegistrations,
    refetch: refetchRegistrations,
  } = useMyRegistrations({ limit: 100 });

  const { mutate: register, isPending: isRegistering } = useRegisterEvent();
  const { mutate: unregister, isPending: isUnregistering } = useUnregisterEvent(
    {
      onSuccess: () => {
        refetchRegistrations();
      },
    }
  );

  const myRegistration = registrationsData?.data?.find(
    (r) => (r.eventId._id || r.eventId) === event._id
  );

  let currentUserState = 'none';
  if (myRegistration) {
    if (myRegistration.status === 'confirmed') {
      currentUserState = 'approved';
    } else {
      currentUserState = myRegistration.status;
    }
  }

  const handleBookmark = () => {
    if (previewMode) return;
    toggleBookmark();
  };

  const handleRegister = () => {
    if (previewMode) {
      alert('Preview mode - Registration not available');
      return;
    }
    if (!user) {
      navigate('/login');
      return;
    }
    register(event._id);
  };

  const handleCancel = () => {
    if (previewMode) return;
    unregister(event._id);
  };

  const handleDiscussion = () => {
    if (previewMode) return;
    onGoToDiscussion?.();
  };

  const isEventFull =
    event.capacity && event.registrationsCount >= event.capacity;

  const handleManageEvent = () => {
    navigate(`/manager/events/${event._id}`);
  };

  // Combine event data with user state for ABAC checks
  const permissionData = { ...event, currentUserState };

  // Attribute-Based Access Control (ABAC) Logic
  const permissions = {
    canManage: checkPermission(
      user,
      RESOURCES.EVENTS,
      ACTIONS.MANAGE,
      permissionData
    ),
    canRegister: checkPermission(
      user,
      RESOURCES.EVENTS,
      ACTIONS.REGISTER,
      permissionData
    ),
    canBookmark: checkPermission(
      user,
      RESOURCES.EVENTS,
      ACTIONS.BOOKMARK,
      permissionData
    ),
    canDiscuss: checkPermission(
      user,
      RESOURCES.EVENTS,
      ACTIONS.DISCUSSION,
      permissionData
    ),
  };

  const isLoading =
    isBookmarkLoading ||
    isLoadingRegistrations ||
    isRegistering ||
    isUnregistering;

  return (
    <aside className={styles['event-detail__sidebar']}>
      {/* Discussion Card - Available based on permissions */}

      {/* Registration Card */}
      <div className={styles['event-detail__sidebar-card']}>
        {/* Registration Count */}
        <div className={styles['event-detail__sidebar-registered']}>
          <Users size={24} />
          <div className={styles['event-detail__sidebar-registered-info']}>
            <span className={styles['event-detail__sidebar-registered-count']}>
              {event.registrationsCount || 0} / {event.capacity || 'Unlimited'}
            </span>
            <span className={styles['event-detail__sidebar-registered-label']}>
              Registered volunteers
            </span>
          </div>
        </div>

        {/* Registration Status or Manager Controls */}
        {permissions.canManage ? (
          <>
            <h3 className={styles['event-detail__sidebar-card-title']}>
              Manage Event
            </h3>
            <button
              className={styles['event-detail__sidebar-card-btn']}
              onClick={handleManageEvent}
            >
              <Settings size={20} />
              Go to Management
            </button>
          </>
        ) : (
          <>
            {currentUserState === 'none' && permissions.canRegister && (
              <>
                {isEventFull ? (
                  <div className={styles['event-detail__sidebar-status']}>
                    <span
                      className={`${styles['event-detail__sidebar-status-icon']} ${styles['red']}`}
                    >
                      <X size={16} />
                    </span>
                    <p>This event is unavailable right now.</p>
                  </div>
                ) : (
                  <>
                    <h3 className={styles['event-detail__sidebar-card-title']}>
                      SIGN UP TO VOLUNTEER
                    </h3>
                    <button
                      className={styles['event-detail__sidebar-card-btn']}
                      onClick={handleRegister}
                      disabled={previewMode || isLoading}
                    >
                      {previewMode ? 'Preview Mode' : 'Go'}
                    </button>
                  </>
                )}
              </>
            )}

            {currentUserState === 'approved' && (
              <>
                <div className={styles['event-detail__sidebar-status']}>
                  <span
                    className={`${styles['event-detail__sidebar-status-icon']} ${styles['green']}`}
                  >
                    <Check size={16} />
                  </span>
                  <p>You're in! Your registration is approved, see you soon.</p>
                </div>
                <button
                  className={styles['event-detail__sidebar-cancel-btn']}
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </>
            )}

            {currentUserState === 'pending' && (
              <>
                <div className={styles['event-detail__sidebar-status']}>
                  <span
                    className={`${styles['event-detail__sidebar-status-icon']} ${styles['orange']}`}
                  >
                    <Ellipsis size={16} />
                  </span>
                  <p>
                    Your registration is pending, we'll notify you once
                    approved.
                  </p>
                </div>
                <button
                  className={styles['event-detail__sidebar-cancel-btn']}
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </>
            )}

            {currentUserState === 'cancelled' && (
              <>
                <div className={styles['event-detail__sidebar-status']}>
                  <span
                    className={`${styles['event-detail__sidebar-status-icon']} ${styles['red']}`}
                  >
                    <X size={16} />
                  </span>
                  <p>Your registration was not approved.</p>
                </div>
              </>
            )}

            {currentUserState === 'completed' && (
              <>
                <div className={styles['event-detail__sidebar-status']}>
                  <span
                    className={`${styles['event-detail__sidebar-status-icon']} ${styles['green']}`}
                  >
                    <Check size={16} />
                  </span>
                  <p>Thank you for contributing in the event!</p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {!previewMode && permissions.canDiscuss && (
        <div className={styles['event-detail__sidebar-card']}>
          <div className={styles['event-detail__sidebar-discussion-header']}>
            <MessageSquare size={24} />
            <div>
              <h3 className={styles['event-detail__sidebar-card-title']}>
                Event Discussion
              </h3>
              <p className={styles['event-detail__sidebar-card-subtitle']}>
                Join the conversation with other volunteers
              </p>
            </div>
          </div>
          <button
            className={`${styles['event-detail__sidebar-card-btn']} ${styles['discussion-btn']}`}
            onClick={handleDiscussion}
          >
            Go to Discussion
          </button>
        </div>
      )}

      {/* Bookmark Card */}
      {!previewMode && permissions.canBookmark && (
        <div className={styles['event-detail__sidebar-card']}>
          <h3 className={styles['event-detail__sidebar-card-title']}>
            {isBookmarked ? 'Bookmarked' : 'Add to bookmark'}
          </h3>
          <button
            className={styles['event-detail__sidebar-card-bookmark-btn']}
            onClick={handleBookmark}
            disabled={isLoading}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked ? (
              <>
                <BookmarkCheck size={20} />
                Bookmarked
              </>
            ) : (
              <>
                <Bookmark size={20} />
                Bookmark
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};

export default EventSidebar;
