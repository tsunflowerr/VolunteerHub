import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Users, FileText, Search } from 'lucide-react';
import styles from './SearchResult.module.css';
import EventList from '../../components/EventCard/EventList';
import UserList from '../../components/User/UserList';
import { useAdvancedSearch } from '../../hooks/useSearch';
import LoadingOverlay from '../../components/common/LoadingOverlay';

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeType, setActiveType] = useState('all');

  // Search result types configuration
  const resultTypes = [
    { id: 'all', label: 'All Results', icon: Search },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users },
    // Temporarily disabled until post results are implemented
    /* { id: 'posts', label: 'Posts', icon: FileText }, */
  ];

  // Fetch data using the hook
  const { data, isLoading, isError } = useAdvancedSearch({
    q: query,
    type: activeType,
    limit: 10, // Default limit
  });

  // Process data for display
  const processedData = useMemo(() => {
    if (!data) return { events: [], users: [], posts: [], counts: {} };

    // Handle "All" view response
    if (activeType === 'all' && data.results) {
      const events =
        data.results.find((r) => r.type === 'events')?.preview || [];
      const users = data.results.find((r) => r.type === 'users')?.preview || [];

      const counts = {
        all: data.totalResults || 0,
        events: data.results.find((r) => r.type === 'events')?.count || 0,
        users: data.results.find((r) => r.type === 'users')?.count || 0,
        // posts count temporarily omitted
      };

      // posts omitted until post results are implemented
      return { events, users, posts: [], counts };
    }

    // Handle specific type view response
    // When fetching a specific type, the API returns { data: [...], pagination: ... }
    const items = data.data || [];
    const total = data.pagination?.totalResults || 0;

    return {
      events: activeType === 'events' ? items : [],
      users: activeType === 'users' ? items : [],
      posts: [], // posts disabled for now
      counts: {
        [activeType]: total,
      },
    };
  }, [data, activeType]);

  const { events, users, posts, counts } = processedData;

  return (
    <div className={styles.searchResultPage}>
      <div className={styles.container}>
        {/* Search Header */}
        <div className={styles.searchHeader}>
          <h1 className={styles.searchTitle}>
            Search Results for <span className={styles.query}>"{query}"</span>
          </h1>
          {/* Only show total count if available (mostly in 'all' view) */}
          {activeType === 'all' && (
            <p className={styles.resultCount}>Found {counts.all} results</p>
          )}
        </div>

        <div className={styles.contentWrapper}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Filters</h2>
            <nav className={styles.sidebarNav}>
              {resultTypes.map((type) => {
                const Icon = type.icon;
                const count = counts[type.id];
                return (
                  <button
                    key={type.id}
                    className={`${styles.sidebarItem} ${
                      activeType === type.id ? styles.sidebarItemActive : ''
                    }`}
                    onClick={() => setActiveType(type.id)}
                  >
                    <Icon size={20} className={styles.sidebarIcon} />
                    <span className={styles.sidebarLabel}>{type.label}</span>
                    {/* Show count only if defined (mostly in 'all' view) */}
                    {count !== undefined && (
                      <span className={styles.sidebarCount}>{count}</span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {isLoading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Searching...</p>
              </div>
            ) : (
              <>
                {/* Events Section */}
                {events.length > 0 && (
                  <section className={styles.resultSection}>
                    <h2 className={styles.sectionTitle}>
                      <Calendar size={24} />
                      Events {activeType === 'all' ? `(Preview)` : ''}
                    </h2>
                    <EventList events={events} />
                  </section>
                )}

                {/* Users Section */}
                {users.length > 0 && (
                  <section className={styles.resultSection}>
                    <h2 className={styles.sectionTitle}>
                      <Users size={24} />
                      Users {activeType === 'all' ? `(Preview)` : ''}
                    </h2>
                    <UserList users={users} />
                  </section>
                )}

                {/* Posts Section (temporarily disabled) */}
                {false && (
                  <section className={styles.resultSection}>
                    <h2 className={styles.sectionTitle}>
                      <FileText size={24} />
                      Posts {activeType === 'all' ? `(Preview)` : ''}
                    </h2>
                    <div className={styles.resultList} />
                  </section>
                )}

                {/* Empty State */}
                {!isLoading && events.length === 0 && users.length === 0 && (
                  <div className={styles.emptyState}>
                    <Search size={64} />
                    <h2>No results found</h2>
                    <p>Try adjusting your search or filter</p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default SearchResult;
