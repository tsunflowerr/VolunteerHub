import { useNavigate } from 'react-router-dom';
import User from './User';
import styles from './User.module.css';

const UserList = ({ users }) => {
  const navigate = useNavigate();

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className={styles['usersContainer']}>
      {users.map((user) => (
        <User
          key={user._id}
          user={user}
          onAccessProfile={() => handleUserClick(user._id)}
        />
      ))}
    </div>
  );
};

export default UserList;
