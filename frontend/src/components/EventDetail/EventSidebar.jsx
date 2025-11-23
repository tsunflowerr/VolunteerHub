import {
  Users,
  Bookmark,
  BookmarkCheck,
  Check,
  Ellipsis,
  X,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EventDetail.module.css';

const EventSidebar = ({
  event,
  userState = 'none',
  onRegister,
  onCancel,
  onGoToDiscussion,
  previewMode = false,
}) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    if (previewMode) return;
    setIsBookmarked(!isBookmarked);
    // TODO: API call
  };

  const handleRegister = () => {
    if (previewMode) {
      alert('Preview mode - Registration not available');
      return;
    }
    onRegister?.();
  };

  const handleCancel = () => {
    if (previewMode) return;
    onCancel?.();
  };

  const handleDiscussion = () => {
    if (previewMode) return;
    onGoToDiscussion?.();
  };

  const isEventFull =
    event.capacity && event.registrationsCount >= event.capacity;

  //TODO: do role based access and handle manage events
  const handleManageEvent = () => {
    navigate(`/events/${event._id}/manage`);
  };

  return (
    <aside className={styles['event-detail__sidebar']}>
      {/* Bookmark Card */}
      {!previewMode && (
        <div className={styles['event-detail__sidebar-card']}>
          <h3 className={styles['event-detail__sidebar-card-title']}>
            {isBookmarked ? 'Bookmarked' : 'Add to bookmark'}
          </h3>
          <button
            className={styles['event-detail__sidebar-card-bookmark-btn']}
            onClick={handleBookmark}
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
      {!previewMode && (
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
        {userState === 'none' && (
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
                  disabled={previewMode}
                >
                  {previewMode ? 'Preview Mode' : 'Go'}
                </button>
              </>
            )}
          </>
        )}

        {userState === 'approved' && (
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
            >
              Cancel
            </button>
          </>
        )}

        {userState === 'pending' && (
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
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Discussion Card */}
      {userState === 'approved' && !previewMode && (
        <div className={styles['event-detail__sidebar-card']}>
          <h3 className={styles['event-detail__sidebar-card-title']}>
            Go to discussion
          </h3>
          <button
            className={styles['event-detail__sidebar-card-btn']}
            onClick={handleDiscussion}
          >
            Go
          </button>
        </div>
      )}
    </aside>
  );
};

export default EventSidebar;
