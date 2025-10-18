import React from 'react';
import styles from './Footer.module.css';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer__container}>
        <div className={styles.footer__information}>
          <div className={styles.footer__logo}>
            <span className={styles.footer__logoName}>VolunteerHub</span>
          </div>
          <p className={styles.footer__quote}>
            Your passion is changing the world. Our mission is to make it
            easier. Manage your team of changemakers with powerful tools
            designed to help your cause succeed.
          </p>
          <ul className={`${styles.footer__items} ${styles.footer__contact}`}>
            <li className={styles.footer__item}>
              <Phone />
              +12 345 678 JQK
            </li>
            <li className={styles.footer__item}>
              <Mail />
              volunteerhub-support@volunteerhub.com
            </li>
            <li className={styles.footer__item}>
              <MapPin />
              Phố Kiều Mai, Hà Nội, Việt Nam
            </li>
          </ul>
        </div>
        <div className={styles.footer__section}>
          <ul className={styles.footer__items}>
            <li className={styles.footer__item}>Platform</li>
            <li className={styles.footer__item}>Solutions</li>
            <li className={styles.footer__item}>Pricing</li>
          </ul>
          <ul className={styles.footer__items}>
            <li className={styles.footer__item}>Resources</li>
            <li className={styles.footer__item}>About</li>
            <li className={styles.footer__item}>Support</li>
          </ul>
          <ul className={styles.footer__items}>
            <li className={styles.footer__item}>Privacy Policy</li>
            <li className={styles.footer__item}>Terms of Use</li>
            <li className={styles.footer__item}>Copyright Management</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
