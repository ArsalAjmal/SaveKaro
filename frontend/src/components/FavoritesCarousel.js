import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import '../styles/FavoritesCarousel.css';

const FavoritesCarousel = ({ favorites, onRemove }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const itemsPerView = {
    mobile: 2,
    tablet: 3,
    desktop: 5
  };

  const getItemsPerView = () => {
    if (window.innerWidth < 640) return itemsPerView.mobile;
    if (window.innerWidth < 1024) return itemsPerView.tablet;
    return itemsPerView.desktop;
  };

  const [itemsVisible, setItemsVisible] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      const items = getItemsPerView();
      setItemsVisible(items);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxIndex = Math.max(0, favorites.length - itemsVisible);

  const nextSlide = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="favorites-carousel">
      <div className="favorites-carousel__header">
        <h3 className="favorites-carousel__title">My Favorites</h3>
        <div className="favorites-carousel__controls">
          <button
            className="favorites-carousel__nav-btn"
            onClick={prevSlide}
            disabled={currentIndex === 0}
          >
            <FiChevronLeft />
          </button>
          <span className="favorites-carousel__count">
            {currentIndex + 1} - {Math.min(currentIndex + itemsVisible, favorites.length)} of {favorites.length}
          </span>
          <button
            className="favorites-carousel__nav-btn"
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
          >
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div
        className="favorites-carousel__container"
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="favorites-carousel__track"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsVisible)}%)`
          }}
        >
          {favorites.map((product) => (
            <div key={product._id} className="favorites-carousel__item">
              <div className="favorites-carousel__card">
                <button
                  className="favorites-carousel__remove"
                  onClick={(e) => {
                    e.preventDefault();
                    onRemove(product._id);
                  }}
                  aria-label="Remove from favorites"
                >
                  <FiTrash2 />
                </button>

                <Link to={`/product/${product._id}`} className="favorites-carousel__link">
                  <div className="favorites-carousel__image-wrapper">
                    {product.discount_percent > 0 && (
                      <div className="favorites-carousel__badge">
                        -{product.discount_percent}%
                      </div>
                    )}
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="favorites-carousel__image"
                    />
                  </div>

                  <div className="favorites-carousel__info">
                    <p className="favorites-carousel__brand">{product.brand}</p>
                    <h4 className="favorites-carousel__product-title">{product.title}</h4>
                    <div className="favorites-carousel__pricing">
                      <span className="favorites-carousel__price">
                        PKR {product.price?.toLocaleString()}
                      </span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="favorites-carousel__original-price">
                          PKR {product.original_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="favorites-carousel__dots">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={`favorites-carousel__dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FavoritesCarousel;

