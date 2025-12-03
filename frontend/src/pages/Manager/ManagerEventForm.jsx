import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as yup from 'yup';
import {
  Calendar,
  MapPin,
  Users,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  Save,
  Eye,
  Tag,
} from 'lucide-react';
import {
  FormField,
  TextInput,
  TextArea,
  ImagePicker,
  CategoryCheckboxes,
} from '../../components/Form';
import styles from './ManagerEventForm.module.css';
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
  thumbnail: yup.mixed().when('$isEdit', {
    is: false,
    then: () =>
      yup
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
    otherwise: () => yup.mixed().nullable(),
  }),
});

const ManagerEventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

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
  const [showPreview, setShowPreview] = useState(false);

  // Load event data if editing
  useEffect(() => {
    if (isEditMode) {
      // TODO: Fetch event data from API
      // Mock data for now
      const mockEvent = {
        name: 'Beach Cleanup Initiative',
        about:
          'Join us for a community beach cleanup event to protect our marine life and keep our beaches beautiful.',
        activities:
          'Collect trash and recyclables, sort materials, participate in educational workshops about ocean conservation.',
        prepare:
          'Bring sunscreen, comfortable shoes, reusable water bottle, and gloves if you have them.',
        location: 'Santa Monica Beach, 1550 PCH, Santa Monica, CA 90401',
        startDate: '2025-11-20T08:00:00',
        endDate: '2025-11-20T12:00:00',
        category: ['animals', 'climate'],
        capacity: 50,
        thumbnail:
          'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800',
      };

      setFormData({
        ...mockEvent,
        startDate: mockEvent.startDate.slice(0, 16),
        endDate: mockEvent.endDate.slice(0, 16),
      });
      setThumbnailPreview(mockEvent.thumbnail);
    }
  }, [isEditMode, id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form
      await eventFormSchema.validate(formData, {
        abortEarly: false,
        context: { isEdit: isEditMode },
      });

      setLoading(true);

      // TODO: Submit to API
      console.log('Form data:', formData);

      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        alert(
          isEditMode
            ? 'Event updated successfully!'
            : 'Event created successfully!'
        );
        navigate('/manager/events');
      }, 1500);
    } catch (err) {
      if (err.name === 'ValidationError') {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      }
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className={styles.title}>
            {isEditMode ? 'Edit Event' : 'Create New Event'}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Event Name */}
          <FormField
            label="Event Name"
            icon={FileText}
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
            label="About This Event"
            icon={FileText}
            required
            error={errors.about}
          >
            <TextArea
              name="about"
              value={formData.about}
              onChange={handleChange}
              placeholder="Describe what this event is about..."
              rows={4}
              error={errors.about}
            />
          </FormField>

          {/* Activities */}
          <FormField
            label="Activities"
            icon={FileText}
            required
            error={errors.activities}
          >
            <TextArea
              name="activities"
              value={formData.activities}
              onChange={handleChange}
              placeholder="What activities will volunteers do?"
              rows={4}
              error={errors.activities}
            />
          </FormField>

          {/* Preparation */}
          <FormField
            label="What to Prepare"
            icon={FileText}
            required
            error={errors.prepare}
          >
            <TextArea
              name="prepare"
              value={formData.prepare}
              onChange={handleChange}
              placeholder="What should volunteers bring or prepare?"
              rows={3}
              error={errors.prepare}
            />
          </FormField>

          {/* Location */}
          <FormField
            label="Location"
            icon={MapPin}
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
          <div className={styles.dateRow}>
            <FormField
              label="Start Date & Time"
              icon={Calendar}
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
              label="End Date & Time"
              icon={Calendar}
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

          {/* Capacity */}
          <FormField
            label="Capacity"
            icon={Users}
            required
            error={errors.capacity}
          >
            <TextInput
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="Maximum number of volunteers"
              error={errors.capacity}
              min="1"
            />
          </FormField>

          {/* Categories */}
          <FormField
            label="Categories"
            required
            error={errors.category}
            icon={Tag}
          >
            <CategoryCheckboxes
              selectedCategories={formData.category}
              onCategoryChange={handleCategoryChange}
            />
          </FormField>

          {/* Thumbnail */}
          <FormField
            label="Event Thumbnail"
            icon={ImageIcon}
            required={!isEditMode}
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
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.previewBtn}
              onClick={() => setShowPreview(true)}
            >
              <Eye size={20} />
              Preview
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              <Save size={20} />
              {loading
                ? 'Saving...'
                : isEditMode
                ? 'Update Event'
                : 'Create Event'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Preview Dialog */}
      {showPreview && (
        <EventPreviewDialog
          event={{
            ...formData,
            thumbnail: thumbnailPreview,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default ManagerEventForm;
