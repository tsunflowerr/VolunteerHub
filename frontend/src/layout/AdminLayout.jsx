import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FolderOpen,
  Download,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Shield,
} from 'lucide-react';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { id: 'events', icon: Calendar, label: 'Events', path: '/admin/events' },
    { id: 'users', icon: Users, label: 'Users', path: '/admin/users' },
    { id: 'categories', icon: FolderOpen, label: 'Categories', path: '/admin/categories' },
    { id: 'export', icon: Download, label: 'Export', path: '/admin/export' },
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      navigate('/admin/login');
    }
  };

  // Get active menu from current path
  const getActiveMenu = () => {
    const path = location.pathname;
    const item = menuItems.find(m => path.includes(m.id));
    return item?.id || 'dashboard';
  };

  const activeMenu = getActiveMenu();
  const currentMenuItem = menuItems.find(m => m.id === activeMenu);

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
        {/* Brand */}
        <div className={styles.brand}>
          {!collapsed ? (
            <h2 className={styles.brandText}>Admin Panel</h2>
          ) : (
            <Shield size={28} />
          )}
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = activeMenu === item.id;

            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${active ? styles.active : ''}`}
                onClick={() => navigate(item.path)}
              >
                <div className={styles.iconWrapper}>
                  <Icon size={20} />
                </div>
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                {active && <div className={styles.activeIndicator} />}
              </button>
            );
          })}

          {/* Back to Home */}
          <button
            className={`${styles.navItem} ${styles.special}`}
            onClick={() => navigate('/')}
          >
            <div className={styles.iconWrapper}>
              <Home size={20} />
            </div>
            {!collapsed && <span className={styles.navLabel}>Back to Home</span>}
          </button>
        </nav>

        {/* Collapse Button */}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Content */}
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
