import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './PartnerSlider.module.css';
import { partnerLogos } from '../../dummy/partnerLogos.js';

const PartnerSlider = ({
  logos = partnerLogos,
  speed = 30,
  title = 'Our Partners',
  subtitle = 'Trusted by leading organizations worldwide',
}) => {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || logos.length === 0) return;

    let animationId;
    let position = 0;
    let setWidth = 0;

    // Calculate the width of one complete set after render
    const calculateWidth = () => {
      // Get all items
      const items = track.children;
      if (items.length === 0) return;

      let totalWidth = 0;
      for (let i = 0; i < logos.length; i++) {
        totalWidth += items[i].offsetWidth;
      }
      setWidth = totalWidth;
    };

    const images = track.querySelectorAll('img');
    // let loadedCount = 0;
    // const onLoad = () => {
    //   loadedCount++;
    //   if (loadedCount === images.length) {
    //     calculateWidth();
    //   }
    // };

    // images.forEach((img) => {
    //   if (img.complete) {
    //     onLoad();
    //   } else {
    //     img.addEventListener('load', onLoad);
    //   }
    // });

    // Start animation after a short delay
    const startTimeout = setTimeout(() => {
      if (setWidth === 0) calculateWidth();

      const animate = () => {
        position -= speed / 60;

        // Reset when scrolled past one complete set
        if (Math.abs(position) >= setWidth) {
          position = 0;
        }

        track.style.transform = `translateX(${position}px)`;
        animationId = requestAnimationFrame(animate);
      };

      animationId = requestAnimationFrame(animate);
    }, 100);

    // Handle resize
    const handleResize = () => {
      calculateWidth();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(startTimeout);
      // window.removeEventListener('resize', handleResize);
      // images.forEach((img) => img.removeEventListener('load', onLoad));
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [logos, speed]);

  const tripleLogos = [...logos, ...logos, ...logos];

  return (
    <section className={styles['partner-slider-container']}>
      {/* Header Section */}
      <div className={styles['partner-slider-container__header']}>
        <h2 className={styles['partner-slider-container__title']}>{title}</h2>
        {subtitle && (
          <p className={styles['partner-slider-container__subtitle']}>
            {subtitle}
          </p>
        )}
      </div>
      {/* Slider Section */}
      <div className={styles['partner-slider']}>
        <div ref={trackRef} className={styles['partner-slider__track']}>
          {tripleLogos.map((logo, index) => (
            <div
              key={`partner-${index}-${logo.id || logo.name || ''}`}
              className={styles['partner-slider__item']}
            >
              <img
                src={logo.src}
                alt={logo.name}
                className={styles['partner-slider__image']}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

PartnerSlider.propTypes = {
  logos: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      src: PropTypes.string.isRequired,
    })
  ).isRequired,
  speed: PropTypes.number,
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

export default PartnerSlider;
