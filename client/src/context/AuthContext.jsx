import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState(new Set());
  const { showToast } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('auralink_token');
    if (!token) {
      setUser(null);
      setSavedIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const res = await API.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        const ids = (res.data.user.savedResources || []).map(r => (typeof r === 'string' ? r : r._id));
        setSavedIds(new Set(ids));
      }
    } catch (err) {
      console.warn('[AuthContext] Token validation failed:', err.response?.data?.message);
      localStorage.removeItem('auralink_token');
      setUser(null);
      setSavedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('auralink_token', res.data.token);
        setUser(res.data.user);
        const ids = (res.data.user.savedResources || []).map(r => (typeof r === 'string' ? r : r._id));
        setSavedIds(new Set(ids));
        showToast(`Welcome back, ${res.data.user.username}!`, 'success');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      showToast(msg, 'error');
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await API.post('/auth/register', { username, email, password });
      if (res.data.success) {
        localStorage.setItem('auralink_token', res.data.token);
        setUser(res.data.user);
        setSavedIds(new Set());
        showToast(`Account created! Welcome, ${res.data.user.username}!`, 'success');
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      showToast(msg, 'error');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('auralink_token');
    setUser(null);
    setSavedIds(new Set());
    showToast('Logged out successfully', 'info');
  };

  const toggleSaveResource = async (resourceId) => {
    if (!user) {
      showToast('Please login to save bookmarks', 'info');
      return false;
    }

    const isCurrentlySaved = savedIds.has(resourceId);
    try {
      if (isCurrentlySaved) {
        await API.delete(`/resources/${resourceId}/save`);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(resourceId);
          return next;
        });
        showToast('Resource removed from bookmarks', 'info');
      } else {
        await API.post(`/resources/${resourceId}/save`);
        setSavedIds(prev => new Set(prev).add(resourceId));
        showToast('Resource saved to bookmarks!', 'success');
      }
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update bookmark', 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      savedIds,
      toggleSaveResource,
      refetchUser: fetchCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
