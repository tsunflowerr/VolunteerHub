import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/NavBar.css';
import defaultAvatar from '../assets/avatar.jpeg';
import { User, LogOut } from 'lucide-react';

const NavBar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <span className="logo-text">VolunteerHub</span>
        </div>

        {/* Navigation Items */}
        <nav className="navbar-nav">
          <button
            className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            Home
          </button>
          <button
            className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Events
          </button>
          <button
            className={`nav-link ${
              activeTab === 'Discussions' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('Discussions')}
          >
            Discussions
          </button>
          <button
            className={`nav-link ${
              activeTab === 'integrations' ? 'active' : ''
            }`}
            onClick={() => setActiveTab('integrations')}
          >
            Integrations
          </button>
        </nav>

        {/* Sign Up Button */}
        <div className="navbar-actions">
          {user ? (
            <div className="nav-user-menu">
              <span className="nav-user-name">Hello, {user.fullName}</span>
              <div className="nav-user-avatar-container">
                <img
                  src={user.avatar || defaultAvatar}
                  alt="User Avatar"
                  className="nav-user-avatar"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                  <div className="nav-dropdown-menu">
                    <button
                      className="nav-dropdown-item"
                      onClick={() => navigate('/user-profile')}
                    >
                      <User />
                      User Profile
                    </button>
                    <button className="nav-dropdown-item" onClick={logout}>
                      <LogOut />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button className="nav-link" onClick={() => navigate('/register')}>
              Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
