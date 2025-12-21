import { UserCheck, Clock, CalendarCheck, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  StatCard,
  DashboardCharts,
  DashboardWidgets,
} from '../../components/Admin';
import styles from './AdminDashboard.module.css';
import { useAdminDashboard } from '../../hooks/useAdmin';

function AdminDashboard() {
  const { data: dashboardData, isLoading } = useAdminDashboard();

  const stats = dashboardData?.data || {
    userStatistics: { volunteers: { total: 0 } },
    eventStatistics: {
      byStatus: { pending: 0, total: 0 },
      byCategory: [],
      byTime: {},
    },
  };

  const statsData = [
    {
      id: 1,
      title: 'Total Users',
      value: stats.userStatistics?.volunteers?.total?.toLocaleString() || '0',
      icon: UserCheck,
      color: '#667eea',
      change: `+${stats.userStatistics?.volunteers?.newThisWeek || 0}`,
      changeType: 'increase',
    },
    {
      id: 2,
      title: 'Pending Events',
      value: stats.eventStatistics?.byStatus?.pending?.toString() || '0',
      icon: Clock,
      color: '#f4991a',
      change: 'Active',
      changeType: 'neutral',
    },
    {
      id: 3,
      title: 'Total Events',
      value: stats.eventStatistics?.byStatus?.total?.toString() || '0',
      icon: CalendarCheck,
      color: '#43a047',
      change: `+${stats.eventStatistics?.byTime?.newThisWeek || 0}`,
      changeType: 'increase',
    },
    {
      id: 4,
      title: 'Total Registrations',
      value: stats.registrationStatistics?.byStatus?.total?.toString() || '0',
      icon: Activity,
      color: '#e53935',
      change: `+${stats.registrationStatistics?.byTime?.newThisWeek || 0}`,
      changeType: 'increase',
    },
  ];

  if (isLoading) {
    return <div className="p-8 text-center">Loading dashboard stats...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <motion.div
        className={styles.statsContainer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {statsData.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            changeType={stat.changeType}
          />
        ))}
      </motion.div>

      <DashboardCharts stats={stats} />
    </div>
  );
}

export default AdminDashboard;
