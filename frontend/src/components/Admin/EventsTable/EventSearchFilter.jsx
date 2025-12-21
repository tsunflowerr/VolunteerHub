import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import styles from './EventsTable.module.css';

function EventSearchFilter({ searchTerm, onSearchChange }) {
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
    </div>
  );
}

EventSearchFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default EventSearchFilter;
