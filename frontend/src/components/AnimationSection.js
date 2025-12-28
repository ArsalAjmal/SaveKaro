import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AnimationSection.css';

const AnimationSection = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate('/men?category=Jackets');
  };

  return (
    <section className="animation-section">
      <div className="animation-video-container">
        <video 
          className="animation-video"
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="/animationsection.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        <div className="animation-overlay">
          <button className="shop-now-btn" onClick={handleShopNow}>SHOP NOW</button>
        </div>
      </div>
    </section>
  );
};

export default AnimationSection;
