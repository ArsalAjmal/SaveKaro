import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import '../styles/ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('http://localhost:8000/api/auth/forgot-password', {
        email
      });

      setMessage({
        type: 'success',
        text: 'If an account exists with this email, you will receive password reset instructions.'
      });
      setEmail('');
    } catch (error) {
      setMessage({
        type: 'success', // Show success message even on error for security
        text: 'If an account exists with this email, you will receive password reset instructions.'
      });
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <Link to="/login" className="back-link">
            <FiArrowLeft /> Back to Login
          </Link>

          <div className="forgot-password-header">
            <div className="forgot-password-icon">
              <FiMail size={48} />
            </div>
            <h1 className="forgot-password-title">Forgot Password?</h1>
            <p className="forgot-password-subtitle">
              No worries! Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>

          {message.text && (
            <div className={`forgot-password-message forgot-password-message--${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="forgot-password-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="forgot-password-input-wrapper">
                <FiMail className="forgot-password-input-icon" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              className="forgot-password-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="forgot-password-footer">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;



