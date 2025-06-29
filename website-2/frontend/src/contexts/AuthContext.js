import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(sessionStorage.getItem('token'));

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = sessionStorage.getItem('token');
      if (storedToken) {
        try {
          const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(response.data.user);
          setToken(storedToken);
        } catch (error) {
          console.error('Auth check failed:', error);
          // Remove invalid token
          sessionStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, [API_URL]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      sessionStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      // Return user data with the response
      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      sessionStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      // Return user data with the response
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      try {
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        setUser(response.data.user);
        return response.data.user;
      } catch (error) {
        console.error('User refresh failed:', error);
        // Remove invalid token
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
        return null;
      }
    }
    return null;
  };

  const value = {
    user,
    login,
    register,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
