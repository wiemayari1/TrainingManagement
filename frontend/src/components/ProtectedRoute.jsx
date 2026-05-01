import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, hasAnyRole, initializeAuth } = useAuthStore();

  if (!isAuthenticated) {
    initializeAuth();
    if (!useAuthStore.getState().isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  }

  if (!hasAnyRole(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}