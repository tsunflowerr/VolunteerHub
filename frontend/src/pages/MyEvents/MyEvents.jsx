import { useState } from 'react';
import { Grid3x3, Calendar } from 'lucide-react';
import EventList from '../../components/EventCard/EventList.jsx';
import SearchBox from '../../components/SearchBox/SearchBox.jsx';
import { volunteerEvents } from '../../dummy/volunteerEvents.js';
import { Pagination } from '@mui/material';
import styles from './MyEvents.module.css';

const MyEvents = () => {
  const [events, setEvents] = useState(volunteerEvents);
  const [activeTab, setActiveTab] = useState('enrolled');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(12);

  // Get current events
  const totalEvents = events.length;
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  // Change page
  const handleChangePage = (e, value) => setCurrentPage(value);

  // Handle search
  const handleSearch = (searchData) => {
    console.log('Search data:', searchData);
    // TODO: Implement search logic
  };

  return (
    <div className={styles['my-events']}>
      <div className={styles['my-events__container']}>
        {/* Header */}
        <div className={styles['my-events__header']}>
          <h1 className={styles['my-events__title']}>My Events</h1>
          {/* <div className={styles['my-events__view-toggle']}>
            <button
              className={`${styles['my-events__view-btn']} ${
                viewMode === 'grid' ? styles['my-events__view-btn--active'] : ''
              }`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 size={20} />
              Grid View
            </button>
            <button
              className={`${styles['my-events__view-btn']} ${
                viewMode === 'calendar'
                  ? styles['my-events__view-btn--active']
                  : ''
              }`}
              onClick={() => setViewMode('calendar')}
            >
              <Calendar size={20} />
              Calendar View
            </button>
          </div> */}
        </div>

        {/* Search Box */}
        <div className={styles['my-events__search']}>
          <SearchBox
            onSearch={handleSearch}
            showCategories={true}
            showSearchByName={true}
          />
        </div>

        {/* Tabs */}
        <div className={styles['my-events__tabs']}>
          <button
            className={`${styles['my-events__tab']} ${
              activeTab === 'enrolled' ? styles['my-events__tab--active'] : ''
            }`}
            onClick={() => setActiveTab('enrolled')}
          >
            Enrolled Events
          </button>
          <button
            className={`${styles['my-events__tab']} ${
              activeTab === 'requested' ? styles['my-events__tab--active'] : ''
            }`}
            onClick={() => setActiveTab('requested')}
          >
            Requested Events
          </button>
          <button
            className={`${styles['my-events__tab']} ${
              activeTab === 'past' ? styles['my-events__tab--active'] : ''
            }`}
            onClick={() => setActiveTab('past')}
          >
            Past Events
          </button>
        </div>
        {/* Events Content */}
        {currentEvents.length > 0 ? (
          <div className={styles['my-events__list-container']}>
            <EventList events={currentEvents} />
            <Pagination
              className={styles['my-events__pagination']}
              count={Math.ceil(totalEvents / eventsPerPage)}
              shape="rounded"
              page={currentPage}
              onChange={handleChangePage}
            />
          </div>
        ) : (
          <div className={styles['my-events__empty']}>
            <Calendar size={80} className={styles['my-events__empty-icon']} />
            <p className={styles['my-events__empty-text']}>
              There are no events to see here...yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
