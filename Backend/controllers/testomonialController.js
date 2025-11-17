import Testimonial from "../models/testomonial.js";

// ========================================
// PUBLIC CONTROLLERS
// ========================================

// ✅ Create new testimonial (Public - anyone can submit)
export const createTestimonial = async (req, res) => {
  try {
    const { name, rating, review, email, tourOrTrek, location } = req.body;

    // Create new testimonial
    const testimonial = new Testimonial({
      name,
      rating,
      review,
      email,
      tourOrTrek,
      location,
      status: "Approved" // Automatically approve testimonials
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: "Thank you for your review! Your testimonial has been published.",
      data: testimonial
    });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to submit testimonial",
      error: error.message
    });
  }
};

// ✅ Get all approved testimonials (Public)
export const getApprovedTestimonials = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    const testimonials = await Testimonial.find({ status: "Approved" })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select("-adminNotes"); // Hide admin notes from public

    const total = await Testimonial.countDocuments({ status: "Approved" });

    res.status(200).json({
      success: true,
      data: testimonials,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCount: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
      error: error.message
    });
  }
};

// ✅ Get featured testimonials (Public - for homepage)
export const getFeaturedTestimonials = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const testimonials = await Testimonial.getFeatured(parseInt(limit));

    res.status(200).json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
  } catch (error) {
    console.error("Error fetching featured testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured testimonials",
      error: error.message
    });
  }
};

// ✅ Get average rating and statistics (Public)
export const getTestimonialStats = async (req, res) => {
  try {
    const avgRating = await Testimonial.getAverageRating();
    const distribution = await Testimonial.getRatingDistribution();

    // Get recent testimonials count
    const recentCount = await Testimonial.countDocuments({
      status: "Approved",
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    res.status(200).json({
      success: true,
      data: {
        averageRating: avgRating.averageRating,
        totalReviews: avgRating.totalReviews,
        ratingDistribution: distribution,
        recentReviewsCount: recentCount
      }
    });
  } catch (error) {
    console.error("Error fetching testimonial stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message
    });
  }
};

// ========================================
// ADMIN CONTROLLERS
// ========================================

// ✅ Get all testimonials (Admin - including pending/rejected)
export const getAllTestimonials = async (req, res) => {
  try {
    const { status, rating, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (rating) filter.rating = parseInt(rating);

    const testimonials = await Testimonial.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Testimonial.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: testimonials,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalCount: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching all testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonials",
      error: error.message
    });
  }
};

// ✅ Get testimonial by ID (Admin)
export const getTestimonialById = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.status(200).json({
      success: true,
      data: testimonial
    });
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch testimonial",
      error: error.message
    });
  }
};

// ✅ Update testimonial status (Admin - Approve/Reject)
export const updateTestimonialStatus = async (req, res) => {
  try {
    const { status, isFeatured, adminNotes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (typeof isFeatured !== "undefined") updateData.isFeatured = isFeatured;
    if (adminNotes) updateData.adminNotes = adminNotes;

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Testimonial ${status ? status.toLowerCase() : "updated"} successfully`,
      data: testimonial
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update testimonial",
      error: error.message
    });
  }
};

// ✅ Update testimonial (Admin - full edit)
export const updateTestimonial = async (req, res) => {
  try {
    const { name, rating, review, email, tourOrTrek, location, status, isFeatured, adminNotes } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      {
        name,
        rating,
        review,
        email,
        tourOrTrek,
        location,
        status,
        isFeatured,
        adminNotes
      },
      { new: true, runValidators: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      data: testimonial
    });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update testimonial",
      error: error.message
    });
  }
};

// ✅ Delete testimonial (Admin)
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete testimonial",
      error: error.message
    });
  }
};

// ✅ Get pending testimonials (Admin)
export const getPendingTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "Pending" })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: testimonials,
      count: testimonials.length
    });
  } catch (error) {
    console.error("Error fetching pending testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending testimonials",
      error: error.message
    });
  }
};

// ✅ Bulk approve testimonials (Admin)
export const bulkApproveTestimonials = async (req, res) => {
  try {
    const { ids } = req.body; // Array of testimonial IDs

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of testimonial IDs"
      });
    }

    const result = await Testimonial.updateMany(
      { _id: { $in: ids } },
      { status: "Approved" }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} testimonials approved successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error bulk approving testimonials:", error);
    res.status(500).json({
      success: false,
      message: "Failed to approve testimonials",
      error: error.message
    });
  }
};

// ✅ Toggle featured status (Admin)
export const toggleFeatured = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    testimonial.isFeatured = !testimonial.isFeatured;
    await testimonial.save();

    res.status(200).json({
      success: true,
      message: `Testimonial ${testimonial.isFeatured ? "featured" : "unfeatured"} successfully`,
      data: testimonial
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update featured status",
      error: error.message
    });
  }
};

// ✅ Get admin dashboard stats (Admin)
export const getAdminStats = async (req, res) => {
  try {
    const totalTestimonials = await Testimonial.countDocuments();
    const pendingCount = await Testimonial.countDocuments({ status: "Pending" });
    const approvedCount = await Testimonial.countDocuments({ status: "Approved" });
    const rejectedCount = await Testimonial.countDocuments({ status: "Rejected" });
    const featuredCount = await Testimonial.countDocuments({ isFeatured: true, status: "Approved" });

    const avgRating = await Testimonial.getAverageRating();
    const distribution = await Testimonial.getRatingDistribution();

    // Recent testimonials (last 7 days)
    const recentTestimonials = await Testimonial.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalTestimonials,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        featured: featuredCount,
        recentWeek: recentTestimonials,
        averageRating: avgRating.averageRating,
        totalReviews: avgRating.totalReviews,
        ratingDistribution: distribution
      }
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message
    });
  }
};
