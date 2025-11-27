import { MapPin } from 'lucide-react';
import styles from './EventDetail.module.css';

const EventLocation = ({ location }) => {
  return (
    <div className={styles['event-detail__section']}>
      <h3 className={styles['event-detail__section-title']}>LOCATION</h3>
      <div className={styles['event-detail__location']}>
        <div className={styles['event-detail__map-container']}>
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(
              location
            )}&output=embed`}
            width="100%"
            height="400"
            style={{ border: 0, borderRadius: '0.75rem' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
        <div className={styles['event-detail__address']}>
          <MapPin size={24} />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
};

export default EventLocation;