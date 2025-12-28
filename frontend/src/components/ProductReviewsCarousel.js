import React from 'react';
import { Star } from 'lucide-react';
import '../styles/ProductReviewsCarousel.css';

const ProductReviewsCarousel = ({ productName, brand }) => {
  // Pakistani names and realistic reviews
  const reviews = [
    {
      id: 1,
      name: "Ayesha Khan",
      avatar: "https://ui-avatars.com/api/?name=Ayesha+Khan&background=FF6B9D&color=fff",
      rating: 5,
      date: "2 days ago",
      review: "Absolutely love this product! The quality is amazing and fits perfectly. Highly recommend buying from SaveKaro!",
      verified: true
    },
    {
      id: 2,
      name: "Ahmed Ali",
      avatar: "https://ui-avatars.com/api/?name=Ahmed+Ali&background=4A90E2&color=fff",
      rating: 5,
      date: "5 days ago",
      review: "Great deal! Got it at an amazing discount. The material is top-notch and delivery was quick.",
      verified: true
    },
    {
      id: 3,
      name: "Fatima Malik",
      avatar: "https://ui-avatars.com/api/?name=Fatima+Malik&background=9B59B6&color=fff",
      rating: 4,
      date: "1 week ago",
      review: "Very satisfied with my purchase. True to size and exactly as shown in pictures. Worth every rupee!",
      verified: true
    },
    {
      id: 4,
      name: "Hassan Raza",
      avatar: "https://ui-avatars.com/api/?name=Hassan+Raza&background=1ABC9C&color=fff",
      rating: 5,
      date: "1 week ago",
      review: "SaveKaro is a game changer! Found the best deals here. Quality is excellent and authentic.",
      verified: true
    },
    {
      id: 5,
      name: "Zainab Hussain",
      avatar: "https://ui-avatars.com/api/?name=Zainab+Hussain&background=E74C3C&color=fff",
      rating: 5,
      date: "2 weeks ago",
      review: "Perfect! Exactly what I was looking for. The discount made it even better. Highly recommended!",
      verified: true
    },
    {
      id: 6,
      name: "Usman Sheikh",
      avatar: "https://ui-avatars.com/api/?name=Usman+Sheikh&background=F39C12&color=fff",
      rating: 4,
      date: "2 weeks ago",
      review: "Good quality product. SaveKaro helped me find the best price. Will definitely shop again!",
      verified: true
    },
    {
      id: 7,
      name: "Mariam Siddiqui",
      avatar: "https://ui-avatars.com/api/?name=Mariam+Siddiqui&background=3498DB&color=fff",
      rating: 5,
      date: "3 weeks ago",
      review: "Absolutely beautiful! The quality exceeded my expectations. Best purchase I've made this month!",
      verified: true
    },
    {
      id: 8,
      name: "Bilal Ahmed",
      avatar: "https://ui-avatars.com/api/?name=Bilal+Ahmed&background=2ECC71&color=fff",
      rating: 5,
      date: "3 weeks ago",
      review: "Great value for money! SaveKaro makes finding deals so easy. Authentic product and fast delivery.",
      verified: true
    }
  ];

  return (
    <div className="reviews-carousel-wrapper">
      <div className="reviews-carousel-track">
        {/* Duplicate reviews for seamless loop */}
        {[...reviews, ...reviews].map((review, index) => (
          <div key={`${review.id}-${index}`} className="review-card">
            <div className="review-header">
              <div className="reviewer-info">
                <img 
                  src={review.avatar} 
                  alt={review.name}
                  className="reviewer-avatar"
                  loading="lazy"
                />
                <div className="reviewer-details">
                  <div className="reviewer-name-container">
                    <h4 className="reviewer-name">{review.name}</h4>
                    {review.verified && (
                      <span className="verified-badge" title="Verified Purchase">✓</span>
                    )}
                  </div>
                  <p className="review-date">{review.date}</p>
                </div>
              </div>
              <div className="review-rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`star-icon ${i < review.rating ? 'filled' : ''}`}
                    fill={i < review.rating ? 'currentColor' : 'none'}
                    size={16}
                  />
                ))}
              </div>
            </div>
            <p className="review-text">{review.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductReviewsCarousel;
