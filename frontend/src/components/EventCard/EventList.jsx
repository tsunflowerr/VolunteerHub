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
            name={event.name}
            description={event.description}
            startDate={event.startDate}
            location={event.location}
            thumbnail={event.thumbnail}
            managerId={event.managerId}
            registrationsCount={event.registrationsCount}
            category={event.category}
            onLearnMore={() => handleEventClick(event._id)}
          />
        ))}
      </div>
    </>
  );
};

export default EventList;
