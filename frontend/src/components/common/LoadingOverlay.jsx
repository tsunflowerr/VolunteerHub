import React from 'react';
import styles from './LoadingOverlay.module.css';

const LoadingOverlay = ({ message = 'Loading...', contained = false }) => {
  return (
    <div className={`${styles.overlay} ${contained ? styles.contained : ''}`}>
      <div className={styles.spinnerContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;