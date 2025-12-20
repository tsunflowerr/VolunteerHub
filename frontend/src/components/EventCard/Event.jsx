import PropTypes from 'prop-types';
import { format, parseISO, isValid } from 'date-fns';
import { MapPin, Users, Star, Lock } from 'lucide-react';
import styles from './Event.module.css';
import CategoryChip from '../common/Category/CategoryChip';

export function Event({
  name,
  description,
  startDate,
  location,
  thumbnail,
  managerId,
  registrationsCount = 0,
  category,
  rewards,
  requirements,
  onLearnMore,
}) {
  //   const [isHovered, setIsHovered] = useState(false);

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

  const dateInfo = formatDate(startDate);

  // Extract manager info
  const hostName = managerId?.username || 'Unknown';
  const hostAvatar = managerId?.avatar || null;

  // Calculate total XP reward
  const totalXP = (rewards?.pointsReward || 0) + (rewards?.bonusPoints || 0);
  const hasRequirements = requirements?.hasRequirements;

  return (
    <div
      className={styles['event']}
      //   onMouseEnter={() => setIsHovered(true)}
      //   onMouseLeave={() => setIsHovered(false)}
      onClick={onLearnMore}
    >
      {/* Image Section with Date Badge */}
      <div className={styles['event__image-wrapper']}>
        {thumbnail && (
          <img src={thumbnail} alt={name} className={styles['event__image']} />
        )}

        {/* Date Badge */}
        <div className={styles['event__date-badge']}>
          <div className={styles['event__date-day']}>{dateInfo.day}</div>
          <div className={styles['event__date-month']}>{dateInfo.month}</div>
        </div>

        {/* Requirements Badge */}
        {hasRequirements && (
          <div className={styles['event__req-badge']}>
            <Lock size={12} />
          </div>
        )}
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
        <h3 className={styles['event__title']}>{name}</h3>

        {/* Categories */}

        {/* Description */}
        {description && (
          <p className={styles['event__description']}>{description}</p>
        )}

        {category && category.length > 0 && (
          <div className={styles['event__categories']}>
            {category.map((cat) => (
              <CategoryChip key={cat._id} category={cat} filled={false} />
            ))}
          </div>
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
              {registrationsCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

Event.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string,
  startDate: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string])
    .isRequired,
  location: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  managerId: PropTypes.shape({
    _id: PropTypes.string,
    username: PropTypes.string,
    avatar: PropTypes.string,
  }),
  registrationsCount: PropTypes.number,
  category: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      slug: PropTypes.string,
    })
  ),
  rewards: PropTypes.shape({
    pointsReward: PropTypes.number,
    bonusPoints: PropTypes.number,
    hoursCredit: PropTypes.number,
  }),
  requirements: PropTypes.shape({
    hasRequirements: PropTypes.bool,
    minLevel: PropTypes.number,
    minPoints: PropTypes.number,
  }),
  onLearnMore: PropTypes.func,
};

Event.defaultProps = {
  description: '',
  managerId: null,
  registrationsCount: 0,
  category: [],
  rewards: null,
  requirements: null,
  onLearnMore: () => {},
};

export default Event;
