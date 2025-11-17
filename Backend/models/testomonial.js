import mongoose from "mongoose";

// ✅ Testimonial Schema
const testimonialSchema = new mongoose.Schema(
  {
    // Customer Information
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },

    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1 star"],
      max: [5, "Rating cannot exceed 5 stars"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number"
      }
    },

    // Review Text
    review: {
      type: String,
      required: [true, "Review text is required"],
      trim: true,
      minlength: [10, "Review must be at least 10 characters long"],
      maxlength: [1000, "Review cannot exceed 1000 characters"]
    },

    // Optional: Email for verification
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address"
      ]
    },

    // Optional: Tour/Trek reference
    tourOrTrek: {
      type: String,
      trim: true,
      default: ""
    },

    // Optional: Location/City
    location: {
      type: String,
      trim: true,
      default: ""
    },

    // Status (for admin approval)
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Approved" // Auto-approve all testimonials
    },

    // Display on homepage
    isFeatured: {
      type: Boolean,
      default: false
    },

    // Admin notes (internal use)
    adminNotes: {
      type: String,
      trim: true,
      default: ""
    },

    // Helpful count (for future like/helpful feature)
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0
    },

    // Verified customer (who actually booked)
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ✅ Virtual for formatted date
testimonialSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
});

// ✅ Virtual for star display
testimonialSchema.virtual("stars").get(function () {
  return "⭐".repeat(this.rating);
});

// ✅ Virtual for short review (first 100 chars)
testimonialSchema.virtual("shortReview").get(function () {
  return this.review.length > 100 
    ? this.review.substring(0, 100) + "..." 
    : this.review;
});

// ✅ Instance method to check if highly rated
testimonialSchema.methods.isHighlyRated = function () {
  return this.rating >= 4;
};

// ✅ Static method to get approved testimonials
testimonialSchema.statics.getApproved = function (limit = 10) {
  return this.find({ status: "Approved" })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// ✅ Static method to get featured testimonials
testimonialSchema.statics.getFeatured = function (limit = 6) {
  return this.find({ 
    status: "Approved", 
    isFeatured: true 
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// ✅ Static method to calculate average rating
testimonialSchema.statics.getAverageRating = async function () {
  const result = await this.aggregate([
    { $match: { status: "Approved" } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  return result.length > 0 
    ? {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews
      }
    : { averageRating: 0, totalReviews: 0 };
};

// ✅ Static method to get rating distribution
testimonialSchema.statics.getRatingDistribution = async function () {
  const distribution = await this.aggregate([
    { $match: { status: "Approved" } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  // Convert to object format
  const result = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distribution.forEach(item => {
    result[item._id] = item.count;
  });

  return result;
};

// ✅ Indexes for better query performance
testimonialSchema.index({ status: 1, createdAt: -1 });
testimonialSchema.index({ rating: 1 });
testimonialSchema.index({ isFeatured: 1, status: 1 });

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
