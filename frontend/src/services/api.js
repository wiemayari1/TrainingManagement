import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000,
});

let logoutCallback = null;
export const setLogoutCallback = (cb) => { logoutCallback = cb; };

let inMemoryToken = null;

export const setToken = (token) => {
  inMemoryToken = token;
  if (token) {
    sessionStorage.setItem('_t', token);
  } else {
    sessionStorage.removeItem('_t');
  }
};

export const getToken = () => {
  if (!inMemoryToken) {
    inMemoryToken = sessionStorage.getItem('_t') || null;
  }
  return inMemoryToken;
};

export const clearToken = () => {
  inMemoryToken = null;
  sessionStorage.removeItem('_t');
  localStorage.removeItem('token');
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  delete config.headers['X-Forwarded-For'];
  return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response?.status === 401) {
        const token = getToken();
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
              clearToken();
              if (logoutCallback) logoutCallback();
              else window.location.href = '/login';
            }
          } catch {
            clearToken();
            if (logoutCallback) logoutCallback();
            else window.location.href = '/login';
          }
        } else {
          clearToken();
          if (logoutCallback) logoutCallback();
          else window.location.href = '/login';
        }
      }
      if (err.response?.status >= 500) {
        console.error('Erreur serveur:', err.response?.status);
      }
      return Promise.reject(err);
    }
);

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
