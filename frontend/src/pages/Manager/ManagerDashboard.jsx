import { useState, useEffect } from 'react';
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

const ManagerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        totalEvents: 25,
        totalRegistrations: 450,
        pendingEvents: 3,
        approvedEvents: 20,
        completedEvents: 2,
        cancelledEvents: 0,
        recentEvents: [
          {
            _id: 'event1',
            name: 'Beach Cleanup',
            status: 'approved',
            registrationsCount: 30,
            startDate: '2025-11-20T08:00:00Z',
          },
          {
            _id: 'event2',
            name: 'Food Bank Sorting',
            status: 'pending',
            registrationsCount: 25,
            startDate: '2025-11-25T09:00:00Z',
          },
          {
            _id: 'event3',
            name: 'Youth Tutoring Program',
            status: 'approved',
            registrationsCount: 15,
            startDate: '2025-12-01T14:00:00Z',
          },
          {
            _id: 'event4',
            name: 'Community Garden',
            status: 'completed',
            registrationsCount: 40,
            startDate: '2025-11-10T10:00:00Z',
          },
        ],
        monthlyData: [
          { month: 'Jan', events: 5, registrations: 80 },
          { month: 'Feb', events: 8, registrations: 120 },
          { month: 'Mar', events: 6, registrations: 95 },
          { month: 'Apr', events: 10, registrations: 150 },
          { month: 'May', events: 7, registrations: 110 },
          { month: 'Jun', events: 12, registrations: 180 },
        ],
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Events',
      value: dashboardData.totalEvents,
      icon: Calendar,
      color: '#344f1f',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Total Registrations',
      value: dashboardData.totalRegistrations,
      icon: Users,
      color: '#f4991a',
      bgColor: '#fff3e0',
    },
    {
      title: 'Approved Events',
      value: dashboardData.approvedEvents,
      icon: CheckCircle,
      color: '#4caf50',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Pending Events',
      value: dashboardData.pendingEvents,
      icon: Clock,
      color: '#ff9800',
      bgColor: '#fff3e0',
    },
    {
      title: 'Completed Events',
      value: dashboardData.completedEvents,
      icon: Activity,
      color: '#2196f3',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Cancelled Events',
      value: dashboardData.cancelledEvents,
      icon: XCircle,
      color: '#f44336',
      bgColor: '#ffebee',
    },
  ];

  const pieData = [
    { name: 'Approved', value: dashboardData.approvedEvents, color: '#4caf50' },
    { name: 'Pending', value: dashboardData.pendingEvents, color: '#ff9800' },
    { name: 'Completed', value: dashboardData.completedEvents, color: '#2196f3' },
    { name: 'Cancelled', value: dashboardData.cancelledEvents, color: '#f44336' },
  ];

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
            {dashboardData.recentEvents.map((event) => (
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
