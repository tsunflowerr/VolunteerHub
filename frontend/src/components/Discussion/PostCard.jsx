import { useState, memo } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  Edit,
  Flag,
  Globe,
} from 'lucide-react';
import styles from './PostCard.module.css';
import { formatDistanceToNow } from 'date-fns';
import { checkPermission, RESOURCES, ACTIONS } from '../../utilities/abac';

//using date fns to format time ago
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

const PostCard = memo(
  ({ post, onLike, onComment, onDelete, onEdit, onClick, delay = 0, user }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    // const isAuthor = currentUserId && (post.author._id === currentUserId || post.author.id === currentUserId);
    // ABAC checks will now determine edit/delete permissions

    const canEdit = checkPermission(user, RESOURCES.POSTS, ACTIONS.EDIT, post);
    const canDelete = checkPermission(
      user,
      RESOURCES.POSTS,
      ACTIONS.DELETE,
      post
    );

    const handleLike = (e) => {
      e.stopPropagation();
      onLike(post._id);
    };

    const handleComment = (e) => {
      e.stopPropagation();
      onComment(post._id);
    };

    const handleDelete = (e) => {
      e.stopPropagation();
      onDelete(post._id);
      setShowMenu(false);
    };

    const handleEdit = (e) => {
      e.stopPropagation();

      onEdit(post);
      setShowMenu(false);
    };

    const handleMenuToggle = (e) => {
      e.stopPropagation();
      setShowMenu(!showMenu);
    };

    // Render images grid
    const renderImages = () => {
      if (!post.image || post.image.length === 0) return null;

      const imageCount = post.image.length;

      if (imageCount === 1) {
        return (
          <div className={styles.imagesSingle}>
            <img src={post.image[0]} alt="Post" />
          </div>
        );
      }

      if (imageCount === 2) {
        return (
          <div className={styles.imagesDouble}>
            {post.image.map((img, idx) => (
              <img key={idx} src={img} alt={`Post ${idx + 1}`} />
            ))}
          </div>
        );
      }

      if (imageCount === 3) {
        return (
          <div className={styles.imagesTriple}>
            <img
              src={post.image[0]}
              alt="Post 1"
              className={styles.mainImage}
            />
            <div className={styles.sideImages}>
              {post.image.slice(1).map((img, idx) => (
                <img key={idx} src={img} alt={`Post ${idx + 2}`} />
              ))}
            </div>
          </div>
        );
      }

      // 4+ images
      return (
        <div className={styles.imagesGrid}>
          {post.image.slice(0, 4).map((img, idx) => (
            <div key={idx} className={styles.gridItem}>
              <img src={img} alt={`Post ${idx + 1}`} />
              {idx === 3 && imageCount > 4 && (
                <div className={styles.moreImages}>+{imageCount - 4}</div>
              )}
            </div>
          ))}
        </div>
      );
    };

    return (
      <motion.article className={styles.card} onClick={onClick}>
        {/* Header */}
        <header className={styles.header}>
          <img
            src={post.author.avatar}
            alt={post.author.username}
            className={styles.avatar}
          />
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>{post.author.username}</span>
            <div className={styles.postMeta}>
              <span className={styles.time}>
                {formatTimeAgo(post.createdAt)}
              </span>
            </div>
          </div>
          <div className={styles.menuWrapper}>
            <motion.button
              className={styles.menuBtn}
              onClick={handleMenuToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreHorizontal size={20} />
            </motion.button>

            {showMenu && (
              <motion.div
                className={styles.menu}
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
              >
                {canEdit && (
                  <button className={styles.menuItem} onClick={handleEdit}>
                    <Edit size={16} />
                    Edit Post
                  </button>
                )}
                {canDelete && (
                  <button className={styles.menuItem} onClick={handleDelete}>
                    <Trash2 size={16} />
                    Delete Post
                  </button>
                )}
                <button className={styles.menuItem}>
                  <Flag size={16} />
                  Report
                </button>
              </motion.div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {post.title && <h3 className={styles.title}>{post.title}</h3>}
          <p className={styles.text}>{post.content}</p>
        </div>

        {/* Images */}
        {renderImages()}

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
          <div className={styles.commentsStats}>
            {post.commentsCount > 0 && (
              <span>{post.commentsCount} comments</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <motion.button
            className={`${styles.actionBtn} ${
              post.isLiked ? styles.liked : ''
            }`}
            onClick={handleLike}
          >
            <Heart size={20} fill={post.isLiked ? '#f44336' : 'none'} />
            <span>Like</span>
          </motion.button>
          <motion.button className={styles.actionBtn} onClick={handleComment}>
            <MessageCircle size={20} />
            <span>Comment</span>
          </motion.button>
        </div>
      </motion.article>
    );
  }
);

PostCard.displayName = 'PostCard';

export default PostCard;
