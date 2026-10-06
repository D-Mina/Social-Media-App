import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, storage } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => storage.getUser());
  const [token, setToken] = useState(() => storage.getToken());
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!storage.getToken()) return;
    try {
      const res = await api.notifications.getUnreadCount();
      // res may be { count: 3 } or { data: { count: 3 } } or { unreadCount: 3 }
      const count =
        res?.data?.count ??
        res?.data?.unreadCount ??
        res?.count ??
        res?.unreadCount ??
        0;
      setUnreadCount(Number(count) || 0);
    } catch (e) {
      // ignore silent notification error
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!storage.getToken()) {
      setLoading(false);
      return null;
    }
    try {
      const res = await api.auth.getProfileData();
      const profileUser = res?.data?.user || res?.data || res?.user;
      if (profileUser) {
        setUser(profileUser);
        storage.setUser(profileUser);
        return profileUser;
      }
    } catch (err) {
      if (err.status === 401) {
        // Token expired or invalid
        storage.clear();
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  useEffect(() => {
    if (token) {
      refreshProfile();
      fetchUnreadCount();
      // poll notifications every 45s
      const interval = setInterval(fetchUnreadCount, 45000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [token, refreshProfile, fetchUnreadCount]);

  const signin = async ({ loginIdentifier, password }) => {
    const trimmed = loginIdentifier.trim();
    const payload = trimmed.includes('@')
      ? { email: trimmed, password }
      : { email: trimmed, username: trimmed, login: trimmed, password };

    const res = await api.auth.signin(payload);

    // Look for token and user
    const receivedToken = res?.token || res?.data?.token;
    const receivedUser = res?.user || res?.data?.user || res?.data;

    if (!receivedToken) {
      throw new Error(res?.message || 'Login failed: No authentication token received.');
    }

    storage.setToken(receivedToken);
    setToken(receivedToken);

    if (receivedUser && typeof receivedUser === 'object') {
      setUser(receivedUser);
      storage.setUser(receivedUser);
    }

    // Attempt to get fresh profile data in background
    try {
      const profileRes = await api.auth.getProfileData();
      const freshUser = profileRes?.data?.user || profileRes?.data || profileRes?.user;
      if (freshUser) {
        setUser(freshUser);
        storage.setUser(freshUser);
      }
    } catch {
      // keep fallback receivedUser
    }

    fetchUnreadCount();
    return res;
  };

  const signup = async (userData) => {
    const res = await api.auth.signup(userData);
    const receivedToken = res?.token || res?.data?.token;
    const receivedUser = res?.user || res?.data?.user || res?.data;

    if (receivedToken) {
      storage.setToken(receivedToken);
      setToken(receivedToken);
      if (receivedUser) {
        setUser(receivedUser);
        storage.setUser(receivedUser);
      }
      refreshProfile();
      fetchUnreadCount();
    }
    return res;
  };

  const logout = () => {
    storage.clear();
    setToken(null);
    setUser(null);
    setUnreadCount(0);
  };

  const updateUserLocal = (newUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserData };
      storage.setUser(updated);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        unreadCount,
        signin,
        signup,
        logout,
        refreshProfile,
        fetchUnreadCount,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
