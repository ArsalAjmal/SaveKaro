import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/VerifyEmail.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        const response = await axios.post('http://localhost:8000/api/auth/verify-email', {
          token: token
        });
        
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Refresh user data to update verification status
        await refreshUser();
        
        // Redirect to account page after 3 seconds
        setTimeout(() => {
          navigate('/my-account');
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.detail || 'Failed to verify email. The link may have expired.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="verify-email">
      <div className="verify-email__container">
        <div className="verify-email__card">
          {status === 'loading' && (
            <>
              <FiLoader className="verify-email__icon verify-email__icon--loading" />
              <h1 className="verify-email__title">Verifying Your Email</h1>
              <p className="verify-email__message">Please wait while we verify your email address...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <FiCheckCircle className="verify-email__icon verify-email__icon--success" />
              <h1 className="verify-email__title">Email Verified!</h1>
              <p className="verify-email__message">{message}</p>
              <p className="verify-email__redirect">Redirecting you to your account...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <FiXCircle className="verify-email__icon verify-email__icon--error" />
              <h1 className="verify-email__title">Verification Failed</h1>
              <p className="verify-email__message">{message}</p>
              <div className="verify-email__actions">
                <button
                  className="verify-email__btn verify-email__btn--primary"
                  onClick={() => navigate('/my-account')}
                >
                  Go to My Account
                </button>
                <button
                  className="verify-email__btn verify-email__btn--secondary"
                  onClick={() => navigate('/')}
                >
                  Go to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

