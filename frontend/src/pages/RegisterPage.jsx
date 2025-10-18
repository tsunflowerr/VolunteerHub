import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sign, { styles } from '../components/Sign';
import EyeIcon from '../assets/icons/eye.svg?react';
import EyeOffIcon from '../assets/icons/eye-off.svg?react';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    const result = register(fullName, email, password);

    if (result.success) {
      // Redirect to home page after registration
      navigate('/');
    } else {
      setError(result.message);
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
            type="text"
            placeholder="John Doe"
            className={styles.authen__input}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            //   disabled={isSubmitting}
            required
          />
        </div>

        <div className={styles.authen__fieldGroup}>
          <label htmlFor="email" className={styles.authen__label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="user@company.com"
            className={styles.authen__input}
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            //   disabled={isSubmitting}
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
              onChange={(e) => setPassword(e.target.value)}
              // disabled={isSubmitting}
              required
            />
            <button
              type="button"
              className={styles.authen__eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              // disabled={isSubmitting}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
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
              className={`${styles.authen__input} ${styles.authen__passwordInput}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              // disabled={isSubmitting}
              required
            />
            <button
              type="button"
              className={styles.authen__eyeButton}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              // disabled={isSubmitting}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className={styles.authen__submitButton}
          // disabled={isSubmitting}
          // style={{
          //   opacity: isSubmitting ? 0.6 : 1,
          //   cursor: isSubmitting ? 'not-allowed' : 'pointer',
          // }}
        >
          Create Account{' '}
          {/* {isSubmitting ? 'Validating...' : 'Create Account'} */}
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
