import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import styles from './UserInfo.module.css';
import { ArrowLeft, Camera, Mail, MapPin, Phone, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import {
  FormHeader,
  FormField,
  TextInput,
  TextArea,
  CategoryCheckboxes,
  ImagePicker,
  FormActions,
} from '../Form';
// Validation schema
const userInfoSchema = Yup.object().shape({
  username: Yup.string()
    .matches(/^[a-zA-Z\s]+$/, 'Username can only contain letters and spaces')
    .required('Username is required'),
  phoneNumber: Yup.string()
    .matches(
      /^[0-9+\-\s()]*$/,
      'Phone number can only contain numbers, +, -, spaces, and parentheses'
    )
    .nullable(),
  location: Yup.string().nullable(),
  bio: Yup.string().max(160, 'Bio must not exceed 160 characters').nullable(),
  about: Yup.string()
    .max(500, 'About must not exceed 500 characters')
    .nullable(),
});
const UserInfo = ({ user, onSubmit }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(user);
  const [formData, setFormData] = useState(user);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file && formData) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    if (formData) {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });

      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const revertChanges = () => {
    setFormData(userData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      await userInfoSchema.validate(
        {
          username: formData.username,
          phoneNumber: formData.phoneNumber || null,
          location: formData.location || null,
          bio: formData.bio || null,
          about: formData.about || null,
        },
        { abortEarly: false }
      );

      const hasChanged =
        formData.username !== userData.username ||
        (formData.phoneNumber || '') !== (userData.phoneNumber || '') ||
        (formData.location || '') !== (userData.location || '') ||
        (formData.bio || '') !== (userData.bio || '') ||
        (formData.about || '') !== (userData.about || '') ||
        (formData.avatar || '') !== (userData.avatar || '');

      if (!hasChanged) {
        setIsSaving(false);
        return;
      }

      // Call the parent submit handler (mutation)
      if (onSubmit) {
        await onSubmit(formData);
        setUserData(formData); // Update local baseline
      }

    } catch (validationErrors) {
      // Handle Yup validation errors
      if (validationErrors.inner) {
        const formattedErrors = {};
        validationErrors.inner.forEach((err) => {
          formattedErrors[err.path] = err.message;
        });
        setErrors(formattedErrors);
      } else {
        console.error('Failed to save changes:', validationErrors);
        toast.error('Failed to save changes. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) {
    return (
      <div className={styles['user-info-form__loading']}>
        <p className={styles['user-info-form__loading-text']}>Loading...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles['user-info-form__form']}>
      {/* Avatar Section */}
      <div className={styles['user-info-form__card']}>
        <div className={styles['user-info-form__card-header']}>
          <h2 className={styles['user-info-form__card-title']}>
            Profile Picture
          </h2>
          <p className={styles['user-info-form__card-description']}>
            Upload or change your avatar
          </p>
        </div>
        <div className={styles['user-info-form__card-content']}>
          <div className={styles['user-info-form__avatar-section']}>
            <div className={styles['user-info-form__avatar-wrapper']}>
              <div className={styles['user-info-form__avatar']}>
                <img
                  src={formData.avatar}
                  alt={formData.username}
                  className={styles['user-info-form__avatar-image']}
                />
              </div>
              <label
                htmlFor="avatar-upload"
                className={styles['user-info-form__avatar-overlay']}
              >
                <Camera />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles['user-info-form__avatar-input']}
              />
            </div>
            <div className={styles['user-info-form__avatar-info']}>
              <p className={styles['user-info-form__avatar-title']}>
                Change your avatar
              </p>
              <p className={styles['user-info-form__avatar-hint']}>
                Hover over the image and click the camera icon
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Personal Information */}
      <div className={styles['user-info-form__card']}>
        <div className={styles['user-info-form__card-header']}>
          <h2 className={styles['user-info-form__card-title']}>
            Personal Information
          </h2>
          <p className={styles['user-info-form__card-description']}>
            Update your basic profile details
          </p>
        </div>
        <div className={styles['user-info-form__card-content']}>
          <FormField
            icon={User}
            label="Username"
            required
            error={errors.username}
          >
            <TextInput
              name="username"
              value={formData.username}
              onChange={handleChange}
              errror={errors.name}
            />
          </FormField>
          <FormField icon={Mail} label="email" required error={errors.email}>
            <TextInput
              name="email"
              value={formData.email}
              onChange={handleChange}
              errror={errors.email}
              disabled
            />
          </FormField>

          <FormField
            icon={Phone}
            label="Phone Number"
            required
            error={errors.phoneNumber}
          >
            <TextInput
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              errror={errors.phoneNumber}
            />
          </FormField>

          <FormField
            icon={MapPin}
            label="location"
            required
            error={errors.location}
          >
            <TextInput
              name="location"
              value={formData.location}
              onChange={handleChange}
              errror={errors.location}
            />
          </FormField>
        </div>
      </div>
      {/* Bio and About */}
      <div className={styles['user-info-form__card']}>
        <div className={styles['user-info-form__card-header']}>
          <h2 className={styles['user-info-form__card-title']}>About You</h2>
          <p className={styles['user-info-form__card-description']}>
            Tell others about yourself
          </p>
        </div>
        <div className={styles['user-info-form__card-content']}>
          <FormField icon={Phone} label="Bio" error={errors.bio}>
            <TextArea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              errror={errors.bio}
              placeholder="A short bio about yourself..."
            />
          </FormField>
          <FormField icon={Phone} label="about" error={errors.about}>
            <TextArea
              name="about"
              value={formData.about}
              onChange={handleChange}
              errror={errors.about}
              placeholder="Tell us more about yourself, your interests, and what you do..."
            />
          </FormField>
        </div>
      </div>
      <FormActions
        onCancel={revertChanges}
        submitText="Save"
        loadingText="Saving..."
      />
    </form>
  );
};

export default UserInfo;
