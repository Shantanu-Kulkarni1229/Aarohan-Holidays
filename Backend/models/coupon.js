import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    // Coupon Code
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code must not exceed 20 characters"],
    },

    // Discount Details
    discountPercentage: {
      type: Number,
      required: [true, "Discount percentage is required"],
      min: [1, "Discount percentage must be at least 1%"],
      max: [100, "Discount percentage cannot exceed 100%"],
    },

    // Description
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Validity Period
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"],
      default: Date.now,
    },
    validTo: {
      type: Date,
      required: [true, "Valid to date is required"],
      validate: {
        validator: function (v) {
          return v > this.validFrom;
        },
        message: "Valid to date must be after valid from date",
      },
    },

    // Status
    isActive: {
      type: Boolean,
      default: true,
    },

    // Usage Limits
    usageLimit: {
      type: Number,
      default: null, // null means unlimited
      min: [1, "Usage limit must be at least 1"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "Used count cannot be negative"],
    },

    // Minimum Order Amount (optional)
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },

    // Maximum Discount Amount (optional cap)
    maxDiscountAmount: {
      type: Number,
      default: null, // null means no cap
      min: [0, "Maximum discount amount cannot be negative"],
    },

    // Applicable to specific tours/treks (optional)
    applicableToType: {
      type: String,
      enum: ["all", "tour", "trek"],
      default: "all",
    },
    applicableToIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [], // Empty means all tours/treks
    },

    // Created By (admin user ID - optional for future user management)
    createdBy: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

// Index for faster lookups
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

// Virtual to check if coupon is currently valid
couponSchema.virtual("isCurrentlyValid").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.validFrom <= now &&
    this.validTo >= now &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

// Method to check if coupon can be applied to specific booking
couponSchema.methods.canApplyTo = function (bookingType, itemId, orderAmount) {
  // Check if coupon is currently valid
  if (!this.isCurrentlyValid) {
    return { valid: false, message: "Coupon is not currently valid" };
  }

  // Check minimum order amount
  if (orderAmount < this.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order amount of ₹${this.minOrderAmount} required`,
    };
  }

  // Check if coupon is applicable to booking type
  if (this.applicableToType !== "all" && this.applicableToType !== bookingType) {
    return {
      valid: false,
      message: `Coupon is only applicable to ${this.applicableToType}s`,
    };
  }

  // Check if coupon is applicable to specific tour/trek
  if (
    this.applicableToIds.length > 0 &&
    !this.applicableToIds.some((id) => id.toString() === itemId.toString())
  ) {
    return {
      valid: false,
      message: "Coupon is not applicable to this tour/trek",
    };
  }

  return { valid: true, message: "Coupon is valid" };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  let discountAmount = (orderAmount * this.discountPercentage) / 100;

  // Apply maximum discount cap if set
  if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
    discountAmount = this.maxDiscountAmount;
  }

  return Math.round(discountAmount);
};

// Ensure virtuals are included when converting to JSON
couponSchema.set("toJSON", { virtuals: true });
couponSchema.set("toObject", { virtuals: true });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
