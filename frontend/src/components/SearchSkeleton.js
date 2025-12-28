import React from 'react';
import '../styles/SearchSkeleton.css';

const SearchSkeleton = () => {
  return (
    <div className="search-results-grid">
      <div className="search-results-section">
        <div className="skeleton-title"></div>
        <ul className="search-suggestions-list">
          {[1, 2, 3, 4, 5].map((item) => (
            <li key={item} className="skeleton-suggestion-item">
              <div className="skeleton-line"></div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="search-results-section">
        <div className="skeleton-title"></div>
        <div className="search-products-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <div key={item} className="skeleton-product-card">
              <div className="skeleton-product-image"></div>
              <div className="skeleton-product-info">
                <div className="skeleton-line skeleton-line-short"></div>
                <div className="skeleton-line skeleton-line-medium"></div>
                <div className="skeleton-line skeleton-line-long"></div>
                <div className="skeleton-line skeleton-line-short"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchSkeleton;
