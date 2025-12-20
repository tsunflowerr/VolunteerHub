import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, AlertTriangle, Send } from 'lucide-react';
import { useCreateReport } from '../../hooks/useReports';
import styles from './ReportModal.module.css';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam or misleading' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'hate_speech', label: 'Hate speech or discrimination' },
  { value: 'violence', label: 'Violence or dangerous content' },
  { value: 'inappropriate', label: 'Inappropriate or offensive content' },
  { value: 'misinformation', label: 'False information' },
  { value: 'copyright', label: 'Copyright violation' },
  { value: 'other', label: 'Other' },
];

const ReportModal = ({ isOpen, onClose, type, targetId, targetTitle }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const createReport = useCreateReport();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason) {
      return;
    }

    try {
      await createReport.mutateAsync({
        type,
        targetId,
        reason,
        description: description.trim() || undefined,
      });
      handleClose();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleClose = () => {
    setReason('');
    setDescription('');
    onClose();
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleClose}
        >
          <motion.div
            className={styles.modal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <div className={styles.headerIcon}>
                <Flag size={20} />
              </div>
              <div className={styles.headerText}>
                <h2>Report {type === 'post' ? 'Post' : type === 'comment' ? 'Comment' : type === 'user' ? 'User' : 'Event'}</h2>
                {targetTitle && (
                  <p className={styles.targetInfo}>
                    Reporting: &ldquo;{targetTitle.length > 50 ? targetTitle.substring(0, 50) + '...' : targetTitle}&rdquo;
                  </p>
                )}
              </div>
              <button className={styles.closeButton} onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.warningBox}>
                <AlertTriangle size={18} />
                <span>Please select the reason that best describes the issue</span>
              </div>

              <div className={styles.reasonList}>
                {REPORT_REASONS.map((option) => (
                  <label
                    key={option.value}
                    className={`${styles.reasonOption} ${reason === option.value ? styles.selected : ''}`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={option.value}
                      checked={reason === option.value}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <span className={styles.radioCustom}></span>
                    <span className={styles.reasonLabel}>{option.label}</span>
                  </label>
                ))}
              </div>

              <div className={styles.descriptionGroup}>
                <label htmlFor="description">Additional details (optional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide more context about why you're reporting this content..."
                  rows={4}
                  maxLength={500}
                />
                <span className={styles.charCount}>{description.length}/500</span>
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleClose}
                  disabled={createReport.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!reason || createReport.isPending}
                >
                  {createReport.isPending ? (
                    <>
                      <span className={styles.spinner}></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
