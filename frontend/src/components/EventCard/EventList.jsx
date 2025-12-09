import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './EventList.module.css';
import Event from './Event';

const EventList = ({ events }) => {
  const navigate = useNavigate();

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  if (!events || events.length === 0) {
    return (
      <motion.div
        className={styles['no-events']}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        No event yet
      </motion.div>
    );
  }

  return (
    <div className={styles['event-list__grid']}>
      <AnimatePresence mode="popLayout">
        {events.map((event, index) => (
          <motion.div
            key={event._id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Event
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default EventList;
