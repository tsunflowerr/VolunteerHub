import { useState, useMemo } from 'react';
import { Calendar, Lock } from 'lucide-react';
import { Pagination } from '@mui/material';
import EventList from '../../components/EventCard/EventList.jsx';
import SearchBox from '../../components/SearchBox/SearchBox.jsx';
import styles from './MyEvents.module.css';
import { useMyRegistrations } from '../../hooks/useRegistrations';
import { useBookmarkedEvents } from '../../hooks/useUser';
import useAuth from '../../hooks/useAuth';

const MyEvents = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(12);

  // Restrict access for Admin and Manager
  if (user && (user.role === 'admin' || user.role === 'manager')) {
    return (
      <div className={styles['my-events']}>
        <div className={styles['my-events__container']}>
          <div className={styles['my-events__empty']}>
            <Lock size={80} className={styles['my-events__empty-icon']} />
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>
              Volunteer Access Only
            </h2>
            <p className={styles['my-events__empty-text']}>
              This page is designed for volunteers to manage their event
              registrations. As a {user.role}, please use your dashboard to
              manage events.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine status for useMyRegistrations hook based on active tab
  const registrationStatus = useMemo(() => {
    switch (activeTab) {
      case 'enrolled':
        return 'confirmed';
      case 'requested':
        return 'pending';
      case 'past':
        return 'completed';
      default:
        return undefined;
    }
  }, [activeTab]);

  // Fetch Registrations (Enrolled, Requested, Past)
  const { data: regData, isLoading: isRegLoading } = useMyRegistrations({
    status: registrationStatus,
    page: currentPage,
    limit: eventsPerPage,
    // Only fetch if NOT on bookmarked tab
    enabled: activeTab !== 'bookmarked',
  });

  // Fetch Bookmarks
  const { data: bookData, isLoading: isBookLoading } = useBookmarkedEvents();

  // Process Data based on Active Tab
  const { currentEvents, totalPages, isLoading } = useMemo(() => {
    if (activeTab === 'bookmarked') {
      const allBookmarks = bookData?.bookmarks || [];
      const total = allBookmarks.length;
      const start = (currentPage - 1) * eventsPerPage;
      const end = start + eventsPerPage;
      return {
        currentEvents: allBookmarks.slice(start, end),
        totalPages: Math.ceil(total / eventsPerPage),
        isLoading: isBookLoading,
      };
    } else {
      // For registrations, data is already paginated by backend
      // Map registration objects to event objects
      const events = regData?.data?.map((reg) => reg.eventId) || [];
      return {
        currentEvents: events,
        totalPages: regData?.pagination?.totalPages || 0,
        isLoading: isRegLoading,
      };
    }
  }, [
    activeTab,
    bookData,
    regData,
    currentPage,
    eventsPerPage,
    isBookLoading,
    isRegLoading,
  ]);

  // Change page
  const handleChangePage = (e, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = (searchData) => {
    console.log('Search data:', searchData);
    // TODO: Implement client-side filtering or pass params to hooks
  };

  return (
    <div className={styles['my-events']}>
      <div className={styles['my-events__container']}>
        {/* Header */}
        <div className={styles['my-events__header']}>
          <h1 className={styles['my-events__title']}>My Events</h1>
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
            onClick={() => handleTabChange('enrolled')}
          >
            Enrolled Events
          </button>
          <button
            className={`${styles['my-events__tab']} ${
              activeTab === 'bookmarked' ? styles['my-events__tab--active'] : ''
            }`}
            onClick={() => handleTabChange('bookmarked')}
          >
            Bookmarked Events
          </button>
          <button
            className={`${styles['my-events__tab']} ${
              activeTab === 'requested' ? styles['my-events__tab--active'] : ''
            }`}
            onClick={() => handleTabChange('requested')}
          >
            Requested Events
          </button>
          <button
            className={`${styles['my-events__tab']} ${
              activeTab === 'past' ? styles['my-events__tab--active'] : ''
            }`}
            onClick={() => handleTabChange('past')}
          >
            Past Events
          </button>
        </div>

        {/* Events Content */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : currentEvents.length > 0 ? (
          <div className={styles['my-events__list-container']}>
            <EventList events={currentEvents} />
            {totalPages > 1 && (
              <Pagination
                className={styles['my-events__pagination']}
                count={totalPages}
                shape="rounded"
                page={currentPage}
                onChange={handleChangePage}
              />
            )}
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
