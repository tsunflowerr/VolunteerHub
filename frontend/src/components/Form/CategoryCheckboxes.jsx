import styles from './Form.module.css';

import { categories } from '../../utilities/CategoriesIcons';

const CategoryCheckboxes = ({ selectedCategories, onCategoryChange }) => {
  return (
    <div className={styles['form__checkbox-group']}>
      {categories
        .filter((cat) => cat.id !== 'all')
        .map((cat) => (
          <label key={cat.id} className={styles['form__checkbox-label']}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat.id)}
              onChange={() => onCategoryChange(cat.id)}
              className={styles['form__checkbox']}
            />
            <span className={styles['form__checkbox-text']}>{cat.name}</span>
          </label>
        ))}
    </div>
  );
};

export default CategoryCheckboxes;
