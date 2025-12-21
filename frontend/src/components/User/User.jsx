import VerifiedBadge from '../common/VerifiedBadge';
import styles from './User.module.css';

const User = ({ user, onAccessProfile }) => {
  return (
    <div className={styles['userCard']} onClick={onAccessProfile}>
      <img
        className={styles['userAvatar']}
        src={user.avatar}
        alt={user.username}
      />
      <div className={styles['userInfo']}>
        <h2 className={styles['username']}>
          {user.username}
          <VerifiedBadge role={user.role} size={14} />
        </h2>
        <p className={styles['bio']}>{user.bio}</p>
      </div>
    </div>
  );
};

export default User;
