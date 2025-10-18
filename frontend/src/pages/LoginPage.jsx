import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AuthenPage.css';
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
    <div className="container">
      <div className="leftPanel">
        <div className="leftContent">
          <div className="logo">
            <h1 className="logoText">VolunteerHub</h1>
          </div>

          <div className="heroSection">
            <h2 className="heroTitle">
              The all-in-one platform to recruit, schedule, and communicate with
              your volunteers, effortlessly.
            </h2>
            <p className="heroDescription">
              Build, manage, and grow your community of changemakers.
            </p>
          </div>

          <div className="authen-footer">
            <span>Copyright © UET 2025.</span>
            <span className="footerLink">
              Image from{' '}
              <a href="https://unsplash.com/photos/a-group-of-people-holding-hands-on-top-of-a-tree-DNkoNXQti3c">
                Shane Rounce
              </a>
            </span>
          </div>
        </div>
      </div>

      <div className="rightPanel">
        <div className="formContainer">
          <div className="mobileLogo">
            <h1 className="mobileLogoText">VolunteerHub</h1>
          </div>

          <div className="formWrapper">
            <div className="header">
              <h2 className="title">Welcome Back</h2>
              <p className="subtitle">
                Enter your email and password to access your account.
              </p>
            </div>

            <form className="signinForm" onSubmit={handleSubmit}>
              <div className="fieldGroup">
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  className="input"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="fieldGroup">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <div className="passwordWrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className="input passwordInput"
                    value={password}
                    autoComplete="off"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="eyeButton"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button type="submit" className="submitButton">
                Log In
              </button>
            </form>

            <div className="switchView">
              Don't Have An Account?{' '}
              <Link to="/register" className="switchLink">
                Register Now.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
