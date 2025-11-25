import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  CalendarPlus,
  Users,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import styles from './ManagerLayout.module.css';

const ManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/manager/dashboard',
    },
    {
      icon: Calendar,
      label: 'My Events',
      path: '/manager/events',
    },
    {
      icon: CalendarPlus,
      label: 'Create Event',
      path: '/manager/events/create',
    },
    {
      icon: Users,
      label: 'Registrations',
      path: '/manager/registrations',
    },
    {
      icon: Home,
      label: 'Back to User View',
      path: '/',
      special: true,
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <motion.aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
        initial={false}
        animate={{ width: collapsed ? '80px' : '280px' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {/* Logo/Brand */}
        <div className={styles.brand}>
          {!collapsed && (
            <motion.h2
              className={styles.brandText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Manager Panel
            </motion.h2>
          )}
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <motion.button
                key={item.path}
                className={`${styles.navItem} ${active ? styles.active : ''} ${
                  item.special ? styles.special : ''
                }`}
                onClick={() => navigate(item.path)}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.iconWrapper}>
                  <Icon size={20} />
                </div>
                {!collapsed && (
                  <motion.span
                    className={styles.navLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {item.label}
                  </motion.span>
                )}
                {active && <div className={styles.activeIndicator} />}
              </motion.button>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
