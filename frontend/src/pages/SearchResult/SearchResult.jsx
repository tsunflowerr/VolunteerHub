import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Users,
  FileText,
  MessageSquare,
  Search,
  Filter,
} from 'lucide-react';
import styles from './SearchResult.module.css';
import EventList from '../../components/EventCard/EventList';
import UserList from '../../components/User/UserList';
const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeType, setActiveType] = useState('all');
  const [results, setResults] = useState({
    events: [],
    users: [],
    posts: [],
    discussions: [],
  });
  const [loading, setLoading] = useState(false);

  // Search result types configuration
  const resultTypes = [
    { id: 'all', label: 'All Results', icon: Search, count: 0 },
    { id: 'events', label: 'Events', icon: Calendar, count: 0 },
    { id: 'users', label: 'Users', icon: Users, count: 0 },
    { id: 'posts', label: 'Posts', icon: FileText, count: 0 },
  ];

  // Mock data - replace with actual API call
  useEffect(() => {
    if (query) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        const mockResults = {
          events: [
            {
              _id: 'new1',
              name: 'Beach Cleanup Volunteer Day',
              about:
                'Join us for a meaningful day cleaning up our local beaches and protecting marine life. This event is perfect for individuals, families, and groups who want to make a tangible difference in environmental conservation.',
              activities:
                "Volunteers will collect trash and debris from the beach, sort recyclables, document types of waste found, and help restore natural habitats. We'll provide all necessary equipment including gloves, bags, and safety gear.",
              prepare:
                'Wear comfortable clothes that can get dirty, closed-toe shoes, and bring sunscreen, a hat, and a reusable water bottle. We recommend bringing a change of clothes and towel if you plan to swim afterwards.',
              startDate: '2025-11-20T09:00:00.000Z',
              endDate: '2025-11-20T13:00:00.000Z',
              location: 'Santa Monica Beach, 1550 PCH, Santa Monica, CA 90401',
              thumbnail:
                'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&q=80',
              managerId: {
                _id: 'manager20',
                username: 'Ocean Conservation Society',
                avatar:
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
              },
              registrationsCount: 32,
              category: [
                { _id: 'cat5', name: 'Environment', slug: 'environment' },
                {
                  _id: 'cat1',
                  name: 'Community Development',
                  slug: 'community-development',
                },
                { _id: 'cat6', name: 'Health', slug: 'health' },
              ],
              capacity: 50,
              status: 'approved',
            },
            {
              _id: 'new2',
              name: 'Food Bank Sorting & Distribution',
              about:
                'Help fight hunger in our community by volunteering at the local food bank. We need dedicated volunteers to sort donations, pack boxes, and assist with distribution to families in need.',
              activities:
                'Sort and organize food donations, check expiration dates, pack food boxes for distribution, assist clients during pick-up hours, and help maintain the warehouse organization.',
              prepare:
                'Wear comfortable clothing and closed-toe shoes. Hair should be tied back if long. We provide gloves and aprons. Please avoid wearing strong perfumes or colognes.',
              startDate: '2025-11-25T08:00:00.000Z',
              endDate: '2025-11-25T12:00:00.000Z',
              location:
                'Community Food Bank, 456 Maple Street, Los Angeles, CA 90012',
              thumbnail:
                'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80',
              managerId: {
                _id: 'manager21',
                username: 'LA Food Bank',
                avatar:
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
              },
              registrationsCount: 18,
              category: [
                { _id: 'cat7', name: 'Hunger', slug: 'hunger' },
                {
                  _id: 'cat1',
                  name: 'Community Development',
                  slug: 'community-development',
                },
              ],
              capacity: 30,
              status: 'approved',
            },
            {
              _id: 'new3',
              name: 'Youth Tutoring Program',
              about:
                "Make a difference in a child's education by becoming a volunteer tutor. Help students with homework, reading comprehension, and building confidence in their academic abilities.",
              activities:
                'Provide one-on-one or small group tutoring in math, reading, and science. Assist with homework completion, teach study skills, and mentor students on their educational journey.',
              prepare:
                'Bring your patience, enthusiasm, and any educational materials you find helpful. A background check is required. We provide all necessary textbooks and learning materials.',
              startDate: '2025-12-01T15:00:00.000Z',
              endDate: '2025-12-01T18:00:00.000Z',
              location:
                'Community Learning Center, 789 Education Ave, San Diego, CA 92101',
              thumbnail:
                'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
              managerId: {
                _id: 'manager22',
                username: 'Emily Rodriguez',
                avatar:
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
              },
              registrationsCount: 12,
              category: [
                { _id: 'cat8', name: 'Education', slug: 'education' },
                { _id: 'cat9', name: 'Youth', slug: 'youth' },
              ],
              capacity: 20,
              status: 'approved',
            },
          ],
          users: [
            {
              _id: '1',
              username: 'Sarah Johnson',
              avatar:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
              bio: 'Passionate about community service and environmental causes',
            },
            {
              _id: '2',
              username: 'Michael Chen',
              avatar:
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
              bio: 'Dedicated to empowering youth through education',
            },
          ],
          posts: [
            {
              _id: '1',
              title: 'Success Story: Community Garden Project',
              content:
                'Our recent community garden project was a huge success...',
              author: 'Emily Rodriguez',
              date: '2025-11-15',
              likes: 124,
              comments: 18,
            },
            {
              _id: '2',
              title: 'Tips for First-Time Volunteers',
              content:
                "If you're new to volunteering, here are some helpful tips...",
              author: 'David Park',
              date: '2025-11-18',
              likes: 89,
              comments: 12,
            },
          ],
        };
        setResults(mockResults);
        setLoading(false);
      }, 500);
    }
  }, [query]);

  // Calculate counts for each type
  const typesWithCounts = resultTypes.map((type) => ({
    ...type,
    count:
      type.id === 'all'
        ? Object.values(results).reduce((sum, arr) => sum + arr.length, 0)
        : results[type.id]?.length || 0,
  }));

  // Get filtered results based on active type
  const getFilteredResults = () => {
    if (activeType === 'all') {
      return {
        events: results.events,
        users: results.users,
        posts: results.posts,
        discussions: results.discussions,
      };
    }
    return { [activeType]: results[activeType] };
  };

  const filteredResults = getFilteredResults();

  return (
    <div className={styles.searchResultPage}>
      <div className={styles.container}>
        {/* Search Header */}
        <div className={styles.searchHeader}>
          <h1 className={styles.searchTitle}>
            Search Results for <span className={styles.query}>"{query}"</span>
          </h1>
          <p className={styles.resultCount}>
            Found {typesWithCounts.find((t) => t.id === 'all')?.count || 0}{' '}
            results
          </p>
        </div>

        <div className={styles.contentWrapper}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Filters</h2>
            <nav className={styles.sidebarNav}>
              {typesWithCounts.map((type) => {
                const Icon = type.icon;
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
                    <span className={styles.sidebarCount}>{type.count}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles.mainContent}>
            {loading ? (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Searching...</p>
              </div>
            ) : (
              <>
                {/* Events Section */}
                {filteredResults.events &&
                  filteredResults.events.length > 0 && (
                    <section className={styles.resultSection}>
                      <h2 className={styles.sectionTitle}>
                        <Calendar size={24} />
                        Events ({filteredResults.events.length})
                      </h2>
                      <EventList events={filteredResults.events} />
                    </section>
                  )}

                {/* Users Section */}
                {filteredResults.users && filteredResults.users.length > 0 && (
                  <section className={styles.resultSection}>
                    <h2 className={styles.sectionTitle}>
                      <Users size={24} />
                      Users ({filteredResults.users.length})
                    </h2>
                    <UserList users={filteredResults.users} />
                  </section>
                )}

                {/* Posts Section */}
                {filteredResults.posts && filteredResults.posts.length > 0 && (
                  <section className={styles.resultSection}>
                    <h2 className={styles.sectionTitle}>
                      <FileText size={24} />
                      Posts ({filteredResults.posts.length})
                    </h2>
                    <div className={styles.resultList}>
                      {filteredResults.posts.map((post) => (
                        <div key={post._id} className={styles.postCard}>
                          <h3 className={styles.postTitle}>{post.title}</h3>
                          <p className={styles.postContent}>{post.content}</p>
                          <div className={styles.postMeta}>
                            <span className={styles.postAuthor}>
                              By {post.author}
                            </span>
                            <span className={styles.postDate}>
                              {new Date(post.date).toLocaleDateString()}
                            </span>
                            <span className={styles.postStats}>
                              {post.likes} likes · {post.comments} comments
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty State */}
                {!loading &&
                  Object.values(filteredResults).every(
                    (arr) => arr.length === 0
                  ) && (
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
