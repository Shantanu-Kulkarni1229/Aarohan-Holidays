import express from "express";
import upload from "../middlewares/upload.js";
import {
  createTour,
  getAllTours,
  getTourById,
  updateTour,
  deleteTour,
  createTrek,
  getAllTreks,
  getTrekById,
  updateTrek,
  deleteTrek,
  getAllTestimonials,
  getTestimonialById,
  updateTestimonialStatus,
  bulkUpdateTestimonials,
  deleteTestimonial,
  getAllEnquiries,
  getEnquiryById,
  getEnquiryByReference,
  updateEnquiryStatus,
  bulkUpdateEnquiries,
  deleteEnquiry,
} from "../controllers/adminController.js";

const router = express.Router();

// ---------- TOURS ----------
router.post(
  "/tours",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "showcaseImages", maxCount: 5 },
    { name: "hotelImages", maxCount: 5 },
  ]),
  createTour
);
router.get("/tours", getAllTours);
router.get("/tours/:id", getTourById);
router.put(
  "/tours/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "showcaseImages", maxCount: 5 },
    { name: "hotelImages", maxCount: 5 },
  ]),
  updateTour
);
router.delete("/tours/:id", deleteTour);

// ---------- TREKS ----------
router.post(
  "/treks",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "showcaseImages", maxCount: 5 },
    { name: "hotelImages", maxCount: 5 },
  ]),
  createTrek
);
router.get("/treks", getAllTreks);
router.get("/treks/:id", getTrekById);
router.put(
  "/treks/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "showcaseImages", maxCount: 5 },
    { name: "hotelImages", maxCount: 5 },
  ]),
  updateTrek
);
router.delete("/treks/:id", deleteTrek);

// ---------- TESTIMONIALS ----------
// Get all testimonials with statistics and filtering
router.get("/testimonials", getAllTestimonials);

// Get specific testimonial by ID
router.get("/testimonials/:id", getTestimonialById);

// Update testimonial status (approve/reject), featured status, or add admin notes
router.patch("/testimonials/:id/status", updateTestimonialStatus);

// Bulk update testimonials (bulk approve/reject/delete)
router.patch("/testimonials/bulk-update", bulkUpdateTestimonials);

// Delete testimonial
router.delete("/testimonials/:id", deleteTestimonial);

// ---------- ENQUIRIES (Other Services) ----------
// Get all enquiries with statistics and filtering
router.get("/enquiries", getAllEnquiries);

// Get specific enquiry by ID
router.get("/enquiries/:id", getEnquiryById);

// Get enquiry by reference number
router.get("/enquiries/reference/:reference", getEnquiryByReference);

// Update enquiry status and priority
router.patch("/enquiries/:id/status", updateEnquiryStatus);

// Bulk update enquiries (bulk status update/delete)
router.patch("/enquiries/bulk-update", bulkUpdateEnquiries);

// Delete enquiry
router.delete("/enquiries/:id", deleteEnquiry);

export default router;
