import express from "express";
import {
  createOrder,
  verifyPaymentAndCreateBooking,
  getPaymentStatus,
  handlePaymentFailure,
  refundPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

// ====================================
// 🟢 PUBLIC PAYMENT ROUTES
// ====================================

// Create Razorpay order
router.post("/create-order", createOrder);

// Verify payment and create booking
router.post("/verify", verifyPaymentAndCreateBooking);

// Handle payment failure
router.post("/failure", handlePaymentFailure);

// Get payment status
router.get("/status/:paymentId", getPaymentStatus);

// ====================================
// 🟣 ADMIN PAYMENT ROUTES
// ====================================

// Process refund
router.post("/admin/refund/:bookingId", refundPayment);

export default router;
