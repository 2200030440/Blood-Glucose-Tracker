import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session from HTTP-only cookie on app startup
  const checkAuth = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      // 401 is normal for unauthenticated guests
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response?.data?.user) {
        setUser(response.data.user);
        toast.success(response.message || 'Welcome back!');
        return response.data.user;
      }
    } catch (err) {
      const msg = err.friendlyMessage || 'Invalid email or password.';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response?.data?.user) {
        setUser(response.data.user);
        toast.success(response.message || 'Welcome to Sweety!');
        return response.data.user;
      }
    } catch (err) {
      const msg = err.friendlyMessage || 'Registration failed.';
      toast.error(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Logged out successfully.');
    } catch (err) {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

