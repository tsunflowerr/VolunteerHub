import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './NavBar.module.css';
import defaultAvatar from '../../assets/avatar.jpeg';
import { User, LogOut, Bell, Menu } from 'lucide-react';

const NavBar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className={styles.navbar}>
      <div className={styles.navbar__container}>
        {/* Logo */}
        <div className={styles.navbar__logo}>
          <span className={styles.navbar__logoText}>VolunteerHub</span>
        </div>

        {/* Navigation Items */}
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
              activeTab === 'My Events' ? styles['navbar__navLink--active'] : ''
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
              <button
                className={styles.navbar__notiButton}
                onClick={() => console.log('Notifications clicked')}
                aria-label="Notifications"
              >
                <Bell size={20} />
              </button>

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
                        navigate('/userinfo');
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
