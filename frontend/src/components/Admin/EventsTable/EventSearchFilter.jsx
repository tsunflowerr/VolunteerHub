import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import styles from './EventsTable.module.css';

function EventSearchFilter({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
}) {
  return (
    <div className={styles.controls}>
      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by event name or organizer..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        {searchTerm && (
          <button
            className={styles.clearSearch}
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className={styles.filterBox}>
        <label>Status:</label>
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
    </div>
  );
}

EventSearchFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  filterStatus: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default EventSearchFilter;
