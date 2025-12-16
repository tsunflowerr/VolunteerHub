import { useState, useMemo } from 'react';
import { Calendar, Lock } from 'lucide-react';
import { Pagination } from '@mui/material';
import EventList from '../../components/EventCard/EventList.jsx';
import SearchBox from '../../components/SearchBox/SearchBox.jsx';
import styles from './MyEvents.module.css';
import {
  useMyRegistrations,
  useEvents,
} from '../../hooks/useEvents';
import { useBookmarkedEvents } from '../../hooks/useUser';
import useAuth from '../../hooks/useAuth';

const MyEvents = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(12);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
  });

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
  // Note: We fetch ALL items (limit: 1000) to perform client-side filtering comfortably
  // since backend pagination doesn't support complex filtering on registrations endpoint easily yet.
  const { data: regData, isLoading: isRegLoading } = useMyRegistrations({
    status: registrationStatus,
    limit: 1000,
    // Only fetch if NOT on bookmarked tab
    enabled: activeTab !== 'bookmarked',
  });

  // Fetch Bookmarks
  const { data: bookData, isLoading: isBookLoading } = useBookmarkedEvents();

  // Process Data based on Active Tab & Search Params
  const { currentEvents, totalPages, isLoading } = useMemo(() => {
    let rawEvents = [];
    let loading = false;

    if (activeTab === 'bookmarked') {
      rawEvents = bookData?.bookmarks || [];
      loading = isBookLoading;
    } else {
      rawEvents = regData?.data?.map((reg) => reg.eventId) || [];
      loading = isRegLoading;
    }

    // Client-side Filtering
    let filteredEvents = rawEvents.filter((event) => {
      if (!event) return false;

      // Keyword Filter
      if (searchParams.keyword) {
        const keyword = searchParams.keyword.toLowerCase();
        const nameMatch = event.name?.toLowerCase().includes(keyword);
        const descMatch = event.description?.toLowerCase().includes(keyword);
        if (!nameMatch && !descMatch) return false;
      }

      // Category Filter
      if (searchParams.category) {
        // Assuming event.categories is an array of objects with 'slug'
        const hasCategory = event.categories?.some(
          (cat) => cat.slug === searchParams.category
        );
        if (!hasCategory) return false;
      }

      return true;
    });

    // Pagination
    const total = filteredEvents.length;
    const start = (currentPage - 1) * eventsPerPage;
    const end = start + eventsPerPage;

    return {
      currentEvents: filteredEvents.slice(start, end),
      totalPages: Math.ceil(total / eventsPerPage),
      isLoading: loading,
    };
  }, [
    activeTab,
    bookData,
    regData,
    currentPage,
    eventsPerPage,
    isBookLoading,
    isRegLoading,
    searchParams,
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
    setSearchParams({ keyword: '', category: '' }); // Optional: Reset search on tab change?
  };

  const handleSearch = (searchData) => {
    console.log('Search data:', searchData);
    setSearchParams({
      keyword: searchData.keyword || '',
      category: searchData.category || '',
    });
    setCurrentPage(1); // Reset to first page on new search
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
