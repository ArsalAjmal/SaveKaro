import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import '../styles/ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!token) {
      setMessage({
        type: 'error',
        text: 'Invalid or missing reset token. Please request a new password reset link.'
      });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post('http://localhost:8000/api/auth/reset-password', {
        token,
        new_password: passwords.newPassword
      });

      setMessage({
        type: 'success',
        text: 'Password reset successfully! Redirecting to login...'
      });

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to reset password. The link may have expired.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <Link to="/login" className="back-link">
            <FiArrowLeft /> Back to Login
          </Link>

          <div className="reset-password-header">
            <div className="reset-password-icon">
              <FiLock size={48} />
            </div>
            <h1 className="reset-password-title">Reset Your Password</h1>
            <p className="reset-password-subtitle">
              Enter your new password below
            </p>
          </div>

          {message.text && (
            <div className={`reset-password-message reset-password-message--${message.type}`}>
              {message.text}
            </div>
          )}

          {token ? (
            <form onSubmit={handleSubmit} className="reset-password-form">
              <div className="reset-password-input-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="reset-password-input-wrapper">
                  <FiLock className="reset-password-input-icon" />
                  <input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="reset-password-input-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <div className="reset-password-input-wrapper">
                  <FiCheck className="reset-password-input-icon" />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="reset-password-btn"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="reset-password-footer">
              <Link to="/forgot-password" className="forgot-link">
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;



