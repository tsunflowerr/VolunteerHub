import {
  Users,
  Bookmark,
  BookmarkCheck,
  Check,
  Ellipsis,
  X,
  MessageSquare,
  Settings,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './EventDetail.module.css';
import { useToggleBookmark } from '../../hooks/useUser';
import useAuth from '../../hooks/useAuth';
import {
  useRegisterEvent,
  useUnregisterEvent,
  useMyRegistrations,
} from '../../hooks/useEvents';
import { useEventEligibility } from '../../hooks/useGamification';
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
  
  // Only use bookmark hook when we have a valid event ID (not in preview mode)
  const eventId = event?._id;
  const {
    isBookmarked,
    toggleBookmark,
    isLoading: isBookmarkLoading,
  } = useToggleBookmark(previewMode ? null : eventId);

  const {
    data: registrationsData,
    isLoading: isLoadingRegistrations,
    refetch: refetchRegistrations,
  } = useMyRegistrations({ limit: 100 });

  // Check eligibility for events with requirements
  const hasRequirements = event.requirements?.hasRequirements;
  const { data: eligibilityData, isLoading: isCheckingEligibility } = useEventEligibility(
    user && hasRequirements ? event._id : null
  );

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
      toast('Preview mode - Registration not available', { icon: 'ℹ️' });
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
    isUnregistering ||
    isCheckingEligibility;

  // Check if user is eligible for event with requirements
  const isEligible = !hasRequirements || eligibilityData?.data?.eligible;
  
  // Build list of unmet requirements for display
  const getUnmetRequirements = () => {
    if (!eligibilityData?.data?.requirements) return [];
    const reqs = eligibilityData.data.requirements;
    const unmet = [];
    
    if (reqs.level && !reqs.level.passed) {
      unmet.push(`Level ${reqs.level.required} required (You: Level ${reqs.level.current})`);
    }
    if (reqs.points && !reqs.points.passed) {
      unmet.push(`${reqs.points.required} XP required (You: ${reqs.points.current} XP)`);
    }
    if (reqs.eventsCompleted && !reqs.eventsCompleted.passed) {
      unmet.push(`${reqs.eventsCompleted.required} events completed required (You: ${reqs.eventsCompleted.current})`);
    }
    if (reqs.achievements && !reqs.achievements.passed) {
      reqs.achievements.missing.forEach(a => {
        unmet.push(`Achievement "${a.name}" required`);
      });
    }
    
    return unmet;
  };
  
  const eligibilityReasons = getUnmetRequirements();

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
                ) : !isEligible && hasRequirements ? (
                  // User doesn't meet requirements
                  <div className={styles['event-detail__sidebar-eligibility']}>
                    <div className={styles['event-detail__sidebar-eligibility-header']}>
                      <Lock size={20} />
                      <span>Requirements Not Met</span>
                    </div>
                    <p className={styles['event-detail__sidebar-eligibility-text']}>
                      You don't meet the requirements to register for this event.
                    </p>
                    {eligibilityReasons.length > 0 && (
                      <ul className={styles['event-detail__sidebar-eligibility-list']}>
                        {eligibilityReasons.map((reason, index) => (
                          <li key={index}>
                            <AlertTriangle size={14} />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    )}
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
