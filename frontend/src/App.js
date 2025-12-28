import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lenis from 'lenis';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CategoryPage from './components/CategoryPage';
import ProductDetailPage from './components/ProductDetailPage';
import LoginSignup from './components/LoginSignup';
import MyAccount from './components/MyAccount';
import Favorites from './components/Favorites';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import Footer from './components/Footer';
import NavigationLoader from './components/NavigationLoader';
import AuthPopup from './components/AuthPopup';
import AuthTimer from './components/AuthTimer';
import ChatWidget from './components/ChatWidget';

function App() {
  const lenisRef = useRef(null);

  useEffect(() => {
    console.log('=== APP.JS MOUNTED ===');
    
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      window.lenis = null;
    };
  }, []);

  console.log('App.js rendering...');

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavigationLoader />
          <AuthTimer />
          <AuthPopup />
          <Header />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/deals" element={<HomePage />} />
              <Route path="/login" element={<LoginSignup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/my-account" element={<MyAccount />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/men/:category" element={<CategoryPage />} />
              <Route path="/women/:category" element={<CategoryPage />} />
              <Route path="/category/:category" element={<CategoryPage />} />
              <Route path="/men" element={<CategoryPage />} />
              <Route path="/women" element={<CategoryPage />} />
              <Route path="/jeans" element={<CategoryPage />} />
              <Route path="/pants" element={<CategoryPage />} />
              <Route path="/jackets" element={<CategoryPage />} />
              <Route path="/hoodies" element={<CategoryPage />} />
              <Route path="/shirts" element={<CategoryPage />} />
              <Route path="/sweaters" element={<CategoryPage />} />
              <Route path="/eastern" element={<CategoryPage />} />
              <Route path="/western" element={<CategoryPage />} />
            </Routes>
          </div>
          <ChatWidget />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
