import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as yup from 'yup';
import toast from 'react-hot-toast';
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
import { useCreateEvent, useUpdateEvent } from '../../hooks/useManager';
import { useEvent } from '../../hooks/useEvents';
import useAuth from '../../hooks/useAuth.js';

import styles from './ManagerEventForm.module.css';
import EventPreviewDialog from '../../components/EventDetail/EventPreviewDialog';

// Yup validation schema
const eventFormSchema = yup.object().shape({
  name: yup
    .string()
    .required('Event name is required')
    .min(3, 'Event name must be at least 3 characters')
    .max(100, 'Event name must not exceed 100 characters')
    .trim(),
  about: yup
    .string()
    .required('About section is required')
    .min(10, 'About must be at least 10 characters')
    .max(1000, 'About must not exceed 1000 characters')
    .trim(),
  activities: yup
    .string()
    .max(2000, 'Activities must not exceed 2000 characters')
    .trim(),
  prepare: yup
    .string()
    .max(1000, 'Preparation info must not exceed 1000 characters')
    .trim(),
  location: yup
    .string()
    .required('Location is required')
    .min(5, 'Location must be at least 5 characters')
    .max(200, 'Location must not exceed 200 characters')
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
  thumbnail: yup.string().when('$isEdit', {
    is: false,
    then: () =>
      yup
        .string()
        .required('Thumbnail image is required')
        .test(
          'isValidImage',
          'Please select a valid image',
          (value) => !!value && value.length > 0
        ),
    otherwise: () => yup.string().nullable(),
  }),
});

const ManagerEventForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  // Get current user (manager) info
  const { user } = useAuth();

  // React Query hooks
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const { data: existingEventData, isLoading: isLoadingEvent } = useEvent(id);

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
    thumbnail: '',
  });

  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Loading state from mutations
  const loading = createEvent.isPending || updateEvent.isPending;

  // Load event data if editing
  useEffect(() => {
    if (isEditMode && existingEventData?.event) {
      const event = existingEventData.event;
      setFormData({
        name: event.name || '',
        about: event.description || '',
        activities: event.activities || '',
        prepare: event.prepare || '',
        location: event.location || '',
        startDate: event.startDate ? event.startDate.slice(0, 16) : '',
        endDate: event.endDate ? event.endDate.slice(0, 16) : '',
        category: event.categories?.map((c) => c._id || c) || [],
        capacity: event.capacity || '',
        thumbnail: event.thumbnail || '',
      });
      setThumbnailPreview(event.thumbnail || '');
    }
  }, [isEditMode, existingEventData]);

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

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData((prev) => ({
          ...prev,
          thumbnail: base64String,
        }));
        setThumbnailPreview(base64String);
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
      thumbnail: '',
    }));
    setThumbnailPreview('');
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form data
      await eventFormSchema.validate(formData, {
        abortEarly: false,
        context: { isEdit: isEditMode },
      });

      const payload = {
        name: formData.name,
        description: formData.about,
        activities: formData.activities,
        prepare: formData.prepare,
        location: formData.location,
        startDate: formData.startDate,
        endDate: formData.endDate,
        categories: formData.category,
        capacity: Number(formData.capacity),
        thumbnail: formData.thumbnail,
        images: [],
      };

      if (isEditMode) {
        await updateEvent.mutateAsync({ id, data: payload });
      } else {
        await createEvent.mutateAsync(payload);
      }

      navigate('/manager/events');
    } catch (err) {
      if (err.name === 'ValidationError') {
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
        toast.error('Please check the form for errors');
      } else {
        console.error('Failed to save event:', err);
      }
    }
  };

  // Show loading when fetching existing event
  if (isEditMode && isLoadingEvent) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Loading event data...</p>
        </div>
      </div>
    );
  }

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
            description: formData.about,
            thumbnail: thumbnailPreview,
            managerId: user,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default ManagerEventForm;
