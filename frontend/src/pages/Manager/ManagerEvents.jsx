import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Filter,
  Search,
  Plus,
} from 'lucide-react';
import { useManagerEvents, useDeleteEvent } from '../../hooks/useEvents';
import { Event } from '../../components/EventCard/Event';
import styles from './ManagerEvents.module.css';

const ManagerEvents = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useManagerEvents();
  const deleteMutation = useDeleteEvent();

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

  const events = useMemo(() => data?.events || [], [data]);

  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((event) => event.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [events, activeFilter, searchQuery]);

  const filters = [
    { id: 'all', label: 'All Events', count: events.length },
    {
      id: 'pending',
      label: 'Pending',
      count: events.filter((e) => e.status === 'pending').length,
    },
    {
      id: 'approved',
      label: 'Approved',
      count: events.filter((e) => e.status === 'approved').length,
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: events.filter((e) => e.status === 'rejected').length,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      count: events.filter((e) => e.status === 'cancelled').length,
    },
    {
      id: 'completed',
      label: 'Completed',
      count: events.filter((e) => e.status === 'completed').length,
    },
  ];

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEventAction = (action, eventId) => {
    setOpenMenuId(null);

    switch (action) {
      case 'view':
        navigate(`/manager/events/${eventId}`);
        break;
      case 'edit':
        navigate(`/manager/events/edit/${eventId}`);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this event?')) {
          deleteMutation.mutate(eventId);
        }
        break;
      default:
        break;
    }
  };

  const toggleMenu = (eventId) => {
    setOpenMenuId(openMenuId === eventId ? null : eventId);
  };

  if (isLoading) {
    return <div className="flex justify-center p-10">Loading events...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className={styles.title}>My Events</h1>
          <p className={styles.subtitle}>Manage all your volunteer events</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => navigate('/manager/events/create')}
        >
          <Plus size={20} />
          Create Event
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        className={styles.filtersSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.filters}>
          <Filter size={20} className={styles.filterIcon} />
          {filters.map((filter) => (
            <button
              key={filter.id}
              className={`${styles.filterBtn} ${
                activeFilter === filter.id ? styles.active : ''
              }`}
              onClick={() => handleFilterChange(filter.id)}
            >
              {filter.label}
              <span className={styles.filterCount}>{filter.count}</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
      </motion.div>

      {/* Events Grid */}
      <motion.div
        className={styles.eventsGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="popLayout">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <motion.div
                key={event._id}
                className={styles.eventWrapper}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Event
                  {...event}
                  category={event.categories}
                  onLearnMore={() => navigate(`/manager/events/${event._id}`)}
                />
                {/* Action Menu Button */}
                <div className={styles.actionMenu}>
                  <button
                    className={styles.menuBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(event._id);
                    }}
                  >
                    <MoreVertical size={20} />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {openMenuId === event._id && (
                      <motion.div
                        className={styles.dropdown}
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.15 }}
                      >
                        <button
                          className={styles.dropdownItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventAction('view', event._id);
                          }}
                        >
                          <Eye size={16} />
                          View Details
                        </button>
                        <button
                          className={styles.dropdownItem}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventAction('edit', event._id);
                          }}
                        >
                          <Edit size={16} />
                          Edit Event
                        </button>
                        <button
                          className={`${styles.dropdownItem} ${styles.danger}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventAction('delete', event._id);
                          }}
                        >
                          <Trash2 size={16} />
                          Delete Event
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Status Badge */}
                <div
                  className={`${styles.statusBadge} ${
                    styles[`status-${event.status || 'pending'}`]
                  }`}
                >
                  {event.status || 'pending'}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              className={styles.emptyState}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p>No events found</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Click outside to close menu */}
      {openMenuId && (
        <div
          className={styles.overlay}
          onClick={() => setOpenMenuId(null)}
        ></div>
      )}
    </div>
  );
};

export default ManagerEvents;
