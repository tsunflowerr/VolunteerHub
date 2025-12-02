import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, Trash2, Loader2 } from 'lucide-react';
import styles from './EventsTable.module.css';

const STATUS_MAP = {
  pending: { label: 'Pending', className: styles.statusPending },
  approved: { label: 'Approved', className: styles.statusApproved },
  rejected: { label: 'Rejected', className: styles.statusRejected },
  completed: { label: 'Completed', className: styles.statusApproved },
  cancelled: { label: 'Cancelled', className: styles.statusRejected },
};

function EventTable({
  events,
  startIndex,
  onApprove,
  onReject,
  onDelete,
  actionLoading,
  emptyMessage = 'No events yet',
}) {
  const renderStatus = (status) => {
    const statusInfo = STATUS_MAP[status] || {
      label: status,
      className: styles.statusPending,
    };
    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (events.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Event Name</th>
              <th>Organizer</th>
              <th>Date</th>
              <th>Participants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="7" className={styles.textCenter}>
                {emptyMessage}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Event Name</th>
            <th>Organizer</th>
            <th>Date</th>
            <th>Participants</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event._id}>
              <td>{startIndex + index + 1}</td>
              <td className={styles.eventTitle}>{event.title}</td>
              <td>{event.createdBy?.fullName || 'Unknown'}</td>
              <td>{new Date(event.eventDate).toLocaleDateString('en-US')}</td>
              <td className={styles.textCenter}>
                {event.maxParticipants || 0}
              </td>
              <td>{renderStatus(event.status)}</td>
              <td>
                <div className={styles.actionButtons}>
                  {event.status === 'pending' && (
                    <>
                      <button
                        className={styles.btnApprove}
                        onClick={() => onApprove(event._id)}
                        disabled={actionLoading === event._id}
                        title="Approve event"
                      >
                        {actionLoading === event._id ? (
                          <Loader2 size={16} className={styles.spinning} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </button>
                      <button
                        className={styles.btnReject}
                        onClick={() => onReject(event._id)}
                        disabled={actionLoading === event._id}
                        title="Reject"
                      >
                        {actionLoading === event._id ? (
                          <Loader2 size={16} className={styles.spinning} />
                        ) : (
                          <XCircle size={16} />
                        )}
                      </button>
                    </>
                  )}
                  <button
                    className={styles.btnDelete}
                    onClick={() => onDelete(event._id)}
                    disabled={actionLoading === event._id}
                    title="Delete event"
                  >
                    {actionLoading === event._id ? (
                      <Loader2 size={16} className={styles.spinning} />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

EventTable.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      createdBy: PropTypes.shape({
        fullName: PropTypes.string,
      }),
      eventDate: PropTypes.string,
      maxParticipants: PropTypes.number,
      status: PropTypes.string,
    })
  ).isRequired,
  startIndex: PropTypes.number.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  actionLoading: PropTypes.string,
  emptyMessage: PropTypes.string,
};

export default EventTable;
