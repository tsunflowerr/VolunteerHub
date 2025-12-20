import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  Filter,
  Search,
} from 'lucide-react';
import styles from './ManagerRegistrations.module.css';
import {
  useManagerRegistrations,
  useUpdateRegistrationStatus,
} from '../../hooks/useManager';

const ManagerRegistrations = () => {
  // Fetch registrations
  const { data: responseData, isLoading } = useManagerRegistrations({
    limit: 10,
  });
  const { mutate: updateStatus } = useUpdateRegistrationStatus();

  const registrations = useMemo(
    () => responseData?.registrations || [],
    [responseData]
  );

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegistrations = useMemo(() => {
    let filtered = [...registrations];

    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter((reg) => reg.status === activeFilter);
    }
    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          (reg.userId?.username || '').toLowerCase().includes(lowerQuery) ||
          (reg.eventId?.name || '').toLowerCase().includes(lowerQuery) ||
          (reg.userId?.email || '').toLowerCase().includes(lowerQuery)
      );
    }
    return filtered;
  }, [registrations, activeFilter, searchQuery]);

  const filters = [
    {
      id: 'all',
      label: 'All',
      count: registrations.length,
    },
    {
      id: 'pending',
      label: 'Pending',
      count: registrations.filter((r) => r.status === 'pending').length,
    },
    {
      id: 'confirmed',
      label: 'Approved',
      count: registrations.filter((r) => r.status === 'confirmed').length,
    },
    {
      id: 'cancelled',
      label: 'Rejected',
      count: registrations.filter((r) => r.status === 'cancelled').length,
    },
  ];

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleApprove = (regId) => {
    updateStatus({ registrationId: regId, status: 'confirmed' });
  };

  const handleReject = (regId) => {
    updateStatus({ registrationId: regId, status: 'cancelled' });
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>Loading registrations...</div>
    );
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
          <h1 className={styles.title}>Volunteer Registrations</h1>
          <p className={styles.subtitle}>
            Manage volunteer applications for your events
          </p>
        </div>
      </motion.div>

      {/* Filters & Search */}
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

        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email, or event..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
        </div>
      </motion.div>

      {/* Registrations Table */}
      <motion.div
        className={styles.tableContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.table}>
          {/* Table Header */}
          <div className={styles.tableHeader}>
            <div className={styles.headerCell}>Volunteer</div>
            <div className={styles.headerCell}>Event</div>
            <div className={styles.headerCell}>Registered Date</div>
            <div className={styles.headerCell}>Status</div>
            <div className={styles.headerCell}>Actions</div>
          </div>

          {/* Table Body */}
          <AnimatePresence mode="popLayout">
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((reg, index) => (
                <motion.div
                  key={reg._id}
                  className={styles.tableRow}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {/* Volunteer Info */}
                  <div className={styles.cell}>
                    <div className={styles.userInfo}>
                      <img
                        src={reg.userId?.avatar || '/default-avatar.png'}
                        alt={reg.userId?.username}
                        className={styles.avatar}
                      />
                      <div>
                        <div className={styles.userName}>
                          {reg.userId?.username}
                        </div>
                        <div className={styles.userEmail}>
                          <Mail size={14} />
                          {reg.userId?.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Name */}
                  <div className={styles.cell}>
                    <div className={styles.eventName}>{reg.eventId?.name}</div>
                  </div>

                  {/* Registered Date */}
                  <div className={styles.cell}>
                    <div className={styles.date}>
                      <Calendar size={14} />
                      {new Date(reg.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  {/* Status */}
                  <div className={styles.cell}>
                    <span
                      className={`${styles.status} ${
                        styles[`status-${reg.status}`]
                      }`}
                    >
                      {reg.status === 'confirmed'
                        ? 'Approved'
                        : reg.status === 'cancelled'
                        ? 'Rejected'
                        : reg.status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className={styles.cell}>
                    <div className={styles.actions}>
                      {reg.status === 'pending' && (
                        <>
                          <motion.button
                            className={`${styles.actionBtn} ${styles.approve}`}
                            onClick={() => handleApprove(reg._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </motion.button>
                          <motion.button
                            className={`${styles.actionBtn} ${styles.reject}`}
                            onClick={() => handleReject(reg._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </motion.button>
                        </>
                      )}
                      {reg.status !== 'pending' && (
                        <span className={styles.noActions}>
                          {reg.status === 'confirmed'
                            ? '✓ Approved'
                            : reg.status === 'cancelled'
                            ? '✗ Rejected'
                            : reg.status}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className={styles.emptyState}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p>No registrations found</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ManagerRegistrations;
