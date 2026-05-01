import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Formations from './pages/Formations';
import Formateurs from './pages/Formateurs';
import Participants from './pages/Participants';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import Users from './pages/Admin/Users';
import Structures from './pages/Admin/Structures';
import Domaines from './pages/Admin/Domaines';
import Profils from './pages/Admin/Profils';
import Employeurs from './pages/Admin/Employeurs';
import FirstLogin from './pages/FirstLogin';
import ProtectedRoute from './components/ProtectedRoute';
import { ForgotPassword, ResetPassword } from './pages/ForgotPassword';
import Profile from './pages/Profile';

function AppInitializer() {
    useEffect(() => {
        useAuthStore.getState().initializeAuth();
    }, []);
    return null;
}

function App() {
    return (
        <Router>
            <AppInitializer />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route
                    path="/first-login"
                    element={
                        <ProtectedRoute requireFirstLogin={true}>
                            <FirstLogin />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="formations" element={<Formations />} />
                    <Route path="formateurs" element={<Formateurs />} />
                    <Route path="participants" element={<Participants />} />
                    <Route path="stats" element={<Stats />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="admin" element={<Admin />}>
                        <Route index element={<Navigate to="users" replace />} />
                        <Route path="users" element={<Users />} />
                        <Route path="structures" element={<Structures />} />
                        <Route path="domaines" element={<Domaines />} />
                        <Route path="profils" element={<Profils />} />
                        <Route path="employeurs" element={<Employeurs />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;