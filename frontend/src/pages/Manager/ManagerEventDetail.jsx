import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import VolunteerListDialog from '../../components/Manager/VolunteerListDialog';
import CategoryChip from '../../components/common/Category/CategoryChip';
import { useEvent, eventKeys } from '../../hooks/useEvents';
import {
  useDeleteEvent,
  useEventVolunteers,
  useUpdateRegistrationStatus,
} from '../../hooks/useManager';
import styles from './ManagerEventDetail.module.css';

const ManagerEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showVolunteersDialog, setShowVolunteersDialog] = useState(false);

  // Data Fetching
  const {
    data: eventData,
    isLoading: isEventLoading,
    isError: isEventError,
  } = useEvent(id);
  const { data: volunteersData, isLoading: isVolunteersLoading } =
    useEventVolunteers(id);
  const deleteMutation = useDeleteEvent();
  const updateStatusMutation = useUpdateRegistrationStatus();

  const event = eventData?.event;
  // Map volunteers to include completionStatus for compatibility
  const volunteers =
    volunteersData?.volunteers?.map((v) => ({
      ...v,
      registrationStatus: v.registrationStatus,
      completionStatus: v.registrationStatus,
    })) || [];

  const handleMarkComplete = (registrationIds) => {
    // registrationIds from Dialog are actually registration IDs (v._id)
    registrationIds.forEach((regId) => {
      updateStatusMutation.mutate({
        registrationId: regId,
        status: 'completed',
      });
    });
  };

  const handleEdit = () => {
    navigate(`/manager/events/edit/${id}`);
  };

  const handleDiscussion = () => {
    navigate(`/events/${id}/discussion`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: eventKeys.all });
          navigate('/manager/events');
        },
      });
    }
  };

  if (isEventLoading || isVolunteersLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (isEventError || !event) {
    return (
      <div className={styles.error}>
        <AlertCircle size={48} />
        <h2>Event not found</h2>
        <button onClick={() => navigate('/manager/events')}>
          Back to Events
        </button>
      </div>
    );
  }

  const completedVolunteers = volunteers.filter(
    (v) => v.registrationStatus === 'completed'
  ).length;

  return (
    <div className={styles.container}>
      {/* Header */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className={styles.actions}>
          {(event.status === 'approved' || event.status === 'completed') && (
            <button className={styles.discussionBtn} onClick={handleDiscussion}>
              <MessageSquare size={18} />
              Discussion
            </button>
          )}
          <button className={styles.editBtn} onClick={handleEdit}>
            <Edit size={18} />
            Edit
          </button>
          <button className={styles.deleteBtn} onClick={handleDelete}>
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </motion.div>

      {/* Hero Image */}
      <motion.div
        className={styles.hero}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <img src={event.thumbnail} alt={event.name} />
        <div
          className={`${styles.statusBadge} ${
            styles[`status-${event.status}`]
          }`}
        >
          {event.status}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Main Info */}
        <div className={styles.main}>
          <h1 className={styles.title}>{event.name}</h1>
          <p className={styles.description}>{event.description}</p>

          {/* Info Cards */}
          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <Calendar size={20} />
              <div>
                <span className={styles.infoLabel}>Start Date</span>
                <span className={styles.infoValue}>
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(event.startDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <Clock size={20} />
              <div>
                <span className={styles.infoLabel}>End Date</span>
                <span className={styles.infoValue}>
                  {new Date(event.endDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}{' '}
                  at{' '}
                  {new Date(event.endDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className={`${styles.infoCard} ${styles.locationCard}`}>
              <MapPin size={20} />
              <div>
                <span className={styles.infoLabel}>Location</span>
                <span className={styles.infoValue}>{event.location}</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          {event.categories && event.categories.length > 0 && (
            <div className={styles.categories}>
              {event.categories.map((cat) => (
                <CategoryChip key={cat._id} category={cat} filled={false} />
              ))}
            </div>
          )}

          {/* Details Sections */}
          {event.about && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>About This Event</h2>
              <p className={styles.sectionText}>{event.about}</p>
            </div>
          )}

          {event.activities && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Activities</h2>
              <p className={styles.sectionText}>{event.activities}</p>
            </div>
          )}

          {event.prepare && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>What to Prepare</h2>
              <p className={styles.sectionText}>{event.prepare}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* Volunteers Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Users size={20} />
              Volunteers
            </h3>
            <div
              className={styles.volunteersStats}
              onClick={() => setShowVolunteersDialog(true)}
            >
              <div className={styles.volunteerCount}>
                <span className={styles.countNumber}>
                  {event.registrationsCount || 0}
                </span>
                <span className={styles.countLabel}>
                  / {event.capacity} volunteers
                </span>
              </div>
              <button className={styles.viewVolunteersBtn}>
                View All Volunteers
              </button>
            </div>

            {event.status === 'completed' && (
              <div className={styles.completionStats}>
                <div className={styles.completionItem}>
                  <CheckCircle size={18} color="#4caf50" />
                  <span>
                    Completed: <strong>{completedVolunteers}</strong>
                  </span>
                </div>
                <div className={styles.completionItem}>
                  <Clock size={18} color="#ff9800" />
                  <span>
                    Pending:{' '}
                    <strong>{volunteers.length - completedVolunteers}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Status Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Event Status</h3>
            <div className={styles.statusInfo}>
              <div
                className={`${styles.statusIndicator} ${
                  styles[`status-${event.status}`]
                }`}
              >
                {event.status === 'completed' && <CheckCircle size={20} />}
                {event.status === 'approved' && <CheckCircle size={20} />}
                {event.status === 'pending' && <Clock size={20} />}
                {event.status === 'rejected' && <AlertCircle size={20} />}
                <span className={styles.statusDescription}>
                  {event.status === 'completed' &&
                    'Event has been completed. You can now mark volunteers as completed'}
                  {event.status === 'approved' &&
                    'Event is approved and accepting volunteers'}
                  {event.status === 'pending' &&
                    'Event is pending approval from administrators'}
                  {event.status === 'rejected' &&
                    'Event has been rejected by administrators'}
                </span>
              </div>
            </div>
          </div>

          {/* Created Date */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Created</h3>
            <p className={styles.createdDate}>
              {new Date(event.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Volunteer List Dialog */}
      {showVolunteersDialog && (
        <VolunteerListDialog
          event={event}
          volunteers={volunteers}
          onClose={() => setShowVolunteersDialog(false)}
          onMarkComplete={handleMarkComplete}
        />
      )}
    </div>
  );
};

export default ManagerEventDetail;
