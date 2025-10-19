import { useState } from 'react';
import PropTypes from 'prop-types';
import { format, parseISO, isValid } from 'date-fns';
import styles from './EventCard.module.css';

export function EventCard({ title, description, date, onLearnMore, image }) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateValue) => {
    const dateObj =
      typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;

    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }

    return format(dateObj, 'MMMM d, yyyy');
  };

  return (
    <div
      className={styles['event-card']}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      {image && (
        <div className={styles['event-card__image-wrapper']}>
          <img
            src={image}
            alt={title}
            className={styles['event-card__image']}
          />
        </div>
      )}

      {/* Content Section */}
      <div className={styles['event-card__content']}>
        {/* Date Badge */}
        <div className={styles['event-card__date-badge']}>
          {formatDate(date)}
        </div>

        {/* Title */}
        <h3 className={styles['event-card__title']}>{title}</h3>

        {/* Description */}
        <p className={styles['event-card__description']}>{description}</p>

        {/* Learn More Button */}
        <button
          onClick={onLearnMore}
          className={`${styles['event-card__button']} ${
            isHovered ? styles['event-card__button--hovered'] : ''
          }`}
        >
          Learn More
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${styles['event-card__icon']} ${
              isHovered ? styles['event-card__icon--hovered'] : ''
            }`}
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

EventCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string])
    .isRequired,
  onLearnMore: PropTypes.func,
  image: PropTypes.string,
};

EventCard.defaultProps = {
  onLearnMore: undefined,
  image: undefined,
};
