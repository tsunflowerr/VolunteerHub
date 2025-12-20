import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import EventHero from './EventHero';
import EventContent from './EventContent';
import EventSidebar from './EventSidebar';
import { useCategories } from '../../hooks/useCategories';
import { useAllAchievements } from '../../hooks/useGamification';
import React, { useMemo } from 'react';
import styles from './EventPreviewDialog.module.css';

const EventPreviewDialog = ({ event, onClose }) => {
  const { categories } = useCategories();
  const { data: achievementsData } = useAllAchievements();
  const allAchievements = achievementsData?.data || [];

  // Transform category IDs to full category objects for preview
  const transformedEvent = useMemo(() => {
    if (!event) return event;

    let transformed = { ...event };

    // Transform categories
    if (event.category && categories.length > 0) {
      // Check if categories are already objects (from API) or just IDs (from form)
      const isIdArray =
        event.category.length > 0 && typeof event.category[0] === 'string';

      if (isIdArray) {
        const categoryObjects = event.category
          .map((catId) => categories.find((c) => c._id === catId))
          .filter(Boolean);
        transformed.categories = categoryObjects;
      }
    }

    // Transform rewards from form format to API format
    if (event.pointsReward !== undefined || event.hoursCredit !== undefined) {
      transformed.rewards = {
        pointsReward: event.pointsReward || 0,
        hoursCredit: event.hoursCredit || 0,
        bonusPoints: event.bonusPoints || 0,
        bonusReason: event.bonusReason || '',
      };
    }

    // Transform requirements from form format to API format
    if (event.hasRequirements !== undefined) {
      transformed.requirements = {
        hasRequirements: event.hasRequirements,
        minLevel: event.minLevel || 1,
        minPoints: event.minPoints || 0,
        minEventsCompleted: event.minEventsCompleted || 0,
        requirementDescription: event.requirementDescription || '',
        requiredAchievements: event.requiredAchievements || [],
      };

      // Transform required achievement IDs to objects for display
      if (event.requiredAchievements && event.requiredAchievements.length > 0 && allAchievements.length > 0) {
        const achievementObjects = event.requiredAchievements
          .map((achId) => allAchievements.find((a) => a._id === achId))
          .filter(Boolean);
        transformed.requirements.requiredAchievementObjects = achievementObjects;
      }
    }

    return transformed;
  }, [event, categories, allAchievements]);
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
