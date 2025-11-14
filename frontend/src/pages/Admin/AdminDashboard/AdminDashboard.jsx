import { useState } from 'react';
import styles from './AdminDashboard.module.css';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  UserCheck,
  ArrowUpRight,
  Activity
} from 'lucide-react';

const AdminDashboard = () => {
  const stats = {
    totalUsers: 1500,
    totalManagers: 50,
    totalEvents: 350,
    totalRegistrations: 5000,
    pendingEvents: 15,
    activeUsers: 1200,
    eventsThisMonth: 45,
    registrationsThisMonth: 600,
  };

  const recentEvents = [
    { id: 1, name: 'Beach Cleanup Drive', status: 'pending', date: '2025-11-20', volunteers: 30 },
    { id: 2, name: 'Tree Planting Campaign', status: 'approved', date: '2025-11-22', volunteers: 45 },
    { id: 3, name: 'Food Distribution', status: 'pending', date: '2025-11-25', volunteers: 25 },
    { id: 4, name: 'Education Workshop', status: 'approved', date: '2025-11-28', volunteers: 60 },
  ];

  const StatCard = ({ icon: Icon, title, value, change, changeType, subtitle, color }) => (
    <div className={styles.statCard}>
      <div className={styles.statCard__header}>
        <div className={`${styles.statCard__icon} ${styles[`icon--${color}`]}`}>
          <Icon size={24} />
        </div>
        <div className={`${styles.statCard__change} ${changeType === 'increase' ? styles.positive : styles.negative}`}>
          {changeType === 'increase' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{change}%</span>
        </div>
      </div>
      <div className={styles.statCard__body}>
        <p className={styles.statCard__title}>{title}</p>
        <h3 className={styles.statCard__value}>{value.toLocaleString()}</h3>
        <p className={styles.statCard__subtitle}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.dashboard__header}>
        <div>
          <h1 className={styles.dashboard__title}>Dashboard Overview</h1>
          <p className={styles.dashboard__subtitle}>Welcome back! Here's what's happening with your platform today.</p>
        </div>
        <div className={styles.dashboard__actions}>
          <button className={styles.btn__secondary}>
            <Activity size={20} />
            View Reports
          </button>
          <button className={styles.btn__primary}>
            <Calendar size={20} />
            Create Event
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          change={12}
          changeType="increase"
          subtitle="Registered volunteers"
          color="blue"
        />
        <StatCard
          icon={UserCheck}
          title="Total Managers"
          value={stats.totalManagers}
          change={8}
          changeType="increase"
          subtitle="Event organizers"
          color="purple"
        />
        <StatCard
          icon={Calendar}
          title="Total Events"
          value={stats.totalEvents}
          change={15}
          changeType="increase"
          subtitle="All time events"
          color="green"
        />
        <StatCard
          icon={CheckCircle}
          title="Registrations"
          value={stats.totalRegistrations}
          change={20}
          changeType="increase"
          subtitle="Event sign-ups"
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className={styles.secondaryStats}>
        <div className={styles.secondaryCard}>
          <div className={styles.secondaryIcon}>
            <Clock size={20} />
          </div>
          <div>
            <p className={styles.secondaryValue}>{stats.pendingEvents}</p>
            <p className={styles.secondaryLabel}>Pending Approvals</p>
          </div>
        </div>
        <div className={styles.secondaryCard}>
          <div className={styles.secondaryIcon}>
            <Users size={20} />
          </div>
          <div>
            <p className={styles.secondaryValue}>{stats.activeUsers}</p>
            <p className={styles.secondaryLabel}>Active Users</p>
          </div>
        </div>
        <div className={styles.secondaryCard}>
          <div className={styles.secondaryIcon}>
            <Calendar size={20} />
          </div>
          <div>
            <p className={styles.secondaryValue}>{stats.eventsThisMonth}</p>
            <p className={styles.secondaryLabel}>Events This Month</p>
          </div>
        </div>
        <div className={styles.secondaryCard}>
          <div className={styles.secondaryIcon}>
            <TrendingUp size={20} />
          </div>
          <div>
            <p className={styles.secondaryValue}>{stats.registrationsThisMonth}</p>
            <p className={styles.secondaryLabel}>New Sign-ups</p>
          </div>
        </div>
      </div>

      {/* Recent Events Table */}
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Recent Events</h2>
          <button className={styles.btn__link}>
            View All
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Volunteers</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => (
                <tr key={event.id}>
                  <td className={styles.tableEventName}>{event.name}</td>
                  <td>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td>{event.volunteers} registered</td>
                  <td>
                    <span className={`${styles.badge} ${styles[`badge--${event.status}`]}`}>
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <button className={styles.btn__text}>View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
