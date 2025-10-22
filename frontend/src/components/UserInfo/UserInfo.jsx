import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './UserInfo.module.css';
import { ArrowLeft, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
const UserInfo = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const { updateUserInfo } = useAuth();
  // const [formData, setFormData] = useState({
  //   name: 'John Doe',
  //   email: 'john.doe@example.com',
  //   location: 'United States',
  //   bio: 'Passionate volunteer and community advocate',
  //   aboutMe:
  //     'I love helping others and making a positive impact in my community. I have been volunteering for over 5 years in various organizations.',
  //   avatar: '',
  // });
  const [formData, setFormData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Get all users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      // Find the current user index
      const userIndex = users.findIndex((u) => u.id === userData.id);

      if (userIndex !== -1) {
        // Update user in users array (preserve password)
        const existingPassword = users[userIndex].password;
        users[userIndex] = {
          ...users[userIndex],
          fullName: formData.fullName,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          aboutMe: formData.aboutMe,
          avatar: formData.avatar,
          password: existingPassword,
          updatedAt: new Date().toISOString(),
        };

        // Save updated users array to localStorage
        localStorage.setItem('users', JSON.stringify(users));

        // Update currentUser in localStorage (without password)
        const updatedCurrentUser = {
          id: userData.id,
          email: userData.email,
          fullName: formData.fullName,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
          aboutMe: formData.aboutMe,
          avatar: formData.avatar,
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));

        // Update context state
        updateUserInfo(formData);

        // Show success message
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
    }

    setIsSaving(false);
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
                    required
                    className={styles['user-detail__input']}
                  />
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
                    placeholder=""
                    className={styles['user-detail__input']}
                  />
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
                    placeholder=""
                    className={styles['user-detail__input']}
                  />
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
                    className={styles['user-detail__textarea']}
                  />
                  <p className={styles['user-detail__hint']}>
                    {(formData.bio || '').length}/160 characters
                  </p>
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
                    className={styles['user-detail__textarea']}
                  />
                  <p className={styles['user-detail__hint']}>
                    {(formData.aboutMe || '').length}/500 characters
                  </p>
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
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                to="/profile"
                className={styles['user-detail__button--outline']}
              >
                Cancel
              </Link>
            </div>
            {/* Success Message */}
            {saveSuccess && (
              <div className={styles['user-detail__success']}>
                <p className={styles['user-detail__success-text']}>
                  ✓ Changes saved successfully!
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
