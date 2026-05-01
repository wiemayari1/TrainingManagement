import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setToken, clearToken, getToken, setLogoutCallback } from '../services/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (login, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetch(
                        (process.env.REACT_APP_API_URL || 'http://localhost:8081/api') + '/auth/login',
                        {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: login, password }),
                        }
                    );

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Identifiants incorrects');
                    }
                    if (!data.token) {
                        throw new Error('Token manquant dans la réponse serveur');
                    }

                    // Stocker le token
                    setToken(data.token);

                    const user = {
                        id: data.id,
                        login: data.username,
                        email: data.email,
                        role: data.role || 'ROLE_USER',
                        firstLogin: data.firstLogin === true || data.firstLogin === 'true',
                    };

                    set({ user, isAuthenticated: true, isLoading: false, error: null });
                    return { success: true, user };
                } catch (error) {
                    set({ isLoading: false, error: error.message });
                    return { success: false, error: 'Identifiants incorrects ou erreur serveur.' };
                }
            },

            logout: async () => {
                try {
                    const token = getToken();
                    if (token) {
                        await fetch(
                            (process.env.REACT_APP_API_URL || 'http://localhost:8081/api') + '/auth/logout',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                            }
                        );
                    }
                } catch (e) {
                    console.warn('Logout serveur échoué:', e.message);
                }
                clearToken();
                set({ user: null, isAuthenticated: false, error: null });
            },

            clearFirstLogin: () => {
                set(state => ({
                    user: state.user ? { ...state.user, firstLogin: false } : null,
                }));
            },

            // Vérifie si le token est encore valide sans modifier l'état
            checkAuth: () => {
                const token = getToken();
                if (!token) return false;
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.exp * 1000 < Date.now()) {
                        clearToken();
                        return false;
                    }
                    return true;
                } catch {
                    clearToken();
                    return false;
                }
            },

            hasRole: (role) => {
                const { user } = get();
                if (!user) return false;
                if (user.role === 'ROLE_ADMIN') return true;
                return user.role === role;
            },

            hasAnyRole: (roles) => {
                const { user } = get();
                if (!user) return false;
                if (user.role === 'ROLE_ADMIN') return true;
                return roles.includes(user.role);
            },

            canManageFormations: () => {
                const { user } = get();
                return user?.role === 'ROLE_USER' || user?.role === 'ROLE_ADMIN';
            },
            canManageParticipants: () => {
                const { user } = get();
                return user?.role === 'ROLE_USER' || user?.role === 'ROLE_ADMIN';
            },
            canManageFormateurs: () => {
                const { user } = get();
                return user?.role === 'ROLE_USER' || user?.role === 'ROLE_ADMIN';
            },
            canViewStats: () => {
                const { user } = get();
                return user?.role === 'ROLE_RESPONSABLE' || user?.role === 'ROLE_ADMIN';
            },
            isAdmin: () => get().user?.role === 'ROLE_ADMIN',
            isResponsable: () => get().user?.role === 'ROLE_RESPONSABLE',
            isSimpleUser: () => get().user?.role === 'ROLE_USER',

            needsPasswordChange: () => {
                const { user, isAuthenticated } = get();
                return isAuthenticated && user?.firstLogin === true;
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user ? {
                    id: state.user.id,
                    login: state.user.login,
                    email: state.user.email,
                    role: state.user.role,
                    firstLogin: state.user.firstLogin,
                } : null,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

setLogoutCallback(() => useAuthStore.getState().logout());