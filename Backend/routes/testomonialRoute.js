import express from "express";
import {
  createTestimonial,
  getApprovedTestimonials,
  getFeaturedTestimonials,
  getTestimonialStats,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonialStatus,
  updateTestimonial,
  deleteTestimonial,
  getPendingTestimonials,
  bulkApproveTestimonials,
  toggleFeatured,
  getAdminStats
} from "../controllers/testomonialController.js";

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// ✅ Create new testimonial
// POST /api/testimonials
router.post("/", createTestimonial);

// ✅ Get approved testimonials with pagination
// GET /api/testimonials/approved?limit=20&page=1
router.get("/approved", getApprovedTestimonials);

// ✅ Get featured testimonials (for homepage)
// GET /api/testimonials/featured?limit=6
router.get("/featured", getFeaturedTestimonials);

// ✅ Get testimonial statistics
// GET /api/testimonials/stats
router.get("/stats", getTestimonialStats);

// ========================================
// ADMIN ROUTES (Should be protected with authentication middleware)
// ========================================

// ✅ Get admin dashboard statistics
// GET /api/testimonials/admin/stats
router.get("/admin/stats", getAdminStats);

// ✅ Get pending testimonials
// GET /api/testimonials/admin/pending
router.get("/admin/pending", getPendingTestimonials);

// ✅ Bulk approve testimonials
// POST /api/testimonials/admin/bulk-approve
router.post("/admin/bulk-approve", bulkApproveTestimonials);

// ✅ Toggle featured status
// PATCH /api/testimonials/admin/:id/toggle-featured
router.patch("/admin/:id/toggle-featured", toggleFeatured);

// ✅ Get all testimonials with filters
// GET /api/testimonials/admin?status=Pending&rating=5&page=1&limit=20
router.get("/admin", getAllTestimonials);

// ✅ Update testimonial status (Approve/Reject)
// PATCH /api/testimonials/admin/:id/status
router.patch("/admin/:id/status", updateTestimonialStatus);

// ✅ Update testimonial (full edit)
// PUT /api/testimonials/admin/:id
router.put("/admin/:id", updateTestimonial);

// ✅ Delete testimonial
// DELETE /api/testimonials/admin/:id
router.delete("/admin/:id", deleteTestimonial);

// ✅ Get testimonial by ID
// GET /api/testimonials/admin/:id
router.get("/admin/:id", getTestimonialById);

export default router;
