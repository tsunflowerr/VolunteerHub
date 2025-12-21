import styles from './Sign.module.css';

const Sign = ({ title, subtitle, children }) => {
  return (
    <div className={styles.authen}>
      <div className={styles.authen__leftPanel}>
        <div className={styles.authen__leftContent}>
          <div className={styles.authen__logo}>
            <img
              src="/logo_big.png"
              alt="logo"
              className={styles.authen__logoIcon}
            />
            <h1 className={styles.authen__logoText}>VolunteerHub</h1>
          </div>

          <div className={styles.authen__heroSection}>
            <h2 className={styles.authen__heroTitle}>
              The all-in-one platform to recruit, schedule, and communicate with
              your volunteers, effortlessly.
            </h2>
            <p className={styles.authen__heroDescription}>
              Build, manage, and grow your community of changemakers.
            </p>
          </div>

          <div className={styles.authen__footer}>
            <span>Copyright © UET 2025.</span>
            <span className={styles.authen__footerLink}>
              Image from{' '}
              <a href="https://unsplash.com/photos/a-group-of-people-holding-hands-on-top-of-a-tree-DNkoNXQti3c">
                Shane Rounce
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className={styles.authen__rightPanel}>
        <div className={styles.authen__formContainer}>
          <div className={styles.authen__mobileLogo}>
            <img
              src="/logo_big.png"
              alt="logo"
              className={styles.authen__mobileLogoIcon}
            />
          </div>

          <div className={styles.authen__formWrapper}>
            <div className={styles.authen__header}>
              <h2 className={styles.authen__title}>{title}</h2>
              <p className={styles.authen__subtitle}>{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sign;
