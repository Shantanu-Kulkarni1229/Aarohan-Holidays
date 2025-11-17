import Tour from "../models/tours.js";
import Trek from "../models/treks.js";
import Testimonial from "../models/testomonial.js";
import OtherService from "../models/otherServices.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

// Utility function for image uploads
const uploadImage = async (filePath, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};

// Utility function to parse JSON fields from FormData
const parseJSONField = (value, fallback = []) => {
  if (!value) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error(`Failed to parse JSON field:`, error);
      return fallback;
    }
  }
  return value;
};

// Generic validation
const validateRequiredFields = (fields, data) => {
  const missing = fields.filter((field) => !data[field]);
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
};

// -----------------------------
// 🟢 TOUR CONTROLLERS
// -----------------------------

// Create Tour
export const createTour = async (req, res) => {
  try {
    const requiredFields = ["name", "description", "location", "duration", "regionType"];
    validateRequiredFields(requiredFields, req.body);

    const { name, description, location, duration, regionType, ...rest } = req.body;

    // Parse JSON strings sent from frontend
    const parseJSONField = (field) => {
      try {
        return field ? JSON.parse(field) : undefined;
      } catch (error) {
        return field; // Return as-is if not valid JSON
      }
    };

    // Parse array fields
    const parsedRest = { ...rest };
    const arrayFields = ['highlights', 'inclusions', 'exclusions', 'cityPricing', 'itinerary', 'faqs', 'availableDates'];
    
    arrayFields.forEach(field => {
      if (parsedRest[field]) {
        parsedRest[field] = parseJSONField(parsedRest[field]);
      }
    });

    // Convert string values to appropriate types
    if (parsedRest.maxGroupSize) {
      parsedRest.maxGroupSize = Number(parsedRest.maxGroupSize);
    }
    if (parsedRest.isActive !== undefined) {
      parsedRest.isActive = parsedRest.isActive === 'true' || parsedRest.isActive === true;
    }
    if (parsedRest.isFeatured !== undefined) {
      parsedRest.isFeatured = parsedRest.isFeatured === 'true' || parsedRest.isFeatured === true;
    }

    // Upload images
    if (!req.files || !req.files.thumbnail) {
      return res.status(400).json({ success: false, message: "Thumbnail image is required." });
    }

    const thumbnailUrl = await uploadImage(req.files.thumbnail[0].path, "Tours/Thumbnails");

    let showcaseUrls = [];
    if (req.files.showcaseImages) {
      const uploads = req.files.showcaseImages.map((file) =>
        uploadImage(file.path, "Tours/Showcase")
      );
      showcaseUrls = await Promise.all(uploads);
    }

    const newTour = await Tour.create({
      name,
      description,
      location,
      duration,
      regionType,
      thumbnail: thumbnailUrl,
      showcaseImages: showcaseUrls,
      ...parsedRest,
    });

    console.log('✅ Tour created successfully:', newTour._id);
    res.status(201).json({ success: true, message: "Tour created successfully!", data: newTour });
  } catch (error) {
    console.error('❌ Error creating tour:', error);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      if (error.message.includes('slug_1')) {
        return res.status(500).json({ 
          success: false, 
          message: "Database index conflict detected. Please restart the server to fix this issue automatically.",
          error: "SLUG_INDEX_CONFLICT"
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: "Duplicate entry detected. Please check your data and try again.",
        error: "DUPLICATE_KEY"
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: `Validation failed: ${validationErrors.join(', ')}`,
        error: "VALIDATION_ERROR"
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Tours
export const getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: tours.length, data: tours });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Tour By ID
export const getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Tour ID" });
    }

    const tour = await Tour.findById(id);
    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found" });
    }

    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Tour
export const updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid Tour ID" });

    const tour = await Tour.findById(id);
    if (!tour) return res.status(404).json({ success: false, message: "Tour not found" });

    // Parse JSON strings from FormData
    const arrayFields = ['highlights', 'inclusions', 'exclusions', 'cityPricing', 'accommodation', 'notes', 'availableDates', 'faqs', 'itinerary'];
    const booleanFields = ['trending', 'featured'];
    const numberFields = ['duration', 'maxGroupSize', 'minAge', 'maxAge', 'price', 'discountPrice'];

    const {
      thumbnail: thumbnailField,
      showcaseImages: showcaseField,
      ...rest
    } = req.body;

    const parsedRest = {};
    for (const [key, value] of Object.entries(rest)) {
      if (arrayFields.includes(key)) {
        parsedRest[key] = parseJSONField(value, []);
      } else if (booleanFields.includes(key)) {
        parsedRest[key] = value === 'true' || value === true;
      } else if (numberFields.includes(key)) {
        parsedRest[key] = value ? Number(value) : undefined;
      } else {
        parsedRest[key] = value;
      }
    }

    // Update images if new ones uploaded
    if (req.files?.thumbnail) {
      const newThumb = await uploadImage(req.files.thumbnail[0].path, "Tours/Thumbnails");
      parsedRest.thumbnail = newThumb;
    }

    if (req.files?.showcaseImages) {
      const showcaseUploads = req.files.showcaseImages.map((file) =>
        uploadImage(file.path, "Tours/Showcase")
      );
      parsedRest.showcaseImages = await Promise.all(showcaseUploads);
    }

    const updatedTour = await Tour.findByIdAndUpdate(id, parsedRest, { new: true });
    res.status(200).json({ success: true, message: "Tour updated successfully!", data: updatedTour });
  } catch (error) {
    console.error('Error updating tour:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Tour
export const deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid Tour ID" });

    const deletedTour = await Tour.findByIdAndDelete(id);
    if (!deletedTour)
      return res.status(404).json({ success: false, message: "Tour not found" });

    res.status(200).json({ success: true, message: "Tour deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// 🟣 TREK CONTROLLERS
// -----------------------------

// Create Trek
export const createTrek = async (req, res) => {
  try {
    const requiredFields = ["name", "description", "location", "duration", "regionType"];
    validateRequiredFields(requiredFields, req.body);

    if (!req.files || !req.files.thumbnail) {
      return res.status(400).json({ success: false, message: "Thumbnail image is required." });
    }

    // Parse JSON strings from FormData
    const arrayFields = ['highlights', 'cityPricing', 'availableDates', 'faqs'];
    const booleanFields = ['isActive', 'isFeatured'];
    const numberFields = ['altitude', 'maxGroupSize', 'totalBookings', 'rating'];

    const {
      thumbnail: thumbnailField,
      showcaseImages: showcaseField,
      ...rest
    } = req.body;

    // Debug logging
    console.log('📥 Creating trek - Raw cityPricing from request:', rest.cityPricing);

    const parsedRest = {};
    for (const [key, value] of Object.entries(rest)) {
      if (arrayFields.includes(key)) {
        parsedRest[key] = parseJSONField(value, []);
        // Special debug for cityPricing
        if (key === 'cityPricing') {
          console.log('📦 Parsed cityPricing:', parsedRest[key]);
        }
      } else if (booleanFields.includes(key)) {
        parsedRest[key] = value === 'true' || value === true;
      } else if (numberFields.includes(key)) {
        parsedRest[key] = value ? Number(value) : undefined;
      } else {
        parsedRest[key] = value;
      }
    }

    const thumbnailUrl = await uploadImage(req.files.thumbnail[0].path, "Treks/Thumbnails");

    let showcaseUrls = [];
    if (req.files.showcaseImages) {
      const uploads = req.files.showcaseImages.map((file) =>
        uploadImage(file.path, "Treks/Showcase")
      );
      showcaseUrls = await Promise.all(uploads);
    }

    // Debug: Log final data before creating trek
    console.log('💾 Data being sent to MongoDB:', {
      ...parsedRest,
      cityPricing: parsedRest.cityPricing,
      cityPricingLength: parsedRest.cityPricing?.length
    });

    const newTrek = await Trek.create({
      thumbnail: thumbnailUrl,
      showcaseImages: showcaseUrls,
      ...parsedRest,
    });

    console.log('✅ Trek created successfully:', newTrek._id);
    console.log('✅ Trek cityPricing saved:', newTrek.cityPricing);
    res.status(201).json({ success: true, message: "Trek created successfully!", data: newTrek });
  } catch (error) {
    console.error('❌ Error creating trek:', error);
    console.error('Error code:', error.code);
    console.error('Error name:', error.name);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      if (error.message.includes('slug_1')) {
        return res.status(500).json({ 
          success: false, 
          message: "Database index conflict detected. Please restart the server to fix this issue automatically.",
          error: "SLUG_INDEX_CONFLICT"
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: "Duplicate entry detected. Please check your data and try again.",
        error: "DUPLICATE_KEY"
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: `Validation failed: ${validationErrors.join(', ')}`,
        error: "VALIDATION_ERROR"
      });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Treks
export const getAllTreks = async (req, res) => {
  try {
    const treks = await Trek.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: treks.length, data: treks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Trek By ID
export const getTrekById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Trek ID" });
    }

    const trek = await Trek.findById(id);
    if (!trek) {
      return res.status(404).json({ success: false, message: "Trek not found" });
    }

    res.status(200).json({ success: true, data: trek });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Trek
export const updateTrek = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid Trek ID" });

    const trek = await Trek.findById(id);
    if (!trek) return res.status(404).json({ success: false, message: "Trek not found" });

    // Parse JSON strings from FormData
    const arrayFields = ['highlights', 'cityPricing', 'availableDates', 'faqs'];
    const booleanFields = ['isActive', 'isFeatured'];
    const numberFields = ['altitude', 'maxGroupSize', 'totalBookings', 'rating'];

    const {
      thumbnail: thumbnailField,
      showcaseImages: showcaseField,
      ...rest
    } = req.body;

    // Debug logging
    console.log('📥 Updating trek - Raw cityPricing from request:', rest.cityPricing);

    const parsedRest = {};
    for (const [key, value] of Object.entries(rest)) {
      if (arrayFields.includes(key)) {
        parsedRest[key] = parseJSONField(value, []);
        // Special debug for cityPricing
        if (key === 'cityPricing') {
          console.log('📦 Parsed cityPricing for update:', parsedRest[key]);
        }
      } else if (booleanFields.includes(key)) {
        parsedRest[key] = value === 'true' || value === true;
      } else if (numberFields.includes(key)) {
        parsedRest[key] = value ? Number(value) : undefined;
      } else {
        parsedRest[key] = value;
      }
    }

    if (req.files?.thumbnail) {
      const newThumb = await uploadImage(req.files.thumbnail[0].path, "Treks/Thumbnails");
      parsedRest.thumbnail = newThumb;
    }

    if (req.files?.showcaseImages) {
      const showcaseUploads = req.files.showcaseImages.map((file) =>
        uploadImage(file.path, "Treks/Showcase")
      );
      parsedRest.showcaseImages = await Promise.all(showcaseUploads);
    }

    // Debug: Log final data before updating trek
    console.log('💾 Data being sent to MongoDB for update:', {
      ...parsedRest,
      cityPricing: parsedRest.cityPricing,
      cityPricingLength: parsedRest.cityPricing?.length
    });

    const updatedTrek = await Trek.findByIdAndUpdate(id, parsedRest, { new: true });
    console.log('✅ Trek updated successfully:', updatedTrek._id);
    console.log('✅ Updated trek cityPricing:', updatedTrek.cityPricing);
    res.status(200).json({ success: true, message: "Trek updated successfully!", data: updatedTrek });
  } catch (error) {
    console.error('Error updating trek:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Trek
export const deleteTrek = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ success: false, message: "Invalid Trek ID" });

    const deletedTrek = await Trek.findByIdAndDelete(id);
    if (!deletedTrek)
      return res.status(404).json({ success: false, message: "Trek not found" });

    res.status(200).json({ success: true, message: "Trek deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// 🟡 TESTIMONIALS MANAGEMENT
// -----------------------------

// Get All Testimonials (with filtering and sorting)
export const getAllTestimonials = async (req, res) => {
  try {
    const { status, isFeatured, sortBy = 'createdAt', order = 'desc', page = 1, limit = 20 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const testimonials = await Testimonial.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const total = await Testimonial.countDocuments(filter);
    
    // Get overall statistics (not filtered by pagination)
    const allTestimonials = await Testimonial.find({});
    const statistics = {
      total: allTestimonials.length,
      pending: allTestimonials.filter(t => t.status === 'Pending').length,
      approved: allTestimonials.filter(t => t.status === 'Approved').length,
      rejected: allTestimonials.filter(t => t.status === 'Rejected').length,
      featured: allTestimonials.filter(t => t.isFeatured).length,
      averageRating: allTestimonials.length > 0 
        ? (allTestimonials.reduce((sum, t) => sum + t.rating, 0) / allTestimonials.length).toFixed(2)
        : 0
    };

    res.status(200).json({ 
      success: true, 
      testimonials: testimonials,
      statistics: statistics,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCount: total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Testimonial by ID
export const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Testimonial ID" });
    }

    const testimonial = await Testimonial.findById(id);
    
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Testimonial Status
export const updateTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isFeatured, adminNotes, isVerified } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Testimonial ID" });
    }

    // Validate status
    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    // Update fields
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (isVerified !== undefined) updateData.isVerified = isVerified;

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`✅ Testimonial ${id} status updated to: ${status || 'unchanged'}`);
    
    res.status(200).json({ 
      success: true, 
      message: "Testimonial updated successfully!", 
      data: updatedTestimonial 
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Update Testimonials Status
export const bulkUpdateTestimonials = async (req, res) => {
  try {
    const { testimonialIds, status, isFeatured } = req.body;

    if (!testimonialIds || !Array.isArray(testimonialIds) || testimonialIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide an array of testimonial IDs" 
      });
    }

    // Validate all IDs
    const invalidIds = testimonialIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid testimonial IDs: ${invalidIds.join(", ")}` 
      });
    }

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

    const result = await Testimonial.updateMany(
      { _id: { $in: testimonialIds } },
      { $set: updateData }
    );

    console.log(`✅ Bulk update: ${result.modifiedCount} testimonials updated`);
    
    res.status(200).json({ 
      success: true, 
      message: `${result.modifiedCount} testimonials updated successfully!`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Testimonial ID" });
    }

    const deletedTestimonial = await Testimonial.findByIdAndDelete(id);
    
    if (!deletedTestimonial) {
      return res.status(404).json({ success: false, message: "Testimonial not found" });
    }

    console.log(`✅ Testimonial ${id} deleted`);
    
    res.status(200).json({ 
      success: true, 
      message: "Testimonial deleted successfully!" 
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// 🟠 ENQUIRIES MANAGEMENT (Other Services)
// -----------------------------

// Get All Enquiries (with filtering and sorting)
export const getAllEnquiries = async (req, res) => {
  try {
    const { 
      enquiryStatus, 
      priority, 
      serviceType,
      sortBy = 'createdAt', 
      order = 'desc',
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (enquiryStatus) filter.enquiryStatus = enquiryStatus;
    if (priority) filter.priority = priority;
    if (serviceType) filter.serviceType = serviceType;
    
    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const enquiries = await OtherService.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination
    const total = await OtherService.countDocuments(filter);
    
    // Get overall statistics (not filtered by pagination)
    const allEnquiries = await OtherService.find({});
    const statistics = {
      total: allEnquiries.length,
      pending: allEnquiries.filter(e => e.enquiryStatus === 'Pending').length,
      inProgress: allEnquiries.filter(e => e.enquiryStatus === 'In Progress').length,
      contacted: allEnquiries.filter(e => e.enquiryStatus === 'Contacted').length,
      quoted: allEnquiries.filter(e => e.enquiryStatus === 'Quoted').length,
      confirmed: allEnquiries.filter(e => e.enquiryStatus === 'Confirmed').length,
      cancelled: allEnquiries.filter(e => e.enquiryStatus === 'Cancelled').length,
      completed: allEnquiries.filter(e => e.enquiryStatus === 'Completed').length,
      highPriority: allEnquiries.filter(e => e.priority === 'High' || e.priority === 'Urgent').length
    };

    // Group by service type
    const byServiceType = allEnquiries.reduce((acc, enq) => {
      acc[enq.serviceType] = (acc[enq.serviceType] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({ 
      success: true, 
      enquiries: enquiries,
      statistics: {
        ...statistics,
        byServiceType
      },
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalCount: total,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Enquiry by ID
export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Enquiry ID" });
    }

    const enquiry = await OtherService.findById(id);
    
    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Enquiry by Reference Number
export const getEnquiryByReference = async (req, res) => {
  try {
    const { reference } = req.params;
    
    const enquiry = await OtherService.findOne({ enquiryReference: reference });
    
    if (!enquiry) {
      return res.status(404).json({ 
        success: false, 
        message: "Enquiry not found with this reference number" 
      });
    }

    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    console.error('Error fetching enquiry by reference:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Enquiry Status
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { enquiryStatus, priority, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Enquiry ID" });
    }

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Contacted", "Quoted", "Confirmed", "Cancelled", "Completed"];
    if (enquiryStatus && !validStatuses.includes(enquiryStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    // Validate priority
    const validPriorities = ["Low", "Medium", "High", "Urgent"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid priority. Must be one of: ${validPriorities.join(", ")}` 
      });
    }

    const enquiry = await OtherService.findById(id);
    if (!enquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    // Update fields
    const updateData = {};
    if (enquiryStatus !== undefined) updateData.enquiryStatus = enquiryStatus;
    if (priority !== undefined) updateData.priority = priority;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updatedEnquiry = await OtherService.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`✅ Enquiry ${id} (${enquiry.enquiryReference}) status updated to: ${enquiryStatus || 'unchanged'}`);
    
    res.status(200).json({ 
      success: true, 
      message: "Enquiry updated successfully!", 
      data: updatedEnquiry 
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk Update Enquiries Status
export const bulkUpdateEnquiries = async (req, res) => {
  try {
    const { enquiryIds, enquiryStatus, priority } = req.body;

    if (!enquiryIds || !Array.isArray(enquiryIds) || enquiryIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Please provide an array of enquiry IDs" 
      });
    }

    // Validate all IDs
    const invalidIds = enquiryIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid enquiry IDs: ${invalidIds.join(", ")}` 
      });
    }

    const updateData = {};
    if (enquiryStatus !== undefined) updateData.enquiryStatus = enquiryStatus;
    if (priority !== undefined) updateData.priority = priority;

    const result = await OtherService.updateMany(
      { _id: { $in: enquiryIds } },
      { $set: updateData }
    );

    console.log(`✅ Bulk update: ${result.modifiedCount} enquiries updated`);
    
    res.status(200).json({ 
      success: true, 
      message: `${result.modifiedCount} enquiries updated successfully!`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Enquiry
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Enquiry ID" });
    }

    const deletedEnquiry = await OtherService.findByIdAndDelete(id);
    
    if (!deletedEnquiry) {
      return res.status(404).json({ success: false, message: "Enquiry not found" });
    }

    console.log(`✅ Enquiry ${id} (${deletedEnquiry.enquiryReference}) deleted`);
    
    res.status(200).json({ 
      success: true, 
      message: "Enquiry deleted successfully!" 
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
