import React from 'react';
import '../styles/ProductCarousel.css';

const ProductCarouselSkeleton = () => {
  return (
    <div className="product-carousel-wrapper">
      <div className="carousel-nav-btn carousel-nav-left skeleton-btn">‹</div>
      
      <div className="product-carousel-container">
        {[1, 2, 3, 4, 5, 6, 7].map((item) => (
          <div key={item} className="product-carousel-card skeleton-card">
            <div className="skeleton-product-image"></div>
            <div className="product-carousel-info">
              <div className="skeleton-line skeleton-line-long"></div>
              <div className="skeleton-line skeleton-line-short"></div>
              <div className="skeleton-sizes">
                <span className="skeleton-size-badge"></span>
                <span className="skeleton-size-badge"></span>
                <span className="skeleton-size-badge"></span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="carousel-nav-btn carousel-nav-right skeleton-btn">›</div>
    </div>
  );
};

export default ProductCarouselSkeleton;
