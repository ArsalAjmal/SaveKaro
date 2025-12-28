import React from 'react';
import '../styles/ProductSkeleton.css';

const ProductSkeleton = ({ count = 12 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="product-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-brand"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-title short"></div>
            <div className="skeleton-price-row">
              <div className="skeleton-price"></div>
              <div className="skeleton-original-price"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;
