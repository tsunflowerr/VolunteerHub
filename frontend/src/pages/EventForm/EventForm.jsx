import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import {
  FormHeader,
  FormField,
  TextInput,
  TextArea,
  CategoryCheckboxes,
  ImagePicker,
  FormActions,
} from '../../components/Form';
import styles from './EventForm.module.css';
import EventPreviewDialog from '../../components/EventDetail/EventPreviewDialog';

// Yup validation schema
const eventFormSchema = yup.object().shape({
  name: yup
    .string()
    .required('Event name is required')
    .min(5, 'Event name must be at least 5 characters')
    .max(200, 'Event name must not exceed 200 characters')
    .trim(),
  about: yup
    .string()
    .required('About section is required')
    .min(20, 'About must be at least 20 characters')
    .max(2000, 'About must not exceed 2000 characters')
    .trim(),
  activities: yup
    .string()
    .required('Activities description is required')
    .min(20, 'Activities must be at least 20 characters')
    .max(2000, 'Activities must not exceed 2000 characters')
    .trim(),
  prepare: yup
    .string()
    .required('Preparation information is required')
    .min(10, 'Preparation info must be at least 10 characters')
    .max(1000, 'Preparation info must not exceed 1000 characters')
    .trim(),
  location: yup
    .string()
    .required('Location is required')
    .min(5, 'Location must be at least 5 characters')
    .trim(),
  startDate: yup
    .date()
    .required('Start date is required')
    .min(new Date(), 'Start date must be in the future'),
  endDate: yup
    .date()
    .required('End date is required')
    .min(yup.ref('startDate'), 'End date must be after start date'),
  category: yup
    .array()
    .of(yup.string())
    .min(1, 'Please select at least one category')
    .required('Please select at least one category'),
  capacity: yup
    .number()
    .required('Capacity is required')
    .positive('Capacity must be positive')
    .integer('Capacity must be an integer')
    .min(1, 'Capacity must be at least 1')
    .max(10000, 'Capacity must not exceed 10,000'),
  thumbnail: yup
    .mixed()
    .required('Thumbnail image is required')
    .test('fileType', 'Please select a valid image file', (value) => {
      if (!value) return false;
      return value instanceof File && value.type.startsWith('image/');
    })
    .test('fileSize', 'Image size must be less than 5MB', (value) => {
      if (!value) return false;
      return value instanceof File && value.size <= 5 * 1024 * 1024;
    }),
});

const EventForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    activities: '',
    prepare: '',
    location: '',
    startDate: '',
    endDate: '',
    category: [],
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

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setFormData((prev) => {
      const currentCategories = prev.category;
      const isSelected = currentCategories.includes(categoryId);

      const newCategories = isSelected
        ? currentCategories.filter((id) => id !== categoryId)
        : [...currentCategories, categoryId];

      return {
        ...prev,
        category: newCategories,
      };
    });

    if (errors.category) {
      setErrors((prev) => ({
        ...prev,
        category: '',
      }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          thumbnail: 'Please select a valid image file',
        }));
        return;
      }

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

      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);

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
  };

  const createPreviewEvent = () => {
    return {
      _id: 'preview',
      name: formData.name || 'Untitled Event',
      thumbnail:
        thumbnailPreview ||
        'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
      location: formData.location || 'Location not specified',
      startDate: formData.startDate || new Date().toISOString(),
      endDate: formData.endDate || new Date().toISOString(),
      category: formData.category.map((catId) => ({
        _id: catId,
        slug: catId,
        name: catId.charAt(0).toUpperCase() + catId.slice(1).replace('-', ' '),
      })),
      capacity: parseInt(formData.capacity) || 0,
      registrationsCount: 0,
      managerId: {
        username: 'You',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
      },

      about: formData.about || 'No description provided',
      activities: formData.activities || 'No activities specified',
      prepare: formData.prepare || 'No preparation info provided',
    };
  };
  // Validate form using Yup
  const validateForm = async () => {
    try {
      const dataToValidate = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : 0,
      };

      await eventFormSchema.validate(dataToValidate, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const validationErrors = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      // const apiData = new FormData();
      // apiData.append('name', formData.name.trim());
      // apiData.append('about', formData.about.trim());
      // apiData.append('activities', formData.activities.trim());
      // apiData.append('prepare', formData.prepare.trim());
      // apiData.append('location', formData.location.trim());
      // apiData.append('startDate', new Date(formData.startDate).toISOString());
      // apiData.append('endDate', new Date(formData.endDate).toISOString());
      // formData.category.forEach((categoryId) => {
      //   apiData.append('category[]', categoryId);
      // });
      // apiData.append('capacity', parseInt(formData.capacity, 10));
      // apiData.append('thumbnail', formData.thumbnail);
      // console.log('Submitting event data...');
      // TODO: Replace with actual API endpoint
      // const response = await fetch('/api/events', {
      //   method: 'POST',
      //   body: apiData,
      // });
      // Simulate API call
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      // console.log('Event created successfully!');
      // navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
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
        <FormHeader
          title="Create New Event"
          subtitle="Fill in the details below to create a new volunteer event"
        />

        <form onSubmit={handleSubmit} className={styles['event-form__form']}>
          {/* Event Name */}
          <FormField
            icon={FileText}
            label="Event Name"
            required
            error={errors.name}
          >
            <TextInput
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter event name"
              error={errors.name}
            />
          </FormField>

          {/* About */}
          <FormField
            icon={FileText}
            label="About the Event"
            required
            error={errors.about}
          >
            <TextArea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Describe what this event is about"
              rows={4}
              error={errors.about}
            />
          </FormField>

          {/* Activities */}
          <FormField
            icon={FileText}
            label="What will volunteers do?"
            required
            error={errors.activities}
          >
            <TextArea
              name="activities"
              value={formData.activities}
              onChange={handleChange}
              placeholder="Describe the activities volunteers will participate in"
              rows={4}
              error={errors.activities}
            />
          </FormField>

          {/* Prepare */}
          <FormField
            icon={FileText}
            label="What to bring or wear?"
            required
            error={errors.prepare}
          >
            <TextArea
              name="prepare"
              value={formData.prepare}
              onChange={handleChange}
              placeholder="What volunteers need to bring or wear"
              rows={3}
              error={errors.prepare}
            />
          </FormField>

          {/* Location */}
          <FormField
            icon={MapPin}
            label="Location"
            required
            error={errors.location}
          >
            <TextInput
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              error={errors.location}
            />
          </FormField>

          {/* Date Range */}
          <div className={styles['event-form__row']}>
            <FormField
              icon={Calendar}
              label="Start Date & Time"
              required
              error={errors.startDate}
            >
              <TextInput
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                error={errors.startDate}
              />
            </FormField>

            <FormField
              icon={Calendar}
              label="End Date & Time"
              required
              error={errors.endDate}
            >
              <TextInput
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                error={errors.endDate}
              />
            </FormField>
          </div>

          {/* Categories */}
          <FormField label="Categories" required error={errors.category}>
            <CategoryCheckboxes
              selectedCategories={formData.category}
              onCategoryChange={handleCategoryChange}
            />
          </FormField>

          {/* Capacity */}
          <FormField
            icon={Users}
            label="Capacity"
            required
            error={errors.capacity}
          >
            <TextInput
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Max volunteers"
              min="1"
              error={errors.capacity}
            />
          </FormField>

          {/* Thumbnail */}
          <FormField
            icon={ImageIcon}
            label="Event Thumbnail"
            required
            error={errors.thumbnail}
          >
            <ImagePicker
              preview={thumbnailPreview}
              onImageChange={handleImageChange}
              onRemoveImage={handleRemoveImage}
              error={errors.thumbnail}
            />
          </FormField>

          {/* Actions */}
          <div className={styles['event-form__actions']}>
            <button
              type="button"
              className={styles['event-form__button--cancel']}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <EventPreviewDialog event={createPreviewEvent()}>
              <button
                type="button"
                className={styles['event-form__button--preview']}
                disabled={loading}
              >
                Preview
              </button>
            </EventPreviewDialog>
            <button
              type="submit"
              className={styles['event-form__button--submit']}
              disabled={loading}
            >
              {loading ? 'Create...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
