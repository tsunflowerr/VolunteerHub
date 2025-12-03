import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import styles from './UsersTable.module.css';

function UserSearchFilter({
  searchTerm,
  onSearchChange,
  filterRole,
  onFilterChange,
}) {
  return (
    <div className={styles.controls}>
      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && <button onClick={() => onSearchChange('')}>×</button>}
      </div>

      <div className={styles.filterBox}>
        <label>Role:</label>
        <select
          value={filterRole}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          <option value="all">All</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
      </div>
    </div>
  );
}

UserSearchFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterRole: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default UserSearchFilter;
