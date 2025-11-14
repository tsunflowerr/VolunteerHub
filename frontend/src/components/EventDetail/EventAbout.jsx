import styles from './EventDetail.module.css';

const EventAbout = ({ about, activities, prepare }) => {
  return (
    <div className={styles['event-detail__section']}>
      <h3 className={styles['event-detail__section-title']}>ABOUT</h3>

      {about && (
        <div className={styles['event-detail__subsection']}>
          <h2 className={styles['event-detail__section-subtitle']}>
            About the event
          </h2>
          <p className={styles['event-detail__section-subcontent']}>{about}</p>
        </div>
      )}

      {activities && (
        <div className={styles['event-detail__subsection']}>
          <h2 className={styles['event-detail__section-subtitle']}>
            What will volunteers do?
          </h2>
          <p className={styles['event-detail__section-subcontent']}>
            {activities}
          </p>
        </div>
      )}

      {prepare && (
        <div className={styles['event-detail__subsection']}>
          <h2 className={styles['event-detail__section-subtitle']}>
            What will volunteers need to bring or wear?
          </h2>
          <p className={styles['event-detail__section-subcontent']}>
            {prepare}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventAbout;
