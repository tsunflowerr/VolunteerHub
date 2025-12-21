import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import styles from './CTA.module.css';

const CTA = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleConnect = () => {
    if (!isAuthenticated) {
      navigate('/register');
    }
  };

  return (
    <section className={styles.cta}>
      <div className={styles.cta__container}>
        <div className={styles.cta__content}>
          <h2 className={styles.cta__title}>
            Learn why people trust VolunteerHub.
          </h2>
          <button
            className={styles.cta__button}
            onClick={handleConnect}
            style={{
              cursor: isAuthenticated ? 'default' : 'pointer',
              opacity: isAuthenticated ? 0.7 : 1,
            }}
          >
            Let's Connect
          </button>
        </div>
        <div className={styles.cta__decoration}>
          {/* Decorative geometric patterns */}
          <div className={styles.cta__pattern1}></div>
          <div className={styles.cta__pattern2}></div>
          <div className={styles.cta__pattern3}></div>
          <div className={styles.cta__circle1}></div>
          <div className={styles.cta__circle2}></div>
          <div className={styles.cta__circle3}></div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
