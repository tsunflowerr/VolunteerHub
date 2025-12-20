import { useState, useMemo, useCallback, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  EventSearchFilter,
  EventTable,
} from '../../components/Admin/EventsTable';
import EventPreviewDialog from '../../components/EventDetail/EventPreviewDialog';
import { Pagination } from '../../components/common';
import {
  useAdminAllEvents,
  useUpdateEventStatus,
  useAdminDeleteEvent,
} from '../../hooks/useAdmin';
import styles from '../../components/Admin/EventsTable/EventsTable.module.css';

function EventsManagement() {
  // Filter & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(null);
  const [previewEvent, setPreviewEvent] = useState(null);

  // Data state queries with search parameter
  const {
    data: eventsData,
    isLoading,
    isError,
    error,
  } = useAdminAllEvents({ 
    search: searchTerm,
    page: currentPage,
    limit: itemsPerPage 
  });

  const updateStatusMutation = useUpdateEventStatus();
  const deleteEventMutation = useAdminDeleteEvent();

  // Map events data
  const events = useMemo(() => {
    if (!eventsData?.events) return [];

    return eventsData.events.map((event) => ({
      ...event, // Keep original data for preview
      title: event.name,
      createdBy: event.managerId
        ? { fullName: event.managerId.username }
        : { fullName: 'Unknown' },
      eventDate: event.startDate,
      maxParticipants: event.capacity,
      status: event.status,
      location: event.location || 'N/A',
    }));
  }, [pendingEventsData]);

  // Use server-side pagination from API response
  const totalPages = eventsData?.pagination?.pages || 1;
  const totalItems = eventsData?.pagination?.total || 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + events.length, totalItems);

  // Reset page if it exceeds total pages (e.g., after deletion)
  useEffect(() => {
    if (currentPage > 1 && currentPage > totalPages) {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  }, [currentPage, totalPages]);

  // Handlers
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handlePreview = (event) => {
    setPreviewEvent(event);
  };

  const handleApprove = (eventId) => {
    // Optimistically set loading
    setActionLoading(eventId);
    updateStatusMutation.mutate(
      { eventId, status: 'approved' },
      {
        onSettled: () => setActionLoading(null),
      }
    );
  };

  const handleReject = (eventId) => {
    setActionLoading(eventId);
    updateStatusMutation.mutate(
      { eventId, status: 'rejected' },
      {
        onSettled: () => setActionLoading(null),
      }
    );
  };

  const handleDelete = (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setActionLoading(eventId);
    deleteEventMutation.mutate(eventId, {
      onSettled: () => setActionLoading(null),
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 className={styles.spinner} size={32} />
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  // Error state - ignore 404 (treat as empty list)
  if (isError && error?.response?.status !== 404) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error: {error?.message || 'Failed to load events'}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const emptyMessage = searchTerm
    ? 'No matching events found'
    : 'No events found';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Events Management</h2>
      </div>

      <EventSearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      <EventTable
        events={events}
        startIndex={startIndex}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
        onPreview={handlePreview}
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

      {previewEvent && (
        <EventPreviewDialog
          event={previewEvent}
          onClose={() => setPreviewEvent(null)}
        />
      )}
    </div>
  );
}

export default EventsManagement;
