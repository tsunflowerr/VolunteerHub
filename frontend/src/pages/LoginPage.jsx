import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sign, { styles } from '../components/Sign';
import EyeIcon from '../assets/icons/eye.svg?react';
import EyeOffIcon from '../assets/icons/eye-off.svg?react';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
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
            type="email"
            placeholder="user@company.com"
            className={styles.authen__input}
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              required
            />
            <button
              type="button"
              className={styles.authen__eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button type="submit" className={styles.authen__submitButton}>
          Log In
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
