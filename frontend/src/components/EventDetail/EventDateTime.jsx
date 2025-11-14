import { Calendar, ArrowRight } from 'lucide-react';
import styles from './EventDetail.module.css';

const EventDateTime = ({ startDate, endDate }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles['event-detail__section']}>
      <h3 className={styles['event-detail__section-title']}>DATE & TIME</h3>
      <div className={styles['event-detail__datetime']}>
        <div className={styles['event-detail__datetime-item']}>
          <Calendar size={24} />
          <div className={styles['event-detail__datetime-content']}>
            <span className={styles['event-detail__datetime-label']}>
              Start Date
            </span>
            <span className={styles['event-detail__datetime-value']}>
              {formatDate(startDate)}
            </span>
          </div>
        </div>
        <ArrowRight size={36} />
        <div className={styles['event-detail__datetime-item']}>
          <Calendar size={24} />
          <div className={styles['event-detail__datetime-content']}>
            <span className={styles['event-detail__datetime-label']}>
              End Date
            </span>
            <span className={styles['event-detail__datetime-value']}>
              {formatDate(endDate || startDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDateTime;
