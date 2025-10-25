import { useState } from 'react';
import PropTypes from 'prop-types';
import { format, parseISO, isValid } from 'date-fns';
import { MapPin, Heart, Users } from 'lucide-react';
import styles from './Event.module.css';

export function Event({
  title,
  description,
  date,
  location,
  image,
  hostName,
  hostAvatar,
  registeredCount = 0,
  onLearnMore,
}) {
  //   const [isHovered, setIsHovered] = useState(false);

  // Debug: Log the props
  console.log('Event props:', { title, hostName, hostAvatar, registeredCount });

  const formatDate = (dateValue) => {
    const dateObj =
      typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;

    if (!isValid(dateObj)) {
      return { day: '00', month: 'XXX' };
    }

    return {
      day: format(dateObj, 'd'),
      month: format(dateObj, 'MMM').toUpperCase(),
    };
  };

  const dateInfo = formatDate(date);

  return (
    <div
      className={styles['event']}
      //   onMouseEnter={() => setIsHovered(true)}
      //   onMouseLeave={() => setIsHovered(false)}
      onClick={onLearnMore}
    >
      {/* Image Section with Date Badge */}
      <div className={styles['event__image-wrapper']}>
        {image && (
          <img src={image} alt={title} className={styles['event__image']} />
        )}

        {/* Date Badge */}
        <div className={styles['event__date-badge']}>
          <div className={styles['event__date-day']}>{dateInfo.day}</div>
          <div className={styles['event__date-month']}>{dateInfo.month}</div>
        </div>
      </div>

      {/* Content Section */}
      <div className={styles['event__content']}>
        {/* Location */}
        {location && (
          <div className={styles['event__location']}>
            <MapPin size={14} />
            <span className={styles['event__location-text']}>{location}</span>
          </div>
        )}

        {/* Title */}
        <h3 className={styles['event__title']}>{title}</h3>

        {/* Description */}
        {description && (
          <p className={styles['event__description']}>{description}</p>
        )}

        {/* Footer with Host and Registered Count */}
        <div className={styles['event__footer']}>
          {/* Host */}
          <div className={styles['event__host']}>
            {hostAvatar && (
              <img
                src={hostAvatar}
                alt={hostName || 'Host'}
                className={styles['event__host-logo']}
              />
            )}
            <div className={styles['event__host-info']}>
              <div className={styles['event__host-name']}>
                {hostName || 'No host name'}
              </div>
              <div className={styles['event__host-type']}>Event Host</div>
            </div>
          </div>

          {/* Registered Count */}
          <div className={styles['event__registered']}>
            <Users size={16} className={styles['event__registered-icon']} />
            <span className={styles['event__registered-count']}>
              {registeredCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

Event.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string])
    .isRequired,
  location: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  hostName: PropTypes.string.isRequired,
  hostAvatar: PropTypes.string,
  registeredCount: PropTypes.number,
  onLearnMore: PropTypes.func,
};

Event.defaultProps = {
  description: '',
  hostAvatar: null,
  registeredCount: 0,
  onLearnMore: () => {},
  onFavorite: null,
  isFavorited: false,
};

export default Event;
