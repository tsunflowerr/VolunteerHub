import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  Mail,
  Phone,
  CheckCircle,
  AlertCircle,
  Download,
  Search,
} from 'lucide-react';
import styles from './VolunteerListDialog.module.css';

const VolunteerListDialog = ({ event, volunteers, onClose, onMarkComplete }) => {
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const isEventCompleted = event.status === 'completed';

  // Filter volunteers by search
  const filteredVolunteers = volunteers.filter(
    (volunteer) =>
      volunteer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle volunteer selection
  const toggleSelection = (volunteerId) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volunteerId)
        ? prev.filter((id) => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  // Select all volunteers
  const selectAll = () => {
    if (selectedVolunteers.length === filteredVolunteers.length) {
      setSelectedVolunteers([]);
    } else {
      setSelectedVolunteers(
        filteredVolunteers.map((v) => v._id || v.userId)
      );
    }
  };

  // Mark selected volunteers as completed
  const handleMarkComplete = () => {
    if (selectedVolunteers.length === 0) {
      alert('Please select at least one volunteer');
      return;
    }

    if (
      window.confirm(
        `Mark ${selectedVolunteers.length} volunteer(s) as completed?`
      )
    ) {
      onMarkComplete(selectedVolunteers);
      setSelectedVolunteers([]);
    }
  };

  // Export volunteer list
  const handleExport = () => {
    console.log('Exporting volunteer list...');
    // TODO: Implement export to CSV/Excel
    const csvContent = volunteers
      .map(
        (v) =>
          `${v.username},${v.email},${v.phone || 'N/A'},${
            v.completionStatus || 'pending'
          }`
      )
      .join('\n');
    console.log(csvContent);
    alert('Export functionality will be implemented');
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.dialog}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Users size={24} />
              <div>
                <h2>Event Volunteers</h2>
                <p className={styles.eventName}>{event.name}</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className={styles.statsBar}>
            <div className={styles.stat}>
              <Users size={18} />
              <span>
                Total: <strong>{volunteers.length}</strong>
              </span>
            </div>
            <div className={styles.stat}>
              <CheckCircle size={18} />
              <span>
                Completed:{' '}
                <strong>
                  {
                    volunteers.filter((v) => v.completionStatus === 'completed')
                      .length
                  }
                </strong>
              </span>
            </div>
            <div className={styles.stat}>
              <AlertCircle size={18} />
              <span>
                Pending:{' '}
                <strong>
                  {
                    volunteers.filter(
                      (v) =>
                        v.completionStatus === 'pending' ||
                        !v.completionStatus
                    ).length
                  }
                </strong>
              </span>
            </div>
          </div>

          {/* Actions Bar */}
          <div className={styles.actionsBar}>
            <div className={styles.searchBox}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search volunteers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>

            <div className={styles.actions}>
              {isEventCompleted && (
                <>
                  <button className={styles.selectAllBtn} onClick={selectAll}>
                    {selectedVolunteers.length === filteredVolunteers.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                  <button
                    className={styles.markCompleteBtn}
                    onClick={handleMarkComplete}
                    disabled={selectedVolunteers.length === 0}
                  >
                    <CheckCircle size={18} />
                    Mark Complete ({selectedVolunteers.length})
                  </button>
                </>
              )}
              <button className={styles.exportBtn} onClick={handleExport}>
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          {/* Event Status Alert */}
          {isEventCompleted && (
            <div className={styles.alert}>
              <CheckCircle size={20} />
              <span>
                This event is completed. You can now mark volunteers as
                completed.
              </span>
            </div>
          )}

          {!isEventCompleted && (
            <div className={styles.alertWarning}>
              <AlertCircle size={20} />
              <span>
                Event is not completed yet. Completion marking will be available
                after the event ends.
              </span>
            </div>
          )}

          {/* Volunteer List */}
          <div className={styles.listContainer}>
            {filteredVolunteers.length > 0 ? (
              <div className={styles.list}>
                {filteredVolunteers.map((volunteer) => {
                  const volunteerId = volunteer._id || volunteer.userId;
                  const isSelected = selectedVolunteers.includes(volunteerId);
                  const isCompleted =
                    volunteer.completionStatus === 'completed';

                  return (
                    <motion.div
                      key={volunteerId}
                      className={`${styles.volunteerCard} ${
                        isSelected ? styles.selected : ''
                      } ${isCompleted ? styles.completed : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Checkbox (only if event is completed) */}
                      {isEventCompleted && !isCompleted && (
                        <div className={styles.checkbox}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(volunteerId)}
                          />
                        </div>
                      )}

                      {/* Avatar */}
                      <img
                        src={
                          volunteer.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${volunteer.username}`
                        }
                        alt={volunteer.username}
                        className={styles.avatar}
                      />

                      {/* Info */}
                      <div className={styles.info}>
                        <div className={styles.name}>
                          {volunteer.username}
                          {isCompleted && (
                            <span className={styles.completedBadge}>
                              <CheckCircle size={16} />
                              Completed
                            </span>
                          )}
                        </div>
                        <div className={styles.contact}>
                          <Mail size={14} />
                          {volunteer.email}
                        </div>
                        {volunteer.phone && (
                          <div className={styles.contact}>
                            <Phone size={14} />
                            {volunteer.phone}
                          </div>
                        )}
                      </div>

                      {/* Registration Date */}
                      <div className={styles.registeredDate}>
                        <span className={styles.label}>Registered:</span>
                        <span className={styles.date}>
                          {new Date(volunteer.registeredAt).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Users size={48} />
                <p>No volunteers found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Showing {filteredVolunteers.length} of {volunteers.length}{' '}
              volunteers
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VolunteerListDialog;
