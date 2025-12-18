import { useState, useMemo } from 'react';
import { Calendar, Lock } from 'lucide-react';
import { Pagination } from '@mui/material';
import EventList from '../../components/EventCard/EventList.jsx';
import SearchBox from '../../components/SearchBox/SearchBox.jsx';
import styles from './MyEvents.module.css';
import { useMyRegistrations, useEvents } from '../../hooks/useEvents';
import { useBookmarkedEvents } from '../../hooks/useUser';
import useAuth from '../../hooks/useAuth';

const MyEvents = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('enrolled');
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    sort: 'newest',
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
      case 'completed':
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
    limit: 100,
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
    let filteredEvents = (rawEvents || []).filter((event) => !!event);

    // Keyword (searchQuery) - search in name, description, location, manager username
    if (searchParams.keyword) {
      const keyword = searchParams.keyword.trim().toLowerCase();
      if (keyword.length > 0) {
        filteredEvents = filteredEvents.filter((event) => {
          const name = event.name || '';

          return name.toLowerCase().includes(keyword);
        });
      }
    }

    // Category filter (support multiple categories)
    if (searchParams.category && searchParams.category.length > 0) {
      const catSlugs = Array.isArray(searchParams.category)
        ? searchParams.category
        : [searchParams.category];

      filteredEvents = filteredEvents.filter((event) =>
        Array.isArray(event.categories)
          ? event.categories.some((c) => catSlugs.includes(c.slug))
          : false
      );
    }

    // Location filter (substring match)
    if (searchParams.location) {
      const loc = searchParams.location.trim().toLowerCase();
      if (loc.length > 0) {
        filteredEvents = filteredEvents.filter((event) =>
          (event.location || '').toLowerCase().includes(loc)
        );
      }
    }

    // Date range filter (startDate between dateFrom and dateTo)
    if (searchParams.startDate || searchParams.endDate) {
      const from = searchParams.startDate
        ? new Date(searchParams.startDate)
        : null;
      const to = searchParams.endDate ? new Date(searchParams.endDate) : null;

      filteredEvents = filteredEvents.filter((event) => {
        if (!event.startDate) return false;
        const evDate = new Date(event.startDate);
        if (Number.isNaN(evDate.getTime())) return false;

        if (from && evDate < from) return false;
        if (to && evDate > to) return false;
        return true;
      });
    }

    // Sorting
    const sortBy = searchParams.sort || 'newest';
    const now = new Date();

    const getStartDate = (ev) => {
      const d = ev.startDate ? new Date(ev.startDate) : null;
      return d && !Number.isNaN(d.getTime()) ? d : null;
    };

    const relevanceScore = (ev, keyword) => {
      if (!keyword) return 0;
      const k = keyword.toLowerCase();
      let score = 0;
      if (ev.name?.toLowerCase().includes(k)) score += 10;
      if (ev.description?.toLowerCase().includes(k)) score += 5;
      if (ev.location?.toLowerCase().includes(k)) score += 3;
      if (ev.managerId?.username?.toLowerCase().includes(k)) score += 2;
      return score;
    };

    // If sorting by upcoming, only include future events
    if (sortBy === 'upcoming') {
      filteredEvents = filteredEvents.filter((ev) => {
        const sd = getStartDate(ev);
        return sd && sd > now;
      });
    }

    filteredEvents.sort((a, b) => {
      switch (sortBy) {
        case 'relevance': {
          const scoreA = relevanceScore(a, searchParams.keyword);
          const scoreB = relevanceScore(b, searchParams.keyword);
          return scoreB - scoreA;
        }
        case 'upcoming': {
          const da = getStartDate(a);
          const db = getStartDate(b);
          // prefer nearest future date (future first), then past by proximity
          const pa = da ? Math.abs(da - now) : Infinity;
          const pb = db ? Math.abs(db - now) : Infinity;
          return pa - pb;
        }
        case 'popular':
        case 'trending': {
          const ra = Number(a.registrationsCount) || 0;
          const rb = Number(b.registrationsCount) || 0;
          return rb - ra;
        }
        case 'newest':
        default: {
          // Newest: latest startDate first
          const da = getStartDate(a);
          const db = getStartDate(b);
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return db - da;
        }
      }
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
    setSearchParams({
      keyword: '',
      category: '',
      location: '',
      startDate: '',
      endDate: '',
      sort: 'newest',
    }); // Optional: Reset search on tab change?
  };

  const handleSearch = (searchData) => {
    console.log('Search data:', searchData);
    setSearchParams({
      keyword: searchData.searchQuery || '',
      category:
        searchData.categories && searchData.categories.length > 0
          ? searchData.categories
          : null,
      location: searchData.location || '',
      startDate: searchData.dateFrom || '',
      endDate: searchData.dateTo || '',
      sort: searchData.sortBy || 'newest',
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
              activeTab === 'completed' ? styles['my-events__tab--active'] : ''
            }`}
            onClick={() => handleTabChange('completed')}
          >
            Completed Events
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
