import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import useAuth from '../../hooks/useAuth.js';
import Sign, { styles } from '../../components/Sign';
import EyeIcon from '../../assets/icons/eye.svg?react';
import EyeOffIcon from '../../assets/icons/eye-off.svg?react';

// Validation schema - matches backend validation
const registerSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must not exceed 30 characters')
    .matches(
      /^[a-zA-Z0-9]+$/,
      'Username must only contain alphanumeric characters'
    )
    .required('Username is required'),
  email: Yup.string()
    .email('Email must be a valid email address')
    .required('Email is required'),
  phone_number: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits long')
    .required('Phone number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters long')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate form data with Yup
      await registerSchema.validate(
        {
          username,
          email,
          phone_number: phoneNumber,
          password,
          confirmPassword,
        },
        { abortEarly: false }
      );

      // If validation passes, proceed with registration
      const result = await register(username, email, phoneNumber, password);

      if (result.success) {
        setTimeout(() => {
          navigate('/login', { state: { from: location.state?.from } });
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (validationErrors) {
      // Handle Yup validation errors
      if (validationErrors.inner) {
        const formattedErrors = {};
        validationErrors.inner.forEach((err) => {
          formattedErrors[err.path] = err.message;
        });
        console.log(formattedErrors);
        setErrors(formattedErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sign
      title="Create Account"
      subtitle="Create a new account to get started with VolunteerHub."
    >
      <form className="signinForm" onSubmit={handleSubmit}>
        <div className={styles.authen__fieldGroup}>
          <label htmlFor="username" className={styles.authen__label}>
            Username
          </label>
          <input
            id="username"
            placeholder="johndoe123"
            className={`${styles.authen__input} ${
              errors.username ? styles.authen__inputError : ''
            }`}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.username && (
            <span className={styles.authen__errorMessage}>
              {errors.username}
            </span>
          )}
        </div>

        <div className={styles.authen__fieldGroup}>
          <label htmlFor="email" className={styles.authen__label}>
            Email
          </label>
          <input
            id="email"
            placeholder="user@company.com"
            className={`${styles.authen__input} ${
              errors.email ? styles.authen__inputError : ''
            }`}
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.email ? (
            <span className={styles.authen__errorMessage}>{errors.email}</span>
          ) : (
            error && (
              <span className={styles.authen__errorMessage}>{error}</span>
            )
          )}
        </div>

        <div className={styles.authen__fieldGroup}>
          <label htmlFor="phone_number" className={styles.authen__label}>
            Phone Number
          </label>
          <input
            id="phone_number"
            placeholder="0912345678"
            className={`${styles.authen__input} ${
              errors.phone_number ? styles.authen__inputError : ''
            }`}
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.phone_number && (
            <span className={styles.authen__errorMessage}>
              {errors.phone_number}
            </span>
          )}
        </div>

        <div className={styles.authen__fieldGroup}>
          <label htmlFor="password" className={styles.authen__label}>
            Password
          </label>
          <div className={styles.authen__passwordWrapper}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              className={`${styles.authen__input} ${
                styles.authen__passwordInput
              } ${errors.password ? styles.authen__inputError : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className={styles.authen__eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.password && (
            <span className={styles.authen__errorMessage}>
              {errors.password}
            </span>
          )}
        </div>

        <div className={styles.authen__fieldGroup}>
          <label htmlFor="confirmPassword" className={styles.authen__label}>
            Confirm Password
          </label>
          <div className={styles.authen__passwordWrapper}>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              className={`${styles.authen__input} ${
                styles.authen__passwordInput
              } ${errors.confirmPassword ? styles.authen__inputError : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className={styles.authen__eyeButton}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isSubmitting}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className={styles.authen__errorMessage}>
              {errors.confirmPassword}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={styles.authen__submitButton}
          disabled={isSubmitting}
          style={{
            opacity: isSubmitting ? 0.6 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Validating...' : 'Create Account'}
        </button>
      </form>

      <div className={styles.authen__switchView}>
        Already Have An Account?{' '}
        <Link
          to="/login"
          state={{ from: location.state?.from }}
          className={styles.authen__switchLink}
        >
          Sign In.
        </Link>
      </div>
    </Sign>
  );
};

export default RegisterPage;
