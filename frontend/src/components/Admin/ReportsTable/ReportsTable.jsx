import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  User,
  MessageSquare,
  FileText,
  ChevronDown,
  ExternalLink,
  Shield,
  Ban,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import styles from './ReportsTable.module.css';

// Status badge colors
const statusConfig = {
  pending: { color: 'orange', label: 'Pending', icon: AlertTriangle },
  reviewed: { color: 'blue', label: 'Reviewed', icon: Eye },
  resolved: { color: 'green', label: 'Resolved', icon: CheckCircle },
  dismissed: { color: 'gray', label: 'Dismissed', icon: XCircle },
};

// Type badge colors
const typeConfig = {
  post: { color: 'purple', label: 'Post', icon: FileText },
  comment: { color: 'teal', label: 'Comment', icon: MessageSquare },
};

// Action badge colors
const actionConfig = {
  none: { color: 'gray', label: 'No Action' },
  content_removed: { color: 'red', label: 'Content Removed' },
  user_warned: { color: 'orange', label: 'User Warned' },
  user_banned: { color: 'red', label: 'User Banned' },
};

// Reason display
const reasonLabels = {
  spam: 'Spam or misleading',
  harassment: 'Harassment or bullying',
  hate_speech: 'Hate speech or discrimination',
  violence: 'Violence or dangerous content',
  inappropriate: 'Inappropriate or offensive content',
  misinformation: 'False information',
  copyright: 'Copyright violation',
  other: 'Other',
};

export const ReportSearchFilter = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onStatusChange,
  filterType,
  onTypeChange,
}) => {
  return (
    <div className={styles.searchFilter}>
      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by reporter or reported user..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className={styles.filterGroup}>
        <Filter size={18} />
        <select value={filterStatus} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select value={filterType} onChange={(e) => onTypeChange(e.target.value)}>
          <option value="all">All Types</option>
          <option value="post">Posts</option>
          <option value="comment">Comments</option>
        </select>
      </div>
    </div>
  );
};

