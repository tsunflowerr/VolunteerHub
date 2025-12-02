import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import styles from './CategoriesTable.module.css';

function CategorySearchFilter({ searchTerm, onSearchChange }) {
  return (
    <div className={styles.controls}>
      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
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

CategorySearchFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

export default CategorySearchFilter;
