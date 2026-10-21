import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('staffsync_token') || null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Verify and fetch logged-in user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          // If token expired, auto-switch to demo HR for instant evaluation
          tryDemoLogin('hr');
        }
      } else {
        // Automatically log in as HR Admin by default so the demo is immediately active!
        tryDemoLogin('hr');
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const tryDemoLogin = async (role = 'hr') => {
    try {
      const res = await api.demoSwitch(role);
      if (res.success) {
        localStorage.setItem('staffsync_token', res.token);
        setToken(res.token);
        setUser(res.user);
      }
    } catch (err) {
      console.error('Demo auto-login error:', err);
    }
  };

  const handleLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('staffsync_token', res.token);
        setToken(res.token);
        setUser(res.user);
        addToast(`Welcome back, ${res.user.name}!`, 'success');
        return { success: true };
      }
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSwitch = async (role) => {
    setLoading(true);
    try {
      const res = await api.demoSwitch(role);
      if (res.success) {
        localStorage.setItem('staffsync_token', res.token);
        setToken(res.token);
        setUser(res.user);
        addToast(`Switched view to ${role.toUpperCase()}: ${res.user.name}`, 'info');
        return { success: true };
      }
    } catch (err) {
      addToast(`Failed to switch role: ${err.message}`, 'error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('staffsync_token');
    setToken(null);
    setUser(null);
    addToast('You have been logged out.', 'info');
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : 'guest',
        token,
        loading,
        login: handleLogin,
        switchRole: handleDemoSwitch,
        logout: handleLogout,
        refreshUser,
        addToast,
        toasts,
        removeToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
