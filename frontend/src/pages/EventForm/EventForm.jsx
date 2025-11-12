import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Image as ImageIcon,
  Upload,
  X,
} from 'lucide-react';
import { categories } from '../../utilities/CategoriesIcons';
import styles from './EventForm.module.css';

const EventForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    about: '',
    activities: '',
    prepare: '',
    location: '',
    startDate: '',
    endDate: '',
    category: '',
    capacity: '',
    thumbnail: null,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: 'Please select a valid image file',
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: 'Image size must be less than 5MB',
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.thumbnail) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: '',
        }));
      }
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnail: null,
    }));
    setThumbnailPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Trigger file input click
  const handleImagePickerClick = () => {
    fileInputRef.current?.click();
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    } else if (formData.name.trim().length < 5) {
      newErrors.name = 'Event name must be at least 5 characters';
    }

    if (!formData.about.trim()) {
      newErrors.about = 'About section is required';
    } else if (formData.about.trim().length < 20) {
      newErrors.about = 'About must be at least 20 characters';
    }

    if (!formData.activities.trim()) {
      newErrors.activities = 'Activities description is required';
    } else if (formData.activities.trim().length < 20) {
      newErrors.activities = 'Activities must be at least 20 characters';
    }

    if (!formData.prepare.trim()) {
      newErrors.prepare = 'Preparation information is required';
    } else if (formData.prepare.trim().length < 10) {
      newErrors.prepare = 'Preparation info must be at least 10 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    } else {
      const startDate = new Date(formData.startDate);
      const now = new Date();
      if (startDate < now) {
        newErrors.startDate = 'Start date must be in the future';
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required';
    } else {
      const capacity = parseInt(formData.capacity, 10);
      if (isNaN(capacity) || capacity < 1) {
        newErrors.capacity = 'Capacity must be at least 1';
      }
    }

    if (!formData.thumbnail) {
      newErrors.thumbnail = 'Thumbnail image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setApiError('');
    setSuccessMessage('');

    // if (!validateForm()) {
    //   return;
    // }

    // setLoading(true);

    // try {
    //   // Create FormData for file upload
    //   const apiData = new FormData();
    //   apiData.append('name', formData.name.trim());
    //   apiData.append('about', formData.about.trim());
    //   apiData.append('activities', formData.activities.trim());
    //   apiData.append('prepare', formData.prepare.trim());
    //   apiData.append('location', formData.location.trim());
    //   apiData.append('startDate', new Date(formData.startDate).toISOString());
    //   apiData.append('endDate', new Date(formData.endDate).toISOString());
    //   apiData.append('category', formData.category);
    //   apiData.append('capacity', parseInt(formData.capacity, 10));
    //   apiData.append('thumbnail', formData.thumbnail);

    //   console.log('Submitting event data...');

    //   // TODO: Replace with actual API endpoint
    //   const response = await fetch('/api/events', {
    //     method: 'POST',
    //     // Don't set Content-Type header - browser will set it automatically with boundary for FormData
    //     body: apiData,
    //   });

    //   const data = await response.json();

    //   if (response.ok) {
    //     setSuccessMessage('Event created successfully!');
    //     console.log('Event created:', data);

    //     setTimeout(() => {
    //       navigate('/events');
    //     }, 1500);
    //   } else {
    //     setApiError(data.message || 'Failed to create event');
    //     console.error('API Error:', data);
    //   }
    // } catch (error) {
    //   console.error('Error creating event:', error);
    //   setApiError('Network error. Please check your connection and try again.');
    // } finally {
    //   setLoading(false);
    // }
  };

  // Handle cancel
  const handleCancel = () => {
    if (
      window.confirm(
        'Are you sure you want to cancel? All changes will be lost.'
      )
    ) {
      navigate(-1);
    }
  };

  return (
    <div className={styles['event-form']}>
      <div className={styles['event-form__container']}>
        {/* Header */}
        <div className={styles['event-form__header']}>
          <h1 className={styles['event-form__title']}>Create New Event</h1>
          <p className={styles['event-form__subtitle']}>
            Fill in the details below to create a new volunteer event
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles['event-form__form']}>
          {/* Event Name */}
          <div className={styles['event-form__group']}>
            <label className={styles['event-form__label']}>
              <FileText size={20} />
              Event Name
              <span className={styles['event-form__required']}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter event name"
              className={`${styles['event-form__input']} ${
                errors.name ? styles['event-form__input--error'] : ''
              }`}
            />
            {errors.name && (
              <span className={styles['event-form__error']}>{errors.name}</span>
            )}
          </div>

          {/* About */}
          <div className={styles['event-form__group']}>
            <label className={styles['event-form__label']}>
              <FileText size={20} />
              About the Event
              <span className={styles['event-form__required']}>*</span>
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Describe what this event is about"
              rows={4}
              className={`${styles['event-form__textarea']} ${
                errors.about ? styles['event-form__input--error'] : ''
              }`}
            />
            {errors.about && (
              <span className={styles['event-form__error']}>
                {errors.about}
              </span>
            )}
          </div>

          {/* Activities */}
          <div className={styles['event-form__group']}>
            <label className={styles['event-form__label']}>
              <FileText size={20} />
              What will volunteers do?
              <span className={styles['event-form__required']}>*</span>
            </label>
            <textarea
              name="activities"
              value={formData.activities}
              onChange={handleChange}
              placeholder="Describe the activities volunteers will participate in"
              rows={4}
              className={`${styles['event-form__textarea']} ${
                errors.activities ? styles['event-form__input--error'] : ''
              }`}
            />
            {errors.activities && (
              <span className={styles['event-form__error']}>
                {errors.activities}
              </span>
            )}
          </div>

          {/* Prepare */}
          <div className={styles['event-form__group']}>
            <label className={styles['event-form__label']}>
              <FileText size={20} />
              What to bring or wear?
              <span className={styles['event-form__required']}>*</span>
            </label>
            <textarea
              name="prepare"
              value={formData.prepare}
              onChange={handleChange}
              placeholder="What volunteers need to bring or wear"
              rows={3}
              className={`${styles['event-form__textarea']} ${
                errors.prepare ? styles['event-form__input--error'] : ''
              }`}
            />
            {errors.prepare && (
              <span className={styles['event-form__error']}>
                {errors.prepare}
              </span>
            )}
          </div>

          {/* Location */}
          <div className={styles['event-form__group']}>
            <label className={styles['event-form__label']}>
              <MapPin size={20} />
              Location
              <span className={styles['event-form__required']}>*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              className={`${styles['event-form__input']} ${
                errors.location ? styles['event-form__input--error'] : ''
              }`}
            />
            {errors.location && (
              <span className={styles['event-form__error']}>
                {errors.location}
              </span>
            )}
          </div>

          {/* Date Range */}
          <div className={styles['event-form__row']}>
            <div className={styles['event-form__group']}>
              <label className={styles['event-form__label']}>
                <Calendar size={20} />
                Start Date & Time
                <span className={styles['event-form__required']}>*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`${styles['event-form__input']} ${
                  errors.startDate ? styles['event-form__input--error'] : ''
                }`}
              />
              {errors.startDate && (
                <span className={styles['event-form__error']}>
                  {errors.startDate}
                </span>
              )}
            </div>

            <div className={styles['event-form__group']}>
              <label className={styles['event-form__label']}>
                <Calendar size={20} />
                End Date & Time
                <span className={styles['event-form__required']}>*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`${styles['event-form__input']} ${
                  errors.endDate ? styles['event-form__input--error'] : ''
                }`}
              />
              {errors.endDate && (
                <span className={styles['event-form__error']}>
                  {errors.endDate}
                </span>
              )}
            </div>
          </div>

          {/* Category and Capacity */}
          <div className={styles['event-form__row']}>
            <div className={styles['event-form__group']}>
              <label className={styles['event-form__label']}>
                Category
                <span className={styles['event-form__required']}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={`${styles['event-form__select']} ${
                  errors.category ? styles['event-form__input--error'] : ''
                }`}
              >
                <option value="">Select a category</option>
                {categories
                  .filter((cat) => cat.id !== 'all')
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              {errors.category && (
                <span className={styles['event-form__error']}>
                  {errors.category}
                </span>
              )}
            </div>

            <div className={styles['event-form__group']}>
              <label className={styles['event-form__label']}>
                <Users size={20} />
                Capacity
                <span className={styles['event-form__required']}>*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Max volunteers"
                min="1"
                className={`${styles['event-form__input']} ${
                  errors.capacity ? styles['event-form__input--error'] : ''
                }`}
              />
              {errors.capacity && (
                <span className={styles['event-form__error']}>
                  {errors.capacity}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail Image Picker */}
          <div className={styles['event-form__group']}>
            <label className={styles['event-form__label']}>
              <ImageIcon size={20} />
              Event Thumbnail
              <span className={styles['event-form__required']}>*</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles['event-form__file-input']}
            />

            {!thumbnailPreview ? (
              <div
                onClick={handleImagePickerClick}
                className={`${styles['event-form__image-picker']} ${
                  errors.thumbnail ? styles['event-form__input--error'] : ''
                }`}
              >
                <Upload size={48} />
                <p className={styles['event-form__image-picker-text']}>
                  Click to upload image
                </p>
                <p className={styles['event-form__image-picker-hint']}>
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            ) : (
              <div className={styles['event-form__image-preview']}>
                <img src={thumbnailPreview} alt="Thumbnail preview" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={styles['event-form__image-remove']}
                >
                  <X size={20} />
                  Remove Image
                </button>
              </div>
            )}

            {errors.thumbnail && (
              <span className={styles['event-form__error']}>
                {errors.thumbnail}
              </span>
            )}
          </div>

          {/* Form Actions */}
          <div className={styles['event-form__actions']}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles['event-form__button--cancel']}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles['event-form__button--submit']}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
