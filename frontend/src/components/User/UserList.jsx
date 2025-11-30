import { useNavigate } from 'react-router-dom';
import User from './User';
import styles from './User.module.css';

const UserList = ({ users }) => {
  const handleUserClick = (e) => {
    console.log('user clicked');
  };
  return (
    <div className={styles['usersContainer']}>
      {users.map((user) => (
        <User key={user._id} user={user} onAccessProfile={handleUserClick} />
      ))}
    </div>
  );
};

export default UserList;
