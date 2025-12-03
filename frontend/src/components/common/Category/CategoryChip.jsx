import PropTypes from 'prop-types';
import { CategoryIcons } from '../../../utilities/CategoriesIcons';
import styles from './CategoryChip.module.css';

const CategoryChip = ({ category, onClick, isActive }) => {
  if (!category) return null;

  const { name, slug, color } = category;
  // Fallback to 'all' or a default icon if slug doesn't match
  const Icon = CategoryIcons[slug] || CategoryIcons['all'];

  return (
    <div
      className={`${styles.chip} ${isActive ? styles.active : ''}`}
      style={{ 
        '--category-color': color || '#666',
        backgroundColor: isActive ? (color || '#666') : 'transparent',
        borderColor: color || '#666',
        color: isActive ? '#fff' : (color || '#666')
      }}
      onClick={onClick}
    >
      <span className={styles.icon}>{Icon}</span>
      <span className={styles.label}>{name}</span>
    </div>
  );
};

CategoryChip.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string.isRequired,
    slug: PropTypes.string,
    color: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  isActive: PropTypes.bool,
};

export default CategoryChip;
