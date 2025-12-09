import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import EventHero from './EventHero';
import EventContent from './EventContent';
import EventSidebar from './EventSidebar';
import { useCategories } from '../../hooks/useCategories';
import React, { useMemo } from 'react';
import styles from './EventPreviewDialog.module.css';

const EventPreviewDialog = ({ event, onClose }) => {
  const { categories } = useCategories();

  // Transform category IDs to full category objects for preview
  const transformedEvent = useMemo(() => {
    if (!event.category || !categories.length) return event;

    // Check if categories are already objects (from API) or just IDs (from form)
    const isIdArray =
      event.category.length > 0 && typeof event.category[0] === 'string';

    if (!isIdArray) return event;

    const categoryObjects = event.category
      .map((catId) => categories.find((c) => c._id === catId))
      .filter(Boolean);

    return {
      ...event,
      categories: categoryObjects, // Use 'categories' (plural) for EventContent
    };
  }, [event, categories]);
  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.dialog}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Eye size={24} />
              <h2>Event Preview</h2>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            <EventHero thumbnail={transformedEvent.thumbnail} />
            <div className={styles.eventContent}>
              <EventContent event={transformedEvent} />
              <EventSidebar event={transformedEvent} previewMode={true} />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventPreviewDialog;
