import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage, { RegisterPage } from './pages/LoginPage';
import UserDashboard from './pages/user/UserDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTeams from './pages/admin/AdminTeams';

// ─── Protected Route ──────────────────────────────────────────────────────────
/**
 * Wraps a route that requires authentication.
 * - If not logged in → redirect to /login
 * - If wrong role    → redirect to their correct dashboard
 * - If loading       → show loading screen (prevents flash)
 */
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <span>🛡️</span>
        <span>Loading...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.roleName !== requiredRole) {
    return (
      <Navigate
        to={user.roleName === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'}
        replace
      />
    );
  }

  return children;
}

// ─── App Routes ───────────────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Root redirect based on role */}
      <Route path="/" element={
        user
          ? <Navigate to={user.roleName === 'ADMIN' ? '/admin/dashboard' : '/user/dashboard'} replace />
          : <Navigate to="/login" replace />
      }/>

      {/* Public routes */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User routes */}
      <Route path="/user/dashboard" element={
        <ProtectedRoute requiredRole="USER">
          <UserDashboard />
        </ProtectedRoute>
      }/>

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute requiredRole="ADMIN">
          <AdminDashboard />
        </ProtectedRoute>
      }/>

      <Route path="/admin/teams" element={
        <ProtectedRoute requiredRole="ADMIN">
          <AdminTeams />
        </ProtectedRoute>
      }/>

      {/* 404 → redirect home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Root App Component ───────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontWeight: 600,
              borderRadius: 12,
              fontSize: 14,
            },
            success: { style: { background: '#065f46', color: '#fff' } },
            error:   { style: { background: '#991b1b', color: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
