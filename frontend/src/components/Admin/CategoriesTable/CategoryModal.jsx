import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Save, Loader2, Tag } from 'lucide-react';
import styles from './CategoriesTable.module.css';

const PREDEFINED_COLORS = [
  '#667eea',
  '#764ba2',
  '#e53935',
  '#43a047',
  '#1e88e5',
  '#ff9800',
  '#9c27b0',
  '#00bcd4',
];

const INITIAL_FORM_DATA = {
  name: '',
  slug: '',
  description: '',
  color: '#667eea',
};

function CategoryModal({ isOpen, onClose, onSubmit, category = null }) {
  const isEditMode = !!category;
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          name: category.name || '',
          slug:
            category.slug ||
            category.name?.toLowerCase().replace(/\s+/g, '') ||
            '',
          description: category.description || '',
          color: category.color || '#667eea',
        });
      } else {
        setFormData(INITIAL_FORM_DATA);
      }
      setFormErrors({});
    }
  }, [isOpen, category]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'name'
        ? { slug: value.toLowerCase().replace(/\s+/g, '') }
        : {}),
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleColorChange = (color) => {
    setFormData((prev) => ({ ...prev, color }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Please enter category name';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    if (formData.description && formData.description.length > 200) {
      errors.description = 'Description must not exceed 200 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit category:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{isEditMode ? 'Edit Category' : 'Add New Category'}</h3>
          <button
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGroup}>
            <label>
              Category Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="E.g.: Environment, Education, Health..."
              className={formErrors.name ? styles.inputError : ''}
            />
            {formErrors.name && (
              <span className={styles.errorText}>{formErrors.name}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the category"
              rows={3}
              className={formErrors.description ? styles.inputError : ''}
            />
            <span className={styles.charCount}>
              {formData.description.length}/200 characters
            </span>
            {formErrors.description && (
              <span className={styles.errorText}>{formErrors.description}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Display Color</label>
            <div className={styles.colorPicker}>
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`${styles.colorOption} ${
                    formData.color === color ? styles.colorSelected : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className={styles.customColor}
                aria-label="Custom color picker"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Preview</label>
            <div className={styles.preview}>
              <span
                className={styles.categoryBadge}
                style={{ backgroundColor: formData.color }}
              >
                <Tag size={14} />
                {formData.name || 'Category Name'}
              </span>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  {isEditMode ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditMode ? 'Save Changes' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

CategoryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  category: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    slug: PropTypes.string,
    description: PropTypes.string,
    color: PropTypes.string,
  }),
};

export default CategoryModal;
