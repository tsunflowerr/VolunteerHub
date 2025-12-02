import PropTypes from 'prop-types';
import { Shield, ShieldOff, Trash2, Loader2 } from 'lucide-react';
import styles from './UsersTable.module.css';

const renderRole = (role) => {
  const roleMap = {
    admin: { label: 'Admin', className: styles.roleAdmin },
    manager: { label: 'Manager', className: styles.roleManager },
    user: { label: 'User', className: styles.roleUser },
  };
  const roleInfo = roleMap[role] || roleMap.user;
  return (
    <span className={`${styles.roleBadge} ${roleInfo.className}`}>
      {roleInfo.label}
    </span>
  );
};

function UserTable({
  users,
  startIndex,
  onToggleLock,
  isLockPending,
  lockingUserId,
  emptyMessage,
}) {
  if (users.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" className={styles.textCenter}>
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>No.</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user._id}>
              <td>{startIndex + index + 1}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{renderRole(user.role)}</td>
              <td>
                <span
                  className={
                    user.isLocked ? styles.statusLocked : styles.statusActive
                  }
                >
                  {user.isLocked ? 'Locked' : 'Active'}
                </span>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString('en-US')}</td>
              <td>
                <div className={styles.actionButtons}>
                  <button
                    className={
                      user.isLocked ? styles.btnUnlock : styles.btnLock
                    }
                    onClick={() => onToggleLock(user._id)}
                    disabled={isLockPending}
                    title={user.isLocked ? 'Unlock' : 'Lock account'}
                  >
                    {isLockPending && lockingUserId === user._id ? (
                      <Loader2 size={16} className={styles.spinner} />
                    ) : user.isLocked ? (
                      <Shield size={16} />
                    ) : (
                      <ShieldOff size={16} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

UserTable.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string,
      email: PropTypes.string,
      role: PropTypes.string,
      isLocked: PropTypes.bool,
      createdAt: PropTypes.string,
    })
  ).isRequired,
  startIndex: PropTypes.number.isRequired,
  onToggleLock: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isLockPending: PropTypes.bool,
  lockingUserId: PropTypes.string,
  emptyMessage: PropTypes.string,
};

UserTable.defaultProps = {
  isLockPending: false,
  lockingUserId: null,
  emptyMessage: 'No users yet',
};

export default UserTable;
