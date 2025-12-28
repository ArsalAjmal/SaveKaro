import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiExternalLink, FiShoppingBag, FiCheck, FiChevronDown } from 'react-icons/fi';
import ProductReviewsCarousel from './ProductReviewsCarousel';
import RelatedProducts from './RelatedProducts';
import ConfettiButton from './ConfettiButton';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, setShowAuthPopup } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [accordionOpen, setAccordionOpen] = useState({
    description: false,
    details: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setImageLoading(true);
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      console.log('Fetching product with ID:', id);
      
      // Fetch single product by ID from new endpoint
      const response = await axios.get(`${API_URL}/api/products/${id}`);
      const foundProduct = response.data;
      
      if (foundProduct) {
        console.log('Found product:', foundProduct.title);
        setProduct(foundProduct);
        
        // Check if in favorites by fetching from API
        if (isAuthenticated) {
          try {
            const token = localStorage.getItem('token');
            const favResponse = await axios.get('http://localhost:8000/api/auth/favorites', {
              headers: { Authorization: `Bearer ${token}` }
            });
            const favoriteIds = favResponse.data.favorites.map(fav => fav._id);
            setIsFavorite(favoriteIds.includes(id));
          } catch (error) {
            console.error('Error fetching favorites:', error);
            setIsFavorite(false);
          }
        } else {
          const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
          setIsFavorite(favorites.includes(id));
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      if (error.response?.status === 404) {
        console.error('Product not found with ID:', id);
      }
      setLoading(false);
      navigate('/');
    }
  };

  const toggleFavorite = async () => {
    // Check if user is logged in
    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (isFavorite) {
        // Remove from favorites
        await axios.post(
          'http://localhost:8000/api/auth/favorites/remove',
          { product_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(false);
      } else {
        // Add to favorites
        await axios.post(
          'http://localhost:8000/api/auth/favorites/add',
          { product_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Fallback to localStorage if API fails
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      if (isFavorite) {
        const updated = favorites.filter(fav => fav !== id);
        localStorage.setItem('favorites', JSON.stringify(updated));
        setIsFavorite(false);
      } else {
        favorites.push(id);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        setIsFavorite(true);
      }
    }
  };

  const handleFavoriteClick = () => {
    const wasNotFavorite = !isFavorite;
    toggleFavorite();
    // Return true only if we're adding to favorites (trigger confetti)
    return wasNotFavorite;
  };

  const handleBuyNow = () => {
    if (product && product.url) {
      window.open(product.url, '_blank');
    }
  };

  // Get available sizes from variants
  const getAvailableSizes = () => {
    if (!product || !product.variants || product.variants.length === 0) {
      return [];
    }
    
    const sizeMap = new Map();
    
    product.variants
      .filter(v => v.size) // Include all sizes, not just in stock
      .forEach(v => {
        const sizeStr = v.size.toString();
        
        // Extract standard sizes (XS, S, M, L, XL, XXL, etc.)
        const sizeMatch = sizeStr.match(/\b(XXS|XS|S|M|L|XL|XXL|2XL|3XL|4XL)\b/i);
        
        if (sizeMatch) {
          const standardSize = sizeMatch[0].toUpperCase();
          
          if (!sizeMap.has(standardSize)) {
            sizeMap.set(standardSize, {
              size: standardSize,
              inStock: v.in_stock,
              price: v.price || product.price,
              inventory: v.inventory_quantity || 0
            });
          } else {
            // If size exists, update stock status (if any variant is in stock, mark as in stock)
            const existing = sizeMap.get(standardSize);
            existing.inStock = existing.inStock || v.in_stock;
            existing.inventory += (v.inventory_quantity || 0);
          }
        }
      });
    
    // Sort sizes in standard order
    const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL'];
    return Array.from(sizeMap.values()).sort((a, b) => {
      return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
    });
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const availableSizes = getAvailableSizes();

  return (
    <div className="product-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <Link to="/" className="breadcrumb-link">Home</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{product.title}</span>
      </nav>

      {/* Product Details Section */}
      <div className="product-detail-container">
        {/* Product Images */}
        <div className="product-images-section">
          <div className="product-main-image">
            {imageLoading && (
              <div className="image-loading-overlay">
                <div className="image-loading-spinner"></div>
              </div>
            )}
            <img 
              key={product._id}
              src={product.image_url || '/placeholder.png'} 
              alt={product.title}
              loading="eager"
              onLoad={() => setTimeout(() => setImageLoading(false), 300)}
              onError={() => setImageLoading(false)}
              style={{ opacity: imageLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}
            />
            {product.discount_percent > 0 && (
              <div className="product-detail-badge group">
                -{product.discount_percent}% OFF
                <div className="shine-effect" />
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h1 className="product-detail-title">{product.title}</h1>
          
          {/* Price Section */}
          <div className="product-pricing-section">
            <div className="product-current-price">
              PKR {product.price?.toLocaleString() || 'N/A'}
            </div>
            {product.original_price && product.original_price > product.price && (
              <div className="product-original-price">
                PKR {product.original_price.toLocaleString()}
              </div>
            )}
          </div>

          {/* Available Sizes */}
          {availableSizes.length > 0 && (
            <div className="product-sizes-section">
              <h3 className="section-title">Available Sizes</h3>
              <div className="sizes-grid">
                {availableSizes.map((sizeInfo, index) => (
                  <button
                    key={index}
                    className={`size-option ${selectedSize === sizeInfo.size ? 'selected' : ''} ${!sizeInfo.inStock ? 'out-of-stock' : ''}`}
                    onClick={() => sizeInfo.inStock && setSelectedSize(sizeInfo.size)}
                    disabled={!sizeInfo.inStock}
                  >
                    <span className="size-label">{sizeInfo.size}</span>
                    {sizeInfo.inStock && sizeInfo.inventory > 0 && sizeInfo.inventory < 5 && (
                      <span className="size-stock">Only {sizeInfo.inventory} left</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="product-actions">
            <button 
              className="btn-buy-now"
              onClick={handleBuyNow}
            >
              <FiExternalLink />
              Buy on {product.brand} Website
            </button>
            <ConfettiButton 
              className={`btn-favorite ${isFavorite ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              confettiOptions={{
                particleCount: 50,
                spread: 60,
                colors: ['#FF4444', '#FF6B9D', '#FFB6C1', '#FF1744'],
                startVelocity: 30,
                gravity: 0.8,
              }}
            >
              <FiHeart fill={isFavorite ? 'currentColor' : 'none'} />
              {isFavorite ? 'Saved' : 'Save'}
            </ConfettiButton>
          </div>

          {/* Product Info Tags */}
          <div className="product-meta-tags">
            <div className="meta-tag">
              <FiCheck /> Authentic Product
            </div>
            <div className="meta-tag">
              <FiShoppingBag /> Direct Brand Link
            </div>
            {product.gender && (
              <div className="meta-tag">
                {product.gender.charAt(0).toUpperCase() + product.gender.slice(1)}'s Fashion
              </div>
            )}
          </div>

          {/* Product Description - Accordion */}
          <div className="product-accordion">
            <button 
              className={`accordion-header ${accordionOpen.description ? 'active' : ''}`}
              onClick={() => setAccordionOpen({...accordionOpen, description: !accordionOpen.description})}
            >
              <span>Product Description</span>
              <FiChevronDown className={`accordion-icon ${accordionOpen.description ? 'rotated' : ''}`} />
            </button>
            <div className={`accordion-content ${accordionOpen.description ? 'open' : ''}`}>
              <div className="product-description">
                {product.tags && product.tags.length > 0 ? (
                  <>
                    <p>
                      Discover this stunning {product.category || 'item'} from {product.brand}. 
                      Perfect for {product.gender || 'everyone'} who appreciate quality and style.
                    </p>
                    <ul className="product-tags-list">
                      {product.tags.slice(0, 4).map((tag, index) => (
                        <li key={index}>• {tag}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>
                    Premium quality {product.category || 'product'} from {product.brand}. 
                    Crafted with attention to detail and designed for comfort and style.
                    {product.discount_percent > 0 && (
                      <> Now available at {product.discount_percent}% discount!</>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info - Accordion */}
          <div className="product-accordion">
            <button 
              className={`accordion-header ${accordionOpen.details ? 'active' : ''}`}
              onClick={() => setAccordionOpen({...accordionOpen, details: !accordionOpen.details})}
            >
              <span>Product Details</span>
              <FiChevronDown className={`accordion-icon ${accordionOpen.details ? 'rotated' : ''}`} />
            </button>
            <div className={`accordion-content ${accordionOpen.details ? 'open' : ''}`}>
              <div className="product-additional-info">
                <div className="info-row">
                  <span className="info-label">Brand:</span>
                  <span className="info-value">{product.brand}</span>
                </div>
                {product.category && (
                  <div className="info-row">
                    <span className="info-label">Category:</span>
                    <span className="info-value">{product.category}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="info-label">Currency:</span>
                  <span className="info-value">{product.currency || 'PKR'}</span>
                </div>
                {product.source && (
                  <div className="info-row">
                    <span className="info-label">Source:</span>
                    <span className="info-value">{product.source}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="product-reviews-section">
        <h2 className="section-heading">Customer Reviews</h2>
        <ProductReviewsCarousel productName={product.title} brand={product.brand} />
      </section>

      {/* Related Products Section */}
      <RelatedProducts 
        category={product.category} 
        brand={product.brand}
        currentProductId={id}
        gender={product.gender}
      />
    </div>
  );
};

export default ProductDetailPage;
