import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './EventList.module.css';
import Event from './Event';

const EventList = ({ events }) => {
  const navigate = useNavigate();

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <>
      {/* <div
        data-aos="fade-left"
        data-aos-anchor-placement="top-bottom"
        data-aos-easing="linear"
        data-aos-duration="1000"
        className={styles['event-list__container']}
      ></div> */}

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
            categories={event.categories}
            onLearnMore={() => handleEventClick(event._id)}
          />
        ))}
      </div>
    </>
  );
};

export default EventList;
