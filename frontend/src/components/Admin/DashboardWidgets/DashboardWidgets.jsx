import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './DashboardWidgets.module.css';

function QuickStats({ stats }) {
  const quickStatsData = [
    { 
      label: 'Pending Approvals', 
      value: stats?.eventStatistics?.byStatus?.pending || 0, 
      color: '#ff9800' 
    },
    { 
      label: 'Active Events', 
      value: stats?.eventStatistics?.byStatus?.approved || 0, 
      color: '#43a047' 
    },
    { 
      label: 'New Users Today', 
      value: stats?.userStatistics?.volunteers?.newToday || 0, 
      color: '#2196f3' 
    },
  ];

  return (
    <div className={styles.widget} style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
      <h3 className={styles.widgetTitle}>
        <TrendingUp size={20} />
        Quick Stats
      </h3>
      <div className={styles.quickStats}>
        {quickStatsData.map((stat, index) => (
          <motion.div
            key={stat.label}
            className={styles.quickStatItem}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <span className={styles.quickStatValue} style={{ color: stat.color }}>
              {stat.value}
            </span>
            <span className={styles.quickStatLabel}>{stat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function DashboardWidgets({ stats }) {
  return (
    <div className={styles.widgetsGrid} style={{ display: 'flex', justifyContent: 'center', gridTemplateColumns: 'none' }}>
      <QuickStats stats={stats} />
    </div>
  );
}

export { DashboardWidgets, QuickStats };
export default DashboardWidgets;
