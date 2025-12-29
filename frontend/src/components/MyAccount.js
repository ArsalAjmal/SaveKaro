import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiLock, FiHeart,
  FiEdit2, FiCheck, FiX, FiShield
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import FavoritesSkeleton from './FavoritesSkeleton';
import FavoritesCarousel from './FavoritesCarousel';
import '../styles/MyAccount.css';
import '../styles/FavoritesSection.css';

const MyAccount = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [verifyingEmail, setVerifyingEmail] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (activeTab === 'favorites' && isAuthenticated) {
      fetchFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isAuthenticated]);

  const fetchFavorites = async () => {
    setLoadingFavorites(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/auth/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/auth/favorites/remove',
        { product_id: productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from local state without refetching
      setFavorites(favorites.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8000/api/auth/update-profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to update profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8000/api/auth/change-password',
        {
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to change password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setVerifyingEmail(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/auth/resend-verification',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage({ 
        type: 'success', 
        text: 'Verification email sent! Please check your email inbox.' 
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Failed to send verification email'
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  if (!user) return null;

  return (
    <div className="my-account">
      <div className="my-account__container">
        {/* Sidebar */}
        <aside className="my-account__sidebar">
          <div className="my-account__user-card">
            <div className="my-account__avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 className="my-account__user-name">{user.name}</h3>
            <p className="my-account__user-email">{user.email}</p>
            {user.is_verified ? (
              <span className="my-account__verified">
                <FiShield /> Verified
              </span>
            ) : (
              <span className="my-account__unverified">
                Email not verified
              </span>
            )}
          </div>

          <nav className="my-account__nav">
            <button
              className={`my-account__nav-item ${
                activeTab === 'profile' ? 'active' : ''
              }`}
              onClick={() => {
                setActiveTab('profile');
                setMessage({ type: '', text: '' });
              }}
            >
              <FiUser /> Profile
            </button>
            <button
              className={`my-account__nav-item ${
                activeTab === 'security' ? 'active' : ''
              }`}
              onClick={() => {
                setActiveTab('security');
                setMessage({ type: '', text: '' });
              }}
            >
              <FiLock /> Security
            </button>
            <button
              className={`my-account__nav-item ${
                activeTab === 'favorites' ? 'active' : ''
              }`}
              onClick={() => {
                setActiveTab('favorites');
                setMessage({ type: '', text: '' });
              }}
            >
              <FiHeart /> Favorites
            </button>
          </nav>

          <button className="my-account__logout" onClick={logout}>
            Logout
          </button>
        </aside>

        {/* Main Content */}
        <main className="my-account__content">
          {message.text && (
            <div className={`my-account__message my-account__message--${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="my-account__section">
              <div className="my-account__header">
                <h2 className="my-account__title">Profile Information</h2>
                {!isEditing && (
                  <button
                    className="my-account__edit-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <FiEdit2 /> Edit
                  </button>
                )}
              </div>

              {isEditing ? (
                <form className="my-account__form" onSubmit={handleUpdate}>
                  <div className="my-account__form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="my-account__form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      disabled
                    />
                    <small>Email cannot be changed</small>
                  </div>

                  <div className="my-account__form-actions">
                    <button
                      type="button"
                      className="my-account__btn my-account__btn--secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user.name,
                          email: user.email
                        });
                      }}
                      disabled={loading}
                    >
                      <FiX /> Cancel
                    </button>
                    <button
                      type="submit"
                      className="my-account__btn my-account__btn--primary"
                      disabled={loading}
                    >
                      <FiCheck /> {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="my-account__info-grid">
                  <div className="my-account__info-item">
                    <label>Name</label>
                    <p>{user.name}</p>
                  </div>
                  <div className="my-account__info-item">
                    <label>Email</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="my-account__info-item">
                    <label>Account Status</label>
                    <p>{user.is_verified ? 'Verified' : 'Unverified'}</p>
                  </div>
                  <div className="my-account__info-item">
                    <label>Member Since</label>
                    <p>{new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {/* Email Verification Section */}
              {!user.is_verified && (
                <div className="my-account__verification-section">
                  <div className="my-account__verification-notice">
                    <FiShield className="my-account__verification-icon" />
                    <div>
                      <h4>Verify Your Email</h4>
                      <p>Please verify your email address to unlock all features and secure your account.</p>
                    </div>
                  </div>
                  <button
                    className="my-account__btn my-account__btn--primary"
                    onClick={handleResendVerification}
                    disabled={verifyingEmail}
                  >
                    {verifyingEmail ? 'Sending...' : 'Send Verification Email'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="my-account__section">
              <h2 className="my-account__title">Change Password</h2>

              <form className="my-account__form" onSubmit={handlePasswordChange}>
                <div className="my-account__form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <div className="my-account__form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })
                    }
                    required
                    minLength={6}
                  />
                </div>

                <div className="my-account__form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })
                    }
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="my-account__btn my-account__btn--primary"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="my-account__section">
              {loadingFavorites ? (
                <FavoritesSkeleton count={12} />
              ) : favorites.length === 0 ? (
                <div className="my-account__empty">
                  <FiHeart size={48} />
                  <p>No favorite products yet</p>
                  <span 
                    className="my-account__browse-link"
                    onClick={() => navigate('/')}
                  >
                    Browse Products
                  </span>
                </div>
              ) : (
                <FavoritesCarousel 
                  favorites={favorites} 
                  onRemove={removeFavorite}
                />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyAccount;

