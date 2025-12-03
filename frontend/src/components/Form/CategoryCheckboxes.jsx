import { CategoryChip } from '../common';
import { useCategories } from '../../hooks/useCategories';
import styles from './Form.module.css';

const CategoryCheckboxes = ({ selectedCategories, onCategoryChange }) => {
  const { categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className={styles['form__checkbox-group']}>
        Loading categories...
      </div>
    );
  }

  return (
    <div className={styles['form__checkbox-group']}>
      {categories
        .filter((cat) => cat.slug !== 'all')
        .map((cat) => (
          <CategoryChip
            key={cat._id}
            category={cat}
            filled={selectedCategories.includes(cat._id)}
            onClick={() => onCategoryChange(cat._id)}
            showDescription={true}
          />
        ))}
    </div>
  );
};

export default CategoryCheckboxes;
