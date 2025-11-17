import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingsByTourId,
  getBookingsByTrekId,
  getBookingById,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
  resendConfirmation,
  createOfflineBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// ====================================
// 🟢 PUBLIC ROUTES (User Bookings)
// ====================================

// Create a new booking
router.post("/bookings", createBooking);

// Get booking by ID (for user to check their booking)
router.get("/bookings/:id", getBookingById);

// ====================================
// 🟣 ADMIN ROUTES (Booking Management)
// ====================================

// Get all bookings
router.get("/admin/bookings", getAllBookings);

// Get bookings by tour ID
router.get("/admin/bookings/tour/:tourId", getBookingsByTourId);

// Get bookings by trek ID
router.get("/admin/bookings/trek/:trekId", getBookingsByTrekId);

// Create offline booking (Admin only)
router.post("/admin/bookings/offline", createOfflineBooking);

// Update booking status
router.patch("/admin/bookings/:id/status", updateBookingStatus);

// Update payment status
router.patch("/admin/bookings/:id/payment", updatePaymentStatus);

// Delete booking
router.delete("/admin/bookings/:id", deleteBooking);

// Resend confirmation email and WhatsApp
router.post("/admin/bookings/:id/resend", resendConfirmation);

export default router;
