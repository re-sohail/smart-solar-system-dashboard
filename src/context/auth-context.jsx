import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state with cookie check to avoid flash of unauthenticated state
  const [isAuth, setIsAuth] = useState(() => !!Cookies.get('token'));

  // Add cookie change synchronization
  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token');
      setIsAuth(!!token);
    };

    checkAuth();

    const syncLogout = e => {
      if (e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', syncLogout);
    return () => window.removeEventListener('storage', syncLogout);
  }, []);

  const login = (token, options = {}) => {
    Cookies.set('token', token, options);
    setIsAuth(true);
  };

  const logout = () => {
    Cookies.remove('token');
    setIsAuth(false);
  };

  return <AuthContext.Provider value={{ isAuth, login, logout }}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
