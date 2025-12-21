import styles from './EventDetail.module.css';

const EventAbout = ({ description, activities, prepare, images = [] }) => {
  return (
    <div className={styles['event-detail__section']}>
      <h3 className={styles['event-detail__section-title']}>ABOUT</h3>

      {description && (
        <div className={styles['event-detail__subsection']}>
          <h2 className={styles['event-detail__section-subtitle']}>
            About the event
          </h2>
          <p className={styles['event-detail__section-subcontent']}>{description}</p>
        </div>
      )}

      <div className={styles['event-detail__subsection']}>
        <h2 className={styles['event-detail__section-subtitle']}>
          What will volunteers do?
        </h2>
        <p className={styles['event-detail__section-subcontent']}>
          {activities || 'No specific activities described.'}
        </p>
      </div>

      <div className={styles['event-detail__subsection']}>
        <h2 className={styles['event-detail__section-subtitle']}>
          What will volunteers need to bring or wear?
        </h2>
        <p className={styles['event-detail__section-subcontent']}>
          {prepare || 'No specific preparation required.'}
        </p>
      </div>

      {images && images.length > 0 && (
        <div className={styles['event-detail__subsection']}>
          <h2 className={styles['event-detail__section-subtitle']}>
            Some images of the event
          </h2>
          <div className={styles['event-detail__image-grid']}>
            {images.map((image, index) => (
              <div key={index} className={styles['event-detail__image-item']}>
                <img
                  src={image.url || image}
                  alt={image.alt || `Event image ${index + 1}`}
                  className={styles['event-detail__image']}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventAbout;
