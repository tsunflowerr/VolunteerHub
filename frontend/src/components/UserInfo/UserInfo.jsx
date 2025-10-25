import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import PropTypes from 'prop-types';
import styles from './UserInfo.module.css';
import { ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Validation schema
const userInfoSchema = Yup.object().shape({
  fullName: Yup.string()
    .matches(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .required('Full name is required'),
  phone: Yup.string()
    .matches(
      /^[0-9+\-\s()]*$/,
      'Phone number can only contain numbers, +, -, spaces, and parentheses'
    )
    .nullable(),
  location: Yup.string().nullable(),
  bio: Yup.string().max(160, 'Bio must not exceed 160 characters').nullable(),
  aboutMe: Yup.string()
    .max(500, 'About Me must not exceed 500 characters')
    .nullable(),
});
const UserInfo = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const { updateUserInfo } = useAuth();
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem('currentUser');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      console.log(parsed);
      setUserData(parsed);
      setFormData(parsed);
    } else {
      navigate('/register');
    }
  }, [navigate]);

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
    const hasChanged =
      formData.fullName !== userData.fullName ||
      (formData.phone || '') !== (userData.phone || '') ||
      (formData.location || '') !== (userData.location || '') ||
      (formData.bio || '') !== (userData.bio || '') ||
      (formData.aboutMe || '') !== (userData.aboutMe || '') ||
      (formData.avatar || '') !== (userData.avatar || '');

    if (!hasChanged) {
      return;
    }

    setFormData(userData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      await userInfoSchema.validate(
        {
          fullName: formData.fullName,
          phone: formData.phone || null,
          location: formData.location || null,
          bio: formData.bio || null,
          aboutMe: formData.aboutMe || null,
        },
        { abortEarly: false }
      );

      const hasChanged =
        formData.fullName !== userData.fullName ||
        (formData.phone || '') !== (userData.phone || '') ||
        (formData.location || '') !== (userData.location || '') ||
        (formData.bio || '') !== (userData.bio || '') ||
        (formData.aboutMe || '') !== (userData.aboutMe || '') ||
        (formData.avatar || '') !== (userData.avatar || '');

      if (!hasChanged) {
        setIsSaving(false);
        return;
      }

      setUserData(formData);
      const result = updateUserInfo(formData);
      if (result.success) {
        toast.success('Profile updated successfully! 🎉', {
          duration: 3000,
        });
      }

      // Show success toast and message
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
        toast.error('Failed to save changes. Please try again.', {
          duration: 3000,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!formData) {
    return (
      <div className={styles['user-detail__loading']}>
        <p className={styles['user-detail__loading-text']}>Loading...</p>
      </div>
    );
  }

  const initials = formData.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  console.log('render');
  return (
    <div className={styles['user-detail']}>
      <div className={styles['user-detail__container']}>
        {/* Header */}
        <div className={styles['user-detail__header']}>
          <Link to="/profile" className={styles['user-detail__back-button']}>
            <ArrowLeft />
          </Link>
          <div className={styles['user-detail__header-content']}>
            <h1 className={styles['user-detail__title']}>User Details</h1>
            <p className={styles['user-detail__subtitle']}>
              Manage your profile information
            </p>
          </div>
        </div>

        <div className={styles['user-detail__form-container']}>
          <form onSubmit={handleSubmit} className={styles['user-detail__form']}>
            {/* Avatar Section */}
            <div className={styles['user-detail__card']}>
              <div className={styles['user-detail__card-header']}>
                <h2 className={styles['user-detail__card-title']}>
                  Profile Picture
                </h2>
                <p className={styles['user-detail__card-description']}>
                  Upload or change your avatar
                </p>
              </div>
              <div className={styles['user-detail__card-content']}>
                <div className={styles['user-detail__avatar-section']}>
                  <div className={styles['user-detail__avatar-wrapper']}>
                    <div className={styles['user-detail__avatar']}>
                      {formData.avatar ? (
                        <img
                          src={formData.avatar}
                          alt={formData.fullName}
                          className={styles['user-detail__avatar-image']}
                        />
                      ) : (
                        <div className={styles['user-detail__avatar-fallback']}>
                          {initials}
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className={styles['user-detail__avatar-overlay']}
                    >
                      <Camera />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className={styles['user-detail__avatar-input']}
                    />
                  </div>
                  <div className={styles['user-detail__avatar-info']}>
                    <p className={styles['user-detail__avatar-title']}>
                      Change your avatar
                    </p>
                    <p className={styles['user-detail__avatar-hint']}>
                      Hover over the image and click the camera icon
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Personal Information */}
            <div className={styles['user-detail__card']}>
              <div className={styles['user-detail__card-header']}>
                <h2 className={styles['user-detail__card-title']}>
                  Personal Information
                </h2>
                <p className={styles['user-detail__card-description']}>
                  Update your basic profile details
                </p>
              </div>
              <div className={styles['user-detail__card-content']}>
                <div className={styles['user-detail__field']}>
                  <label
                    htmlFor="fullName"
                    className={styles['user-detail__label']}
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`${styles['user-detail__input']} ${
                      errors.fullName ? styles['user-detail__input--error'] : ''
                    }`}
                  />
                  {errors.fullName && (
                    <p className={styles['user-detail__error']}>
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div className={styles['user-detail__field']}>
                  <label
                    htmlFor="email"
                    className={styles['user-detail__label']}
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                    disabled
                    className={`${styles['user-detail__input']} ${styles['user-detail__input--disabled']}`}
                  />
                  <p className={styles['user-detail__hint']}>
                    Email cannot be changed
                  </p>
                </div>
                <div className={styles['user-detail__field']}>
                  <label
                    htmlFor="phone"
                    className={styles['user-detail__label']}
                  >
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className={`${styles['user-detail__input']} ${
                      errors.phone ? styles['user-detail__input--error'] : ''
                    }`}
                  />
                  {errors.phone && (
                    <p className={styles['user-detail__error']}>
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div className={styles['user-detail__field']}>
                  <label
                    htmlFor="location"
                    className={styles['user-detail__label']}
                  >
                    Country
                  </label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location || ''}
                    onChange={handleChange}
                    placeholder="United States"
                    className={`${styles['user-detail__input']} ${
                      errors.location ? styles['user-detail__input--error'] : ''
                    }`}
                  />
                  {errors.location && (
                    <p className={styles['user-detail__error']}>
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Bio and About */}
            <div className={styles['user-detail__card']}>
              <div className={styles['user-detail__card-header']}>
                <h2 className={styles['user-detail__card-title']}>About You</h2>
                <p className={styles['user-detail__card-description']}>
                  Tell others about yourself
                </p>
              </div>
              <div className={styles['user-detail__card-content']}>
                <div className={styles['user-detail__field']}>
                  <label htmlFor="bio" className={styles['user-detail__label']}>
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio || ''}
                    onChange={handleChange}
                    placeholder="A short bio about yourself..."
                    rows={3}
                    className={`${styles['user-detail__textarea']} ${
                      errors.bio ? styles['user-detail__input--error'] : ''
                    }`}
                  />
                  {errors.bio ? (
                    <p className={styles['user-detail__error']}>{errors.bio}</p>
                  ) : (
                    <p className={styles['user-detail__hint']}>
                      {(formData.bio || '').length}/160 characters
                    </p>
                  )}
                </div>
                <div className={styles['user-detail__field']}>
                  <label
                    htmlFor="aboutMe"
                    className={styles['user-detail__label']}
                  >
                    About Me
                  </label>
                  <textarea
                    id="aboutMe"
                    name="aboutMe"
                    value={formData.aboutMe || ''}
                    onChange={handleChange}
                    placeholder="Tell us more about yourself, your interests, and what you do..."
                    rows={5}
                    className={`${styles['user-detail__textarea']} ${
                      errors.aboutMe ? styles['user-detail__input--error'] : ''
                    }`}
                  />
                  {errors.aboutMe ? (
                    <p className={styles['user-detail__error']}>
                      {errors.aboutMe}
                    </p>
                  ) : (
                    <p className={styles['user-detail__hint']}>
                      {(formData.aboutMe || '').length}/500 characters
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Save Button */}
            <div className={styles['user-detail__actions']}>
              <button
                type="submit"
                disabled={isSaving}
                className={styles['user-detail__button']}
              >
                Save Changes
              </button>
              <button
                onClick={revertChanges}
                className={styles['user-detail__button--outline']}
              >
                Revert Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
