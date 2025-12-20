import { useNavigate } from 'react-router-dom';
import styles from './EventDetail.module.css';
import VerifiedBadge from '../common/VerifiedBadge';

const EventHost = ({ managerId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (managerId?._id) {
      navigate(`/profile/${managerId._id}`);
    }
  };

  return (
    <div className={styles['event-detail__host']} onClick={handleClick} style={{ cursor: 'pointer' }}>
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
          {managerId?.role && <VerifiedBadge role={managerId.role} size={16} />}
        </span>
      </div>
    </div>
  );
};

export default EventHost;
