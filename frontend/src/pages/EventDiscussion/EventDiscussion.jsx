import { useState, useEffect, useCallback } from 'react';
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
  Lock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import PostCard from '../../components/Discussion/PostCard';
import CreatePostModal from '../../components/Discussion/CreatePostModal';
import PostDetailModal from '../../components/Discussion/PostDetailModal';
import MediaGalleryModal from '../../components/Discussion/MediaGalleryModal';
import styles from './EventDiscussion.module.css';

const EventDiscussion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [mediaFilter, setMediaFilter] = useState('all');
  const [isJoined, setIsJoined] = useState(false);

  // Current user info
  const currentUser = user || {
    _id: 'guest',
    fullName: 'Guest',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // TODO: Replace with API calls
      setTimeout(() => {
        // Mock event data
        setEvent({
          _id: id,
          name: 'Beach Cleanup Initiative',
          description:
            'Join us for a community beach cleanup event to protect our marine life and keep our beaches beautiful. This is a great opportunity to make a positive impact on our environment.',
          about:
            'This event aims to bring together volunteers from all walks of life to clean our local beaches. We will provide all necessary equipment and refreshments. Volunteers will learn about marine conservation and the impact of pollution on our oceans.',
          location: 'Santa Monica Beach, 1550 PCH, Santa Monica, CA 90401',
          startDate: '2025-12-20T08:00:00Z',
          endDate: '2025-12-20T12:00:00Z',
          thumbnail:
            'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1200',
          capacity: 50,
          registrationsCount: 32,
          manager: {
            _id: 'manager1',
            username: 'John Manager',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager',
          },
          status: 'approved',
        });

        // Mock participants
        const mockParticipants = [
          {
            _id: 'user1',
            username: 'Alice Johnson',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
          },
          {
            _id: 'user2',
            username: 'Bob Smith',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
          },
          {
            _id: 'user3',
            username: 'Carol Williams',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
          },
          {
            _id: 'user4',
            username: 'David Brown',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
          },
          {
            _id: 'user5',
            username: 'Eva Martinez',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva',
          },
        ];
        setParticipants(mockParticipants);

        // Check if current user is joined
        if (user) {
          const userJoined = mockParticipants.some((p) => p._id === user.id);
          setIsJoined(userJoined);
        }

        // Mock posts
        setPosts([
          {
            _id: 'post1',
            title: 'Excited for the cleanup! 🌊',
            content:
              "Can't wait to join everyone this weekend for the beach cleanup! I've been looking forward to this event for weeks. Let's make our beach beautiful again!",
            author: {
              _id: 'user1',
              username: 'Alice Johnson',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
            },
            image: [
              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
            ],
            likesCount: 24,
            commentsCount: 8,
            createdAt: '2025-11-27T10:30:00Z',
            isLiked: true,
          },
          {
            _id: 'post2',
            title: 'What to bring?',
            content:
              'Hey everyone! First time joining a beach cleanup. What should I bring? I have my own gloves but not sure about other equipment. Any tips would be appreciated! 🙏',
            author: {
              _id: 'user2',
              username: 'Bob Smith',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
            },
            image: [],
            likesCount: 12,
            commentsCount: 15,
            createdAt: '2025-11-26T15:45:00Z',
            isLiked: false,
          },
          {
            _id: 'post3',
            title: 'Photos from last year! 📸',
            content:
              "Here are some photos from last year's cleanup event. We collected over 500 pounds of trash! Let's beat that record this year!",
            author: {
              _id: 'user3',
              username: 'Carol Williams',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
            },
            image: [
              'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800',
              'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800',
              'https://images.unsplash.com/photo-1484291470158-b8f8d608850d?w=800',
            ],
            likesCount: 45,
            commentsCount: 22,
            createdAt: '2025-11-25T09:20:00Z',
            isLiked: true,
          },
          {
            _id: 'post4',
            title: 'Carpooling from Downtown?',
            content:
              'Anyone carpooling from downtown area? I have 3 extra seats in my car. Leaving at 7 AM to arrive early. Drop a comment if interested!',
            author: {
              _id: 'user4',
              username: 'David Brown',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
            },
            image: [],
            likesCount: 8,
            commentsCount: 6,
            createdAt: '2025-11-24T18:00:00Z',
            isLiked: false,
          },
        ]);

        setLoading(false);
      }, 1000);
    };

    loadData();
  }, [id, user]);

  // Handlers
  const handleCreatePost = useCallback(
    (newPost) => {
      // Temporarily disabled login check for UI testing
      const postAuthor = user ? {
        _id: user.id,
        username: user.fullName,
        avatar: user.avatar,
      } : {
        _id: 'guest',
        username: 'Guest User',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
      };

      const post = {
        _id: `post${Date.now()}`,
        ...newPost,
        author: postAuthor,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        isLiked: false,
      };
      setPosts((prev) => [post, ...prev]);
      setShowCreatePost(false);
    },
    [user, navigate]
  );

  const handleLikePost = useCallback(
    (postId) => {
      // Temporarily disabled login check for UI testing
      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likesCount: post.isLiked
                  ? post.likesCount - 1
                  : post.likesCount + 1,
              }
            : post
        )
      );
    },
    []
  );

  const handleDeletePost = useCallback((postId) => {
    setPosts((prev) => prev.filter((post) => post._id !== postId));
  }, []);

  const handleJoinLeave = useCallback(() => {
    if (!user) {
      alert('Please login to join this event');
      navigate('/login');
      return;
    }
    setIsJoined((prev) => !prev);
    // TODO: API call to join/leave event
  }, [user, navigate]);

  const handleCreatePostClick = () => {
    // Temporarily disabled login check for UI testing
    setShowCreatePost(true);
  };

  // Filter posts by search
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get all media from posts
  const allMedia = posts.reduce((acc, post) => {
    if (post.image && post.image.length > 0) {
      post.image.forEach((img) => {
        acc.push({
          url: img,
          type: img.includes('video') ? 'video' : 'image',
          postId: post._id,
          author: post.author,
        });
      });
    }
    return acc;
  }, []);

  if (loading) {
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

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <section className={styles.headerSection}>
        <div className={styles.centeredWrapper}>
          {/* Back button */}
          <motion.button
            className={styles.backBtn}
            onClick={() => navigate(-1)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={20} />
            Back
          </motion.button>

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
                src={event.manager.avatar}
                alt={event.manager.username}
                className={styles.managerAvatar}
              />
              <span className={styles.managerName}>
                Organized by <strong>{event.manager.username}</strong>
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
                  src={participant.avatar}
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

            <motion.button
              className={`${styles.joinBtn} ${isJoined ? styles.joined : ''}`}
              onClick={handleJoinLeave}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isJoined ? (
                <>
                  <UserMinus size={18} />
                  Leave
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  Join
                </>
              )}
            </motion.button>
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
          {/* Create Post Card */}
          <motion.div
            className={styles.createPostCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src={currentUser.avatar}
              alt="Your avatar"
              className={styles.createPostAvatar}
            />
            <button
              className={styles.createPostInput}
              onClick={handleCreatePostClick}
            >
              {user ? "What's on your mind?" : 'Login to share your thoughts...'}
            </button>
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

          {/* Posts List */}
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
                    onClick={() => setSelectedPost(post)}
                    delay={index * 0.1}
                    currentUserId={user?.id}
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
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
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
            userName={currentUser.fullName}
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
