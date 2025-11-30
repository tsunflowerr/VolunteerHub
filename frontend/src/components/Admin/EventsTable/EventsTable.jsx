import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Users,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './EventsTable.module.css';

// Mock data for development/fallback
const mockEvents = [
  { _id: '1', title: 'Beach Cleanup Day', createdBy: { fullName: 'John Doe' }, eventDate: '2025-12-15', maxParticipants: 50, status: 'pending', location: 'Santa Monica Beach' },
  { _id: '2', title: 'Food Bank Volunteer', createdBy: { fullName: 'Jane Smith' }, eventDate: '2025-12-20', maxParticipants: 30, status: 'approved', location: 'Community Center' },
  { _id: '3', title: 'Youth Mentoring Program', createdBy: { fullName: 'Mike Johnson' }, eventDate: '2025-12-22', maxParticipants: 20, status: 'pending', location: 'Central Library' },
  { _id: '4', title: 'Park Tree Planting', createdBy: { fullName: 'Sarah Williams' }, eventDate: '2025-12-25', maxParticipants: 40, status: 'rejected', location: 'Riverside Park' },
  { _id: '5', title: 'Senior Home Visit', createdBy: { fullName: 'David Brown' }, eventDate: '2025-12-28', maxParticipants: 15, status: 'approved', location: 'Sunrise Senior Center' },
];

function EventsTable() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/events/pending', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const mappedEvents = (data.data || data.events || []).map((event) => ({
        _id: event._id,
        title: event.name || event.title,
        createdBy: event.managerId ? { fullName: event.managerId.username } : { fullName: 'Unknown' },
        eventDate: event.startDate,
        maxParticipants: event.capacity || event.maxParticipants,
        status: event.status,
        location: event.location || 'N/A',
        category: event.category?.[0]?.name || 'Uncategorized',
      }));
      setEvents(mappedEvents);
    } catch (err) {
      console.warn('Using mock data:', err.message);
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleApprove = async (eventId) => {
    try {
      setActionLoading(eventId);
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`/api/admin/events/${eventId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ status: 'approved' }),
        });
        if (!response.ok) throw new Error('API failed');
      } catch {
        // Fallback to mock update
      }

      setEvents(events.map((event) =>
        event._id === eventId ? { ...event, status: 'approved' } : event
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (eventId) => {
    try {
      setActionLoading(eventId);
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`/api/admin/events/${eventId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
          body: JSON.stringify({ status: 'rejected' }),
        });
        if (!response.ok) throw new Error('API failed');
      } catch {
        // Fallback to mock update
      }

      setEvents(events.map((event) =>
        event._id === eventId ? { ...event, status: 'rejected' } : event
      ));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      setActionLoading(eventId);
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`/api/admin/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        if (!response.ok) throw new Error('API failed');
      } catch {
        // Fallback to mock delete
      }

      setEvents(events.filter((event) => event._id !== eventId));
    } finally {
      setActionLoading(null);
    }
  };

  const renderStatus = (status) => {
    const statusMap = {
      pending: { label: 'Pending', className: styles.statusPending },
      approved: { label: 'Approved', className: styles.statusApproved },
      rejected: { label: 'Rejected', className: styles.statusRejected },
      completed: { label: 'Completed', className: styles.statusApproved },
      cancelled: { label: 'Cancelled', className: styles.statusRejected },
    };
    const statusInfo = statusMap[status] || {
      label: status,
      className: styles.statusPending,
    };
    return (
      <span className={`${styles.statusBadge} ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const filteredEvents = events.filter((event) => {
    const matchSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.createdBy?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === 'all' || event.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 className={styles.spinner} size={32} />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Events Management</h2>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by event name or organizer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.filterBox}>
          <label>Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

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
            {paginatedEvents.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.textCenter}>
                  {events.length === 0
                    ? 'No events yet'
                    : 'No matching events found'}
                </td>
              </tr>
            ) : (
              paginatedEvents.map((event, index) => (
                <tr key={event._id}>
                  <td>{startIndex + index + 1}</td>
                  <td className={styles.eventTitle}>{event.title}</td>
                  <td>{event.createdBy?.fullName || 'Unknown'}</td>
                  <td>
                    {new Date(event.eventDate).toLocaleDateString('en-US')}
                  </td>
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
                            onClick={() => handleApprove(event._id)}
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
                            onClick={() => handleReject(event._id)}
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
                        onClick={() => handleDelete(event._id)}
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredEvents.length)} of{' '}
            {filteredEvents.length} results
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`${styles.paginationBtn} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              );
            })}
            <button
              className={styles.paginationBtn}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className={styles.paginationSize}>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventsTable;
