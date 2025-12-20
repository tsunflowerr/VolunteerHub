import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  X,
  Heart,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Globe,
  Trash2,
  Edit2,
  Flag,
} from 'lucide-react';
import styles from './PostDetailModal.module.css';
import { formatDistanceToNow } from 'date-fns';
import useAuth from '../../hooks/useAuth';
import {
  usePostComments,
  useAddComment,
  useReplyComment,
  useUpdateComment,
  useDeleteComment,
  useLikeComment,
} from '../../hooks/useComment';
import { usePost, useLikePost } from '../../hooks/usePosts';
import ConfirmDialog from '../common/ConfirmDialog';

import { checkPermission, RESOURCES, ACTIONS } from '../../utilities/abac';
import VerifiedBadge from '../common/VerifiedBadge';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    return '';
  }
};

const CommentItem = ({
  comment,
  onReply,
  onLike,
  onUpdate,
  onDelete,
  onReport,
  currentUser,
  event, // Receive event for ABAC
  depth = 0,
  maxDepth = 5, // Allow deeper nesting
}) => {
  const navigate = useNavigate();
  const [showReplies, setShowReplies] = useState(
    depth === 0 && comment.replies?.length > 0
  );
  const [replyText, setReplyText] = useState('');
  const [editText, setEditText] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Safe check for author (in case user is deleted)
  const author = comment.author || {
    _id: 'deleted',
    username: 'Deleted User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deleted',
  };

  // ABAC Checks
  const canEdit = checkPermission(
    currentUser,
    RESOURCES.COMMENTS,
    ACTIONS.EDIT,
    { comment, event }
  );
  const canDelete = checkPermission(
    currentUser,
    RESOURCES.COMMENTS,
    ACTIONS.DELETE,
    { comment, event }
  );

  const handleSubmitReply = async () => {
    if (!replyText.trim() || isSubmittingReply) return;
    setIsSubmittingReply(true);
    try {
      await onReply(comment._id, replyText);
      setReplyText('');
      setIsReplying(false);
      // Auto-expand replies after adding new one
      setShowReplies(true);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleUpdate = () => {
    if (!editText.trim() || editText === comment.content) {
      setIsEditing(false);
      return;
    }
    onUpdate(comment._id, editText);
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (author._id && author._id !== 'deleted') {
      navigate(`/profile/${author._id}`);
    }
  };

  // Determine if this user can report the comment
  const canReport = currentUser && author._id !== (currentUser._id || currentUser.id) && author._id !== 'deleted';

  return (
    <div
      className={styles.commentItem}
      style={{ marginLeft: depth > 0 ? Math.min(depth * 32, 96) + 'px' : 0 }}
    >
      <img
        src={author.avatar}
        alt={author.username}
        className={styles.commentAvatar}
        onClick={handleAvatarClick}
        style={{ cursor: author._id !== 'deleted' ? 'pointer' : 'default' }}
      />
      <div className={styles.commentContent}>
        <div className={styles.commentBubble}>
          <div className={styles.commentHeader}>
            <span className={styles.commentAuthor} onClick={handleAvatarClick} style={{ cursor: author._id !== 'deleted' ? 'pointer' : 'default' }}>
              {author.username}
              <VerifiedBadge role={author.role} size={14} />
            </span>
            {!isEditing && (
              <div className={styles.commentMenu}>
                {canEdit && (
                  <button
                    className={styles.iconBtn}
                    onClick={() => setIsEditing(true)}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                {canDelete && (
                  <button
                    className={styles.iconBtn}
                    onClick={() => onDelete(comment._id)}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {canReport && (
                  <button
                    className={styles.iconBtn}
                    onClick={() => onReport?.(comment)}
                    title="Report"
                  >
                    <Flag size={14} />
                  </button>
                )}
              </div>
            )}
          </div>

          {isEditing ? (
            <div className={styles.editContainer}>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleUpdate();
                  if (e.key === 'Escape') setIsEditing(false);
                }}
                autoFocus
                className={styles.editInput}
              />
              <div className={styles.editActions}>
                <button onClick={handleUpdate} className={styles.saveBtn}>
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className={styles.commentText}>{comment.content}</p>
          )}
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
          {depth < maxDepth && (
            <button
              className={styles.commentAction}
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </button>
          )}
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
              placeholder={`Reply to ${author.username}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()}
              disabled={isSubmittingReply}
            />
            <button 
              onClick={handleSubmitReply} 
              disabled={!replyText.trim() || isSubmittingReply}
            >
              {isSubmittingReply ? '...' : <Send size={16} />}
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
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onReport={onReport}
                    currentUser={currentUser}
                    event={event}
                    depth={depth + 1}
                    maxDepth={maxDepth}
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

const PostDetailModal = ({
  post: initialPost, // Optional now, used for fallback data
  onClose,
  eventId, // Can also be got from params, but prop is fine
  currentUser,
  event,
  onReportPost,
  onReportComment,
}) => {
  const { postId } = useParams();
  const [newComment, setNewComment] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteCommentId, setDeleteCommentId] = useState(null);
  const commentInputRef = useRef(null);

  // Use postId from URL
  const { data: postData } = usePost(eventId, postId);
  
  // Merge initialPost (if provided) with fetched data
  const post = postData?.post || initialPost || { _id: postId, author: {}, content: '', image: [] };

  const { data: commentsData, isLoading } = usePostComments(eventId, postId);
  const comments = commentsData?.comments || [];
  // console.log('Comments Data:', commentsData);

  const addCommentMutation = useAddComment();
  const replyCommentMutation = useReplyComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();
  const likeCommentMutation = useLikeComment();
  const likePostMutation = useLikePost();

  // Focus comment input on mount
  useEffect(() => {
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 300);
  }, []);

  const handleLikePost = () => {
    likePostMutation.mutate({ eventId, postId });
  };

  const handleLikeComment = (commentId) => {
    likeCommentMutation.mutate({ eventId, postId, commentId });
  };

  const handleReply = (parentId, text) => {
    replyCommentMutation.mutate({
      eventId,
      postId,
      commentId: parentId,
      content: text,
    });
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    addCommentMutation.mutate(
      { eventId, postId, content: newComment.trim() },
      { onSuccess: () => setNewComment('') }
    );
  };

  const handleUpdateComment = (commentId, content) => {
    updateCommentMutation.mutate({
      eventId,
      postId,
      commentId,
      content,
    });
  };

  const handleDeleteComment = (commentId) => {
    setDeleteCommentId(commentId);
  };

  const confirmDeleteComment = () => {
    if (deleteCommentId) {
      deleteCommentMutation.mutate(
        { eventId, postId, commentId: deleteCommentId },
        {
          onSuccess: () => {
            toast.success('Comment deleted successfully');
          },
          onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete comment');
          },
        }
      );
    }
    setDeleteCommentId(null);
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
              onClick={() => post.author._id && navigate(`/profile/${post.author._id}`)}
              style={{ cursor: 'pointer' }}
            />
            <div className={styles.authorInfo}>
              <span className={styles.authorName} onClick={() => post.author._id && navigate(`/profile/${post.author._id}`)} style={{ cursor: 'pointer' }}>
                {post.author.username}
                <VerifiedBadge role={post.author.role} size={16} />
              </span>
              <div className={styles.postMeta}>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
            {/* Report Post Button */}
            {currentUser && post.author._id !== (currentUser._id || currentUser.id) && (
              <button
                className={styles.reportPostBtn}
                onClick={() => onReportPost?.(post)}
                title="Report post"
              >
                <Flag size={16} />
              </button>
            )}
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
            <span>{post.commentsCount || comments.length} comments</span>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <motion.button
              className={`${styles.actionBtn} ${
                post.isLiked ? styles.liked : ''
              }`}
              onClick={handleLikePost}
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
            {isLoading ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onReply={handleReply}
                  onLike={handleLikeComment}
                  onUpdate={handleUpdateComment}
                  onDelete={handleDeleteComment}
                  onReport={onReportComment}
                  currentUser={currentUser}
                  event={event}
                />
              ))
            ) : (
              <p className={styles.noComments}>
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className={styles.commentInputWrapper}>
          <img
            src={
              currentUser?.avatar ||
              'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest'
            }
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
              disabled={!newComment.trim() || addCommentMutation.isPending}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete Comment Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCommentId}
        onClose={() => setDeleteCommentId(null)}
        onConfirm={confirmDeleteComment}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmText="Delete"
        variant="danger"
        isLoading={deleteCommentMutation.isPending}
      />
    </motion.div>
  );
};

export default PostDetailModal;
