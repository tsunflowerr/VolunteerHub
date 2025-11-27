import { useState, useEffect } from 'react';
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
import styles from './ManagerEventDetail.module.css';

const ManagerEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVolunteersDialog, setShowVolunteersDialog] = useState(false);

  // Load event data
  useEffect(() => {
    // TODO: Fetch from API
    // Mock data
    setTimeout(() => {
      setEvent({
        _id: id,
        name: 'Beach Cleanup Initiative',
        description:
          'Join us for a community beach cleanup event to protect our marine life.',
        about:
          'Join us for a community beach cleanup event to protect our marine life and keep our beaches beautiful. This is a great opportunity to make a positive impact on our environment while meeting like-minded individuals.',
        activities:
          'Collect trash and recyclables, sort materials, participate in educational workshops about ocean conservation, and help restore beach habitats.',
        prepare:
          'Bring sunscreen, comfortable shoes, reusable water bottle, and gloves if you have them. We will provide trash bags and other equipment.',
        location: 'Santa Monica Beach, 1550 PCH, Santa Monica, CA 90401',
        startDate: '2025-11-20T08:00:00Z',
        endDate: '2025-11-20T12:00:00Z',
        category: ['animals', 'climate'],
        capacity: 50,
        registrationsCount: 32,
        status: 'completed', // completed, approved, pending
        thumbnail:
          'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800',
        createdAt: '2025-11-01T10:00:00Z',
      });

      // Mock volunteers
      setVolunteers([
        {
          _id: 'vol1',
          userId: 'user1',
          username: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
          registeredAt: '2025-11-05T14:30:00Z',
          completionStatus: 'completed',
        },
        {
          _id: 'vol2',
          userId: 'user2',
          username: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1 (555) 234-5678',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
          registeredAt: '2025-11-06T09:15:00Z',
          completionStatus: 'pending',
        },
        {
          _id: 'vol3',
          userId: 'user3',
          username: 'Bob Johnson',
          email: 'bob@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
          registeredAt: '2025-11-07T16:45:00Z',
          completionStatus: 'pending',
        },
        {
          _id: 'vol4',
          userId: 'user4',
          username: 'Alice Williams',
          email: 'alice@example.com',
          phone: '+1 (555) 456-7890',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
          registeredAt: '2025-11-08T11:20:00Z',
          completionStatus: 'completed',
        },
      ]);

      setLoading(false);
    }, 1000);
  }, [id]);

  const handleMarkComplete = (volunteerIds) => {
    // TODO: API call to mark volunteers as completed
    console.log('Marking volunteers as completed:', volunteerIds);

    setVolunteers((prev) =>
      prev.map((v) =>
        volunteerIds.includes(v._id || v.userId)
          ? { ...v, completionStatus: 'completed' }
          : v
      )
    );

    alert(`${volunteerIds.length} volunteer(s) marked as completed!`);
  };

  const handleEdit = () => {
    navigate(`/manager/events/edit/${id}`);
  };

  const handleDiscussion = () => {
    navigate(`/events/${id}/discussion`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      // TODO: API call to delete event
      console.log('Deleting event:', id);
      alert('Event deleted successfully!');
      navigate('/manager/events');
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
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
    (v) => v.completionStatus === 'completed'
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
          <button className={styles.discussionBtn} onClick={handleDiscussion}>
            <MessageSquare size={18} />
            Discussion
          </button>
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
                <span className={styles.infoLabel}>Date & Time</span>
                <span className={styles.infoValue}>
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  <br />
                  {new Date(event.startDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  -{' '}
                  {new Date(event.endDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className={styles.infoCard}>
              <MapPin size={20} />
              <div>
                <span className={styles.infoLabel}>Location</span>
                <span className={styles.infoValue}>{event.location}</span>
              </div>
            </div>
          </div>

          {/* Details Sections */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>About This Event</h2>
            <p className={styles.sectionText}>{event.about}</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Activities</h2>
            <p className={styles.sectionText}>{event.activities}</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>What to Prepare</h2>
            <p className={styles.sectionText}>{event.prepare}</p>
          </div>
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
                  {event.registrationsCount}
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
                <span>{event.status}</span>
              </div>
              <p className={styles.statusDescription}>
                {event.status === 'completed' &&
                  'Event has been completed. You can now mark volunteers as completed.'}
                {event.status === 'approved' &&
                  'Event is approved and accepting volunteers.'}
                {event.status === 'pending' &&
                  'Event is pending approval from administrators.'}
              </p>
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
