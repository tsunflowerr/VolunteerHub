import React from 'react';
import styles from './CTA.module.css';

const CTA = () => {
  const handleConnect = () => {
    // TODO: Add navigation or modal logic
    console.log("Let's Connect clicked");
  };

  return (
    <section className={styles.cta}>
      <div className={styles.cta__container}>
        <div className={styles.cta__content}>
          <h2 className={styles.cta__title}>
            Learn why people trust VolunteerHub.
          </h2>
          <button className={styles.cta__button} onClick={handleConnect}>
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
