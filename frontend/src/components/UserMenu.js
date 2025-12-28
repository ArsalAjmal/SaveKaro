import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import '../styles/UserMenu.css';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const handleLoginClick = () => {
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        className="user-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
      >
        <FiUser className="user-menu__icon" />
        <span className="user-menu__label">
          {isAuthenticated && user ? user.name : 'My Account'}
        </span>
      </button>

      {isOpen && (
        <div className="user-menu__dropdown">
          {isAuthenticated && user ? (
            <>
              <div className="user-menu__header">
                <div className="user-menu__avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-menu__info">
                  <div className="user-menu__user-name">{user.name}</div>
                  <div className="user-menu__user-email">{user.email}</div>
                  {!user.is_verified && (
                    <div className="user-menu__verified-badge">
                      Email not verified
                    </div>
                  )}
                </div>
              </div>

              <div className="user-menu__divider" />

              <Link
                to="/my-account"
                className="user-menu__item"
                onClick={() => setIsOpen(false)}
              >
                <FiSettings className="user-menu__item-icon" />
                <span>My Account</span>
              </Link>

              <div className="user-menu__divider" />

              <button className="user-menu__item" onClick={handleLogout}>
                <FiLogOut className="user-menu__item-icon" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <div className="user-menu__guest">
                <p className="user-menu__guest-text">
                  Sign in to access your account and favorites
                </p>
                <button className="user-menu__login-btn" onClick={handleLoginClick}>
                  Sign In / Register
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserMenu;

