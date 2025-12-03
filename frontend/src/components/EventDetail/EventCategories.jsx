import { CategoryChip } from '../common';
import styles from './EventDetail.module.css';

const EventCategories = ({ categories }) => {
  if (!categories || categories.length === 0) return null;

  return (
    <div className={styles['event-detail__section']}>
      <h3 className={styles['event-detail__section-title']}>CATEGORIES</h3>
      <div className={styles['event-detail__categories']}>
        {categories.map((cat) => (
          <CategoryChip
            key={cat._id}
            category={cat}
            filled={true}
            showDescription={false}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCategories;
