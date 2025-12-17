import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  UserPlus,
  UserMinus,
  Search,
  Image,
  Video,
  X,
  Calendar,
  MapPin,
  Info,
  Grid3X3,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import PostCard from '../../components/Discussion/PostCard';
import CreatePostModal from '../../components/Discussion/CreatePostModal';
import PostDetailModal from '../../components/Discussion/PostDetailModal';
import MediaGalleryModal from '../../components/Discussion/MediaGalleryModal';
import styles from './EventDiscussion.module.css';

// Hooks
import {
  useEvent,
  useRegisterEvent,
  useUnregisterEvent,
  useMyRegistrations,
} from '../../hooks/useEvents';
import { useEventVolunteers } from '../../hooks/useManager';
import {
  useEventPosts,
  useCreatePost,
  useUpdatePost,
  useLikePost,
  useDeletePost,
} from '../../hooks/usePosts';
import { checkPermission, RESOURCES, ACTIONS } from '../../utilities/abac';

const EventDiscussion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // New state for editing
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaFilter, setMediaFilter] = useState('all');

  // Queries
  const { data: eventData, isLoading: isEventLoading } = useEvent(id);
  const { data: volunteersData } = useEventVolunteers(id);
  const { data: postsData, isLoading: isPostsLoading } = useEventPosts(id);
  const { data: myRegistrations } = useMyRegistrations({ limit: 100 });

  // Mutations
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost(); // New mutation
  const likePostMutation = useLikePost();
  const deletePostMutation = useDeletePost();
  const registerMutation = useRegisterEvent();
  const unregisterMutation = useUnregisterEvent();

  // Derived Data
  const event = eventData?.event;
  const participants = volunteersData?.volunteers || [];
  const posts = postsData?.posts || [];

  console.log(postsData);

  const isJoined = useMemo(() => {
    return myRegistrations?.data?.some(
      (r) =>
        (r.eventId._id || r.eventId) === id &&
        ['confirmed', 'completed', 'approved'].includes(r.status)
    );
  }, [myRegistrations, id]);

  const canDiscuss = useMemo(() => {
    if (!event || !user) return false;
    // Basic check: Admin, Manager, or Joined Volunteer
    // You can replace this with checkPermission if needed, e.g.:
    const currentUserState = isJoined ? 'approved' : 'none';
    return checkPermission(user, RESOURCES.EVENTS, ACTIONS.DISCUSSION, {
      ...event,
      currentUserState,
    });
  }, [event, user, isJoined]);

  // Handlers
  const handleCreatePost = (newPost) => {
    if (!user) return;

    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('content', newPost.content);
    if (newPost.files && newPost.files.length > 0) {
      newPost.files.forEach((file) => {
        formData.append('image', file);
      });
    }

    createPostMutation.mutate(
      {
        eventId: id,
        data: formData,
      },
      {
        onSuccess: () => setShowCreatePost(false),
      }
    );
  };

  const handleUpdatePost = (updatedData) => {
    if (!user || !editingPost) return;

    const formData = new FormData();
    formData.append('title', updatedData.title);
    formData.append('content', updatedData.content);

    // Handle existing images
    if (updatedData.existingImages && updatedData.existingImages.length > 0) {
      updatedData.existingImages.forEach((url) => {
        formData.append('image', url);
      });
    } else {
      // If empty, send empty array to clear images?
      // Or if we don't append, backend defaults to [].
      // But backend merge logic expects explicit if needed.
      // My updated backend logic: "if (req.body.image) ... if (req.files) ... merge".
      // If I append nothing for 'image', req.body.image is undefined.
      // And backend mapFilesToBody: "else if (!req.body.image) { req.body.image = [] }".
      // So clearing images works if I don't append anything.
      // Wait, if I have 0 existing and 0 new, I append nothing.
    }

    // Handle new files
    if (updatedData.files && updatedData.files.length > 0) {
      updatedData.files.forEach((file) => {
        formData.append('image', file);
      });
    }

    updatePostMutation.mutate(
      {
        eventId: id,
        postId: editingPost._id,
        data: formData,
      },
      {
        onSuccess: () => setEditingPost(null),
      }
    );
  };

  const handleEditClick = (post) => {
    setEditingPost(post);
  };
  const handleLikePost = (postId) => {
    if (!user) return;
    likePostMutation.mutate({ eventId: id, postId });
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    deletePostMutation.mutate({ eventId: id, postId });
  };

  const handleJoinLeave = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isJoined) {
      if (window.confirm('Are you sure you want to leave this event?')) {
        unregisterMutation.mutate(id);
      }
    } else {
      registerMutation.mutate(id);
    }
  };

  const handleCreatePostClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowCreatePost(true);
  };

  // Filter posts by search
  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [posts, searchQuery]);

  // Get all media from posts
  const allMedia = useMemo(() => {
    return posts.reduce((acc, post) => {
      if (post.image && post.image.length > 0) {
        post.image.forEach((img) => {
          acc.push({
            url: img,
            type: img.includes('video') ? 'video' : 'image', // Basic check
            postId: post._id,
            author: post.author,
          });
        });
      }
      return acc;
    }, []);
  }, [posts]);

  if (isEventLoading || isPostsLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading discussion...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className={styles.error}>
        <h2>Event not found</h2>
        <button onClick={() => navigate('/events')}>Back to Events</button>
      </div>
    );
  }

  // Current user info for UI
  const currentUser = user || {
    _id: 'guest',
    fullName: 'Guest',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  };

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <div className={styles.centeredWrapper}>
          {/* Event Banner */}
          <motion.div
            className={styles.banner}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.thumbnailWrapper}>
              <img
                src={event.thumbnail}
                alt={event.name}
                className={styles.thumbnail}
              />
              <div className={styles.thumbnailOverlay} />
            </div>

            {/* Manager Info Bar */}
            <div className={styles.managerBar}>
              <img
                src={
                  event.managerId?.avatar ||
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager'
                }
                alt={event.managerId?.username || 'Manager'}
                className={styles.managerAvatar}
              />
              <span className={styles.managerName}>
                Organized by{' '}
                <strong>{event.managerId?.username || 'Unknown'}</strong>
              </span>
            </div>
          </motion.div>

          {/* Event Info */}
          <motion.div
            className={styles.eventInfo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className={styles.eventName}>{event.name}</h1>

            <div className={styles.participantsInfo}>
              <div className={styles.participantCount}>
                <Users size={18} />
                <span>
                  {event.registrationsCount} / {event.capacity} participants
                </span>
              </div>

              <div className={styles.participantAvatars}>
                {participants.slice(0, 5).map((participant, index) => (
                  <motion.img
                    key={participant._id}
                    src={
                      participant.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.username}`
                    }
                    alt={participant.username}
                    className={styles.participantAvatar}
                    style={{ zIndex: 5 - index }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    title={participant.username}
                  />
                ))}
                {participants.length > 5 && (
                  <div className={styles.moreParticipants}>
                    +{participants.length - 5}
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className={styles.searchWrapper}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        {/* Posts Column */}
        <div className={styles.postsColumn}>
          {/* Create Post Card - Only show if user can discuss */}
          {canDiscuss && (
            <motion.div
              className={styles.createPostCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.createPostInputWrapper}>
                <img
                  src={
                    currentUser.avatar ||
                    'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
                  }
                  alt="Your avatar"
                  className={styles.createPostAvatar}
                />
                <button
                  className={styles.createPostInput}
                  onClick={handleCreatePostClick}
                >
                  {user
                    ? "What's on your mind?"
                    : 'Login to share your thoughts...'}
                </button>
              </div>
              <div className={styles.createPostActions}>
                <button
                  className={styles.createPostAction}
                  onClick={handleCreatePostClick}
                >
                  <Image size={20} color="#4CAF50" />
                  <span>Photo</span>
                </button>
                <button
                  className={styles.createPostAction}
                  onClick={handleCreatePostClick}
                >
                  <Video size={20} color="#F44336" />
                  <span>Video</span>
                </button>
              </div>
            </motion.div>
          )}

          {!canDiscuss && !isEventLoading && (
            <div className={styles.noAccess}>
              <Lock size={48} />
              <h3>Join the event to discuss</h3>
              <p>
                You must be a registered participant to view and join the
                conversation.
              </p>
            </div>
          )}

          {/* Posts List - Only show if can discuss */}
          {canDiscuss && (
            <div className={styles.postsList}>
              <AnimatePresence>
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onLike={handleLikePost}
                      onComment={() => setSelectedPost(post)}
                      onDelete={handleDeletePost}
                      onEdit={() => handleEditClick(post)}
                      onClick={() => setSelectedPost(post)}
                      delay={index * 0.1}
                      user={user}
                    />
                  ))
                ) : (
                  <motion.div
                    className={styles.noPosts}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p>No posts found. Be the first to share something!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          {/* ... (rest of sidebar) ... */}
          {/* Event Info Card */}
          <motion.div
            className={styles.sidebarCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className={styles.sidebarTitle}>
              <Info size={20} />
              About This Event
            </h3>
            <p className={styles.eventDescription}>{event.description}</p>
            <div className={styles.eventDetails}>
              <div className={styles.eventDetail}>
                <Calendar size={16} />
                <span>
                  {new Date(event.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <div className={styles.eventDetail}>
                <MapPin size={16} />
                <span>{event.location}</span>
              </div>
            </div>
            <button
              className={styles.viewEventBtn}
              onClick={() => navigate(`/events/${id}`)}
            >
              View Event Details
            </button>
          </motion.div>

          {/* Media Gallery Card */}
          <motion.div
            className={styles.sidebarCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className={styles.sidebarTitle}>
              <Grid3X3 size={20} />
              Media
            </h3>
            {allMedia.length > 0 ? (
              <>
                <div className={styles.mediaGrid}>
                  {allMedia.slice(0, 6).map((media, index) => (
                    <motion.div
                      key={index}
                      className={styles.mediaItem}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setShowMediaGallery(true)}
                    >
                      <img src={media.url} alt="Media" />
                      {index === 5 && allMedia.length > 6 && (
                        <div className={styles.mediaOverlay}>
                          +{allMedia.length - 6}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                {allMedia.length > 6 && (
                  <button
                    className={styles.viewAllBtn}
                    onClick={() => setShowMediaGallery(true)}
                  >
                    View All Media
                  </button>
                )}
              </>
            ) : (
              <p className={styles.noMedia}>No media shared yet</p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal
            onClose={() => setShowCreatePost(false)}
            onSubmit={handleCreatePost}
            userAvatar={currentUser.avatar}
            userName={currentUser.username || currentUser.fullName}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingPost && (
          <CreatePostModal
            onClose={() => setEditingPost(null)}
            onSubmit={handleUpdatePost}
            userAvatar={currentUser.avatar}
            userName={currentUser.username || currentUser.fullName}
            initialData={editingPost}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
            onLike={handleLikePost}
            eventId={id}
            currentUser={user}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMediaGallery && (
          <MediaGalleryModal
            media={allMedia}
            filter={mediaFilter}
            onFilterChange={setMediaFilter}
            onClose={() => setShowMediaGallery(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDiscussion;
