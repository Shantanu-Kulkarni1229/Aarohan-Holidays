import mongoose from "mongoose";

// ✅ Flexible pricing schema for city-specific pricing (admin can add custom price categories)
const categoryPriceSchema = new mongoose.Schema({
  city: { type: String, required: true },
  pricingOptions: [{
    categoryName: { type: String, required: true }, // e.g., "Economy", "Deluxe", custom names
    price: { type: Number, required: true, min: 0 }
  }]
});

// ✅ Add-on options schema (for extra charges)
const addOnSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Extra Meal", "Guide Service"
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: "" }
});

// ✅ Additional facilities schema
const addonFacilitySchema = new mongoose.Schema({
  header: { type: String, required: true }, // e.g., "Transportation", "Accommodation"
  subPoints: { type: [String], default: [] } // Array of facility details
});

// ✅ FAQ Schema (reusable and structured)
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const tourSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, minlength: 20 },
    location: { type: String, required: true },
    duration: { type: String, required: true },

    // ✅ Image Fields
    thumbnail: { type: String, required: true }, // single thumbnail image
    showcaseImages: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 5;
        },
        message: "You can upload up to 5 showcase images only.",
      },
      default: [],
    },

    // ✅ Categorization
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
        "Pilgrimage",
        "Custom",
      ],
      default: "Custom",
    },

    // ✅ Domestic / International
    regionType: {
      type: String,
      enum: ["Domestic", "International"],
      required: true,
      default: "Domestic",
    },

    // ✅ State (for Domestic tours)
    state: {
      type: String,
      required: function() {
        return this.regionType === "Domestic";
      },
      trim: true,
      default: "",
    },

    // ✅ Country (for International tours)
    country: {
      type: String,
      required: function() {
        return this.regionType === "International";
      },
      trim: true,
      default: "",
    },

    // ✅ Special Type (Festival / Seasonal)
    specialType: {
      type: String,
      enum: [
        "None",
        "Weekend Special",
        "Diwali Special",
        "Christmas Special",
        "New Year Special",
        "Summer Special",
        "Winter Special",
        "Monsoon Special",
      ],
      default: "None",
    },

    // ✅ Multiple Available Dates
    availableDates: {
      type: [Date],
      validate: {
        validator: function (v) {
          return v.every((date) => date > new Date());
        },
        message: "All available dates must be future dates.",
      },
      default: [],
    },

    // ✅ Video Link (optional)
    videoLink: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid URL for the video link.",
      },
      default: "",
    },

    // ✅ FAQs (list of common questions)
    faqs: {
      type: [faqSchema],
      default: [],
    },

    // Existing Fields
    tourType: {
      type: String,
      enum: [
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
      ],
      default: "Adventure",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard"],
      default: "Moderate",
    },

    highlights: { type: [String], default: [] },
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },

    itinerary: [
      {
        day: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        meals: { type: String, default: "" },
        accommodation: { type: String, default: "" },
        note: { type: String, default: "" }, // NEW: Optional note for each day
        activities: { type: [String], default: [] }, // NEW: List of activities/things to do
      },
    ],

    cityPricing: {
      type: [categoryPriceSchema],
      validate: [
        {
          validator: function (value) {
            const cities = value.map((item) => item.city);
            return new Set(cities).size === cities.length; // prevent duplicates
          },
          message: "Duplicate city pricing is not allowed",
        },
      ],
      default: []
    },

    // ✅ Add-on options (optional extras)
    addOns: {
      type: [addOnSchema],
      default: []
    },

    // ✅ Additional facilities
    addonFacilities: {
      type: [addonFacilitySchema],
      default: []
    },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalBookings: { type: Number, default: 0 },
    maxGroupSize: { type: Number, default: 20 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isFixedDeparture: { type: Boolean, default: false }, // Fixed departure flag
    isOnlyFixedDeparture: { type: Boolean, default: false }, // Only show as fixed departure (not in normal tours)
  },
  { timestamps: true }
);

// Prevent model recompilation error by checking if model already exists
const Tour = mongoose.models.Tour || mongoose.model("Tour", tourSchema);
export default Tour;
