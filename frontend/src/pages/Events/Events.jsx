import { useState } from 'react';
import { Pagination } from '@mui/material';
import SearchBox from '../../components/SearchBox/SearchBox';
import EventList from '../../components/EventCard/EventList.jsx';
import styles from './Events.module.css';
import { useEvents } from '../../hooks/useEvents';

const Events = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(12);
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    sort: 'newest',
  });

  // Clean up filters to remove empty strings before sending to API
  const activeFilters = Object.fromEntries(
    Object.entries(filters).filter(
      ([_, v]) => v !== '' && v !== null && v !== undefined
    )
  );

  const { data, isLoading } = useEvents({
    page: currentPage,
    limit: eventsPerPage,
    status: 'approved',
    ...activeFilters,
  });

  const events = data?.events || [];
  const totalPages = data?.pagination?.totalPages || 0;

  // Change page
  const handleChangePage = (e, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (searchData) => {
    setFilters({
      keyword: searchData.searchQuery || '',
      category:
        searchData.categories && searchData.categories.length > 0
          ? searchData.categories[0]
          : '',
      location: searchData.location || '',
      startDate: searchData.dateFrom || '',
      endDate: searchData.dateTo || '',
      sort: searchData.sortBy || 'newest',
    });
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <>
      {/* Hero Section */}
      <section className={styles['events__hero']}>
        <div className={styles['events__hero-overlay']}></div>
        <div className={styles['events__hero-container']}>
          <div className={styles['events__hero-content']}>
            <h1 className={styles['events__hero-title']}>
              Find Volunteer Opportunities
            </h1>
            <p className={styles['events__hero-subtitle']}>
              Discover meaningful ways to give back to your community
            </p>

            {/* Search Box */}
            <SearchBox
              onSearch={handleSearch}
              showCategories={true}
              showSearchByName={true}
            />
          </div>
        </div>
      </section>

      {/* Events List */}
      <div className={styles['events__list-container']}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : (
          <>
            <EventList events={events} />
            {totalPages > 1 && (
              <Pagination
                className={styles['events__pagination']}
                count={totalPages}
                shape="rounded"
                page={currentPage}
                onChange={handleChangePage}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Events;
