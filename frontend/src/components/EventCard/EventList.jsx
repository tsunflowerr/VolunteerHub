import { useState } from 'react';
import styles from './EventList.module.css';
import Event from './Event';

const EventList = ({ events }) => {
  return (
    <section className={styles['event-list']}>
      <div
        data-aos="fade-left"
        data-aos-anchor-placement="top-bottom"
        data-aos-easing="linear"
        data-aos-duration="1000"
        className={styles['event-list__container']}
      ></div>

      <div className={styles['event-list__grid']}>
        {events.map((event) => (
          <Event
            key={event._id}
            title={event.title}
            description={event.description}
            date={event.date}
            location={event.location}
            image={event.image}
            hostName={event.hostName}
            hostAvatar={event.hostAvatar}
            registeredCount={event.registeredCount}
            onLearnMore={() => {
              console.log('Learn more about:', event);
              // Handle learn more action - navigate to event details page
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default EventList;
