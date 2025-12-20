import PropTypes from 'prop-types';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import styles from './VerifiedBadge.module.css';

/**
 * VerifiedBadge component - displays a verification badge based on user role
 * @param {string} role - User role: 'manager', 'admin', or 'user'
 * @param {number} size - Icon size in pixels (default: 16)
 * @param {boolean} showTooltip - Whether to show tooltip on hover (default: true)
 */
const VerifiedBadge = ({ role, size = 16, showTooltip = true }) => {
  if (role === 'user' || !role) return null;

  const isManager = role === 'manager';
  const isAdmin = role === 'admin';

  if (!isManager && !isAdmin) return null;

  const tooltipText = isAdmin ? 'Administrator' : 'Verified Manager';
  const Icon = isAdmin ? ShieldCheck : BadgeCheck;

  return (
    <span
      className={`${styles.badge} ${isAdmin ? styles.admin : styles.manager}`}
      title={showTooltip ? tooltipText : undefined}
    >
      <Icon size={size} />
    </span>
  );
};

VerifiedBadge.propTypes = {
  role: PropTypes.oneOf(['user', 'manager', 'admin']),
  size: PropTypes.number,
  showTooltip: PropTypes.bool,
};

export default VerifiedBadge;
