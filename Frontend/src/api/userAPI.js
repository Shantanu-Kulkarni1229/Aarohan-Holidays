// Frontend API utility for user endpoints
// Add this to your frontend src/api/ folder

import axios from 'axios';

// const BASE_URL = 'https://4zb5qb7j-5000.inc1.devtunnels.ms/api';
// const BASE_URL = 'https://aarohan-holidays.vercel.app/api';
const BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const userAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds to handle Render cold starts
});

// Tours API Functions
export const toursAPI = {
  // Get all tours with filters and pagination
  getAll: (params = {}) => userAPI.get('/tours', { params }),
  
  // Get single tour by ID
  getById: (id) => userAPI.get(`/tours/${id}`),
  
  // Alias for getTourById
  getTourById: (id) => userAPI.get(`/tours/${id}`),
  
  // Search tours
  search: (query, limit = 10) => userAPI.get('/tours/search', { 
    params: { q: query, limit } 
  }),
  
  // Get featured tours
  getFeatured: (limit = 6) => userAPI.get('/tours/featured', { 
    params: { limit } 
  }),
  
  // Get trending tours
  getTrending: (limit = 6) => userAPI.get('/tours/trending', { 
    params: { limit } 
  }),
  
  // Get special tours (with specialType other than "None")
  getSpecial: (limit = 6, specialType = null) => userAPI.get('/tours/special', { 
    params: { limit, ...(specialType && { specialType }) } 
  }),
  
  // Get tours by category
  getByCategory: (category, params = {}) => userAPI.get(`/tours/category/${category}`, { 
    params 
  }),
  
  // Get tour availability (remaining seats)
  getAvailability: (id) => userAPI.get(`/tours/${id}/availability`),
};

// Treks API Functions
export const treksAPI = {
  // Get all treks with filters and pagination
  getAll: (params = {}) => userAPI.get('/treks', { params }),
  
  // Get single trek by ID
  getById: (id) => userAPI.get(`/treks/${id}`),
  
  // Alias for getTrekById
  getTrekById: (id) => userAPI.get(`/treks/${id}`),
  
  // Search treks
  search: (query, limit = 10) => userAPI.get('/treks/search', { 
    params: { q: query, limit } 
  }),
  
  // Get featured treks
  getFeatured: (limit = 6) => userAPI.get('/treks/featured', { 
    params: { limit } 
  }),
  
  // Get special treks (with specialType other than "None")
  getSpecial: (limit = 6, specialType = null) => userAPI.get('/treks/special', { 
    params: { limit, ...(specialType && { specialType }) } 
  }),
  
  // Get treks by category
  getByCategory: (category, params = {}) => userAPI.get(`/treks/category/${category}`, { 
    params 
  }),
  
  // Get treks by difficulty
  getByDifficulty: (difficulty, params = {}) => userAPI.get(`/treks/difficulty/${difficulty}`, { 
    params 
  }),
  
  // Get trek availability (remaining seats)
  getAvailability: (id) => userAPI.get(`/treks/${id}/availability`),
};

// General API Functions
export const generalAPI = {
  // Global search (tours + treks)
  globalSearch: (query, limit = 5) => userAPI.get('/search', { 
    params: { q: query, limit } 
  }),
  
  // Get public statistics
  getStats: () => userAPI.get('/stats'),
  
  // Get all categories
  getCategories: () => userAPI.get('/categories'),
};

// Other Services API Functions
export const otherServicesAPI = {
  // Create new enquiry
  createEnquiry: (enquiryData) => userAPI.post('/other-services/enquiry', enquiryData),
  
  // Get enquiry by reference number (for users to track)
  getByReference: (reference) => userAPI.get(`/other-services/enquiry/reference/${reference}`),
  
  // Admin functions (require authentication)
  admin: {
    // Get all enquiries with filters
    getAll: (params = {}) => userAPI.get('/other-services', { params }),
    
    // Get enquiry by ID
    getById: (id) => userAPI.get(`/other-services/${id}`),
    
    // Get statistics
    getStats: () => userAPI.get('/other-services/stats'),
    
    // Get pending enquiries
    getPending: () => userAPI.get('/other-services/pending'),
    
    // Get urgent enquiries
    getUrgent: () => userAPI.get('/other-services/urgent'),
    
    // Update enquiry status
    updateStatus: (id, statusData) => userAPI.put(`/other-services/${id}/status`, statusData),
    
    // Delete enquiry
    delete: (id) => userAPI.delete(`/other-services/${id}`)
  }
};

