import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import styles from './Carousel.module.css';

const Carousel = ({ name, image, brief }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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
          <button
            className={styles.carousel__learnMoreBtn}
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/register');
              }
            }}
            style={{
              cursor: isAuthenticated ? 'default' : 'pointer',
              opacity: isAuthenticated ? 0.7 : 1,
            }}
          >
            Learn more!
          </button>
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
