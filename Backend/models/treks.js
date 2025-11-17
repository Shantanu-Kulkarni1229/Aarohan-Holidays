import mongoose from "mongoose";

// Schema for city-based pricing with member type pricing
const priceSchema = new mongoose.Schema({
  city: { type: String, required: true },
  adultPrice: { type: Number, required: true, min: 0 },
  womenPrice: { type: Number, required: true, min: 0 },
  childrenPrice: { type: Number, required: true, min: 0 },
  infantPrice: { type: Number, required: true, min: 0 },
});

// FAQ Schema
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

const trekSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, minlength: 20 },
    location: { type: String, required: true },
    duration: { type: String, required: true },

    // ✅ Image Fields
    thumbnail: { type: String, required: true },
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

    // ✅ Trek Category
    category: {
      type: String,
      enum: [
        "Himalayan Trek",
        "Sahyadri Trek",
      ],
      required: true,
      default: "Sahyadri Trek",
    },

    // ✅ Domestic or International
    regionType: {
      type: String,
      enum: ["Domestic", "International"],
      required: true,
      default: "Domestic",
    },

    // ✅ Special Type (Seasonal or Festival Based)
    specialType: {
      type: String,
      enum: [
        "None",
        "Monsoon Special",
        "Winter Special",
        "Summer Special",
        "Weekend Trek",
        "Festival Trek",
      ],
      default: "None",
    },

    // ✅ Difficulty Level
    difficulty: {
      type: String,
      enum: ["Easy", "Moderate", "Hard", "Extreme"],
      default: "Moderate",
    },

    // ✅ Altitude (in meters)
    altitude: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ✅ Fitness Level Recommendation
    fitnessLevel: {
      type: String,
      enum: [
        "Beginner",
        "Intermediate",
        "Advanced",
      ],
      default: "Beginner",
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

    // ✅ Video Link
    videoLink: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid video link URL.",
      },
      default: "",
    },

    // ✅ FAQs
    faqs: {
      type: [faqSchema],
      default: [],
    },

    // ✅ Highlights
    highlights: { type: [String], default: [] },

    // ✅ Inclusions & Exclusions
    inclusions: { type: [String], default: [] },
    exclusions: { type: [String], default: [] },

    // ✅ Itinerary
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

    // ✅ Pricing (per city)
    cityPricing: {
      type: [priceSchema],
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

    // ✅ Additional Fields
    maxGroupSize: { type: Number, default: 15 },
    totalBookings: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isFixedDeparture: { type: Boolean, default: false }, // NEW: Fixed departure flag
  },
  { timestamps: true }
);

const Trek = mongoose.model("Trek", trekSchema);
export default Trek;
