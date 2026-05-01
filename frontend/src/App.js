import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import FirstLogin from './pages/FirstLogin';
import { ForgotPassword, ResetPassword } from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Formations from './pages/Formations';
import Participants from './pages/Participants';
import Formateurs from './pages/Formateurs';
import Stats from './pages/Stats';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminUsers from './pages/Admin/Users';
import AdminStructures from './pages/Admin/Structures';
import AdminDomaines from './pages/Admin/Domaines';
import AdminProfils from './pages/Admin/Profils';
import AdminEmployeurs from './pages/Admin/Employeurs';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AppRoutes />
            </Router>
        </ThemeProvider>
    );
}

function AppRoutes() {
    const { isAuthenticated, needsPasswordChange, initializeAuth } = useAuthStore();

    useEffect(() => {
        initializeAuth();
    }, []);

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/first-login" element={<FirstLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    if (needsPasswordChange()) {
        return (
            <Routes>
                <Route path="/first-login" element={<FirstLogin />} />
                <Route path="*" element={<Navigate to="/first-login" replace />} />
            </Routes>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="formations" element={<Formations />} />
                <Route path="participants" element={<Participants />} />
                <Route path="formateurs" element={<Formateurs />} />
                <Route path="stats" element={
                    <ProtectedRoute allowedRoles={['ROLE_RESPONSABLE', 'ROLE_ADMIN']}>
                        <Stats />
                    </ProtectedRoute>
                } />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={
                    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                        <Admin />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to="users" replace />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="structures" element={<AdminStructures />} />
                    <Route path="domaines" element={<AdminDomaines />} />
                    <Route path="profils" element={<AdminProfils />} />
                    <Route path="employeurs" element={<AdminEmployeurs />} />
                </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default App;
