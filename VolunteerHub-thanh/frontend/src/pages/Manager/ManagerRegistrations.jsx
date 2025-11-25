import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  User,
  Mail,
  Calendar,
  Filter,
  Search,
  Download,
} from 'lucide-react';
import styles from './ManagerRegistrations.module.css';

const ManagerRegistrations = () => {
  // Mock data - replace with actual API call
  const [registrations, setRegistrations] = useState([
    {
      _id: 'reg1',
      user: {
        _id: 'user1',
        username: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      },
      event: {
        _id: 'event1',
        name: 'Beach Cleanup',
      },
      status: 'pending',
      registeredAt: '2025-11-10T10:00:00Z',
    },
    {
      _id: 'reg2',
      user: {
        _id: 'user2',
        username: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      },
      event: {
        _id: 'event1',
        name: 'Beach Cleanup',
      },
      status: 'approved',
      registeredAt: '2025-11-09T14:30:00Z',
    },
    {
      _id: 'reg3',
      user: {
        _id: 'user3',
        username: 'Bob Johnson',
        email: 'bob@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      },
      event: {
        _id: 'event2',
        name: 'Food Bank Sorting',
      },
      status: 'pending',
      registeredAt: '2025-11-12T09:15:00Z',
    },
    {
      _id: 'reg4',
      user: {
        _id: 'user4',
        username: 'Alice Williams',
        email: 'alice@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      },
      event: {
        _id: 'event2',
        name: 'Food Bank Sorting',
      },
      status: 'rejected',
      registeredAt: '2025-11-11T16:45:00Z',
    },
  ]);

  const [filteredRegistrations, setFilteredRegistrations] =
    useState(registrations);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
      id: 'approved',
      label: 'Approved',
      count: registrations.filter((r) => r.status === 'approved').length,
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: registrations.filter((r) => r.status === 'rejected').length,
    },
  ];

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    applyFilters(filterId, searchQuery);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(activeFilter, query);
  };

  const applyFilters = (filter, search) => {
    let filtered = [...registrations];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter((reg) => reg.status === filter);
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter(
        (reg) =>
          reg.user.username.toLowerCase().includes(search.toLowerCase()) ||
          reg.event.name.toLowerCase().includes(search.toLowerCase()) ||
          reg.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredRegistrations(filtered);
  };

  const handleApprove = (regId) => {
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg._id === regId ? { ...reg, status: 'approved' } : reg
      )
    );
    applyFilters(activeFilter, searchQuery);
  };

  const handleReject = (regId) => {
    if (window.confirm('Are you sure you want to reject this registration?')) {
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg._id === regId ? { ...reg, status: 'rejected' } : reg
        )
      );
      applyFilters(activeFilter, searchQuery);
    }
  };

  const handleExport = () => {
    console.log('Exporting registrations data...');
    // TODO: Implement export functionality
  };

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
        <button className={styles.exportBtn} onClick={handleExport}>
          <Download size={20} />
          Export Data
        </button>
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
                        src={reg.user.avatar}
                        alt={reg.user.username}
                        className={styles.avatar}
                      />
                      <div>
                        <div className={styles.userName}>
                          {reg.user.username}
                        </div>
                        <div className={styles.userEmail}>
                          <Mail size={14} />
                          {reg.user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Name */}
                  <div className={styles.cell}>
                    <div className={styles.eventName}>{reg.event.name}</div>
                  </div>

                  {/* Registered Date */}
                  <div className={styles.cell}>
                    <div className={styles.date}>
                      <Calendar size={14} />
                      {new Date(reg.registeredAt).toLocaleDateString('en-US', {
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
                      {reg.status}
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
                          >
                            <CheckCircle size={18} />
                          </motion.button>
                          <motion.button
                            className={`${styles.actionBtn} ${styles.reject}`}
                            onClick={() => handleReject(reg._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <XCircle size={18} />
                          </motion.button>
                        </>
                      )}
                      {reg.status !== 'pending' && (
                        <span className={styles.noActions}>
                          {reg.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
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
