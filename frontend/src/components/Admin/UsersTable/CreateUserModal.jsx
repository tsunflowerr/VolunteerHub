import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import * as yup from 'yup';
import styles from './UsersTable.module.css';

const initialFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  role: 'user',
};

const validationSchema = yup.object().shape({
  username: yup
    .string()
    .required('Please enter username')
    .matches(
      /^[a-zA-Z0-9]+$/,
      'Username must only contain alphanumeric characters'
    )
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters'),
  email: yup
    .string()
    .required('Please enter email')
    .email('Invalid email format'),
  password: yup
    .string()
    .required('Please enter password')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm password')
    .oneOf([yup.ref('password'), null], 'Passwords do not match'),
  phoneNumber: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9]{10}$/, 'Invalid phone number (10 digits)'),
  role: yup
    .string()
    .required('Role is required')
    .oneOf(['user', 'manager'], 'Role must be either user or manager'),
});

function CreateUserModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the modified field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setFormErrors({});

      setIsSubmitting(true);
      try {
        // Create a copy of formData and remove confirmPassword
        // eslint-disable-next-line no-unused-vars
        const { confirmPassword, ...submitData } = formData;

        await onSubmit(submitData);
        setFormData(initialFormData);
        onClose();
      } catch (err) {
        // Error handled by parent
      } finally {
        setIsSubmitting(false);
      }
    } catch (validationError) {
      const errors = {};
      if (validationError.inner) {
        validationError.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
      }
      setFormErrors(errors);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setFormErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Create New User</h3>
              <button className={styles.modalClose} onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>
                  Username <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  className={formErrors.username ? styles.inputError : ''}
                />
                {formErrors.username && (
                  <span className={styles.errorText}>
                    {formErrors.username}
                  </span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className={formErrors.email ? styles.inputError : ''}
                />
                {formErrors.email && (
                  <span className={styles.errorText}>{formErrors.email}</span>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      className={formErrors.password ? styles.inputError : ''}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <span className={styles.errorText}>
                      {formErrors.password}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Confirm Password <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordInput}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className={
                        formErrors.confirmPassword ? styles.inputError : ''
                      }
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <span className={styles.errorText}>
                      {formErrors.confirmPassword}
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>
                    Phone <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    className={formErrors.phoneNumber ? styles.inputError : ''}
                  />
                  {formErrors.phoneNumber && (
                    <span className={styles.errorText}>
                      {formErrors.phoneNumber}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>
                    Role <span className={styles.required}>*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="submit"
                  className={styles.btnSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className={styles.spinner} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

CreateUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default CreateUserModal;
