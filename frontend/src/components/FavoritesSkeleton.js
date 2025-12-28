import React from 'react';
import '../styles/FavoritesSkeleton.css';

const FavoritesSkeleton = ({ count = 6 }) => {
  return (
    <div className="favorites__grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="favorites__skeleton-card">
          <div className="favorites__skeleton-image"></div>
          <div className="favorites__skeleton-info">
            <div className="favorites__skeleton-brand"></div>
            <div className="favorites__skeleton-title"></div>
            <div className="favorites__skeleton-title-short"></div>
            <div className="favorites__skeleton-pricing">
              <div className="favorites__skeleton-price"></div>
              <div className="favorites__skeleton-discount"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoritesSkeleton;

