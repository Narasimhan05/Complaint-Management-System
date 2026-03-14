import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);  // true on first load

  // ── Restore session from localStorage on page refresh ────────────────
  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const roleName = localStorage.getItem('roleName');
    const userId   = localStorage.getItem('userId');
    const email    = localStorage.getItem('email');

    if (token && userName) {
      setUser({ token, userName, roleName, userId, email });
    }
    setLoading(false);
  }, []);

  // ── Persist auth data and update state ───────────────────────────────
  const persistUser = useCallback((data) => {
    localStorage.setItem('token',    data.token);
    localStorage.setItem('userName', data.userName);
    localStorage.setItem('roleName', data.roleName);
    localStorage.setItem('userId',   data.userId);
    localStorage.setItem('email',    data.email || '');
    setUser(data);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials);
    persistUser(res.data.data);
    toast.success(`Welcome back, ${res.data.data.userName}!`);
    return res.data.data;
  }, [persistUser]);

  // ── Register ──────────────────────────────────────────────────────────
  const register = useCallback(async (formData) => {
    const res = await authAPI.register(formData);
    persistUser(res.data.data);
    toast.success('Account created successfully!');
    return res.data.data;
  }, [persistUser]);

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const isAdmin = () => user?.roleName === 'ADMIN';
  const isUser  = () => user?.roleName === 'USER';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
