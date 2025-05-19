import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Get user profile
          const res = await authAPI.getProfile();
          
          if (res.data.success) {
            setUser(res.data.data);
            setIsAuthenticated(true);
            // Set admin status from user data
            localStorage.setItem('isAdmin', res.data.data.isAdmin);
          } else {
            // Token might be invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('isAdmin');
          }
        } catch (err) {
          console.error('Auth check failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('isAdmin');
        }
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await authAPI.login({ email, password });
      
      if (res.data.success) {
        // Save token and user data
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('isAdmin', res.data.data.isAdmin || false);
        setUser(res.data.data);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        setError(res.data.message || 'Login failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await authAPI.register(userData);
      
      if (res.data.success) {
        // Save token and user data
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('isAdmin', res.data.data.isAdmin || false);
        setUser(res.data.data);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        setError(res.data.message || 'Registration failed');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Remove token and reset state
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await authAPI.updateProfile(profileData);
      
      if (res.data.success) {
        setUser(res.data.data);
        setLoading(false);
        return true;
      } else {
        setError(res.data.message || 'Failed to update profile');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setLoading(false);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;