// Testimonials API Functions
export const testimonialsAPI = {
  // Create new testimonial (Public)
  create: (testimonialData) => userAPI.post('/testimonials', testimonialData),
  
  // Get approved testimonials with pagination (Public)
  getApproved: (params = { limit: 20, page: 1 }) => userAPI.get('/testimonials/approved', { params }),
  
  // Get featured testimonials (Public - for homepage)
  getFeatured: (limit = 6) => userAPI.get('/testimonials/featured', { params: { limit } }),
  
  // Get testimonial statistics (Public)
  getStats: () => userAPI.get('/testimonials/stats'),
  
  // Admin functions (require authentication)
  admin: {
    // Get all testimonials with filters
    getAll: (params = {}) => userAPI.get('/testimonials/admin', { params }),
    
    // Get testimonial by ID
    getById: (id) => userAPI.get(`/testimonials/admin/${id}`),
    
    // Get pending testimonials
    getPending: () => userAPI.get('/testimonials/admin/pending'),
    
    // Get admin statistics
    getStats: () => userAPI.get('/testimonials/admin/stats'),
    
    // Update testimonial status (Approve/Reject)
    updateStatus: (id, statusData) => userAPI.patch(`/testimonials/admin/${id}/status`, statusData),
    
    // Update testimonial (full edit)
    update: (id, testimonialData) => userAPI.put(`/testimonials/admin/${id}`, testimonialData),
    
    // Delete testimonial
    delete: (id) => userAPI.delete(`/testimonials/admin/${id}`),
    
    // Bulk approve testimonials
    bulkApprove: (ids) => userAPI.post('/testimonials/admin/bulk-approve', { ids }),
    
    // Toggle featured status
    toggleFeatured: (id) => userAPI.patch(`/testimonials/admin/${id}/toggle-featured`)
  }
};

// Enquiries API Functions
export const enquiriesAPI = {
  // Create new enquiry (Public)
  create: (enquiryData) => userAPI.post('/enquiries', enquiryData),
  
  // Get enquiry by reference number (Public - for tracking)
  getByReference: (reference) => userAPI.get(`/enquiries/reference/${reference}`),
  
  // Admin functions (require authentication)
  admin: {
    // Get all enquiries with filters
    getAll: (params = {}) => userAPI.get('/admin/enquiries', { params }),
    
    // Get enquiry by ID
    getById: (id) => userAPI.get(`/admin/enquiries/${id}`),
    
    // Get statistics
    getStats: () => userAPI.get('/admin/enquiries/stats'),
    
    // Get pending enquiries
    getPending: () => userAPI.get('/admin/enquiries/pending'),
    
    // Get urgent enquiries
    getUrgent: () => userAPI.get('/admin/enquiries/urgent'),
    
    // Update enquiry status
    updateStatus: (id, statusData) => userAPI.put(`/admin/enquiries/${id}/status`, statusData),
    
    // Add communication to enquiry
    addCommunication: (id, communicationData) => userAPI.post(`/admin/enquiries/${id}/communication`, communicationData),
    
    // Delete enquiry
    delete: (id) => userAPI.delete(`/admin/enquiries/${id}`)
  }
};

// Example usage functions
export const examples = {
  // Homepage data
  async getHomepageData() {
    const [featuredTours, featuredTreks, stats] = await Promise.all([
      toursAPI.getFeatured(6),
      treksAPI.getFeatured(6),
      generalAPI.getStats()
    ]);
    
    return {
      featuredTours: featuredTours.data.data,
      featuredTreks: featuredTreks.data.data,
      stats: stats.data.data
    };
  },
  
  // Tours listing page
  async getToursPage(page = 1, filters = {}) {
    const params = {
      page,
      limit: 12,
      ...filters
    };
    
    const response = await toursAPI.getAll(params);
    return response.data;
  },
  
  // Tour details page
  async getTourDetails(tourId) {
    const response = await toursAPI.getById(tourId);
    return response.data.data;
  },
  
  // Search functionality
  async performSearch(query) {
    const response = await generalAPI.globalSearch(query, 10);
    return response.data.data;
  },
  
  // Filter data for dropdowns
  async getFilterData() {
    const response = await generalAPI.getCategories();
    return response.data.data;
  }
};

export default userAPI;