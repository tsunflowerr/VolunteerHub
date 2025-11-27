import styles from './EventDetail.module.css';

const EventHero = ({ thumbnail, name }) => {
  return (
    <div className={styles['event-detail__hero']}>
      <img
        src={thumbnail}
        alt={name}
        className={styles['event-detail__hero-image']}
      />
    </div>
  );
};

export default EventHero;
