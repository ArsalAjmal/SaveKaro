import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);

  useEffect(() => {
    console.log('AuthContext: Initializing...');
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      console.log('AuthContext: Found stored user and token');
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      console.log('AuthContext: No stored user found');
    }
  }, []);

  const login = (userData, token) => {
    console.log('AuthContext: Logging in user:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setShowAuthPopup(false);
  };

  const logout = () => {
    console.log('AuthContext: Logging out user');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('hasShownAuthPopup');
  };

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data;
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('AuthContext: User data refreshed');
    } catch (error) {
      console.error('AuthContext: Failed to refresh user data:', error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    showAuthPopup,
    setShowAuthPopup,
    login,
    logout,
    refreshUser,
  };

  console.log('AuthContext rendering with:', { isAuthenticated, showAuthPopup });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
