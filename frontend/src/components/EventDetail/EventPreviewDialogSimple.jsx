import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import EventHero from './EventHero';
import EventContent from './EventContent';
import EventSidebar from './EventSidebar';
import React from 'react';
import styles from './EventPreviewDialog.module.css';

const EventPreviewDialog = ({ event, onClose }) => {
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
            <EventHero thumbnail={event.thumbnail} />
            <div className={styles.eventContent}>
              <EventContent event={event} />
              <EventSidebar event={event} previewMode={true} />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EventPreviewDialog;
