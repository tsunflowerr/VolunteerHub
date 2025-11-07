import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  User,
  ArrowRight,
  Check,
  Ellipsis,
  X,
} from 'lucide-react';
import { volunteerEvents } from '../../dummy/volunteerEvents';
import { categoriesById } from '../../utilities/CategoriesIcons';
import styles from './EventDetail.module.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [userState, setUserState] = useState('none');
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Find the event by ID
    const foundEvent = volunteerEvents.find((e) => e._id === id);
    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      // Event not found, redirect to events page
      navigate('/events');
    }
  }, [id, navigate]);

  const handleEnroll = () => {
    if (isEnrolled) {
      // Unenroll
      if (
        window.confirm(
          'Are you sure you want to cancel your enrollment for this event?'
        )
      ) {
        setIsEnrolled(false);
        // TODO: Implement API call to unenroll
        console.log('Unenrolled from event:', id);
      }
    } else {
      // Enroll
      setIsEnrolled(true);
      // TODO: Implement API call to enroll
      console.log('Enrolled in event:', id);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement API call to bookmark/unbookmark
    console.log(isBookmarked ? 'Removed bookmark' : 'Added bookmark', id);
  };

  const handleGoToDiscussion = () => {
    // TODO: Navigate to event discussion page
    navigate(`/events/${id}/discussion`);
    console.log('Navigate to discussion:', id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!event) {
    return (
      <div className={styles['event-detail']}>
        <div className={styles['event-detail__loading']}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles['event-detail']}>
      <div className={styles['event-detail__container']}>
        {/* Hero Section */}
        <div className={styles['event-detail__hero']}>
          <img
            src={event.image}
            alt={event.title}
            className={styles['event-detail__hero-image']}
          />
        </div>
        {/* Content Section */}
        <div className={styles['event-detail__content']}>
          {/* Main Content */}
          <div className={styles['event-detail__main']}>
            <h1 className={styles['event-detail__title']}>{event.title}</h1>
            <div className={styles['event-detail__host']}>
              <img
                src={
                  event.hostAvatar ||
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
                }
                alt={event.hostName}
                className={styles['event-detail__host-avatar']}
              />
              <div className={styles['event-detail__host-info']}>
                <span className={styles['event-detail__host-label']}>
                  Organized by
                </span>
                <span className={styles['event-detail__host-name']}>
                  {event.hostName}
                </span>
              </div>
            </div>
            <div className={styles['event-detail__section']}>
              <h3 className={styles['event-detail__section-title']}>
                DATE & TIME
              </h3>
              <div className={styles['event-detail__datetime']}>
                <div className={styles['event-detail__datetime-item']}>
                  <Calendar size={24} />
                  <div className={styles['event-detail__datetime-content']}>
                    <span className={styles['event-detail__datetime-label']}>
                      Start Date
                    </span>
                    <span className={styles['event-detail__datetime-value']}>
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
                <ArrowRight size={36} />
                <div className={styles['event-detail__datetime-item']}>
                  <Calendar size={24} />
                  <div className={styles['event-detail__datetime-content']}>
                    <span className={styles['event-detail__datetime-label']}>
                      End Date
                    </span>
                    <span className={styles['event-detail__datetime-value']}>
                      {formatDate(event.date)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Description */}
            <div className={styles['event-detail__section']}>
              <h3 className={styles['event-detail__section-title']}>
                LOCATION
              </h3>
              <div className={styles['event-detail__location']}>
                <div className={styles['event-detail__map-container']}>
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      event.location
                    )}&output=embed`}
                    width="100%"
                    height="400"
                    style={{ border: 0, borderRadius: '0.75rem' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
                <div className={styles['event-detail__address']}>
                  <MapPin size={24} />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
            <div className={styles['event-detail__section']}>
              <h3 className={styles['event-detail__section-title']}>
                CATEGORIES
              </h3>
              <div className={styles['event-detail__categories']}>
                {event.categories &&
                  event.categories.map((categoryId) => {
                    const category = categoriesById[categoryId];
                    if (!category) return null;
                    return (
                      <div
                        key={categoryId}
                        className={styles['event-detail__category']}
                      >
                        <span className={styles['event-detail__category-name']}>
                          {category.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className={styles['event-detail__section']}>
              <h3 className={styles['event-detail__section-title']}>ABOUT</h3>
              <div className={styles['event-detail__subsection']}>
                <h2 className={styles['event-detail__section-subtitle']}>
                  About the event
                </h2>
                <p className={styles['event-detail__section-subcontent']}>
                  Newborn kittens are the cutest animals at KCHA, but the level
                  of TLC they need to survive makes them extra vulnerable, too!
                  The fragile fuzz balls require 'round-the-clock attention,
                  feedings every two hours, and help regulating their body
                  temperature.
                </p>
              </div>
              <div className={styles['event-detail__subsection']}>
                <h2 className={styles['event-detail__section-subtitle']}>
                  What will volunteers do?
                </h2>
                <p className={styles['event-detail__section-subcontent']}>
                  These fragile fuzz balls require 'round-the-clock attention,
                  feedings every two hours, help regulating their body
                  temperature, cleaning their cages, refreshing their food and
                  water, tracking their weight, and cleaning up the nursery in
                  general.
                </p>
              </div>
              <div className={styles['event-detail__subsection']}>
                <h2 className={styles['event-detail__section-subtitle']}>
                  What will volunteers need to bring or wear?
                </h2>
                <p className={styles['event-detail__section-subcontent']}>
                  Wear what you feel is comfortable, but remember you will
                  probably get dirty!
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className={styles['event-detail__sidebar']}>
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
            <div className={styles['event-detail__sidebar-card']}>
              {/* Registration Count */}
              <div className={styles['event-detail__sidebar-registered']}>
                <Users size={24} />
                <div
                  className={styles['event-detail__sidebar-registered-info']}
                >
                  <span
                    className={styles['event-detail__sidebar-registered-count']}
                  >
                    {event.registered || 0} / {event.capacity || 'Unlimited'}
                  </span>
                  <span
                    className={styles['event-detail__sidebar-registered-label']}
                  >
                    Registered volunteers
                  </span>
                </div>
              </div>

              {userState == 'none' && (
                <>
                  {event.capacity && event.registered >= event.capacity ? (
                    <>
                      <div className={styles['event-detail__sidebar-status']}>
                        <span
                          className={`${styles['event-detail__sidebar-status-icon']} ${styles['red']}`}
                        >
                          <X size={16} />
                        </span>
                        <p>This event is unavailable right now.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3
                        className={styles['event-detail__sidebar-card-title']}
                      >
                        SIGN UP TO VOLUNTEER
                      </h3>
                      <button
                        className={styles['event-detail__sidebar-card-btn']}
                      >
                        Go
                      </button>
                    </>
                  )}
                </>
              )}
              {userState == 'approved' && (
                <>
                  <div className={styles['event-detail__sidebar-status']}>
                    <span
                      className={`${styles['event-detail__sidebar-status-icon']} ${styles['green']}`}
                    >
                      <Check size={16} />
                    </span>
                    <p>
                      You're in! Your registration is approved, see you soon.
                    </p>
                  </div>

                  <button
                    className={styles['event-detail__sidebar-cancel-btn']}
                  >
                    Cancel
                  </button>
                </>
              )}
              {userState == 'pending' && (
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
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
            {userState == 'approved' && (
              <div className={styles['event-detail__sidebar-card']}>
                <h3 className={styles['event-detail__sidebar-card-title']}>
                  Go to discussion
                </h3>
                <button className={styles['event-detail__sidebar-card-btn']}>
                  Go
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
