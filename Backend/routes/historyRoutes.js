import express from 'express';
import {
  // Admin controllers
  createHistory,
  getAllHistoriesAdmin,
  getHistoryById,
  updateHistory,
  deleteHistory,
  toggleHistoryFeatured,
  toggleHistoryActive,
  // Public controllers
  getAllHistoriesPublic,
  getHistoryByIdOrSlug,
  getFeaturedHistories,
  getHistoryLocations
} from '../controllers/historyController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// Get all published histories
router.get('/history', getAllHistoriesPublic);

// Get featured histories
router.get('/history/featured', getFeaturedHistories);

// Get unique locations
router.get('/history/locations', getHistoryLocations);

// Get single history by ID or slug
router.get('/history/:identifier', getHistoryByIdOrSlug);

// ==================== ADMIN ROUTES ====================
// NOTE: Add authentication middleware before deploying
// Example: router.post('/admin/history', authenticateAdmin, createHistory);

// Create new history entry
router.post('/admin/history', createHistory);

// Get all histories (with admin filters)
router.get('/admin/history', getAllHistoriesAdmin);

// Get single history by ID
router.get('/admin/history/:id', getHistoryById);

// Update history entry
router.put('/admin/history/:id', updateHistory);

// Delete history entry
router.delete('/admin/history/:id', deleteHistory);

// Toggle featured status
router.patch('/admin/history/:id/featured', toggleHistoryFeatured);

// Toggle active status
router.patch('/admin/history/:id/active', toggleHistoryActive);

export default router;
