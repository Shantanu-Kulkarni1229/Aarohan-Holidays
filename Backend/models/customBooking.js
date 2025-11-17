import mongoose from "mongoose";

// Schema for custom tour/trek pricing (category-based)
const customPricingSchema = new mongoose.Schema({
  // Demographics (for analytics only)
  adults: { type: Number, default: 0, min: 0 },
  women: { type: Number, default: 0, min: 0 },
  children: { type: Number, default: 0, min: 0 },
  infants: { type: Number, default: 0, min: 0 },
  
  // Category-based pricing
  selectedCategory: {
    type: String,
    enum: ["budget", "economy", "deluxe", "premium", "luxury"],
    required: true,
    lowercase: true
  },
  pricePerPerson: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  numberOfMembers: { type: Number, required: true, min: 1 }
});

// Itinerary schema for custom bookings
const customItinerarySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  meals: { type: String, default: "" },
  accommodation: { type: String, default: "" },
  note: { type: String, default: "" }, // NEW: Day-specific notes
  activities: { type: [String], default: [] }
});

const customBookingSchema = new mongoose.Schema(
  {
    // Customer Information
    customerName: { type: String, required: true, trim: true },
    customerEmail: { 
      type: String, 
      required: true, 
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    customerPhone: { type: String, required: true },

    // Package Type
    packageType: {
      type: String,
      enum: ["Tour", "Trek"],
      required: true
    },

    // Basic Package Information
    packageName: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    duration: { type: String, required: true },

    // Categorization
    category: {
      type: String,
      enum: [
        "Honeymoon Package",
        "Adventure",
        "Cultural",
        "Wildlife",
        "Spiritual",
        "Heritage",
        "Beach",
        "Hill Station",
        "Desert",
        "Backwater",
        "Photography",
        "Custom",
        "Himalayan Trek",
        "Sahyadri Trek"
      ],
      default: "Custom",
    },

    regionType: {
      type: String,
      enum: ["Domestic", "International"],
      default: "Domestic",
    },

    state: { type: String, default: "" },
    country: { type: String, default: "" },

    // Trek specific fields
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard", "Extreme"],
      default: "Moderate",
    },

    altitude: { type: Number, default: 0 },
    fitnessLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    // Package Details
    highlights: { type: [String], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },
    itinerary: [customItinerarySchema],

    // Pricing and Travelers
    pricing: {
      type: customPricingSchema,
      required: true
    },

    // Travel Dates
    startDate: { type: Date, required: true },
    endDate: { type: Date },

    // Pickup Details
    pickupCity: { type: String, required: true },
    pickupLocation: { type: String, default: "" },

    // Images (optional - can attach tour/trek images)
    thumbnail: { type: String, default: "" },
    images: { type: [String], default: [] },

    // Additional Information
    specialRequests: { type: String, default: "" },
    videoLink: { type: String, default: "" },

    // Payment Information
    paymentLink: { type: String, default: "" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Partial", "Paid", "Refunded"],
      default: "Pending"
    },
    
    // Razorpay Payment Details
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
    razorpaySignature: { type: String, default: "" },
    paymentMethod: {
      type: String,
      enum: ["razorpay", "offline", "pending"],
      default: "pending"
    },

    // Email & PDF Status
    emailSent: { type: Boolean, default: false },
    emailSentAt: { type: Date },
    pdfGenerated: { type: Boolean, default: false },
    pdfPath: { type: String, default: "" },

    // Booking Status
    status: {
      type: String,
      enum: ["Quote Sent", "Payment Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Quote Sent"
    },

    // Admin Notes
    adminNotes: { type: String, default: "" },

    // Timestamps
    quoteSentDate: { type: Date },
    confirmedDate: { type: Date },
  },
  { timestamps: true }
);

// Index for faster queries
customBookingSchema.index({ customerEmail: 1 });
customBookingSchema.index({ status: 1 });
customBookingSchema.index({ createdAt: -1 });

const CustomBooking = mongoose.model("CustomBooking", customBookingSchema);
export default CustomBooking;
