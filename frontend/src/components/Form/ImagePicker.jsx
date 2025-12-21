import { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import styles from './Form.module.css';

const ImagePicker = ({ preview, onImageChange, onRemoveImage, error }) => {
  const fileInputRef = useRef(null);

  const handlePickerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className={styles['form__file-input']}
      />

      {!preview ? (
        <div
          onClick={handlePickerClick}
          className={`${styles['form__image-picker']} ${
            error ? styles['form__input--error'] : ''
          }`}
        >
          <Upload size={48} />
          <p className={styles['form__image-picker-text']}>
            Click to upload image
          </p>
          <p className={styles['form__image-picker-hint']}>
            PNG, JPG, GIF up to 5MB
          </p>
        </div>
      ) : (
        <div className={styles['form__image-preview']}>
          <img src={preview} alt="Thumbnail preview" />
          <button
            type="button"
            onClick={onRemoveImage}
            className={styles['form__image-remove']}
          >
            <X size={20} />
            Remove Image
          </button>
        </div>
      )}
    </>
  );
};

export default ImagePicker;
