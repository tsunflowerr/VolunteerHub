import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, color = '#667eea' }) {
  const getTrendIcon = () => {
    if (changeType === 'increase') return <TrendingUp size={14} />;
    if (changeType === 'decrease') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getTrendClass = () => {
    if (changeType === 'increase') return styles.trendUp;
    if (changeType === 'decrease') return styles.trendDown;
    return styles.trendNeutral;
  };

  return (
    <motion.div
      className={styles.card}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.iconWrapper} style={{ backgroundColor: `${color}15` }}>
        {Icon && <Icon size={24} style={{ color }} />}
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <div className={styles.valueRow}>
          <span className={styles.value}>{value}</span>
          {change && (
            <span className={`${styles.trend} ${getTrendClass()}`}>
              {getTrendIcon()}
              {change}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
