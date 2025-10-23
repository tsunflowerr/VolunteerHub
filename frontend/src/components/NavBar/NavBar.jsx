import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './NavBar.module.css';
import defaultAvatar from '../../assets/avatar.jpeg';
import { User, LogOut } from 'lucide-react';

const NavBar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showDropdown, setShowDropdown] = useState(false);
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
              activeTab === 'features' ? styles['navbar__navLink--active'] : ''
            }`}
            onClick={() => setActiveTab('features')}
          >
            Events
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
              <span className={styles.navbar__userName}>
                Hello, {user.fullName}
              </span>
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
                      onClick={() => navigate('/userinfo')}
                    >
                      <User />
                      User Profile
                    </button>
                    <button
                      className={styles.navbar__dropdownItem}
                      onClick={() => {
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
      </div>
    </header>
  );
};

export default NavBar;
