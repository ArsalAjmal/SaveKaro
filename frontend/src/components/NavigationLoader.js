import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/NavigationLoader.css';

const NavigationLoader = () => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Immediately scroll to top - multiple methods to ensure it works
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Also reset Lenis scroll position if it exists
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    }
    
    setLoading(true);
    
    const timer = setTimeout(() => {
      setLoading(false);
      // Double-check scroll position after loading
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      
      // Final check after a brief delay to ensure Lenis doesn't interfere
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (window.lenis) {
          window.lenis.scrollTo(0, { immediate: true });
        }
      }, 50);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div className="navigation-loader-overlay">
      <div className="navigation-loader-spinner"></div>
    </div>
  );
};

export default NavigationLoader;
