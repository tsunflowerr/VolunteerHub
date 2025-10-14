import { useState } from 'react';
import '../styles/LoginPage.css';
import EyeIcon from '../assets/icons/eye.svg?react';
import EyeOffIcon from '../assets/icons/eye-off.svg?react';

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentView, setCurrentView] = useState('login');

  // TODO: Handle form submission and validation
  return (
    <div className="container">
      <div className="leftPanel">
        <div className="leftContent">
          <div className="logo">
            {/* <div className="logoIcon">
              <div className="logoIconInner"></div>
            </div> */}
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

          <div className="footer">
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
            {/* <div className="mobileLogoIcon">
              <div className="mobileLogoIconInner"></div>
            </div> */}
            <h1 className="mobileLogoText">VolunteerHub</h1>
          </div>

          <div className="formWrapper">
            <div className="header">
              <h2 className="title">
                {currentView === 'login' && 'Welcome Back'}
                {currentView === 'register' && 'Create Account'}
              </h2>
              <p className="subtitle">
                {currentView === 'login' &&
                  'Enter your email and password to access your account.'}
                {currentView === 'register' &&
                  'Create a new account to get started with VolunteerHub.'}
              </p>
            </div>

            <div className="formFields">
              {currentView === 'register' && (
                <div className="fieldGroup">
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="input"
                  />
                </div>
              )}
              <div className="fieldGroup">
                <label htmlFor="email" className="label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  className="input"
                />
              </div>
              {currentView !== 'forgot' && (
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
              )}
              {currentView === 'register' && (
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
                    />
                    <button
                      type="button"
                      className="eyeButton"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="submitButton">
              {currentView === 'login' && 'Log In'}
              {currentView === 'register' && 'Create Account'}
            </button>

            <div className="switchView">
              {currentView === 'login' && (
                <>
                  Don't Have An Account?{' '}
                  <button
                    className="switchLink"
                    onClick={() => setCurrentView('register')}
                  >
                    Register Now.
                  </button>
                </>
              )}
              {currentView === 'register' && (
                <>
                  Already Have An Account?{' '}
                  <button
                    className="switchLink"
                    onClick={() => setCurrentView('login')}
                  >
                    Sign In.
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
