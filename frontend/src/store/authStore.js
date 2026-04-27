import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
                    const response = await fetch('http://localhost:8081/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: login, login, password }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Identifiants incorrects');
                    }

                    // Vérification token présent
                    if (!data.token) {
                        throw new Error('Token manquant dans la réponse serveur');
                    }

                    localStorage.setItem('token', data.token);

                    const user = {
                        id: data.id,
                        login: data.username,
                        email: data.email,
                        role: data.role || 'ROLE_USER',
                        // Normalisation stricte du firstLogin
                        firstLogin: data.firstLogin === true || data.firstLogin === 'true',
                        token: data.token,
                    };

                    set({ user, isAuthenticated: true, isLoading: false, error: null });
                    return { success: true, user };
                } catch (error) {
                    set({ isLoading: false, error: error.message });
                    return { success: false, error: error.message };
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, isAuthenticated: false, error: null });
            },

            clearFirstLogin: () => {
                set(state => ({
                    user: state.user ? { ...state.user, firstLogin: false } : null,
                }));
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
                // Vérification stricte : doit être exactement true (boolean)
                return isAuthenticated && user?.firstLogin === true;
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);