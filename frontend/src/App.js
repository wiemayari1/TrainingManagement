import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Formations from './pages/Formations';
import Formateurs from './pages/Formateurs';
import Participants from './pages/Participants';
import Inscriptions from './pages/Inscriptions';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import FirstLogin from './pages/FirstLogin';
import ProtectedRoute from './components/ProtectedRoute';

function AppInitializer() {
    useEffect(() => {
        // CORRECTION CRITIQUE : Initialiser l'authentification au démarrage
        // Cela restaure isAuthenticated depuis le token JWT en sessionStorage
        useAuthStore.getState().initializeAuth();
    }, []);
    return null;
}

function App() {
    return (
        <Router>
            <AppInitializer />
            <Routes>
                {/* Route publique */}
                <Route path="/login" element={<Login />} />

                {/* Route première connexion (changement mot de passe obligatoire) */}
                <Route
                    path="/first-login"
                    element={
                        <ProtectedRoute requireFirstLogin={true}>
                            <FirstLogin />
                        </ProtectedRoute>
                    }
                />

                {/* Routes protégées avec Layout */}
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
                    <Route path="inscriptions" element={<Inscriptions />} />
                    <Route path="stats" element={<Stats />} />
                    <Route path="admin" element={<Admin />} />
                </Route>

                {/* Redirection par défaut */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;