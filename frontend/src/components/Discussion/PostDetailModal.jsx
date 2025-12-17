import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Globe,
} from 'lucide-react';
import styles from './PostDetailModal.module.css';
import { formatDistanceToNow } from 'date-fns';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

// Mock comments data
const mockComments = [
  {
    _id: 'comment1',
    content: "This is amazing! Can't wait to join the event! 🎉",
    author: {
      _id: 'user1',
      username: 'Alice Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    },
    likesCount: 5,
    isLiked: false,
    createdAt: '2025-11-27T12:30:00Z',
    replies: [
      {
        _id: 'reply1',
        content: 'Me too! See you there!',
        author: {
          _id: 'user2',
          username: 'Bob Smith',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        },
        likesCount: 2,
        isLiked: false,
        createdAt: '2025-11-27T13:00:00Z',
      },
      {
        _id: 'reply2',
        content: "Let's make it a great event!",
        author: {
          _id: 'user3',
          username: 'Carol Williams',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
        },
        likesCount: 1,
        isLiked: true,
        createdAt: '2025-11-27T13:30:00Z',
      },
    ],
  },
  {
    _id: 'comment2',
    content: "Great initiative! I've shared this with my friends.",
    author: {
      _id: 'user4',
      username: 'David Brown',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
    likesCount: 3,
    isLiked: true,
    createdAt: '2025-11-26T18:00:00Z',
    replies: [],
  },
  {
    _id: 'comment3',
    content: 'What time should we arrive? Is there parking available?',
    author: {
      _id: 'user5',
      username: 'Eva Martinez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eva',
    },
    likesCount: 0,
    isLiked: false,
    createdAt: '2025-11-26T10:00:00Z',
    replies: [
      {
        _id: 'reply3',
        content:
          'Please arrive 30 minutes before the start time. Yes, there is free parking available at the venue.',
        author: {
          _id: 'manager1',
          username: 'John Manager',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager',
        },
        likesCount: 8,
        isLiked: false,
        createdAt: '2025-11-26T11:00:00Z',
      },
    ],
  },
];

const CommentItem = ({ comment, onReply, onLike, depth = 0 }) => {
  const [showReplies, setShowReplies] = useState(
    depth === 0 && comment.replies?.length > 0
  );
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    onReply(comment._id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div
      className={styles.commentItem}
      style={{ marginLeft: depth > 0 ? '44px' : 0 }}
    >
      <img
        src={comment.author.avatar}
        alt={comment.author.username}
        className={styles.commentAvatar}
      />
      <div className={styles.commentContent}>
        <div className={styles.commentBubble}>
          <span className={styles.commentAuthor}>
            {comment.author.username}
          </span>
          <p className={styles.commentText}>{comment.content}</p>
        </div>
        <div className={styles.commentActions}>
          <button
            className={`${styles.commentAction} ${
              comment.isLiked ? styles.liked : ''
            }`}
            onClick={() => onLike(comment._id)}
          >
            Like
          </button>
          <button
            className={styles.commentAction}
            onClick={() => setIsReplying(!isReplying)}
          >
            Reply
          </button>
          <span className={styles.commentTime}>
            {formatTimeAgo(comment.createdAt)}
          </span>
          {comment.likesCount > 0 && (
            <span className={styles.commentLikes}>❤️ {comment.likesCount}</span>
          )}
        </div>

        {/* Reply Input */}
        {isReplying && (
          <motion.div
            className={styles.replyInput}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              placeholder={`Reply to ${comment.author.username}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
            />
            <button onClick={handleSubmitReply} disabled={!replyText.trim()}>
              <Send size={16} />
            </button>
          </motion.div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className={styles.repliesSection}>
            {!showReplies && (
              <button
                className={styles.showRepliesBtn}
                onClick={() => setShowReplies(true)}
              >
                <ChevronDown size={16} />
                View {comment.replies.length}{' '}
                {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
            {showReplies && (
              <>
                <button
                  className={styles.showRepliesBtn}
                  onClick={() => setShowReplies(false)}
                >
                  <ChevronUp size={16} />
                  Hide replies
                </button>
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply._id}
                    comment={reply}
                    onReply={onReply}
                    onLike={onLike}
                    depth={1}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const PostDetailModal = ({ post, onClose, onLike, eventId }) => {
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const commentInputRef = useRef(null);

  // Focus comment input on mount
  useEffect(() => {
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 300);
  }, []);

  const handleLikeComment = (commentId) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment._id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likesCount: comment.isLiked
              ? comment.likesCount - 1
              : comment.likesCount + 1,
          };
        }
        // Check replies
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply._id === commentId
                ? {
                    ...reply,
                    isLiked: !reply.isLiked,
                    likesCount: reply.isLiked
                      ? reply.likesCount - 1
                      : reply.likesCount + 1,
                  }
                : reply
            ),
          };
        }
        return comment;
      })
    );
  };

  const handleReply = (parentId, text) => {
    const newReply = {
      _id: `reply${Date.now()}`,
      content: text,
      author: {
        _id: 'manager1',
        username: 'John Manager',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager',
      },
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) =>
      prev.map((comment) =>
        comment._id === parentId
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      )
    );
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      _id: `comment${Date.now()}`,
      content: newComment.trim(),
      author: {
        _id: 'manager1',
        username: 'John Manager',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manager',
      },
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      replies: [],
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <span className={styles.headerTitle}>
            {post.author.username}'s Post
          </span>
          <motion.button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </motion.button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Post Author */}
          <div className={styles.postHeader}>
            <img
              src={post.author.avatar}
              alt={post.author.username}
              className={styles.authorAvatar}
            />
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{post.author.username}</span>
              <div className={styles.postMeta}>
                <span>{formatTimeAgo(post.createdAt)}</span>
                <span className={styles.dot}>·</span>
                <Globe size={12} />
              </div>
            </div>
            <button className={styles.menuBtn}>
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Post Content */}
          <div className={styles.postContent}>
            {post.title && <h2 className={styles.postTitle}>{post.title}</h2>}
            <p className={styles.postText}>{post.content}</p>
          </div>

          {/* Post Images */}
          {post.image && post.image.length > 0 && (
            <div className={styles.postImages}>
              <img
                src={post.image[currentImageIndex]}
                alt="Post"
                className={styles.mainImage}
              />
              {post.image.length > 1 && (
                <div className={styles.imageThumbnails}>
                  {post.image.map((img, index) => (
                    <button
                      key={index}
                      className={`${styles.thumbnail} ${
                        index === currentImageIndex ? styles.active : ''
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.likesStats}>
              {post.likesCount > 0 && (
                <>
                  <span className={styles.likeIcon}>❤️</span>
                  <span>{post.likesCount}</span>
                </>
              )}
            </div>
            <span>{comments.length} comments</span>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <motion.button
              className={`${styles.actionBtn} ${
                post.isLiked ? styles.liked : ''
              }`}
              onClick={() => onLike(post._id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart size={20} fill={post.isLiked ? '#f44336' : 'none'} />
              <span>Like</span>
            </motion.button>
            <motion.button
              className={styles.actionBtn}
              onClick={() => commentInputRef.current?.focus()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle size={20} />
              <span>Comment</span>
            </motion.button>
          </div>

          {/* Comments Section */}
          <div className={styles.commentsSection}>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                onReply={handleReply}
                onLike={handleLikeComment}
              />
            ))}
          </div>
        </div>

        {/* Comment Input */}
        <div className={styles.commentInputWrapper}>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Manager"
            alt="Your avatar"
            className={styles.inputAvatar}
          />
          <div className={styles.inputContainer}>
            <input
              ref={commentInputRef}
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
              className={styles.commentInput}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PostDetailModal;
