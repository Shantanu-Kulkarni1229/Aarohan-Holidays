import axios from 'axios';

// ============================================
// 🌐 CENTRALIZED API BASE URL
// ============================================
// Change this URL in ONE place to update across the entire app
export const API_BASE_URL = 'http://localhost:5000/api';
// export const API_BASE_URL = 'https://4zb5qb7j-5000.inc1.devtunnels.ms/api';
// export const API_BASE_URL = 'https://aarohan-holidays.vercel.app/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds (2 minutes) timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Admin API endpoints
export const adminAPI = {
  // Tours API
  tours: {
    getAll: () => api.get('/admin/tours'),
    getById: (id) => api.get(`/admin/tours/${id}`),
    create: (formData) => api.post('/admin/tours', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000 // 3 minutes for large file uploads
    }),
    update: (id, formData) => api.put(`/admin/tours/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000 // 3 minutes for large file uploads
    }),
    delete: (id) => api.delete(`/admin/tours/${id}`),
  },

  // Treks API
  treks: {
    getAll: () => api.get('/admin/treks'),
    getById: (id) => api.get(`/admin/treks/${id}`),
    create: (formData) => api.post('/admin/treks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000 // 3 minutes for large file uploads
    }),
    update: (id, formData) => api.put(`/admin/treks/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 180000 // 3 minutes for large file uploads
    }),
    delete: (id) => api.delete(`/admin/treks/${id}`),
  },

  // Dashboard Stats (mock for now - can be added to backend later)
  getDashboardStats: () => {
    return Promise.resolve({
      data: {
        success: true,
        data: {
          tours: {
            totalTours: 0,
            publishedTours: 0,
            draftTours: 0,
            featuredTours: 0,
            totalViews: 0,
            totalBookings: 0
          },
          treks: {
            totalTreks: 0,
            publishedTreks: 0,
            draftTreks: 0,
            featuredTreks: 0,
            totalViews: 0,
            totalBookings: 0
          },
          recent: {
            tours: [],
            treks: []
          }
        }
      }
    });
  }
};

// Public API endpoints
export const publicAPI = {
  // Coupons API
  coupons: {
    getActive: () => api.get('/coupons/active'),
    validate: (code, bookingData) => api.post('/coupons/validate', { code, ...bookingData }),
  },
};

export default api;