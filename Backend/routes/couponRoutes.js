import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getActiveCoupons,
} from "../controllers/couponController.js";

const router = express.Router();

// ====================================
// 🟢 PUBLIC ROUTES
// ====================================

// Validate coupon code
router.post("/validate", validateCoupon);

// Get all active coupons (for display purposes)
router.get("/active", getActiveCoupons);

// ====================================
// 🟣 ADMIN ROUTES
// ====================================

// Create new coupon
router.post("/admin/coupons", createCoupon);

// Get all coupons with filtering and pagination
router.get("/admin/coupons", getAllCoupons);

// Get coupon by ID
router.get("/admin/coupons/:id", getCouponById);

// Update coupon
router.put("/admin/coupons/:id", updateCoupon);

// Delete coupon
router.delete("/admin/coupons/:id", deleteCoupon);

export default router;
