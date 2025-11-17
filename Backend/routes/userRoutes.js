import express from "express";
import {
  // Tours Controllers
  getAllTours,
  getTourById,
  searchTours,
  getFeaturedTours,
  getTrendingTours,
  getSpecialTours,
  getToursByCategory,
  
  // Treks Controllers
  getAllTreks,
  getTrekById,
  searchTreks,
  getFeaturedTreks,
  getSpecialTreks,
  getTreksByCategory,
  getTreksByDifficulty,
  
  // Combined/Utility Controllers
  globalSearch,
  getPublicStats,
  getCategories,
  
  // Availability Controllers
  checkTourAvailability,
  checkTrekAvailability,
  getTourAvailability,
  getTrekAvailability,
} from "../controllers/userController.js";

const router = express.Router();

// -----------------------------
// 🟢 TOURS ROUTES (PUBLIC)
// -----------------------------

// Search tours by name/description (MUST be before /:id route)
// GET /api/tours/search?q=kerala&limit=10
router.get("/tours/search", searchTours);

// Get featured tours for homepage
// GET /api/tours/featured?limit=6
router.get("/tours/featured", getFeaturedTours);

// Get trending tours
// GET /api/tours/trending?limit=6
router.get("/tours/trending", getTrendingTours);

// Get special tours (with specialType other than "None")
// GET /api/tours/special?limit=6&specialType=Diwali Special
router.get("/tours/special", getSpecialTours);

// Get tours by category
// GET /api/tours/category/adventure?page=1&limit=12
router.get("/tours/category/:category", getToursByCategory);

// Get availability for all dates of a tour (MUST be before /:id route)
// GET /api/tours/507f1f77bcf86cd799439011/availability
router.get("/tours/:id/availability", getTourAvailability);

// Get all tours with filtering, search, and pagination
// GET /api/tours?page=1&limit=12&category=adventure&search=kerala&featured=true
router.get("/tours", getAllTours);

// Get specific tour by ID (MUST be after other /tours routes)
// GET /api/tours/507f1f77bcf86cd799439011
router.get("/tours/:id", getTourById);

// -----------------------------
// 🟣 TREKS ROUTES (PUBLIC)
// -----------------------------

// Search treks by name/description (MUST be before /:id route)
// GET /api/treks/search?q=himalayan&limit=10
router.get("/treks/search", searchTreks);

// Get featured treks for homepage
// GET /api/treks/featured?limit=6
router.get("/treks/featured", getFeaturedTreks);

// Get special treks (with specialType other than "None")
// GET /api/treks/special?limit=6&specialType=Monsoon Special
router.get("/treks/special", getSpecialTreks);

// Get treks by category
// GET /api/treks/category/himalayan?page=1&limit=12
router.get("/treks/category/:category", getTreksByCategory);

// Get treks by difficulty level
// GET /api/treks/difficulty/moderate?page=1&limit=12
router.get("/treks/difficulty/:difficulty", getTreksByDifficulty);

// Get availability for all dates of a trek (MUST be before /:id route)
// GET /api/treks/507f1f77bcf86cd799439011/availability
router.get("/treks/:id/availability", getTrekAvailability);

// Get all treks with filtering, search, and pagination
// GET /api/treks?page=1&limit=12&difficulty=moderate&search=himalayan&featured=true
router.get("/treks", getAllTreks);

// Get specific trek by ID (MUST be after other /treks routes)
// GET /api/treks/507f1f77bcf86cd799439011
router.get("/treks/:id", getTrekById);

// -----------------------------
// 🔍 SEARCH & UTILITY ROUTES
// -----------------------------

// Global search across tours and treks
// GET /api/search?q=kerala&limit=5
router.get("/search", globalSearch);

// Get public statistics for homepage
// GET /api/stats
router.get("/stats", getPublicStats);

// Get all available categories for filters
// GET /api/categories
router.get("/categories", getCategories);

// Check tour availability for a specific date
// GET /api/tours/availability?tourId=507f1f77bcf86cd799439011&date=2024-12-25
router.get("/tours/availability", checkTourAvailability);

// Check trek availability for a specific date
// GET /api/treks/availability?trekId=507f1f77bcf86cd799439011&date=2024-12-25
router.get("/treks/availability", checkTrekAvailability);

export default router;
