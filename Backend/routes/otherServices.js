import express from "express";
import {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  getEnquiryByReference,
  updateEnquiryStatus,
  getPendingEnquiries,
  getUrgentEnquiries,
  deleteEnquiry,
  getEnquiryStats
} from "../controllers/otherServices.js";

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// ✅ Create new enquiry
// POST /api/other-services/enquiry
router.post("/enquiry", createEnquiry);

// ✅ Get enquiry by reference number (for users to track their enquiry)
// GET /api/other-services/enquiry/reference/:reference
router.get("/enquiry/reference/:reference", getEnquiryByReference);

// ========================================
// ADMIN ROUTES (Should be protected with authentication middleware)
// ========================================

// ✅ Get enquiry statistics
// GET /api/other-services/stats
router.get("/stats", getEnquiryStats);

// ✅ Get pending enquiries
// GET /api/other-services/pending
router.get("/pending", getPendingEnquiries);

// ✅ Get urgent enquiries
// GET /api/other-services/urgent
router.get("/urgent", getUrgentEnquiries);

// ✅ Get all enquiries with filters
// GET /api/other-services?status=Pending&serviceType=Taxi Booking Services&priority=High&page=1&limit=20
router.get("/", getAllEnquiries);

// ✅ Get enquiry by ID
// GET /api/other-services/:id
router.get("/:id", getEnquiryById);

// ✅ Update enquiry status
// PUT /api/other-services/:id/status
router.put("/:id/status", updateEnquiryStatus);

// ✅ Delete enquiry
// DELETE /api/other-services/:id
router.delete("/:id", deleteEnquiry);

export default router;
