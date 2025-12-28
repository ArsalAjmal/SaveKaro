import React, { useEffect, useRef, useState } from 'react';
import '../styles/ReviewCarousel.css';

// Bogus review data (replace with real data if available)
const reviews = [
  {
    brand: 'Bonanza Satrangi',
    productImg: '/public/mybonanza.webp',
    reviewer: 'Zahid Khan',
    city: 'Islamabad',
    rating: 5,
    text: 'Excellent Product Quality. Appreciated on timely response. Highly Recommended.'
  },
  {
    brand: 'Limelight',
    productImg: '/public/mylimelight.webp',
    reviewer: 'Faysal Kath',
    city: 'Karachi',
    rating: 5,
    text: '100% worth it .. their denim joggers transferred me to comfort zone in my daily work routine. Would highly recommend it. Jazak Allah Khair.'
  },
  {
    brand: 'Outfitters',
    productImg: '/public/foroutfitters.webp',
    reviewer: 'Hira Ahmed',
    city: 'Karachi',
    rating: 5,
    text: 'Received the parcel. Fabulous quality and nice stuff. Customer service is also very cooperative. Highly recommend.'
  },
  {
    brand: 'Sapphire',
    productImg: '/public/sapphire.webp',
    reviewer: 'Ayesha Noor',
    city: 'Lahore',
    rating: 4,
    text: 'Nice fabric and fast delivery. Will shop again!'
  }
];

const ReviewCarousel = () => {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef(null);
  const delay = 3500;

  useEffect(() => {
    timeoutRef.current = setTimeout(
      () => setCurrent((prev) => (prev + 1) % reviews.length),
      delay
    );
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  return (
    <div className="review-carousel-container">
      <h2 className="review-carousel-title">REVIEWS</h2>
      <div className="review-carousel">
        {reviews.map((review, idx) => (
          <div
            className={`review-card${idx === current ? ' active' : ''}`}
            key={idx}
            style={{ display: idx === current ? 'block' : 'none' }}
          >
            <div className="review-stars">{'★★★★★'.slice(0, review.rating)}</div>
            <div className="review-text">{review.text}</div>
            <div className="review-meta">
              <img
                src={review.productImg}
                alt="product"
                className="review-product-img"
              />
              <div>
                <div className="reviewer-name">{review.reviewer}</div>
                <div className="reviewer-city">{review.city}</div>
                <div className="review-brand">{review.brand}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="review-carousel-dots">
        {reviews.map((_, idx) => (
          <span
            key={idx}
            className={`dot${idx === current ? ' active' : ''}`}
            onClick={() => setCurrent(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default ReviewCarousel;
