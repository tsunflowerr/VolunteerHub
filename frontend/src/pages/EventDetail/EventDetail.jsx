import { useParams, useNavigate } from 'react-router-dom';
import {
  EventHero,
  EventContent,
  EventSidebar,
} from '../../components/EventDetail/';
import { useEvent } from '../../hooks/useEvents';
import useAuth from '../../hooks/useAuth'; // Import useAuth
import styles from '../../components/EventDetail/EventDetail.module.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useEvent(id);
  const { user } = useAuth(); // Get current user from useAuth

  const event = data?.event;
  // Determine user state for the sidebar
  // This could be 'none', 'registered', 'manager', 'bookmarked', etc.
  // For now, only pass user to enable bookmarking
  const userState = 'none'; 

  if (isLoading) {
    return (
      <div className={styles['event-detail']}>
        <div className={styles['event-detail__loading']}>Loading...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles['event-detail']}>
        <div className={styles['event-detail__error']}>
          Event not found or error loading event.
          <button onClick={() => navigate('/events')}>Back to Events</button>
        </div>
      </div>
    );
  }

  const handleGoToDiscussion = () => {
    navigate(`/events/${id}/discussion`);
  };

  return (
    <div className={styles['event-detail']}>
      <div className={styles['event-detail__container']}>
        <EventHero thumbnail={event.thumbnail} />
        <div className={styles['event-detail__content']}>
          <EventContent event={event} />
          <EventSidebar
            event={event}
            user={user} // Pass the user object
            eventId={event._id} // Pass event ID explicitly for bookmark hook
            userState={userState}
            onGoToDiscussion={handleGoToDiscussion}
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
