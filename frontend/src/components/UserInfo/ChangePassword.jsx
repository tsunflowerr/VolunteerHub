import { useState } from 'react';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { Lock } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import {
  FormField,
  TextInput,
  FormActions,
} from '../Form';
import styles from './UserInfo.module.css';

// Validation schema
const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .min(6, 'New password must be at least 6 characters long')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ChangePassword = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: '',
    });
  };

  const handleCancel = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      await passwordSchema.validate(formData, { abortEarly: false });

      if (onSubmit) {
        await onSubmit({
            current_password: formData.currentPassword,
            new_password: formData.newPassword,
            confirm_new_password: formData.confirmPassword
        });
        handleCancel();
      }

    } catch (validationErrors) {
      if (validationErrors && validationErrors.inner) {
        const formattedErrors = {};
        validationErrors.inner.forEach((err) => {
          formattedErrors[err.path] = err.message;
        });
        setErrors(formattedErrors);
      } else if (validationErrors && validationErrors.message) {
          // Handle API errors thrown by onSubmit (if it throws)
           toast.error(validationErrors.message);
           // Attempt to map API error to field if possible, else general toast
      } else {
        console.error('Failed to save changes:', validationErrors);
        toast.error('An error occurred. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles['user-info-form__form']}>
      <div className={styles['user-info-form__card']}>
        <div className={styles['user-info-form__card-header']}>
          <h2 className={styles['user-info-form__card-title']}>
            Change Password
          </h2>
          <p className={styles['user-info-form__card-description']}>
            Ensure your account is using a long, random password to stay secure.
          </p>
        </div>
        <div className={styles['user-info-form__card-content']}>
          <FormField
            icon={Lock}
            label="Current Password"
            required
            error={errors.currentPassword}
          >
            <TextInput
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              placeholder="Enter current password"
            />
          </FormField>
          
          <FormField
            icon={Lock}
            label="New Password"
            required
            error={errors.newPassword}
          >
            <TextInput
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              placeholder="Enter new password"
            />
          </FormField>

          <FormField
            icon={Lock}
            label="Confirm Password"
            required
            error={errors.confirmPassword}
          >
            <TextInput
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm new password"
            />
          </FormField>
        </div>
      </div>
      <FormActions
        onCancel={handleCancel}
        submitText="Update Password"
        loadingText="Updating..."
        loading={isSaving}
      />
    </form>
  );
};

export default ChangePassword;
