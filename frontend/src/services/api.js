import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Créer une instance axios avec configuration de base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erreur avec réponse du serveur
      if (error.response.status === 401) {
        // Non autorisé - rediriger vers login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response.status === 403) {
        // Accès refusé
        console.error('Accès refusé:', error.response.data.message);
      } else if (error.response.status === 500) {
        // Erreur serveur
        console.error('Erreur serveur:', error.response.data.message);
      }
    } else if (error.request) {
      // Requête envoyée mais pas de réponse
      console.error('Pas de réponse du serveur');
    } else {
      // Autre erreur
      console.error('Erreur:', error.message);
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await api.get('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgotpassword', { email });
  },

  resetPassword: async (token, password) => {
    return await api.put(`/auth/resetpassword/${token}`, { password });
  }
};

// Services de déclarations
export const declarationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/declarations', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/declarations/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/declarations', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/declarations/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/declarations/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/declarations/${id}/status`, { status });
    return response.data;
  },

  uploadDocument: async (id, file, type) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    
    const response = await api.post(`/declarations/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getMonthlyStats: async (year, month) => {
    const response = await api.get('/declarations/stats/monthly', {
      params: { year, month }
    });
    return response.data;
  }
};

// Services de fournisseurs
export const providerService = {
  getAll: async (params = {}) => {
    const response = await api.get('/providers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/providers', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/providers/${id}`, data);
    return response.data;
  },

  findByLocation: async (postalCode) => {
    const response = await api.get('/providers/location', {
      params: { postalCode }
    });
    return response.data;
  }
};

// Services d'utilisateurs
export const userService = {
  getAll: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.put('/users/password', {
      oldPassword,
      newPassword
    });
    return response.data;
  }
};

// Services de rapports
export const reportService = {
  getDashboard: async (period = 'month') => {
    const response = await api.get('/reports/dashboard', {
      params: { period }
    });
    return response.data;
  },

  getEnvironmental: async (year) => {
    const response = await api.get('/reports/environmental', {
      params: { year }
    });
    return response.data;
  },

  getFinancial: async (startDate, endDate) => {
    const response = await api.get('/reports/financial', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  exportPDF: async (type, params = {}) => {
    const response = await api.get(`/reports/export/${type}`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

// Services de notifications
export const notificationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  }
};

// Services d'entreprise
export const companyService = {
  getProfile: async () => {
    const response = await api.get('/companies/profile');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/companies/profile', data);
    return response.data;
  },

  uploadLogo: async (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await api.post('/companies/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/companies/stats');
    return response.data;
  }
};

// Services de types de déchets
export const wasteTypeService = {
  getAll: async () => {
    const response = await api.get('/waste-types');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/waste-types', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/waste-types/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/waste-types/${id}`);
    return response.data;
  }
};

export default api;