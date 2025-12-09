import { useNavigate, Link } from 'react-router-dom';
import styles from './EventSection.module.css';
import { useEvents } from '../../hooks/useEvents';
import Event from './Event';

const EventSection = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useEvents({ limit: 6 });

  const events = data?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading events...
      </div>
    );
  }

  if (error) return null;

  return (
    <section className={styles['event-section']}>
      <div
        data-aos="fade-left"
        data-aos-anchor-placement="top-bottom"
        data-aos-easing="linear"
        data-aos-duration="1000"
        className={styles['event-section__container']}
      >
        <h2 className={styles['event-section__title']}>Volunteer Needs Now</h2>
        <p className={styles['event-section__description']}>
          Volunteer Needs Now is the pulse of our community engagement. This
          section highlights current opportunities where your time and skills
          can make an immediate impact.
        </p>
      </div>

      <div className={styles['event-section__grid']}>
        {events.length > 0 ? (
          events.map((event) => (
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
              onLearnMore={() => navigate(`/events/${event._id}`)}
            />
          ))
        ) : (
          <div className={styles['no-events']}>No event yet</div>
        )}
      </div>

      <div className={styles['event-section__actions']}>
        <Link to="/events" className={styles['event-section__link']}>
          <button className={styles['event-section__button']}>See All</button>
        </Link>
      </div>
    </section>
  );
};

export default EventSection;
