import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Favorites.css';

const Favorites = () => {
  const { user, isAuthenticated, setShowAuthPopup } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }
    fetchFavorites();
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/auth/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(response.data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
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
      setFavorites(favorites.filter(p => p._id !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="favorites">
        <div className="favorites__container">
          <div className="favorites__loading">Loading your favorites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites">
      <div className="favorites__container">
        <div className="favorites__header">
          <h1 className="favorites__title">
            <FiHeart /> My Favorites
          </h1>
          <p className="favorites__subtitle">
            {favorites.length} {favorites.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="favorites__empty">
            <FiHeart size={64} />
            <h2>No favorites yet</h2>
            <p>Start adding products you love to see them here</p>
            <Link to="/" className="favorites__shop-btn">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="favorites__grid">
            {favorites.map((product) => (
              <div key={product._id} className="favorites__card">
                <button
                  className="favorites__remove"
                  onClick={() => removeFavorite(product._id)}
                  aria-label="Remove from favorites"
                >
                  <FiTrash2 />
                </button>

                <Link to={`/product/${product._id}`} className="favorites__link">
                  <div className="favorites__image-wrapper">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="favorites__image"
                      />
                    ) : (
                      <div className="favorites__no-image">No Image</div>
                    )}
                    {product.discount_percent > 0 && (
                      <div className="favorites__discount">
                        -{product.discount_percent}%
                      </div>
                    )}
                  </div>

                  <div className="favorites__info">
                    <div className="favorites__brand">{product.brand}</div>
                    <h3 className="favorites__product-title">{product.title}</h3>
                    <div className="favorites__pricing">
                      <span className="favorites__price">
                        PKR {product.price?.toLocaleString()}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="favorites__original-price">
                          PKR {product.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <button
                  className="favorites__buy-btn"
                  onClick={() => window.open(product.url, '_blank')}
                >
                  <FiShoppingBag /> Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

