import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setToken, clearToken, getToken, setLogoutCallback } from '../services/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            // ── État ──────────────────────────────────────────────────────────────
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // ── Initialisation au démarrage ───────────────────────────────────────
            // Appelée au chargement de l'application pour restaurer l'état depuis
            // le token JWT stocké en sessionStorage
            initializeAuth: () => {
                const token = getToken();
                if (!token) {
                    set({ user: null, isAuthenticated: false });
                    return false;
                }
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.exp * 1000 < Date.now()) {
                        clearToken();
                        set({ user: null, isAuthenticated: false });
                        return false;
                    }
                    // Restaurer l'utilisateur depuis le token si pas déjà en mémoire
                    const currentUser = get().user;
                    if (!currentUser && payload.sub) {
                        const userFromToken = {
                            id: payload.id || payload.sub,
                            login: payload.sub,
                            email: payload.email || '',
                            role: payload.roles || payload.role || 'ROLE_USER',
                            firstLogin: payload.firstLogin === true || payload.firstLogin === 'true',
                        };
                        set({ user: userFromToken, isAuthenticated: true });
                    } else {
                        set({ isAuthenticated: true });
                    }
                    return true;
                } catch {
                    clearToken();
                    set({ user: null, isAuthenticated: false });
                    return false;
                }
            },

            // ── Login ───────────────────────────────────────────────────────────
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
                    return { success: false, error: error.message };
                }
            },

            // ── Logout ────────────────────────────────────────────────────────────
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

            // ── Clear first login flag ───────────────────────────────────────────
            clearFirstLogin: () => {
                set(state => ({
                    user: state.user ? { ...state.user, firstLogin: false } : null,
                }));
            },

            // ── Check auth (validation token) ────────────────────────────────────
            checkAuth: () => {
                const token = getToken();
                if (!token) {
                    set({ user: null, isAuthenticated: false });
                    return false;
                }
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.exp * 1000 < Date.now()) {
                        clearToken();
                        set({ user: null, isAuthenticated: false });
                        return false;
                    }
                } catch {
                    clearToken();
                    set({ user: null, isAuthenticated: false });
                    return false;
                }
                set({ isAuthenticated: true });
                return true;
            },

            // ── Helpers rôles ────────────────────────────────────────────────────
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
            // CORRECTION CRITIQUE : Ne PAS persister isAuthenticated
            // Il doit être recalculé dynamiquement depuis le token au démarrage
            partialize: (state) => ({
                user: state.user
                    ? {
                        id: state.user.id,
                        login: state.user.login,
                        email: state.user.email,
                        role: state.user.role,
                        firstLogin: state.user.firstLogin,
                    }
                    : null,
                // isAuthenticated est intentionnellement EXCLU de la persistance
            }),
        }
    )
);

// ── Initialisation immédiate au chargement du module ───────────────────────
// Cela garantit que le token est vérifié avant le premier rendu React
useAuthStore.getState().initializeAuth();

// ── Câbler le callback de logout dans le service API ───────────────────────
setLogoutCallback(() => useAuthStore.getState().logout());