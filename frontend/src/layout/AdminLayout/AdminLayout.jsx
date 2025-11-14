import { Outlet, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Settings,
  FileText
} from 'lucide-react';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed} ${isMobileSidebarOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebar__header}>
          <div className={styles.sidebar__logoContainer}>
            <div className={styles.sidebar__logoIcon}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className={styles.sidebar__logo}>VolunteerHub</h1>
                <p className={styles.sidebar__role}>Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        <nav className={styles.sidebar__nav}>
          <div className={styles.nav__section}>
            <p className={styles.nav__sectionTitle}>Main</p>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `${styles.sidebar__navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <LayoutDashboard size={20} />
              {isSidebarOpen && <span>Dashboard</span>}
            </NavLink>
          </div>

          <div className={styles.nav__section}>
            <p className={styles.nav__sectionTitle}>Management</p>
            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                `${styles.sidebar__navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <Calendar size={20} />
              {isSidebarOpen && <span>Events</span>}
            </NavLink>

            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `${styles.sidebar__navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <Users size={20} />
              {isSidebarOpen && <span>Users</span>}
            </NavLink>

            <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `${styles.sidebar__navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <FileText size={20} />
              {isSidebarOpen && <span>Reports</span>}
            </NavLink>
          </div>

          <div className={styles.nav__section}>
            <p className={styles.nav__sectionTitle}>Settings</p>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `${styles.sidebar__navItem} ${isActive ? styles.active : ''}`
              }
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <Settings size={20} />
              {isSidebarOpen && <span>Settings</span>}
            </NavLink>
          </div>
        </nav>

        <div className={styles.sidebar__footer}>
          <div className={styles.sidebar__user}>
            <div className={styles.sidebar__userAvatar}>
              <img src="https://ui-avatars.com/api/?name=Admin&background=344f1f&color=fff" alt="Admin" />
            </div>
            {isSidebarOpen && (
              <div className={styles.sidebar__userInfo}>
                <p className={styles.sidebar__userName}>Admin User</p>
                <p className={styles.sidebar__userEmail}>admin@volunteerhub.com</p>
              </div>
            )}
          </div>
          <button className={styles.sidebar__logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainArea}>
        {/* Top Navigation Bar */}
        <header className={styles.topbar}>
          <div className={styles.topbar__left}>
            <button className={styles.topbar__menuBtn} onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <button className={styles.topbar__mobileMenuBtn} onClick={toggleMobileSidebar}>
              {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className={styles.topbar__search}>
              <Search size={20} />
              <input type="text" placeholder="Search..." />
            </div>
          </div>

          <div className={styles.topbar__right}>
            <button className={styles.topbar__iconBtn}>
              <Bell size={20} />
              <span className={styles.topbar__badge}>3</span>
            </button>
            <div className={styles.topbar__user}>
              <img src="https://ui-avatars.com/api/?name=Admin&background=344f1f&color=fff" alt="Admin" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div className={styles.mobileOverlay} onClick={toggleMobileSidebar}></div>
      )}
    </div>
  );
};

export default AdminLayout;
