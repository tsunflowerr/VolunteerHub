import { useParams, useNavigate } from 'react-router-dom';
import {
  EventHero,
  EventContent,
  EventSidebar,
} from '../../components/EventDetail/';
import { useEvent } from '../../hooks/useEvents';
import styles from '../../components/EventDetail/EventDetail.module.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useEvent(id);

  const event = data?.data;
  const userState = 'none'; // Placeholder for user state (guest, registered, manager, etc.)

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
            userState={userState}
            onGoToDiscussion={handleGoToDiscussion}
          />
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
