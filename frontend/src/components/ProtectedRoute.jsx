import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Admin a toujours accès
    if (user?.role === 'ROLE_ADMIN') return <Outlet />;
    // Responsable redirigé vers stats
    if (user?.role === 'ROLE_RESPONSABLE') return <Navigate to="/stats" replace />;
    // Autres redirigés vers dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
