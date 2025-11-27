import styles from './EventDetail.module.css';

const EventHost = ({ managerId }) => {
  return (
    <div className={styles['event-detail__host']}>
      <img
        src={
          managerId?.avatar ||
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'
        }
        alt={managerId?.username || 'Manager'}
        className={styles['event-detail__host-avatar']}
      />
      <div className={styles['event-detail__host-info']}>
        <span className={styles['event-detail__host-label']}>Organized by</span>
        <span className={styles['event-detail__host-name']}>
          {managerId?.username || 'Unknown'}
        </span>
      </div>
    </div>
  );
};

export default EventHost;
