import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/AuthenPage.css';
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
              <h2 className="title">Create Account</h2>
              <p className="subtitle">
                Create a new account to get started with VolunteerHub.
              </p>
            </div>

            <form className="signinForm" onSubmit={handleSubmit}>
              <div className="fieldGroup">
                <label htmlFor="name" className="label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  //   disabled={isSubmitting}
                  required
                />
              </div>

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
                  //   disabled={isSubmitting}
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
                    onChange={(e) => setPassword(e.target.value)}
                    // disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="eyeButton"
                    onClick={() => setShowPassword(!showPassword)}
                    // disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="fieldGroup">
                <label htmlFor="confirmPassword" className="label">
                  Confirm Password
                </label>
                <div className="passwordWrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    className="input passwordInput"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    // disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="eyeButton"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    // disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="submitButton"
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

            <div className="switchView">
              Already Have An Account?{' '}
              <Link to="/login" className="switchLink">
                Sign In.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
