import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, FileQuestion, ArrowLeft, Home } from 'lucide-react';
import styles from './ErrorPage.module.css';

const ErrorPage = ({ code = 404, title, message }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Default configurations
  const config = {
    404: {
      icon: <FileQuestion size={64} className={styles.icon} />,
      title: 'Page Not Found',
      message: "The page you are looking for doesn't exist or has been moved.",
      color: '#3b82f6', // blue
    },
    403: {
      icon: <AlertTriangle size={64} className={styles.icon} />,
      title: 'Access Denied',
      message: "You don't have permission to access this page.",
      color: '#ef4444', // red
    },
    500: {
      icon: <AlertTriangle size={64} className={styles.icon} />,
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      color: '#f59e0b', // amber
    },
  };

  // Determine the error type based on props or location state
  const errorCode = code || location.state?.code || 404;
  const currentConfig = config[errorCode] || config[404];

  // Override with props if provided
  const displayTitle = title || currentConfig.title;
  const displayMessage = message || currentConfig.message;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper} style={{ color: currentConfig.color }}>
          {currentConfig.icon}
        </div>
        <h1 className={styles.code}>{errorCode}</h1>
        <h2 className={styles.title}>{displayTitle}</h2>
        <p className={styles.message}>{displayMessage}</p>
        
        <div className={styles.actions}>
          <button onClick={() => navigate(-1)} className={styles.buttonSecondary}>
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
          <button onClick={() => navigate('/')} className={styles.buttonPrimary}>
            <Home size={18} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
