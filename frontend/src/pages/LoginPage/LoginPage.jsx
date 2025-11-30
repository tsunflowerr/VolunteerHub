import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Sign, { styles } from '../../components/Sign';
import EyeIcon from '../../assets/icons/eye.svg?react';
import EyeOffIcon from '../../assets/icons/eye-off.svg?react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = login(email, password);

      if (result.success) {
        // Show success toast
        toast.success('Login successful! Welcome back! 👋', {
          duration: 2500,
        });

        // Redirect to home page after a short delay
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else {
        // Show error toast
        toast.error(
          result.message || 'Login failed. Please check your credentials.',
          {
            duration: 4000,
          }
        );
        setError(result.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.', {
        duration: 4000,
      });
      setError('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  return (
    <Sign
      title="Welcome Back"
      subtitle="Enter your email and password to access your account."
    >
      <form className="signinForm" onSubmit={handleSubmit}>
        <div className={styles.authen__fieldGroup}>
          <label htmlFor="email" className={styles.authen__label}>
            Email
          </label>
          <input
            id="email"
            placeholder="user@company.com"
            className={styles.authen__input}
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            required
          />
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
              className={`${styles.authen__input} ${styles.authen__passwordInput}`}
              value={password}
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
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
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className={styles.authen__switchView}>
        Don't Have An Account?{' '}
        <Link to="/register" className={styles.authen__switchLink}>
          Register Now.
        </Link>
      </div>
    </Sign>
  );
};

export default LoginPage;
