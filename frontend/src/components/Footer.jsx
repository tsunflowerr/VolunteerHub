import React from 'react';
import '../styles/Footer.css';
import { Phone, Mail, MapPin } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-information">
          <div className="footer-logo">
            <span className="footer-logo-name">VolunteerHub</span>
          </div>
          <p className="footer-quote">
            Your passion is changing the world. Our mission is to make it
            easier. Manage your team of changemakers with powerful tools
            designed to help your cause succeed.
          </p>
          <ul className="footer-items footer-contact">
            <li className="footer-item">
              <Phone />
              +12 345 678 JQK
            </li>
            <li className="footer-item">
              <Mail />
              volunteerhub-support@volunteerhub.com
            </li>
            <li className="footer-item">
              <MapPin />
              Phố Kiều Mai, Hà Nội, Việt Nam
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <ul className="footer-items">
            <li className="footer-item">Platform</li>
            <li className="footer-item">Solutions</li>
            <li className="footer-item">Pricing</li>
          </ul>
          <ul className="footer-items">
            <li className="footer-item">Resources</li>
            <li className="footer-item">About</li>
            <li className="footer-item">Support</li>
          </ul>
          <ul className="footer-items">
            <li className="footer-item">Privacy Policy</li>
            <li className="footer-item">Terms of Use</li>
            <li className="footer-item">Copyright Management</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
