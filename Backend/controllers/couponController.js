import Coupon from "../models/coupon.js";
import mongoose from "mongoose";

// ====================================
// 🟢 CREATE COUPON (ADMIN)
// ====================================
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountPercentage,
      description,
      validFrom,
      validTo,
      isActive,
      usageLimit,
      minOrderAmount,
      maxDiscountAmount,
      applicableToType,
      applicableToIds,
    } = req.body;

    // Validate required fields
    if (!code || !discountPercentage || !validFrom || !validTo) {
      return res.status(400).json({
        success: false,
        message: "Code, discount percentage, validFrom, and validTo are required",
      });
    }

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // Create new coupon
    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountPercentage,
      description,
      validFrom,
      validTo,
      isActive: isActive !== undefined ? isActive : true,
      usageLimit,
      minOrderAmount,
      maxDiscountAmount,
      applicableToType: applicableToType || "all",
      applicableToIds: applicableToIds || [],
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create coupon",
    });
  }
};

// ====================================
// 🟢 GET ALL COUPONS (ADMIN)
// ====================================
export const getAllCoupons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      isActive,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    // Build filter
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Pagination
    const skip = (page - 1) * limit;
    const coupons = await Coupon.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const totalCoupons = await Coupon.countDocuments(filter);
    const totalPages = Math.ceil(totalCoupons / limit);

    // Get statistics
    const stats = {
      total: totalCoupons,
      active: await Coupon.countDocuments({ isActive: true }),
      expired: await Coupon.countDocuments({
        validTo: { $lt: new Date() },
      }),
      unlimited: await Coupon.countDocuments({ usageLimit: null }),
    };

    res.status(200).json({
      success: true,
      data: coupons,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalCoupons,
        itemsPerPage: Number(limit),
      },
      statistics: stats,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupons",
    });
  }
};

// ====================================
// 🟢 GET COUPON BY ID (ADMIN)
// ====================================
export const getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch coupon",
    });
  }
};

// ====================================
// 🟢 UPDATE COUPON (ADMIN)
// ====================================
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    // If updating code, check for duplicates
    if (updateData.code) {
      const existingCoupon = await Coupon.findOne({
        code: updateData.code.toUpperCase(),
        _id: { $ne: id },
      });

      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }

      updateData.code = updateData.code.toUpperCase();
    }

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update coupon",
    });
  }
};

// ====================================
// 🟢 DELETE COUPON (ADMIN)
// ====================================
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID",
      });
    }

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete coupon",
    });
  }
};

// ====================================
// 🟢 VALIDATE COUPON (PUBLIC)
// ====================================
export const validateCoupon = async (req, res) => {
  try {
    const { code, bookingType, itemId, orderAmount } = req.body;

    if (!code || !bookingType || !itemId || !orderAmount) {
      return res.status(400).json({
        success: false,
        message: "Code, bookingType, itemId, and orderAmount are required",
      });
    }

    // Find coupon by code
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check if coupon can be applied
    const validation = coupon.canApplyTo(bookingType, itemId, orderAmount);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalAmount = orderAmount - discountAmount;

    res.status(200).json({
      success: true,
      message: "Coupon is valid",
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount,
        originalAmount: orderAmount,
        finalAmount,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to validate coupon",
    });
  }
};

// ====================================
// 🟢 APPLY COUPON (INTERNAL USE)
// ====================================
export const applyCoupon = async (couponCode, bookingType, itemId, orderAmount) => {
  try {
    // Find coupon
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });

    if (!coupon) {
      return { success: false, message: "Invalid coupon code" };
    }

    // Validate coupon
    const validation = coupon.canApplyTo(bookingType, itemId, orderAmount);

    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalAmount = orderAmount - discountAmount;

    // Increment usage count
    coupon.usedCount += 1;
    await coupon.save();

    return {
      success: true,
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
        discountAmount,
        originalAmount: orderAmount,
        finalAmount,
      },
    };
  } catch (error) {
    console.error("Error applying coupon:", error);
    return { success: false, message: error.message };
  }
};

// ====================================
// 🟢 GET ACTIVE COUPONS (PUBLIC)
// ====================================
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
    })
      .select("code description discountPercentage validTo minOrderAmount")
      .sort({ discountPercentage: -1 });

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    console.error("Error fetching active coupons:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active coupons",
    });
  }
};
