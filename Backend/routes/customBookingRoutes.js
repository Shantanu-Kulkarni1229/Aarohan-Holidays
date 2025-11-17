import express from "express";
import { upload } from "../middlewares/uploadMiddleware.js";
import {
  createCustomBooking,
  getAllCustomBookings,
  getCustomBookingById,
  updateCustomBooking,
  deleteCustomBooking,
  resendCustomBooking,
  updatePaymentStatus,
  getCustomBookingStats,
  downloadCustomBookingPDF
} from "../controllers/customBookingController.js";

const router = express.Router();

// Create new custom booking and send to customer (with optional thumbnail)
router.post("/", upload.single('thumbnail'), createCustomBooking);

// Get all custom bookings with filters
router.get("/", getAllCustomBookings);

// Get statistics
router.get("/stats", getCustomBookingStats);

// Get single custom booking by ID
router.get("/:id", getCustomBookingById);

// Update custom booking
router.put("/:id", updateCustomBooking);

// Delete custom booking
router.delete("/:id", deleteCustomBooking);

// Resend email and PDF
router.post("/:id/resend", resendCustomBooking);

// Update payment status
router.patch("/:id/payment", updatePaymentStatus);

// Download PDF
router.get("/:id/download-pdf", downloadCustomBookingPDF);

export default router;
