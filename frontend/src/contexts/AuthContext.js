import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";
import constants from '../constants/index.js';
import { authService } from '../services/api';

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
  const [loading, setLoading] = useState(true);

  // Check token on mount và lấy user info
  useEffect(() => {
    const token = Cookies.get(constants.ACCESS_TOKEN_KEY) || localStorage.getItem('token');
    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response?.data || response?.user || response);
    } catch (error) {
      // Token invalid, clear it
      Cookies.remove(constants.ACCESS_TOKEN_KEY);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const token = response?.data?.token || response?.token;
    const userData = response?.data?.user || response?.user || response?.data;
    
    if (token) {
      Cookies.set(constants.ACCESS_TOKEN_KEY, token);
      localStorage.setItem('token', token);
    }
    if (userData) {
      setUser(userData);
    }
    return response;
  };

  const register = async (userData) => {
    const response = await authService.register(userData);
    const token = response?.data?.token || response?.token;
    const user = response?.data?.user || response?.user || response?.data;
    
    if (token) {
      Cookies.set(constants.ACCESS_TOKEN_KEY, token);
      localStorage.setItem('token', token);
    }
    if (user) {
      setUser(user);
    }
    return response;
  };

  const logout = () => {
    Cookies.remove(constants.ACCESS_TOKEN_KEY);
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const getUserRole = () => {
  const token = Cookies.get(constants.ACCESS_TOKEN_KEY) || localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.roles?.[0] || decoded.role || null;
  } catch (e) {
    return null;
  }
};

// Named export for direct context access in route wrappers
export { AuthContext };