import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store d'authentification UNIQUE (Zustand).
 * SUPPRIME AuthContext.js et auth.service.js qui créaient un conflit.
 * Toute l'application utilise UNIQUEMENT useAuthStore.
 */
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
            body: JSON.stringify({ username: login, password }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Identifiants incorrects');

          const token = data.token;
          localStorage.setItem('token', token);

          const user = {
            id: data.id,
            login: data.username,
            email: data.email,
            // data.role contient "ROLE_ADMIN", "ROLE_RESPONSABLE" ou "ROLE_USER"
            role: data.role || 'ROLE_USER',
            firstLogin: data.firstLogin,
            token,
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

      // Marquer firstLogin comme traité (après changement de mot de passe)
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

      // ── Permissions selon cahier des charges ──────────────────────────
      // Simple utilisateur : gère formateurs, formations, participants
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
      // Responsable : consulte statistiques uniquement
      canViewStats: () => {
        const { user } = get();
        return user?.role === 'ROLE_RESPONSABLE' || user?.role === 'ROLE_ADMIN';
      },
      // Admin : accès illimité
      isAdmin: () => get().user?.role === 'ROLE_ADMIN',
      isResponsable: () => get().user?.role === 'ROLE_RESPONSABLE',
      isSimpleUser: () => get().user?.role === 'ROLE_USER',

      // Vérifie si l'utilisateur doit changer son mot de passe
      needsPasswordChange: () => {
        const { user, isAuthenticated } = get();
        return isAuthenticated && user?.firstLogin === true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
