import axios from 'axios';
import { attachAdminAuth } from '../utils/adminAuth';

// ============================================
// 🌐 CENTRALIZED API BASE URL
// ============================================
// Change this URL in ONE place to update across the entire app
// export const API_BASE_URL = 'http://localhost:5000/api';
// export const API_BASE_URL = 'https://4zb5qb7j-5000.inc1.devtunnels.ms/api';
export const API_BASE_URL = 'https://aarohan-holidays.vercel.app/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds (2 minutes) timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin token: attached to the shared instance and to plain `axios` calls that go to our API
// (many admin screens call axios directly), but never to another host.
const isOurApi = (config) => {
  const url = config.url || '';
  return config.baseURL === API_BASE_URL || url.startsWith(API_BASE_URL);
};
attachAdminAuth(api);
attachAdminAuth(axios, isOurApi);

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