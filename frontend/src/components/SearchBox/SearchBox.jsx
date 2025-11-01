import { useState } from 'react';
import PropTypes from 'prop-types';
import { Search } from 'lucide-react';
import styles from './SearchBox.module.css';
import { CategoryIcons } from '../../utilities/CategoriesIcons.jsx';

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

  const categories = [
    { id: 'all', name: 'All', icon: CategoryIcons.all },
    { id: 'animal', name: 'Animals', icon: CategoryIcons.animal },
    { id: 'help', name: 'Help', icon: CategoryIcons.help },
    { id: 'food', name: 'Food', icon: CategoryIcons.food },
    { id: 'health', name: 'Health', icon: CategoryIcons.health },
    { id: 'book', name: 'Education', icon: CategoryIcons.book },
    { id: 'equality', name: 'Equality', icon: CategoryIcons.equality },
    { id: 'climate', name: 'Climate', icon: CategoryIcons.climate },
    {
      id: 'communityDevelop',
      name: 'Community Development',
      icon: CategoryIcons.communityDevelop,
    },
    { id: 'organize', name: 'Event Organizer', icon: CategoryIcons.organize },
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');

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
        category: selectedCategory,
      });
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className={styles['search-box']}>
      {/* Search Inputs */}
      <div className={styles['search-box__inputs']}>
        <div className={styles['search-box__input-group']}>
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

        <div className={styles['search-box__input-group']}>
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
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`${styles['search-box__category-btn']} ${
                selectedCategory === category.id
                  ? styles['search-box__category-btn--active']
                  : ''
              }`}
            >
              <span className={styles['search-box__category-icon']}>
                {category.icon}
              </span>
              {category.name}
            </button>
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
