import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './NavBar.module.css';
import NotificationDialog from '../Notification/NotificationDialog.jsx';

import { User, LogOut, Bell, Menu, Search, UserStar } from 'lucide-react';

const NavBar = ({ showNavButtons = true }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showDropdown, setShowDropdown] = useState(false);
  const [open, setOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      // Add your search logic here
      // For example: navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
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
                activeTab === 'home' ? styles['navbar__navLink--active'] : ''
              }`}
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
            <button
              className={`${styles.navbar__navLink} ${
                activeTab === 'events' ? styles['navbar__navLink--active'] : ''
              }`}
              onClick={() => setActiveTab('events')}
            >
              Events
            </button>
            <button
              className={`${styles.navbar__navLink} ${
                activeTab === 'My Events'
                  ? styles['navbar__navLink--active']
                  : ''
              }`}
              onClick={() => setActiveTab('My Events')}
            >
              My Events
            </button>
            <button
              className={`${styles.navbar__navLink} ${
                activeTab === 'Discussions'
                  ? styles['navbar__navLink--active']
                  : ''
              }`}
              onClick={() => setActiveTab('Discussions')}
            >
              Discussions
            </button>
            {/* <button
            className={`${styles.navbar__navLink} ${
              activeTab === 'integrations'
                ? styles['navbar__navLink--active']
                : ''
            }`}
            onClick={() => setActiveTab('integrations')}
          >
            Integrations
          </button> */}
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
                <button
                  className={styles.navbar__notiButton}
                  // onClick={() => setShowNotifications(!showNotifications)}
                  // aria-label="Notifications"
                >
                  <Bell size={20} />
                  <span className={styles.navbar__notiBadge}>3</span>
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
                    <button
                      className={styles.navbar__dropdownItem}
                      onClick={() => {
                        setShowDropdown(false);
                      }}
                    >
                      <UserStar />
                      Switch to Manager view
                    </button>
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
                activeTab === 'home' ? styles['navbar__menuItem--active'] : ''
              }`}
              onClick={() => {
                setActiveTab('home');
                setShowMenu(false);
              }}
            >
              Home
            </button>
            <button
              className={`${styles.navbar__menuItem} ${
                activeTab === 'features'
                  ? styles['navbar__menuItem--active']
                  : ''
              }`}
              onClick={() => {
                setActiveTab('features');
                setShowMenu(false);
              }}
            >
              Events
            </button>
            <button
              className={`${styles.navbar__menuItem} ${
                activeTab === 'My Events'
                  ? styles['navbar__menuItem--active']
                  : ''
              }`}
              onClick={() => {
                setActiveTab('My Events');
                setShowMenu(false);
              }}
            >
              My Events
            </button>
            <button
              className={`${styles.navbar__menuItem} ${
                activeTab === 'Discussions'
                  ? styles['navbar__menuItem--active']
                  : ''
              }`}
              onClick={() => {
                setActiveTab('Discussions');
                setShowMenu(false);
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
