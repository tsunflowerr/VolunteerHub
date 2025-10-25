import { useState } from 'react';
import { Search } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = () => {
  const [searchData, setSearchData] = useState({
    organization: '',
    location: '',
    date: '',
    searchQuery: '',
  });

  const categories = [
    { id: 'all', name: 'All', icon: '🔘' },
    { id: 'animals', name: 'Animals', icon: '🐾' },
    { id: 'poverty', name: 'Poverty', icon: '📦' },
    { id: 'food', name: 'Food', icon: '🍽️' },
    { id: 'water', name: 'Water & Sanitation', icon: '💧' },
    { id: 'health', name: 'Health', icon: '❤️' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'equality', name: 'Equality', icon: '⚖️' },
    { id: 'energy', name: 'Energy', icon: '⚡' },
    { id: 'arts', name: 'Arts and Culture', icon: '🎨' },
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
    console.log('Search data:', searchData);
    // Implement search functionality
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    console.log('Selected category:', categoryId);
  };

  return (
    <section className={styles['hero']}>
      <div className={styles['hero__overlay']}></div>
      <div className={styles['hero__container']}>
        <div className={styles['hero__content']}>
          <h1 className={styles['hero__title']}>
            Find Volunteer Opportunities
          </h1>
          <p className={styles['hero__subtitle']}>
            Discover meaningful ways to give back to your community
          </p>

          {/* Search Card */}
          <div className={styles['hero__search-card']}>
            {/* Search Inputs */}
            <div className={styles['hero__search-inputs']}>
              <div className={styles['hero__input-group']}>
                <label className={styles['hero__label']}>Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={searchData.organization}
                  onChange={handleInputChange}
                  placeholder="All Organizations"
                  className={styles['hero__input']}
                />
              </div>

              <div className={styles['hero__input-group']}>
                <label className={styles['hero__label']}>Where</label>
                <input
                  type="text"
                  name="location"
                  value={searchData.location}
                  onChange={handleInputChange}
                  placeholder="Any ZipCode"
                  className={styles['hero__input']}
                />
              </div>

              <div className={styles['hero__input-group']}>
                <label className={styles['hero__label']}>When</label>
                <input
                  type="text"
                  name="date"
                  value={searchData.date}
                  onChange={handleInputChange}
                  placeholder="Any Dates"
                  className={styles['hero__input']}
                />
              </div>

              <button
                onClick={handleSearch}
                className={styles['hero__search-button']}
              >
                <Search size={20} />
                Search
              </button>
            </div>

            {/* Categories */}
            <div className={styles['hero__categories']}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`${styles['hero__category-btn']} ${
                    selectedCategory === category.id
                      ? styles['hero__category-btn--active']
                      : ''
                  }`}
                >
                  <span className={styles['hero__category-icon']}>
                    {category.icon}
                  </span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* Search by Name */}
            <div className={styles['hero__search-by-name']}>
              <Search
                size={20}
                className={styles['hero__search-by-name-icon']}
              />
              <input
                type="text"
                name="searchQuery"
                value={searchData.searchQuery}
                onChange={handleInputChange}
                placeholder="Search events by name"
                className={styles['hero__search-by-name-input']}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
