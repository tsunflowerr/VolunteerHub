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
} from '../../hooks/useRegistrations';

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

  const { data: registrationsData, isLoading: isLoadingRegistrations } =
    useMyRegistrations({ limit: 100 });

  const { mutate: register, isPending: isRegistering } = useRegisterEvent();
  const { mutate: unregister, isPending: isUnregistering } =
    useUnregisterEvent();

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
    navigate(`/events/${event._id}/manage`);
  };

  // Determine if the user is the manager of this event
  const isManager =
    user &&
    (user.role === 'admin' ||
      (user.role === 'manager' &&
        (event.managerId?._id === user.id || event.managerId === user.id)));

  const isLoading =
    isBookmarkLoading ||
    isLoadingRegistrations ||
    isRegistering ||
    isUnregistering;

  return (
    <aside className={styles['event-detail__sidebar']}>
      {/* Discussion Card - Available for everyone */}
      {!previewMode && (
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
      {!previewMode && (
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

      {/* Manager Controls */}
      {!previewMode && isManager && (
        <div className={styles['event-detail__sidebar-card']}>
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
        </div>
      )}
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

        {/* Registration Status */}
        {currentUserState === 'none' && (
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
                Your registration is pending, we'll notify you once approved.
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
      </div>
    </aside>
  );
};

export default EventSidebar;
