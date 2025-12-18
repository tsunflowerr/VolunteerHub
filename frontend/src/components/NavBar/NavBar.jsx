import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import styles from './NavBar.module.css';
import NotificationDialog from '../Notification/NotificationDialog.jsx';
import { checkPermission, RESOURCES, ACTIONS } from '../../utilities/abac';
import { useUnreadNotificationsCount } from '../../hooks/useNotifications';

import { User, LogOut, Bell, Menu, Search, UserStar } from 'lucide-react';

const NavBar = ({ showNavButtons = true }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: unreadData } = useUnreadNotificationsCount();
  const unreadCount = unreadData?.unreadCount || 0;

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/result?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
      setSearchQuery(''); // Optional: Clear search after navigating
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.navbar__container}>
        {/* Logo */}
        <div className={styles.navbar__leftItems}>
          <div className={styles.navbar__logo}>
            <img src="/logo.png" className={styles.navbar_logoIcon} />
            <span className={styles.navbar__logoText}>
              <span className={styles.navbar__logoTextBlue}>olunteer</span>
              <span className={styles.navbar__logoTextGreen}>Hub</span>
            </span>
          </div>
          {/* Search Bar */}
          <div className={styles.navbar__searchWrapper}>
            <div className={styles.navbar__searchContainer}>
              <Search className={styles.navbar__searchIcon} size={20} />
              <input
                type="text"
                placeholder="Search VolunteerHub"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className={styles.navbar__searchInput}
              />
            </div>
            <button
              className={styles.navbar__searchButton}
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            {showMobileSearch && (
              <div className={styles.navbar__mobileSearchDropdown}>
                <Search className={styles.navbar__searchIcon} size={20} />
                <input
                  type="text"
                  placeholder="Search VolunteerHub"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className={styles.navbar__mobileSearchInput}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        {showNavButtons && (
          <nav className={styles.navbar__nav}>
            <button
              className={`${styles.navbar__navLink} ${
                isActive('/') ? styles['navbar__navLink--active'] : ''
              }`}
              onClick={() => navigate('/')}
            >
              Home
            </button>
            <button
              className={`${styles.navbar__navLink} ${
                isActive('/events') ? styles['navbar__navLink--active'] : ''
              }`}
              onClick={() => navigate('/events')}
            >
              Events
            </button>
            <button
              className={`${styles.navbar__navLink} ${
                isActive('/myevents') ? styles['navbar__navLink--active'] : ''
              }`}
              onClick={() => navigate('/myevents')}
            >
              My Events
            </button>
          </nav>
        )}

        {/* Sign Up Button */}
        <div className={styles.navbar__actions}>
          {user ? (
            <div className={styles.navbar__userMenu}>
              <button
                className={styles.navbar__menuButton}
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Menu"
              >
                <Menu size={20} />
              </button>
              <NotificationDialog open={open} onOpenChange={setOpen}>
                <button className={styles.navbar__notiButton}>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className={styles.navbar__notiBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
              </NotificationDialog>

              <div className={styles.navbar__userAvatarContainer}>
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className={styles.navbar__userAvatar}
                  onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                  <div className={styles.navbar__dropdownMenu}>
                    {checkPermission(
                      user,
                      RESOURCES.DASHBOARD,
                      ACTIONS.VIEW
                    ) && (
                      <button
                        className={styles.navbar__dropdownItem}
                        onClick={() => {
                          setShowDropdown(false);
                          if (user.role === 'admin') {
                            navigate('/admin');
                          } else if (user.role === 'manager') {
                            navigate('/manager');
                          }
                        }}
                      >
                        <UserStar />
                        {user.role === 'admin'
                          ? 'Switch to Admin view'
                          : 'Switch to Manager view'}
                      </button>
                    )}
                    <button
                      className={styles.navbar__dropdownItem}
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/profile');
                      }}
                    >
                      <User />
                      User Profile
                    </button>
                    <button
                      className={styles.navbar__dropdownItem}
                      onClick={() => {
                        setShowDropdown(false);
                        logout();
                        navigate('/login');
                      }}
                    >
                      <LogOut />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              className={styles.navbar__navLink}
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          )}
        </div>

        {/* Mobile Menu Dropdown */}
        {showMenu && (
          <div className={styles.navbar__menu}>
            <button
              className={`${styles.navbar__menuItem} ${
                isActive('/') ? styles['navbar__menuItem--active'] : ''
              }`}
              onClick={() => {
                setShowMenu(false);
                navigate('/');
              }}
            >
              Home
            </button>
            <button
              className={`${styles.navbar__menuItem} ${
                isActive('/events') ? styles['navbar__menuItem--active'] : ''
              }`}
              onClick={() => {
                setShowMenu(false);
                navigate('/events');
              }}
            >
              Events
            </button>
            <button
              className={`${styles.navbar__menuItem} ${
                isActive('/myevents') ? styles['navbar__menuItem--active'] : ''
              }`}
              onClick={() => {
                setShowMenu(false);
                navigate('/myevents');
              }}
            >
              My Events
            </button>
            <button
              className={`${styles.navbar__menuItem} ${
                isActive('/discussions')
                  ? styles['navbar__menuItem--active']
                  : ''
              }`}
              onClick={() => {
                setShowMenu(false);
                navigate('/discussions');
              }}
            >
              Discussions
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavBar;
