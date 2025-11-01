import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import Sign, { styles } from '../../components/Sign';
import EyeIcon from '../../assets/icons/eye.svg?react';
import EyeOffIcon from '../../assets/icons/eye-off.svg?react';

// Validation schema
const registerSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must not exceed 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .required('Full name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(20, 'Password must not exceed 20 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setIsSubmitting(true);

    try {
      // Validate form data with Yup
      await registerSchema.validate(
        {
          fullName,
          email,
          password,
          confirmPassword,
        },
        { abortEarly: false }
      );

      // If validation passes, proceed with registration
      const result = register(fullName, email, password);

      if (result.success) {
        // Show success toast
        toast.success(
          'Account created successfully! Welcome to VolunteerHub! 🎉',
          {
            duration: 3000,
          }
        );

        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/userinfo');
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
          <label htmlFor="name" className={styles.authen__label}>
            Full Name
          </label>
          <input
            id="name"
            placeholder="John Doe"
            className={`${styles.authen__input} ${
              errors.fullName ? styles.authen__inputError : ''
            }`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isSubmitting}
          />
          {errors.fullName && (
            <span className={styles.authen__errorMessage}>
              {errors.fullName}
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
        <Link to="/login" className={styles.authen__switchLink}>
          Sign In.
        </Link>
      </div>
    </Sign>
  );
};

export default RegisterPage;
