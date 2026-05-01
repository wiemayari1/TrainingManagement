import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children, requireFirstLogin = false }) => {
  const { isAuthenticated, user, initializeAuth } = useAuthStore();

  const location = useLocation();

  // CORRECTION : S'assurer que l'auth est initialisée avant de rendre
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Si l'utilisateur doit changer son mot de passe (first login)
  if (isAuthenticated && user?.firstLogin && !requireFirstLogin) {
    return <Navigate to="/first-login" replace />;
  }

  // Si on est sur la page first-login mais que ce n'est plus nécessaire
  if (requireFirstLogin && (!isAuthenticated || !user?.firstLogin)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si non authentifié → redirection login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;