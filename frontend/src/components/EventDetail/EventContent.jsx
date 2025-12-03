import EventHost from './EventHost';
import EventDateTime from './EventDateTime';
import EventLocation from './EventLocation';
import EventCategories from './EventCategories';
import EventAbout from './EventAbout';
import styles from './EventDetail.module.css';

const EventContent = ({ event }) => {
  return (
    <div className={styles['event-detail__main']}>
      <h1 className={styles['event-detail__title']}>{event.name}</h1>

      <EventHost managerId={event.managerId} />

      <EventDateTime startDate={event.startDate} endDate={event.endDate} />

      <EventLocation location={event.location} />

      <EventCategories categories={event.category} />

      <EventAbout
        description={event.description}
        activities={event.activities}
        prepare={event.prepare}
        images={event.images}
      />
    </div>
  );
};

export default EventContent;
