import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthTimer = () => {
  const { isAuthenticated, setShowAuthPopup } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('=== AUTH TIMER MOUNTED ===');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('location:', location.pathname);
    
    // Don't show popup on auth-related pages
    const authPages = ['/login', '/forgot-password', '/reset-password', '/verify-email'];
    if (isAuthenticated || authPages.includes(location.pathname)) {
      console.log('SKIPPED - authenticated or on auth page');
      return;
    }

    const hasShown = sessionStorage.getItem('hasShownAuthPopup');
    if (hasShown === 'true') {
      console.log('SKIPPED - already shown');
      return;
    }

    console.log('✅ STARTING 5 SECOND TIMER...');
    
    const timer = setTimeout(() => {
      console.log('🎉 TIMER FIRED - SHOWING POPUP');
      setShowAuthPopup(true);
      sessionStorage.setItem('hasShownAuthPopup', 'true');
    }, 5000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, location.pathname, setShowAuthPopup]);

  return null;
};

export default AuthTimer;
