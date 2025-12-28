import React, { useEffect, useState, useRef } from 'react';
import '../styles/ReviewCarousel.css';
import axios from 'axios';

// Helper: Generate a bogus review for a product
function makeBogusReview(product, idx) {
  const bogusReviews = [
    {
      text: 'Excellent quality and fast delivery. Highly recommended!',
      reviewer: 'Ayesha Noor',
      city: 'Lahore',
      rating: 5,
    },
    {
      text: 'Loved the fabric and fit. Will shop again!',
      reviewer: 'Faysal Kath',
      city: 'Karachi',
      rating: 5,
    },
    {
      text: 'Customer service was very helpful. Great experience.',
      reviewer: 'Hira Ahmed',
      city: 'Islamabad',
      rating: 4,
    },
    {
      text: 'Amazing discounts and quality. My new favorite brand!',
      reviewer: 'Zahid Khan',
      city: 'Rawalpindi',
      rating: 5,
    },
    {
      text: 'Received my order on time. Product as described.',
      reviewer: 'Maria Ali',
      city: 'Multan',
      rating: 5,
    },
  ];
  const review = bogusReviews[idx % bogusReviews.length];
  return {
    ...review,
    brand: product.brand,
    productImg: product.image_url,
  };
}

const ThreeDReviewCarousel = ({ limit = 7, autoplay = true, delay = 3 }) => {
  const [reviews, setReviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Fetch products for review images/brands
    const fetchProducts = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const res = await axios.get(`${API_URL}/api/products?limit=${limit}`);
        const products = res.data.products || [];
        setReviews(products.map((p, i) => makeBogusReview(p, i)));
      } catch (e) {
        setReviews([]);
      }
    };
    fetchProducts();
  }, [limit]);

  // Autoplay logic
  useEffect(() => {
    if (autoplay && !isPaused && reviews.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % reviews.length);
      }, delay * 1000);
    }
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [autoplay, isPaused, delay, reviews.length]);

  // 3D position logic (same as ThreeDImageCarousel)
  const getSlidePosition = (index) => {
    const total = reviews.length;
    const diff = (index - activeIndex + total) % total;
    if (diff === 0) return 'center';
    if (diff === 1 || diff === total - 1) return diff === 1 ? 'right' : 'left';
    if (diff === 2 || diff === total - 2) return diff === 2 ? 'far-right' : 'far-left';
    if (diff === 3 || diff === total - 3) return diff === 3 ? 'far-far-right' : 'far-far-left';
    return 'hidden';
  };

  return (
    <div 
      className="carousel-3d-container review-3d-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <h2 className="review-carousel-title">REVIEWS</h2>
      <div className="carousel-3d-wrapper">
        {reviews.map((review, idx) => {
          const position = getSlidePosition(idx);
          const isActive = idx === activeIndex;
          return (
            <div
              key={idx}
              className={`carousel-3d-slide review-3d-slide carousel-3d-slide--${position} ${isActive ? 'carousel-3d-slide--active' : ''}`}
              onClick={() => !isActive && setActiveIndex(idx)}
            >
              <div className="review-stars">{'★★★★★'.slice(0, review.rating)}</div>
              <div className="review-text">{review.text}</div>
              <div className="review-meta">
                <img
                  src={review.productImg}
                  alt="product"
                  className="review-product-img"
                  style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #eee', background: '#fff' }}
                />
                <div>
                  <div className="reviewer-name">{review.reviewer}</div>
                  <div className="reviewer-city">{review.city}</div>
                  <div className="review-brand">{review.brand}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="carousel-3d-dots">
        {reviews.map((_, idx) => (
          <button
            key={idx}
            className={`carousel-3d-dot ${idx === activeIndex ? 'carousel-3d-dot--active' : ''}`}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to review ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThreeDReviewCarousel;
