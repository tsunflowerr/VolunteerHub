import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import styles from './ConfirmDialog.module.css';

const iconMap = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  danger: AlertTriangle,
};

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning', // 'warning' | 'info' | 'success' | 'danger'
  isLoading = false,
}) => {
  const Icon = iconMap[variant] || AlertTriangle;

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div
            className={styles.dialog}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>

            <div className={`${styles.iconWrapper} ${styles[variant]}`}>
              <Icon size={28} />
            </div>

            <h2 className={styles.title}>{title}</h2>
            <p className={styles.message}>{message}</p>

            <div className={styles.actions}>
              <button
                className={styles.cancelBtn}
                onClick={onClose}
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                className={`${styles.confirmBtn} ${styles[variant]}`}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
