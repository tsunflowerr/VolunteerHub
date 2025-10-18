import PropTypes from 'prop-types';
import '../styles/Carousel.css';

const Carousel = ({ name, image, brief }) => {
  return (
    <div
      className="carousel-container"
      style={{
        backgroundImage: `url(${image})`,
      }}
    >
      <div className="carousel-overlay">
        <div className="carousel-absolute-bottom-right">
          <div className="carousel-content">
            <h1 className="carousel-title">{name}</h1>
            <h2 className="carousel-description">{brief}</h2>
          </div>
          <button className="carousel-learnMoreBtn">Learn more!</button>
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