export const ReportTable = ({
  reports,
  startIndex,
  onView,
  onReview,
  onDelete,
  isReviewPending,
  reviewingReportId,
  emptyMessage,
}) => {
  if (!reports || reports.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Flag size={48} />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Reporter</th>
            <th>Reported User</th>
            <th>Type</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <ReportRow
              key={report._id}
              report={report}
              index={startIndex + index + 1}
              onView={onView}
              onReview={onReview}
              onDelete={onDelete}
              isReviewPending={isReviewPending && reviewingReportId === report._id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ReportRow = ({ report, index, onView, onReview, onDelete, isReviewPending }) => {
  const [showActions, setShowActions] = useState(false);
  const actionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActions]);

  const status = statusConfig[report.status] || statusConfig.pending;
  const type = typeConfig[report.type] || typeConfig.post;
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  return (
    <tr>
      <td>{index}</td>
      <td>
        <div className={styles.userCell}>
          <img
            src={report.reporter?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deleted'}
            alt={report.reporter?.username || 'Deleted User'}
            className={styles.avatar}
          />
          <span>{report.reporter?.username || 'Deleted User'}</span>
        </div>
      </td>
      <td>
        <div className={styles.userCell}>
          <img
            src={report.reportedUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deleted'}
            alt={report.reportedUser?.username || 'Deleted User'}
            className={styles.avatar}
          />
          <span>{report.reportedUser?.username || 'Deleted User'}</span>
        </div>
      </td>
      <td>
        <span className={`${styles.badge} ${styles[type.color]}`}>
          <TypeIcon size={12} />
          {type.label}
        </span>
      </td>
      <td>
        <span className={styles.reason}>{reasonLabels[report.reason] || report.reason}</span>
      </td>
      <td>
        <span className={`${styles.badge} ${styles[status.color]}`}>
          <StatusIcon size={12} />
          {status.label}
        </span>
      </td>
      <td>
        <span className={styles.date}>
          {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
        </span>
      </td>
      <td>
        <div className={styles.actionsCell} ref={actionsRef}>
          <button
            className={styles.actionsBtn}
            onClick={() => setShowActions(!showActions)}
            disabled={isReviewPending}
          >
            Actions <ChevronDown size={14} />
          </button>
          <AnimatePresence>
            {showActions && (
              <motion.div
                className={styles.actionsMenu}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <button onClick={() => { onView(report); setShowActions(false); }}>
                  <Eye size={14} />
                  View Details
                </button>
                {report.status === 'pending' && (
                  <>
                    <button
                      onClick={() => { onReview(report._id, 'resolved', 'none'); setShowActions(false); }}
                      className={styles.resolve}
                    >
                      <CheckCircle size={14} />
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => { onReview(report._id, 'dismissed', 'none'); setShowActions(false); }}
                    >
                      <XCircle size={14} />
                      Dismiss
                    </button>
                  </>
                )}
                <button
                  onClick={() => { onDelete(report._id); setShowActions(false); }}
                  className={styles.delete}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </tr>
  );
};

// Report Detail Modal
export const ReportDetailModal = ({ report, onClose, onReview, isReviewPending }) => {
  const [selectedStatus, setSelectedStatus] = useState(report?.status || 'pending');
  const [selectedAction, setSelectedAction] = useState(report?.action || 'none');
  const [adminNote, setAdminNote] = useState(report?.adminNote || '');

  if (!report) return null;

  const handleSubmit = () => {
    onReview(report._id, selectedStatus, selectedAction, adminNote);
  };

  const status = statusConfig[report.status] || statusConfig.pending;
  const type = typeConfig[report.type] || typeConfig.post;
  const StatusIcon = status.icon;

  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>
            <Flag size={20} />
            Report Details
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalContent}>
          {/* Current Status */}
          <div className={styles.statusBanner}>
            <span className={`${styles.badge} ${styles[status.color]}`}>
              <StatusIcon size={14} />
              {status.label}
            </span>
          </div>

          {/* Report Info Grid */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h4>Reporter</h4>
              <div className={styles.userInfo}>
                <img
                  src={report.reporter?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deleted'}
                  alt={report.reporter?.username}
                />
                <div>
                  <strong>{report.reporter?.username || 'Deleted User'}</strong>
                  <span>{report.reporter?.email}</span>
                </div>
              </div>
            </div>

            <div className={styles.infoCard}>
              <h4>Reported User</h4>
              <div className={styles.userInfo}>
                <img
                  src={report.reportedUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deleted'}
                  alt={report.reportedUser?.username}
                />
                <div>
                  <strong>{report.reportedUser?.username || 'Deleted User'}</strong>
                  <span>{report.reportedUser?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className={styles.detailsSection}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Type:</span>
              <span className={`${styles.badge} ${styles[type.color]}`}>
                {type.label}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Reason:</span>
              <span className={styles.detailValue}>{reasonLabels[report.reason]}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Submitted:</span>
              <span className={styles.detailValue}>
                {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Description */}
          {report.description && (
            <div className={styles.descriptionSection}>
              <h4>Description</h4>
              <p>{report.description}</p>
            </div>
          )}

          {/* Previous Review Info */}
          {report.reviewedBy && (
            <div className={styles.reviewedSection}>
              <h4>Previously Reviewed By</h4>
              <div className={styles.userInfo}>
                <img
                  src={report.reviewedBy?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'}
                  alt={report.reviewedBy?.username}
                />
                <div>
                  <strong>{report.reviewedBy?.username}</strong>
                  <span>Action: {actionConfig[report.action]?.label || 'None'}</span>
                </div>
              </div>
              {report.adminNote && (
                <div className={styles.previousNote}>
                  <strong>Note:</strong> {report.adminNote}
                </div>
              )}
            </div>
          )}

          {/* Review Form */}
          <div className={styles.reviewForm}>
            <h4>Review Action</h4>
            
            <div className={styles.formGroup}>
              <label>Status</label>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Action Taken</label>
              <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                <option value="none">No Action</option>
                <option value="content_removed">Remove Content</option>
                <option value="user_warned">Warn User</option>
                <option value="user_banned">Ban User</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Admin Note</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add a note about this report..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={isReviewPending}
          >
            {isReviewPending ? 'Saving...' : 'Save Review'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
