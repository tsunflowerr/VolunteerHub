import PropTypes from 'prop-types';
import styles from './Carousel.module.css';

const Carousel = ({ name, image, brief }) => {
  return (
    <div
      className={styles.carousel}
      style={{
        backgroundImage: `url(${image})`,
      }}
    >
      <div className={styles.carousel__overlay}>
        <div className={styles.carousel__contentWrapper}>
          <div className={styles.carousel__content}>
            <h1 className={styles.carousel__title}>{name}</h1>
            <h2 className={styles.carousel__description}>{brief}</h2>
          </div>
          <button className={styles.carousel__learnMoreBtn}>Learn more!</button>
        </div>
      </div>
    </div>
  );
};

Carousel.propTypes = {
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  brief: PropTypes.string.isRequired,
};

export default Carousel;
