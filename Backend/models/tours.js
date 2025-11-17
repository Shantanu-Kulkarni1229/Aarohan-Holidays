import mongoose from "mongoose";

// ✅ Category-based pricing schema for city-specific pricing
const categoryPriceSchema = new mongoose.Schema({
  city: { type: String, required: true },
  budget: { type: Number, required: true, min: 0 },
  economy: { type: Number, required: true, min: 0 },
  deluxe: { type: Number, required: true, min: 0 },
  premium: { type: Number, required: true, min: 0 },
  luxury: { type: Number, required: true, min: 0 },
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
    },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalBookings: { type: Number, default: 0 },
    maxGroupSize: { type: Number, default: 20 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isFixedDeparture: { type: Boolean, default: false }, // NEW: Fixed departure flag
  },
  { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema);
export default Tour;
