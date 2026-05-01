import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
  timeout: 30000,
});

let logoutCallback = null;
export const setLogoutCallback = (cb) => { logoutCallback = cb; };

// ── Token stocké en localStorage pour survivre aux rechargements de page ──────
// sessionStorage se vide à chaque rechargement ce qui causait les 401
const TOKEN_KEY = '_auth_token';

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || null;
};

export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  // Nettoyer aussi l'ancienne clé sessionStorage si elle existe
  sessionStorage.removeItem('_t');
};

// ── Intercepteur requête ─────────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Intercepteur réponse ─────────────────────────────────────────────────────
api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        // Vérifier que c'est bien un problème de token et pas autre chose
        const token = getToken();
        if (!token) {
          // Pas de token → rediriger vers login
          clearToken();
          if (logoutCallback) logoutCallback();
          else window.location.href = '/login';
        } else {
          // Token présent mais rejeté → token expiré ou invalide
          clearToken();
          if (logoutCallback) logoutCallback();
          else window.location.href = '/login';
        }
      }
      if (err.response?.status >= 500) {
        console.error('Erreur serveur:', err.response?.status, err.response?.data);
      }
      return Promise.reject(err);
    }
);

// ── Services ─────────────────────────────────────────────────────────────────
export const formationService = {
  getAll: (annee) => api.get('/formations', { params: annee ? { annee } : {} }),
  getById: (id) => api.get(`/formations/${id}`),
  create: (data) => api.post('/formations', data),
  update: (id, data) => api.put(`/formations/${id}`, data),
  delete: (id) => api.delete(`/formations/${id}`),
};

export const participantService = {
  getAll: () => api.get('/participants'),
  getById: (id) => api.get(`/participants/${id}`),
  create: (data) => api.post('/participants', data),
  update: (id, data) => api.put(`/participants/${id}`, data),
  delete: (id) => api.delete(`/participants/${id}`),
};

export const formateurService = {
  getAll: () => api.get('/formateurs'),
  getById: (id) => api.get(`/formateurs/${id}`),
  create: (data) => api.post('/formateurs', data),
  update: (id, data) => api.put(`/formateurs/${id}`, data),
  delete: (id) => api.delete(`/formateurs/${id}`),
};

export const domaineService = {
  getAll: () => api.get('/domaines'),
  getById: (id) => api.get(`/domaines/${id}`),
  create: (data) => api.post('/domaines', data),
  update: (id, data) => api.put(`/domaines/${id}`, data),
  delete: (id) => api.delete(`/domaines/${id}`),
};

export const structureService = {
  getAll: () => api.get('/structures'),
  getById: (id) => api.get(`/structures/${id}`),
  create: (data) => api.post('/structures', data),
  update: (id, data) => api.put(`/structures/${id}`, data),
  delete: (id) => api.delete(`/structures/${id}`),
};

export const profilService = {
  getAll: () => api.get('/profils'),
  getById: (id) => api.get(`/profils/${id}`),
  create: (data) => api.post('/profils', data),
  update: (id, data) => api.put(`/profils/${id}`, data),
  delete: (id) => api.delete(`/profils/${id}`),
};

export const employeurService = {
  getAll: () => api.get('/employeurs'),
  getById: (id) => api.get(`/employeurs/${id}`),
  create: (data) => api.post('/employeurs', data),
  update: (id, data) => api.put(`/employeurs/${id}`, data),
  delete: (id) => api.delete(`/employeurs/${id}`),
};

export const inscriptionService = {
  getAll: () => api.get('/inscriptions'),
  getByFormation: (formId) => api.get(`/inscriptions/formation/${formId}`),
  getByParticipant: (partId) => api.get(`/inscriptions/participant/${partId}`),
  create: (data) => api.post('/inscriptions', data),
  update: (id, data) => api.put(`/inscriptions/${id}`, data),
  delete: (id) => api.delete(`/inscriptions/${id}`),
};

export const statsService = {
  getDashboard: (annee) => api.get('/stats/dashboard', { params: { annee } }),
};

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout').finally(() => clearToken()),
  changePassword: (oldPassword, newPassword) =>
      api.post('/auth/change-password', { oldPassword, newPassword }),
};

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getDomaines: () => api.get('/domaines'),
  createDomaine: (data) => api.post('/domaines', data),
  updateDomaine: (id, data) => api.put(`/domaines/${id}`, data),
  deleteDomaine: (id) => api.delete(`/domaines/${id}`),

  getStructures: () => api.get('/structures'),
  createStructure: (data) => api.post('/structures', data),
  updateStructure: (id, data) => api.put(`/structures/${id}`, data),
  deleteStructure: (id) => api.delete(`/structures/${id}`),

  getProfils: () => api.get('/profils'),
  createProfil: (data) => api.post('/profils', data),
  updateProfil: (id, data) => api.put(`/profils/${id}`, data),
  deleteProfil: (id) => api.delete(`/profils/${id}`),

  getEmployeurs: () => api.get('/employeurs'),
  createEmployeur: (data) => api.post('/employeurs', data),
  updateEmployeur: (id, data) => api.put(`/employeurs/${id}`, data),
  deleteEmployeur: (id) => api.delete(`/employeurs/${id}`),
};

export default api;