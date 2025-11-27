import { useState } from 'react';
import SearchBox from '../../components/SearchBox/SearchBox';
import EventList from '../../components/EventCard/EventList.jsx';
import { volunteerEvents } from '../../dummy/volunteerEvents';
import { Pagination } from '@mui/material';
import styles from './Events.module.css';

const Events = () => {
  const [events, setEvents] = useState(volunteerEvents);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(12);

  // Get current events
  const totalEvents = events.length;
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  // Change page
  const handleChangePage = (e, value) => setCurrentPage(value);

  const handleSearch = (searchData) => {
    console.log('Search data:', searchData);
    // Implement search functionality
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
        <EventList events={currentEvents} />
        <Pagination
          className={styles['events__pagination']}
          count={Math.ceil(totalEvents / eventsPerPage)}
          shape="rounded"
          page={currentPage}
          onChange={handleChangePage}
        />
      </div>
    </>
  );
};

export default Events;
