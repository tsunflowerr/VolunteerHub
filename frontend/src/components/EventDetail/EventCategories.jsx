import { categoriesById } from '../../utilities/CategoriesIcons';
import styles from './EventDetail.module.css';

const EventCategories = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className={styles['event-detail__section']}>
      <h3 className={styles['event-detail__section-title']}>CATEGORIES</h3>
      <div className={styles['event-detail__categories']}>
        {categories.map((cat) => {
          const categoryData = categoriesById[cat.slug];
          if (!categoryData) return null;
          return (
            <div key={cat._id} className={styles['event-detail__category']}>
              <span className={styles['event-detail__category-name']}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventCategories;
