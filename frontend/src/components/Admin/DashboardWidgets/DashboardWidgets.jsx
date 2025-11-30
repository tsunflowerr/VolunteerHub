import { useState, useEffect } from 'react';
import { Clock, Calendar, Users, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './DashboardWidgets.module.css';

function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: 'event',
      message: 'New event "Beach Cleanup" created',
      time: '5 minutes ago',
      icon: Calendar,
      color: '#667eea',
    },
    {
      id: 2,
      type: 'user',
      message: 'User nguyenvana@gmail.com registered',
      time: '15 minutes ago',
      icon: Users,
      color: '#43a047',
    },
    {
      id: 3,
      type: 'registration',
      message: '3 new registrations for "Food Drive"',
      time: '1 hour ago',
      icon: CheckCircle,
      color: '#2196f3',
    },
    {
      id: 4,
      type: 'alert',
      message: 'Event "Park Restoration" is at full capacity',
      time: '2 hours ago',
      icon: AlertCircle,
      color: '#ff9800',
    },
  ];

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>
        <Clock size={20} />
        Recent Activities
      </h3>
      <div className={styles.activityList}>
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className={styles.activityItem}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={styles.activityIcon}
              style={{ backgroundColor: `${activity.color}15`, color: activity.color }}
            >
              <activity.icon size={16} />
            </div>
            <div className={styles.activityContent}>
              <span className={styles.activityMessage}>{activity.message}</span>
              <span className={styles.activityTime}>{activity.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: 'Community Garden Day',
      date: 'Jan 20, 2024',
      registrations: 25,
      maxParticipants: 30,
    },
    {
      id: 2,
      title: 'Youth Mentoring Program',
      date: 'Jan 22, 2024',
      registrations: 12,
      maxParticipants: 20,
    },
    {
      id: 3,
      title: 'Senior Home Visit',
      date: 'Jan 25, 2024',
      registrations: 8,
      maxParticipants: 15,
    },
  ];

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>
        <Calendar size={20} />
        Upcoming Events
      </h3>
      <div className={styles.eventList}>
        {events.map((event, index) => {
          const progress = (event.registrations / event.maxParticipants) * 100;
          return (
            <motion.div
              key={event.id}
              className={styles.eventItem}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.eventInfo}>
                <span className={styles.eventTitle}>{event.title}</span>
                <span className={styles.eventDate}>{event.date}</span>
              </div>
              <div className={styles.eventProgress}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${progress}%`,
                      backgroundColor: progress >= 80 ? '#ff9800' : '#667eea',
                    }}
                  />
                </div>
                <span className={styles.progressText}>
                  {event.registrations}/{event.maxParticipants}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function QuickStats() {
  const stats = [
    { label: 'Pending Approvals', value: 12, color: '#ff9800' },
    { label: 'Active Events', value: 8, color: '#43a047' },
    { label: 'New Users Today', value: 5, color: '#2196f3' },
  ];

  return (
    <div className={styles.widget}>
      <h3 className={styles.widgetTitle}>
        <TrendingUp size={20} />
        Quick Stats
      </h3>
      <div className={styles.quickStats}>
        {stats.map((stat, index) => (
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

function DashboardWidgets() {
  return (
    <div className={styles.widgetsGrid}>
      <RecentActivities />
      <UpcomingEvents />
      <QuickStats />
    </div>
  );
}

export { DashboardWidgets, RecentActivities, UpcomingEvents, QuickStats };
export default DashboardWidgets;
