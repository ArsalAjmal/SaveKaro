import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPopup.css';

const AuthPopup = () => {
  const { showAuthPopup, setShowAuthPopup } = useAuth();
  const navigate = useNavigate();

  console.log('AuthPopup render - showAuthPopup:', showAuthPopup);

  if (!showAuthPopup) return null;

  const handleLoginClick = () => {
    setShowAuthPopup(false);
    navigate('/login');
  };

  const handleClose = () => {
    setShowAuthPopup(false);
  };

  return (
    <>
      <div className="auth-popup-overlay" onClick={handleClose}></div>
      <div className="auth-popup">
        <button className="auth-popup-close" onClick={handleClose}>
          <X size={24} />
        </button>
        <div className="auth-popup-content">
          <h2>🎉 Unlock Exclusive Deals!</h2>
          <p>Join thousands of shoppers and get personalized recommendations, save favorites, and never miss amazing discounts!</p>
          <button className="auth-popup-button" onClick={handleLoginClick}>
            Get Started Now
          </button>
          <button className="auth-popup-later" onClick={handleClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </>
  );
};

export default AuthPopup;
