import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/FeaturedBrandsCarousel.css';

/**
 * FeaturedBrandsCarousel - A 3D carousel that displays 6 brands at once
 * @param {Object} props
 * @param {Array} props.slides - Array of brand objects with id, src, alt, href
 * @param {boolean} props.autoplay - Enable autoplay (default: true)
 * @param {number} props.delay - Autoplay delay in seconds (default: 3)
 * @param {boolean} props.pauseOnHover - Pause on hover (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const FeaturedBrandsCarousel = ({
  slides,
  autoplay = true,
  delay = 3,
  pauseOnHover = true,
  className = '',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoplayIntervalRef = useRef(null);
  const total = slides.length;

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const swipeThreshold = 50;

  // Navigation function
  const navigate = useCallback((direction) => {
    setActiveIndex(current => {
      if (direction === 'next') {
        return (current + 1) % total;
      } else {
        return (current - 1 + total) % total;
      }
    });
  }, [total]);

  // Autoplay functions
  const startAutoplay = useCallback(() => {
    if (autoplay && total > 1) {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
      autoplayIntervalRef.current = window.setInterval(() => {
        navigate('next');
      }, delay * 1000);
    }
  }, [autoplay, delay, navigate, total]);

  const stopAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoplay();
    return () => { stopAutoplay(); };
  }, [startAutoplay, stopAutoplay]);

  // Mouse/Touch handlers
  const handleMouseEnter = () => {
    if (autoplay && pauseOnHover) {
      stopAutoplay();
    }
  };

  const handleExit = (e) => {
    if (autoplay && pauseOnHover) {
      startAutoplay();
    }
    if (isDragging) {
      handleEnd(e.clientX);
    }
  };

  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    stopAutoplay();
  };

  const handleEnd = (clientX) => {
    if (!isDragging) return;
    const distance = clientX - startX;
    if (Math.abs(distance) > swipeThreshold) {
      if (distance < 0) {
        navigate('next');
      } else {
        navigate('prev');
      }
    }
    setIsDragging(false);
    setStartX(0);
  };

  const onMouseDown = (e) => handleStart(e.clientX);
  const onMouseUp = (e) => {
    handleEnd(e.clientX);
    startAutoplay();
  };

  const onTouchStart = (e) => handleStart(e.touches[0].clientX);
  const onTouchEnd = (e) => {
    handleEnd(e.changedTouches[0].clientX);
    startAutoplay();
  };

  // Get position class for each slide (supporting 6 visible items)
  const getSlidePositionClass = (index) => {
    const diff = (index - activeIndex + total) % total;
    
    if (diff === 0) return 'center'; // Center (active)
    if (diff === 1) return 'right-1'; // Right 1
    if (diff === 2) return 'right-2'; // Right 2
    if (diff === 3) return 'right-3'; // Right 3 (hidden on smaller screens)
    if (diff === total - 1) return 'left-1'; // Left 1
    if (diff === total - 2) return 'left-2'; // Left 2
    if (diff === total - 3) return 'left-3'; // Left 3 (hidden on smaller screens)
    
    return 'hidden';
  };

  return (
    <div
      className={`featured-brands-carousel ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleExit}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="featured-brands-carousel__wrapper">
        {slides.map((slide, index) => {
          const positionClass = getSlidePositionClass(index);
          const isActive = index === activeIndex;
          
          return (
            <div
              key={slide.id}
              className={`featured-brands-carousel__slide featured-brands-carousel__slide--${positionClass} ${
                isActive ? 'featured-brands-carousel__slide--active' : ''
              }`}
              data-index={index}
            >
              <a 
                href={slide.href}
                className="featured-brands-carousel__link"
                onClick={(e) => {
                  // Prevent navigation during drag
                  if (isDragging) {
                    e.preventDefault();
                  }
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt || `Brand ${index + 1}`}
                  className="featured-brands-carousel__image"
                  draggable="false"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `https://placehold.co/350x200/dc2626/ffffff?text=${encodeURIComponent(slide.alt || 'Brand')}`;
                  }}
                />
              </a>
            </div>
          );
        })}
      </div>

      {/* Indicator Dots */}
      <div className="featured-brands-carousel__indicators">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`featured-brands-carousel__dot ${
              index === activeIndex ? 'featured-brands-carousel__dot--active' : ''
            }`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to brand ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedBrandsCarousel;

