import { useNavigate } from 'react-router-dom';
import styles from './EventList.module.css';
import Event from './Event';

const EventList = ({ events }) => {
  const navigate = useNavigate();

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (!events || events.length === 0) {
    return <div className={styles['no-events']}>No event yet</div>;
  }

  return (
    <div className={styles['event-list__grid']}>
      {events.map((event) => (
        <Event
          key={event._id}
          name={event.name}
          description={event.description}
          startDate={event.startDate}
          location={event.location}
          thumbnail={event.thumbnail}
          managerId={event.managerId}
          registrationsCount={event.registrationsCount}
          category={event.categories}
          onLearnMore={() => handleEventClick(event._id)}
        />
      ))}
    </div>
  );
};

export default EventList;
