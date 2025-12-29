import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginSignup.css';
import { FaFacebookF, FaGoogle, FaLinkedinIn } from 'react-icons/fa';

function LoginSignup() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Sign Up form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Sign In form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleSignUpClick = () => {
    setIsSignUpMode(true);
    setError('');
  };

  const handleSignInClick = () => {
    setIsSignUpMode(false);
    setError('');
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }

      // Login the user with the returned data
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Login the user with the returned data
      login(data.user, data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-signup-page">
      <div className={`container ${isSignUpMode ? 'sign-up-mode' : ''}`}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* Sign In Form */}
            <form onSubmit={handleLoginSubmit} className="sign-in-form">
              <h2 className="title">Sign in</h2>
              {error && !isSignUpMode && <div className="error-message">{error}</div>}
              <div className="input-field">
                <i className="fas fa-user"></i>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                />
              </div>
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  placeholder="Password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                />
              </div>
              <div className="forgot-password-container">
                <a href="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </a>
              </div>
              <button type="submit" className="btn solid" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
              <p className="social-text">Or Sign in with social platforms</p>
              <div className="social-media">
                <button type="button" className="social-icon">
                  <FaFacebookF />
                </button>
                <button type="button" className="social-icon">
                  <FaGoogle />
                </button>
                <button type="button" className="social-icon">
                  <FaLinkedinIn />
                </button>
              </div>
            </form>

            {/* Sign Up Form */}
            <form onSubmit={handleSignupSubmit} className="sign-up-form">
              <h2 className="title">Sign up</h2>
              {error && isSignUpMode && <div className="error-message">{error}</div>}
              <div className="input-field">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  placeholder="Username"
                  value={signupData.name}
                  onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                  required
                />
              </div>
              <div className="input-field">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  placeholder="Email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  required
                />
              </div>
              <div className="input-field">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  required
                  minLength="6"
                />
              </div>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Signing up...' : 'Sign up'}
              </button>
              <p className="social-text">Or Sign up with social platforms</p>
              <div className="social-media">
                <button type="button" className="social-icon">
                  <FaFacebookF />
                </button>
                <button type="button" className="social-icon">
                  <FaGoogle />
                </button>
                <button type="button" className="social-icon">
                  <FaLinkedinIn />
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>New here ?</h3>
              <p>
                Join us today and discover amazing deals on fashion!
              </p>
              <button className="btn transparent" onClick={handleSignUpClick}>
                Sign up
              </button>
            </div>
            <img src="/mylogo.png" className="image" alt="" />
          </div>
          <div className="panel right-panel">
            <div className="content">
              <h3>One of us ?</h3>
              <p>
                Welcome back! Sign in to continue your shopping journey.
              </p>
              <button className="btn transparent" onClick={handleSignInClick}>
                Sign in
              </button>
            </div>
            <img src="/mylogo.png" className="image" alt="" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginSignup;
