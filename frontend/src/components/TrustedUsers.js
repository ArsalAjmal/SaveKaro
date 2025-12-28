import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import '../styles/TrustedUsers.css';

const CountUp = ({ value, duration = 2, separator = ',', suffix = '', className = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const increment = value / (duration * 60); // 60 FPS
    let currentCount = 0;

    const timer = setInterval(() => {
      currentCount += increment;
      if (currentCount >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(currentCount));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isVisible, value, duration]);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  return (
    <span ref={elementRef} className={className}>
      {formatNumber(count)}{suffix}
    </span>
  );
};

const TrustedUsers = ({
  avatars = [],
  rating = 5,
  totalUsersText = 1000,
  caption = 'Trusted by',
  className = '',
  starColorClass = 'text-yellow-400',
  ringColors = []
}) => {
  // Default avatars if none provided
  const defaultAvatars = [
    'https://ui-avatars.com/api/?name=Ali+Hassan&background=FF6B9D&color=fff',
    'https://ui-avatars.com/api/?name=Sara+Ahmed&background=4A90E2&color=fff',
    'https://ui-avatars.com/api/?name=Usman+Khan&background=9B59B6&color=fff',
    'https://ui-avatars.com/api/?name=Ayesha+Malik&background=1ABC9C&color=fff',
    'https://ui-avatars.com/api/?name=Zain+Abbas&background=E74C3C&color=fff'
  ];

  const displayAvatars = avatars.length > 0 ? avatars : defaultAvatars;
  const defaultRingColors = ['ring-pink-500', 'ring-blue-500', 'ring-purple-500', 'ring-green-500', 'ring-red-500'];

  return (
    <section className="trusted-users-section">
      <div className="trusted-users-container">
        <div className="trusted-avatars">
          {displayAvatars.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`User ${i + 1}`}
              className="avatar"
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>

        <div className="trusted-stats">
          <div className="trusted-rating">
            <div className="rating-stars">
              {Array.from({ length: rating }).map((_, i) => (
                <Star key={i} fill="currentColor" className="star-icon" />
              ))}
            </div>
          </div>
          <div className="trusted-text">
            <span>Trusted by </span>
            <span className="user-count">
              <CountUp
                value={totalUsersText}
                duration={2}
                separator=","
                suffix="+"
              />
            </span>
            <span> Happy Users</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedUsers;
