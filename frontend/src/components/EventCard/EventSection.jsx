import { useState } from 'react';
import { EventCard } from './EventCard';
import { Link } from 'react-router-dom';
import styles from './EventSection.module.css';
import { volunteerEvents } from '../../dummy/volunteerEvents';

const EventSection = () => {
  const [volunteers, setVolunteers] = useState(volunteerEvents);

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
        {volunteers.map((volunteer) => (
          <EventCard
            key={volunteer._id}
            title={volunteer.title}
            description={volunteer.description}
            date={volunteer.date}
            image={volunteer.image}
            onLearnMore={() => {
              // Handle learn more action
            }}
          />
        ))}
      </div>

      <div className={styles['event-section__actions']}>
        <Link to="/need-volunteer" className={styles['event-section__link']}>
          <button className={styles['event-section__button']}>See All</button>
        </Link>
      </div>
    </section>
  );
};

export default EventSection;
