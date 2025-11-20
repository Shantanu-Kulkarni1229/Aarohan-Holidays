import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // User Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit mobile number"],
    },

    // Booking Details
    bookingType: {
      type: String,
      enum: ["tour", "trek"],
      required: [true, "Booking type is required"],
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: function() {
        return this.bookingType === "tour";
      },
    },
    trekId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trek",
      required: function() {
        return this.bookingType === "trek";
      },
    },

    // Group Information
    numberOfMembers: {
      type: Number,
      required: [true, "Total number of members is required"],
      min: [1, "At least 1 member is required"],
    },
    // Demographics (for admin analytics only)
    adults: {
      type: Number,
      default: 0,
      min: [0, "Adults count cannot be negative"],
    },
    women: {
      type: Number,
      default: 0,
      min: [0, "Women count cannot be negative"],
    },
    children: {
      type: Number,
      default: 0,
      min: [0, "Children count cannot be negative"],
    },
    infants: {
      type: Number,
      default: 0,
      min: [0, "Infants count cannot be negative"],
    },
    
    // Category Selection (Flexible pricing category name) - ONLY FOR TOURS
    selectedCategory: {
      type: String,
      trim: true,
    },

    // Location
    pickupCity: {
      type: String,
      required: [true, "Pickup city is required"],
      trim: true,
    },

    // Booking Date
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
      validate: {
        validator: function (v) {
          return v > new Date();
        },
        message: "Booking date must be a future date",
      },
    },

    // Status
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },

    // Pricing
    pricePerPerson: {
      type: Number,
      required: [true, "Price per person is required"],
      min: [0, "Price cannot be negative"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: [0, "Original price cannot be negative"],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },

    // Coupon Details
    couponCode: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, "Discount percentage cannot be negative"],
      max: [100, "Discount percentage cannot exceed 100"],
    },

    // Communication Status
    emailSent: {
      type: Boolean,
      default: false,
    },
    whatsappSent: {
      type: Boolean,
      default: false,
    },

    // Additional Information
    specialRequests: {
      type: String,
      default: "",
      trim: true,
    },

    // Payment Details
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "completed", "refunded", "failed"],
      default: "pending",
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, "Amount paid cannot be negative"],
    },

    // Razorpay Payment Details
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "offline", "pending"],
      default: "pending",
    },
    transactionId: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },

    // Booking Reference
    bookingReference: {
      type: String,
      unique: true,
      // Don't set required:true since it's auto-generated in pre-save hook
    },
  },
  { timestamps: true }
);

// Generate unique booking reference before saving
bookingSchema.pre("save", function (next) {
  if (!this.bookingReference) {
    const prefix = this.bookingType === "tour" ? "TUR" : "TRK";
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    this.bookingReference = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Virtual for getting tour/trek name
bookingSchema.virtual("itemName").get(function () {
  if (this.bookingType === "tour" && this.tourId) {
    return this.tourId.name;
  } else if (this.bookingType === "trek" && this.trekId) {
    return this.trekId.name;
  }
  return "N/A";
});

// Ensure virtuals are included when converting to JSON
bookingSchema.set("toJSON", { virtuals: true });
bookingSchema.set("toObject", { virtuals: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
