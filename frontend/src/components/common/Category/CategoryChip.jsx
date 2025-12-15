import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { ListCheck, Tag } from 'lucide-react';
import styles from './CategoryChip.module.css';

const CategoryChip = ({
  category,
  onClick,
  filled,
  onHover,
  showDescription = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const chipRef = useRef(null);

  if (!category) return null;

  const { name, slug, color, description } = category;

  // Use specific icon for 'all', otherwise use generic Tag icon
  const Icon = slug === 'all' ? <ListCheck size={14} /> : <Tag size={14} />;

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (chipRef.current) {
      const rect = chipRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
    }
    if (onHover) {
      onHover(category);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onHover) {
      onHover(null);
    }
  };

  return (
    <div
      ref={chipRef}
      className={`${styles.chip} ${filled ? styles.filled : ''} ${
        isHovered ? styles.hovered : ''
      }`}
      style={{
        '--category-color': color || '#666',
        backgroundColor: filled ? color || '#666' : 'transparent',
        borderColor: color || '#666',
        color: filled ? '#fff' : color || '#666',
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={styles.icon}>{Icon}</span>
      <span className={styles.label}>{name}</span>
      {showDescription &&
        description &&
        isHovered &&
        createPortal(
          <div
            className={styles.tooltip}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left,
            }}
          >
            {description}
          </div>,
          document.body
        )}
    </div>
  );
};

CategoryChip.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string,
    color: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  filled: PropTypes.bool,
  onHover: PropTypes.func,
  showDescription: PropTypes.bool,
};

export default CategoryChip;
