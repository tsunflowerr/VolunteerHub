import { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
  EventSearchFilter,
  EventTable,
} from '../../components/Admin/EventsTable';
import { Pagination } from '../../components/common';
import styles from '../../components/Admin/EventsTable/EventsTable.module.css';

// Mock data for development/fallback
const mockEvents = [
  {
    _id: '1',
    title: 'Beach Cleanup Day',
    createdBy: { fullName: 'John Doe' },
    eventDate: '2025-12-15',
    maxParticipants: 50,
    status: 'pending',
    location: 'Santa Monica Beach',
  },
  {
    _id: '2',
    title: 'Food Bank Volunteer',
    createdBy: { fullName: 'Jane Smith' },
    eventDate: '2025-12-20',
    maxParticipants: 30,
    status: 'approved',
    location: 'Community Center',
  },
  {
    _id: '3',
    title: 'Youth Mentoring Program',
    createdBy: { fullName: 'Mike Johnson' },
    eventDate: '2025-12-22',
    maxParticipants: 20,
    status: 'pending',
    location: 'Central Library',
  },
  {
    _id: '4',
    title: 'Park Tree Planting',
    createdBy: { fullName: 'Sarah Williams' },
    eventDate: '2025-12-25',
    maxParticipants: 40,
    status: 'rejected',
    location: 'Riverside Park',
  },
  {
    _id: '5',
    title: 'Senior Home Visit',
    createdBy: { fullName: 'David Brown' },
    eventDate: '2025-12-28',
    maxParticipants: 15,
    status: 'approved',
    location: 'Sunrise Senior Center',
  },
];

function EventsManagement() {
  // Data state
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Filter & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch events
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
        createdBy: event.managerId
          ? { fullName: event.managerId.username }
          : { fullName: 'Unknown' },
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

  // Filter events locally with useMemo
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.createdBy?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchStatus =
        filterStatus === 'all' || event.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [events, searchTerm, filterStatus]);

  // Pagination calculations with useMemo
  const { paginatedEvents, totalPages, startIndex, endIndex, totalItems } =
    useMemo(() => {
      const total = filteredEvents.length;
      const pages = Math.ceil(total / itemsPerPage);
      const start = (currentPage - 1) * itemsPerPage;
      const end = Math.min(start + itemsPerPage, total);
      const paginated = filteredEvents.slice(start, end);

      return {
        paginatedEvents: paginated,
        totalPages: pages,
        startIndex: start,
        endIndex: end,
        totalItems: total,
      };
    }, [filteredEvents, currentPage, itemsPerPage]);

  // Handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  }, []);

  const handleApprove = useCallback(async (eventId) => {
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

      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? { ...event, status: 'approved' } : event
        )
      );
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleReject = useCallback(async (eventId) => {
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

      setEvents((prev) =>
        prev.map((event) =>
          event._id === eventId ? { ...event, status: 'rejected' } : event
        )
      );
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleDelete = useCallback(async (eventId) => {
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

      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleItemsPerPageChange = useCallback((value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  }, []);

  // Loading state
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

  // Error state
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

  const emptyMessage =
    searchTerm || filterStatus !== 'all'
      ? 'No matching events found'
      : 'No events yet';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Events Management</h2>
      </div>

      <EventSearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterStatus={filterStatus}
        onFilterChange={handleFilterChange}
      />

      <EventTable
        events={paginatedEvents}
        startIndex={startIndex}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        actionLoading={actionLoading}
        emptyMessage={emptyMessage}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        startIndex={startIndex}
        endIndex={endIndex}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        pageSizeOptions={[5, 10, 20, 50]}
      />
    </div>
  );
}

export default EventsManagement;
