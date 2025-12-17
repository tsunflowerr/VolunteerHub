import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Video, ChevronLeft, ChevronRight, User } from 'lucide-react';
import styles from './MediaGalleryModal.module.css';

const MediaGalleryModal = ({ media, filter, onFilterChange, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Filter media based on type
  const filteredMedia = media.filter((item) => {
    if (filter === 'all') return true;
    if (filter === 'images') return item.type === 'image';
    if (filter === 'videos') return item.type === 'video';
    return true;
  });

  const handleNext = () => {
    if (selectedIndex < filteredMedia.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleKeyDown = (e) => {
    if (selectedIndex === null) return;
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') setSelectedIndex(null);
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <motion.div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Media Gallery</h2>
          <motion.button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </motion.button>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${
              filter === 'all' ? styles.active : ''
            }`}
            onClick={() => onFilterChange('all')}
          >
            All ({media.length})
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === 'images' ? styles.active : ''
            }`}
            onClick={() => onFilterChange('images')}
          >
            <Image size={16} />
            Photos ({media.filter((m) => m.type === 'image').length})
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === 'videos' ? styles.active : ''
            }`}
            onClick={() => onFilterChange('videos')}
          >
            <Video size={16} />
            Videos ({media.filter((m) => m.type === 'video').length})
          </button>
        </div>

        {/* Gallery Grid */}
        <div className={styles.gallery}>
          {filteredMedia.length > 0 ? (
            <div className={styles.grid}>
              {filteredMedia.map((item, index) => (
                <motion.div
                  key={index}
                  className={styles.gridItem}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedIndex(index)}
                >
                  {item.type === 'video' ? (
                    <div className={styles.videoThumbnail}>
                      <img src={item.url} alt="Video thumbnail" />
                      <div className={styles.playIcon}>▶</div>
                    </div>
                  ) : (
                    <img src={item.url} alt="Gallery item" />
                  )}
                  <div className={styles.itemOverlay}>
                    <div className={styles.itemAuthor}>
                      <img
                        src={item.author.avatar}
                        alt={item.author.username}
                      />
                      <span>{item.author.username}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <Image size={48} />
              <p>No media found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox View */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <motion.button
              className={styles.lightboxClose}
              onClick={() => setSelectedIndex(null)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={32} />
            </motion.button>

            {selectedIndex > 0 && (
              <motion.button
                className={`${styles.lightboxNav} ${styles.prev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronLeft size={40} />
              </motion.button>
            )}

            <motion.div
              key={selectedIndex}
              className={styles.lightboxContent}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={filteredMedia[selectedIndex].url}
                alt="Full view"
                className={styles.lightboxImage}
              />
              <div className={styles.lightboxInfo}>
                <img
                  src={filteredMedia[selectedIndex].author.avatar}
                  alt={filteredMedia[selectedIndex].author.username}
                />
                <span>{filteredMedia[selectedIndex].author.username}</span>
              </div>
            </motion.div>

            {selectedIndex < filteredMedia.length - 1 && (
              <motion.button
                className={`${styles.lightboxNav} ${styles.next}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ChevronRight size={40} />
              </motion.button>
            )}

            <div className={styles.lightboxCounter}>
              {selectedIndex + 1} / {filteredMedia.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MediaGalleryModal;
