import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import styles from './SearchBox.module.css';
import { useCategories } from '../../hooks/useCategories';
import { CategoryChip } from '../common';

const SearchBox = ({
  onSearch,
  showCategories = true,
  showSearchByName = true,
}) => {
  const [searchData, setSearchData] = useState({
    organization: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    searchQuery: '',
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('newest');

  const { categories, isLoading } = useCategories();

  // Check if all categories are selected
  const allSelected =
    categories.length > 0 && selectedCategories.length === categories.length;

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'trending', label: 'Trending' },
    { value: 'upcoming', label: 'Upcoming' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        ...searchData,
        // If all selected or none selected, pass empty array (meaning all)
        categories:
          allSelected || selectedCategories.length === 0
            ? []
            : selectedCategories,
        sortBy: sortBy,
      });
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

    const handleCategoryClick = (categorySlug) => {

      // Toggle individual category

      setSelectedCategories((prev) =>

        prev.includes(categorySlug)

          ? prev.filter((slug) => slug !== categorySlug)

          : [...prev, categorySlug]

      );

    };

  

    // Check if a category is selected

    const isCategorySelected = (categorySlug) => {

      return selectedCategories.includes(categorySlug);

    };

  

    return (
    <div className={styles['search-box']}>
      {/* Search Inputs */}
      <div className={styles['search-box__inputs']}>
        <div
          className={`${styles['search-box__input-group']} ${styles['search-box__input-group-startDate']}`}
        >
          <label className={styles['search-box__label']}>From</label>
          <input
            type="date"
            name="dateFrom"
            value={searchData.dateFrom}
            onChange={handleInputChange}
            placeholder="Start Date"
            className={styles['search-box__input']}
          />
        </div>

        <div
          className={`${styles['search-box__input-group']} ${styles['search-box__input-group-endDate']}`}
        >
          <label className={styles['search-box__label']}>To</label>
          <input
            type="date"
            name="dateTo"
            value={searchData.dateTo}
            onChange={handleInputChange}
            placeholder="End Date"
            min={searchData.dateFrom}
            className={styles['search-box__input']}
          />
        </div>

        <div
          className={`${styles['search-box__input-group']} ${styles['search-box__input-group-location']}`}
        >
          <label className={styles['search-box__label']}>Location</label>
          <input
            type="text"
            name="location"
            value={searchData.location}
            onChange={handleInputChange}
            placeholder="Enter location"
            className={styles['search-box__input']}
          />
        </div>

        <div
          className={`${styles['search-box__input-group']} ${styles['search-box__input-group-location']}`}
        >
          <label className={styles['search-box__label']}>Sort By</label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className={styles['search-box__select']}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSearch}
          className={styles['search-box__search-button']}
        >
          <Search size={20} />
          Search
        </button>
      </div>

      {/* Categories */}
      {showCategories && (
        <div className={styles['search-box__categories']}>
          {/* Individual categories */}
          {categories.map((category) => (
            <CategoryChip
              key={category._id}
              category={category}
              onClick={() => handleCategoryClick(category.slug)}
              filled={isCategorySelected(category.slug)}
            />
          ))}
        </div>
      )}

      {/* Search by Name */}
      {showSearchByName && (
        <div className={styles['search-box__search-by-name']}>
          <Search
            size={20}
            className={styles['search-box__search-by-name-icon']}
          />
          <input
            type="text"
            name="searchQuery"
            value={searchData.searchQuery}
            onChange={handleInputChange}
            placeholder="Search events by name"
            className={styles['search-box__search-by-name-input']}
          />
        </div>
      )}
    </div>
  );
};

SearchBox.propTypes = {
  onSearch: PropTypes.func,
  showCategories: PropTypes.bool,
  showSearchByName: PropTypes.bool,
};

export default SearchBox;
