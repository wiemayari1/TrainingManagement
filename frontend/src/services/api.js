import axios from 'axios';

// ── Instance Axios ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  headers: { 'Content-Type': 'application/json' },
});

// Injecte le JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirige vers /login si 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Services ──────────────────────────────────────────────────────────────────

export const formationService = {
  getAll:   (annee) => api.get('/formations', { params: annee ? { annee } : {} }),
  getById:  (id)    => api.get(`/formations/${id}`),
  create:   (data)  => api.post('/formations', data),
  update:   (id, data) => api.put(`/formations/${id}`, data),
  delete:   (id)    => api.delete(`/formations/${id}`),
};

export const participantService = {
  getAll:   ()      => api.get('/participants'),
  getById:  (id)    => api.get(`/participants/${id}`),
  create:   (data)  => api.post('/participants', data),
  update:   (id, data) => api.put(`/participants/${id}`, data),
  delete:   (id)    => api.delete(`/participants/${id}`),
};

export const formateurService = {
  getAll:   ()      => api.get('/formateurs'),
  getById:  (id)    => api.get(`/formateurs/${id}`),
  create:   (data)  => api.post('/formateurs', data),
  update:   (id, data) => api.put(`/formateurs/${id}`, data),
  delete:   (id)    => api.delete(`/formateurs/${id}`),
};

export const domaineService = {
  getAll:   ()      => api.get('/domaines'),
  getById:  (id)    => api.get(`/domaines/${id}`),
  create:   (data)  => api.post('/domaines', data),
  update:   (id, data) => api.put(`/domaines/${id}`, data),
  delete:   (id)    => api.delete(`/domaines/${id}`),
};

export const structureService = {
  getAll:   ()      => api.get('/structures'),
  getById:  (id)    => api.get(`/structures/${id}`),
  create:   (data)  => api.post('/structures', data),
  update:   (id, data) => api.put(`/structures/${id}`, data),
  delete:   (id)    => api.delete(`/structures/${id}`),
};

export const profilService = {
  getAll:   ()      => api.get('/profils'),
  getById:  (id)    => api.get(`/profils/${id}`),
  create:   (data)  => api.post('/profils', data),
  update:   (id, data) => api.put(`/profils/${id}`, data),
  delete:   (id)    => api.delete(`/profils/${id}`),
};

export const employeurService = {
  getAll:   ()      => api.get('/employeurs'),
  getById:  (id)    => api.get(`/employeurs/${id}`),
  create:   (data)  => api.post('/employeurs', data),
  update:   (id, data) => api.put(`/employeurs/${id}`, data),
  delete:   (id)    => api.delete(`/employeurs/${id}`),
};

export const inscriptionService = {
  getAll:              ()         => api.get('/inscriptions'),
  getByFormation:      (formId)   => api.get(`/inscriptions/formation/${formId}`),
  getByParticipant:    (partId)   => api.get(`/inscriptions/participant/${partId}`),
  create:              (data)     => api.post('/inscriptions', data),
  update:              (id, data) => api.put(`/inscriptions/${id}`, data),
  delete:              (id)       => api.delete(`/inscriptions/${id}`),
};

export const statsService = {
  getDashboard:        (annee)    => api.get('/stats/dashboard', { params: { annee } }),
  getParDomaine:       (annee)    => api.get('/stats/par-domaine', { params: { annee } }),
  getParStructure:     (annee)    => api.get('/stats/par-structure', { params: { annee } }),
  getEvolution:        (annee)    => api.get('/stats/evolution', { params: { annee } }),
  getBudget:           (annee)    => api.get('/stats/budget', { params: { annee } }),
  getFormateurs:       (annee)    => api.get('/stats/formateurs', { params: { annee } }),
};

export const adminService = {
  // Utilisateurs
  getUsers:      ()         => api.get('/admin/users'),
  createUser:    (data)     => api.post('/admin/users', data),
  updateUser:    (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser:    (id)       => api.delete(`/admin/users/${id}`),

  // Domaines
  getDomaines:      ()         => api.get('/domaines'),
  createDomaine:    (data)     => api.post('/domaines', data),
  updateDomaine:    (id, data) => api.put(`/domaines/${id}`, data),
  deleteDomaine:    (id)       => api.delete(`/domaines/${id}`),

  // Structures
  getStructures:    ()         => api.get('/structures'),
  createStructure:  (data)     => api.post('/structures', data),
  updateStructure:  (id, data) => api.put(`/structures/${id}`, data),
  deleteStructure:  (id)       => api.delete(`/structures/${id}`),

  // Profils
  getProfils:       ()         => api.get('/profils'),
  createProfil:     (data)     => api.post('/profils', data),
  updateProfil:     (id, data) => api.put(`/profils/${id}`, data),
  deleteProfil:     (id)       => api.delete(`/profils/${id}`),

  // Employeurs
  getEmployeurs:    ()         => api.get('/employeurs'),
  createEmployeur:  (data)     => api.post('/employeurs', data),
  updateEmployeur:  (id, data) => api.put(`/employeurs/${id}`, data),
  deleteEmployeur:  (id)       => api.delete(`/employeurs/${id}`),
};

export default api;
