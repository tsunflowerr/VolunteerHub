import React from 'react';
import PropTypes from 'prop-types';
import { Rating } from '@mui/material';
import styles from './RatingCard.module.css';

const RatingCard = ({ image, name, position, review, rating }) => (
  <div className={styles['rating-card']}>
    <div className={styles['rating-card__image-wrapper']}>
      <img src={image} alt={name} className={styles['rating-card__image']} />
    </div>
    <div className={styles['rating-card__content']}>
      <Rating
        name="read-only"
        value={rating}
        readOnly
        className={styles['rating-card__star']}
      />
      <p className={styles['rating-card__review']}>{review}</p>
      <p className={styles['rating-card__name']}>{name}</p>
      <p className={styles['rating-card__position']}>{position}</p>
    </div>
  </div>
);

RatingCard.propTypes = {
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  position: PropTypes.string.isRequired,
  review: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
};

export default RatingCard;
