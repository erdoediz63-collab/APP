import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { storage } from '../utils/storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await storage.getToken();
      const savedUser = await storage.getUser();
      
      if (token && savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Load user error:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, username, password) => {
    try {
      const response = await api.post('/auth/register', {
        email,
        username,
        password,
      });
      
      await storage.setToken(response.data.token);
      await storage.setUser(response.data.user);
      setUser(response.data.user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Kayıt başarısız' 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      await storage.setToken(response.data.token);
      await storage.setUser(response.data.user);
      setUser(response.data.user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Giriş başarısız' 
      };
    }
  };

  const logout = async () => {
    await storage.clear();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/auth/me');
      await storage.setUser(response.data);
      setUser(response.data);
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
