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
import {
  EventHero,
  EventContent,
  EventSidebar,
} from '../../components/EventDetail/';
import { volunteerEvents } from '../../dummy/volunteerEvents';
import { categoriesById } from '../../utilities/CategoriesIcons';
import styles from '../../components/EventDetail/EventDetail.module.css';

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
        <EventHero thumbnail={event.thumbnail} />
        <div className={styles['event-detail__content']}>
          <EventContent event={event} />
          <EventSidebar 
            event={event} 
            userState={userState}
            onGoToDiscussion={handleGoToDiscussion}
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
