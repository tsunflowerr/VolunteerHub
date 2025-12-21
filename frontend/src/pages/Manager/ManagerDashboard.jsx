import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './ManagerDashboard.module.css';
import { useManagerDashboard } from '../../hooks/useManager';

const ManagerDashboard = () => {
  const { data: response, isLoading } = useManagerDashboard();

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const dashboardData = response?.data || {
    eventStatistics: {
      total: 0,
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
    },
    volunteerStatistics: { total: 0 },
    recentEvents: [],
    monthlyData: [],
  };

  const statsCards = [
    {
      title: 'Total Events',
      value: dashboardData.eventStatistics?.total || 0,
      icon: Calendar,
      color: '#344f1f',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Total Registrations',
      value: dashboardData.volunteerStatistics?.total || 0,
      icon: Users,
      color: '#f4991a',
      bgColor: '#fff3e0',
    },
    {
      title: 'Approved Events',
      value: dashboardData.eventStatistics?.approved || 0,
      icon: CheckCircle,
      color: '#4caf50',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Pending Events',
      value: dashboardData.eventStatistics?.pending || 0,
      icon: Clock,
      color: '#ff9800',
      bgColor: '#fff3e0',
    },
    {
      title: 'Completed Events',
      value: dashboardData.eventStatistics?.completed || 0,
      icon: Activity,
      color: '#2196f3',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Cancelled Events',
      value: dashboardData.eventStatistics?.cancelled || 0,
      icon: XCircle,
      color: '#f44336',
      bgColor: '#ffebee',
    },
  ];

  const pieData = [
    {
      name: 'Approved',
      value: dashboardData.eventStatistics?.approved || 0,
      color: '#4caf50',
    },
    {
      name: 'Pending',
      value: dashboardData.eventStatistics?.pending || 0,
      color: '#ff9800',
    },
    {
      name: 'Completed',
      value: dashboardData.eventStatistics?.completed || 0,
      color: '#2196f3',
    },
    {
      name: 'Cancelled',
      value: dashboardData.eventStatistics?.cancelled || 0,
      color: '#f44336',
    },
  ].filter((item) => item.value > 0);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className={styles.title}>Manager Dashboard</h1>
            <p className={styles.subtitle}>
              Welcome back! Here's your overview
            </p>
          </div>
          <div className={styles.headerIcon}>
            <TrendingUp size={32} />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className={styles.statsGrid}
          variants={container}
          initial="hidden"
          animate="show"
        >
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className={styles.statCard}
                variants={item}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div
                  className={styles.statIcon}
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <Icon size={24} color={stat.color} />
                </div>
                <div className={styles.statContent}>
                  <h3 className={styles.statTitle}>{stat.title}</h3>
                  <p className={styles.statValue}>{stat.value}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts Section */}
        <div className={styles.chartsSection}>
          {/* Bar Chart */}
          <motion.div
            className={styles.chartCard}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className={styles.chartTitle}>Monthly Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#344f1f" name="Events" />
                <Bar
                  dataKey="registrations"
                  fill="#f4991a"
                  name="Registrations"
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            className={styles.chartCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h3 className={styles.chartTitle}>Events by Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Line Chart */}
        <motion.div
          className={styles.chartCardFull}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h3 className={styles.chartTitle}>Registration Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="registrations"
                stroke="#f4991a"
                strokeWidth={2}
                name="Registrations"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Events */}
        <motion.div
          className={styles.recentEvents}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h3 className={styles.sectionTitle}>Recent Events</h3>
          <div className={styles.eventsList}>
            {dashboardData.recentEvents?.map((event) => (
              <div key={event._id} className={styles.eventItem}>
                <div className={styles.eventInfo}>
                  <h4 className={styles.eventName}>{event.name}</h4>
                  <p className={styles.eventDate}>
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className={styles.eventStats}>
                  <span
                    className={`${styles.eventStatus} ${
                      styles[`status-${event.status}`]
                    }`}
                  >
                    {event.status}
                  </span>
                  <span className={styles.eventRegistrations}>
                    <Users size={16} />
                    {event.registrationsCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
