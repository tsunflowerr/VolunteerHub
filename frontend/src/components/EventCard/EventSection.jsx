import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './EventSection.module.css';
import { volunteerEvents } from '../../dummy/volunteerEvents';
import Event from './Event';

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
          <Event
            key={volunteer._id}
            name={volunteer.name}
            description={volunteer.description}
            startDate={volunteer.startDate}
            location={volunteer.location}
            thumbnail={volunteer.thumbnail}
            managerId={volunteer.managerId}
            registrationsCount={volunteer.registrationsCount}
            category={volunteer.category}
            onLearnMore={() => {
              console.log('Learn more about:', volunteer);
              // Handle learn more action - navigate to event details page
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
