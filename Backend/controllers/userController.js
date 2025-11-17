import Tour from "../models/tours.js";
import Trek from "../models/treks.js";
import mongoose from "mongoose";

// -----------------------------
// 🟢 TOURS CONTROLLERS (USER)
// -----------------------------

// Get All Tours (Public - Only Active)
export const getAllTours = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      regionType,
      specialType,
      minPrice,
      maxPrice,
      search,
      featured,
      trending,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Region type filter
    if (regionType && regionType !== 'all') {
      filter.regionType = regionType;
    }

    // Special type filter
    if (specialType && specialType !== 'all') {
      filter.specialType = specialType;
    }

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;  // Changed from 'featured' to 'isFeatured'
    }

    // Trending filter
    if (trending === 'true') {
      filter.trending = true;
    }

    // Price range filter (based on minimum price from cityPricing)
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = Number(minPrice);
      if (maxPrice) priceFilter.$lte = Number(maxPrice);
      
      // Add aggregation pipeline to filter by price range
      const priceQuery = Tour.aggregate([
        { $match: filter },
        {
          $addFields: {
            minPrice: { $min: "$cityPricing.price" }
          }
        },
        {
          $match: {
            minPrice: priceFilter
          }
        }
      ]);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { highlights: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const tours = await Tour.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get total count for pagination
    const totalTours = await Tour.countDocuments(filter);
    const totalPages = Math.ceil(totalTours / limit);

    res.status(200).json({
      success: true,
      data: tours,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalTours,
        itemsPerPage: Number(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching tours:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Tour by ID (Public)
export const getTourById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Tour ID" });
    }

    const tour = await Tour.findOne({ _id: id, isActive: true }).lean();

    if (!tour) {
      return res.status(404).json({ success: false, message: "Tour not found or inactive" });
    }

    res.status(200).json({ success: true, data: tour });
  } catch (error) {
    console.error('Error fetching tour:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Tours by Name/Search (Public)
export const searchTours = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const searchQuery = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { highlights: { $elemMatch: { $regex: q, $options: 'i' } } }
      ]
    };

    const tours = await Tour.find(searchQuery)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: tours,
      count: tours.length
    });
  } catch (error) {
    console.error('Error searching tours:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Featured Tours (Public)
export const getFeaturedTours = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const tours = await Tour.find({ 
      isActive: true, 
      isFeatured: true  // Changed from 'featured' to 'isFeatured'
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: tours,
      count: tours.length
    });
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Trending Tours (Public)
export const getTrendingTours = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const tours = await Tour.find({ 
      isActive: true, 
      trending: true 
    })
      .sort({ totalBookings: -1, createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: tours,
      count: tours.length
    });
  } catch (error) {
    console.error('Error fetching trending tours:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Special Tours (Tours with specialType other than "None")
export const getSpecialTours = async (req, res) => {
  try {
    const { limit = 6, specialType } = req.query;

    const filter = { 
      isActive: true,
      specialType: { $ne: "None" } // Get all tours where specialType is not "None"
    };

    // If specific specialType is requested
    if (specialType && specialType !== 'all') {
      filter.specialType = specialType;
    }

    const tours = await Tour.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: tours,
      count: tours.length
    });
  } catch (error) {
    console.error('Error fetching special tours:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Tours by Category (Public)
export const getToursByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const filter = { 
      isActive: true,
      category: { $regex: category, $options: 'i' }
    };

    const skip = (page - 1) * limit;
    const tours = await Tour.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalTours = await Tour.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: tours,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalTours / limit),
        totalItems: totalTours,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tours by category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// 🟣 TREKS CONTROLLERS (USER)
// -----------------------------

// Get All Treks (Public - Only Active)
export const getAllTreks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      regionType,
      specialType,
      difficulty,
      fitnessLevel,
      minPrice,
      maxPrice,
      search,
      featured,
      minAltitude,
      maxAltitude,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Region type filter
    if (regionType && regionType !== 'all') {
      filter.regionType = regionType;
    }

    // Special type filter
    if (specialType && specialType !== 'all') {
      filter.specialType = specialType;
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    // Fitness level filter
    if (fitnessLevel && fitnessLevel !== 'all') {
      filter.fitnessLevel = fitnessLevel;
    }

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Altitude range filter
    if (minAltitude || maxAltitude) {
      filter.altitude = {};
      if (minAltitude) filter.altitude.$gte = Number(minAltitude);
      if (maxAltitude) filter.altitude.$lte = Number(maxAltitude);
    }

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { highlights: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const treks = await Trek.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    // Get total count for pagination
    const totalTreks = await Trek.countDocuments(filter);
    const totalPages = Math.ceil(totalTreks / limit);

    res.status(200).json({
      success: true,
      data: treks,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalTreks,
        itemsPerPage: Number(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching treks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Trek by ID (Public)
export const getTrekById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Trek ID" });
    }

    const trek = await Trek.findOne({ _id: id, isActive: true }).lean();

    if (!trek) {
      return res.status(404).json({ success: false, message: "Trek not found or inactive" });
    }

    res.status(200).json({ success: true, data: trek });
  } catch (error) {
    console.error('Error fetching trek:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Treks by Name/Search (Public)
export const searchTreks = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const searchQuery = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { highlights: { $elemMatch: { $regex: q, $options: 'i' } } }
      ]
    };

    const treks = await Trek.find(searchQuery)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: treks,
      count: treks.length
    });
  } catch (error) {
    console.error('Error searching treks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Featured Treks (Public)
export const getFeaturedTreks = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const treks = await Trek.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: treks,
      count: treks.length
    });
  } catch (error) {
    console.error('Error fetching featured treks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Special Treks (Treks with specialType other than "None")
export const getSpecialTreks = async (req, res) => {
  try {
    const { limit = 6, specialType } = req.query;

    const filter = { 
      isActive: true,
      specialType: { $ne: "None" } // Get all treks where specialType is not "None"
    };

    // If specific specialType is requested
    if (specialType && specialType !== 'all') {
      filter.specialType = specialType;
    }

    const treks = await Trek.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: treks,
      count: treks.length
    });
  } catch (error) {
    console.error('Error fetching special treks:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Treks by Category (Public)
export const getTreksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const filter = { 
      isActive: true,
      category: { $regex: category, $options: 'i' }
    };

    const skip = (page - 1) * limit;
    const treks = await Trek.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalTreks = await Trek.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: treks,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalTreks / limit),
        totalItems: totalTreks,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching treks by category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Treks by Difficulty (Public)
export const getTreksByDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const filter = { 
      isActive: true,
      difficulty: { $regex: difficulty, $options: 'i' }
    };

    const skip = (page - 1) * limit;
    const treks = await Trek.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const totalTreks = await Trek.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: treks,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalTreks / limit),
        totalItems: totalTreks,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching treks by difficulty:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// 🔍 COMBINED SEARCH & STATS
// -----------------------------

// Combined Search (Tours + Treks)
export const globalSearch = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim() === '') {
      return res.status(400).json({ success: false, message: "Search query is required" });
    }

    const searchQuery = {
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { highlights: { $elemMatch: { $regex: q, $options: 'i' } } }
      ]
    };

    // Search both tours and treks
    const [tours, treks] = await Promise.all([
      Tour.find(searchQuery).limit(Number(limit)).lean(),
      Trek.find(searchQuery).limit(Number(limit)).lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        tours: tours.map(tour => ({ ...tour, type: 'tour' })),
        treks: treks.map(trek => ({ ...trek, type: 'trek' })),
        total: tours.length + treks.length
      }
    });
  } catch (error) {
    console.error('Error in global search:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Public Stats (for homepage)
export const getPublicStats = async (req, res) => {
  try {
    const [tourStats, trekStats] = await Promise.all([
      Tour.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalTours: { $sum: 1 },
            featuredTours: { $sum: { $cond: ['$isFeatured', 1, 0] } },  // Changed from '$featured' to '$isFeatured'
            trendingTours: { $sum: { $cond: ['$trending', 1, 0] } },
            totalBookings: { $sum: '$totalBookings' },
            avgRating: { $avg: '$rating' }
          }
        }
      ]),
      Trek.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalTreks: { $sum: 1 },
            featuredTreks: { $sum: { $cond: ['$isFeatured', 1, 0] } },
            totalBookings: { $sum: '$totalBookings' },
            avgRating: { $avg: '$rating' }
          }
        }
      ])
    ]);

    const stats = {
      tours: tourStats[0] || {
        totalTours: 0,
        featuredTours: 0,
        trendingTours: 0,
        totalBookings: 0,
        avgRating: 0
      },
      treks: trekStats[0] || {
        totalTreks: 0,
        featuredTreks: 0,
        totalBookings: 0,
        avgRating: 0
      }
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Categories (for filters)
export const getCategories = async (req, res) => {
  try {
    const [tourCategories, trekCategories] = await Promise.all([
      Tour.distinct('category', { isActive: true }),
      Trek.distinct('category', { isActive: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        tours: tourCategories,
        treks: trekCategories
      }
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------
// 🔍 AVAILABILITY CHECKS
// -----------------------------

// Check available seats for a specific tour on a specific date
export const checkTourAvailability = async (req, res) => {
  try {
    const { tourId, date } = req.query;

    if (!tourId || !date) {
      return res.status(400).json({
        success: false,
        message: "Tour ID and date are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID",
      });
    }

    // Get tour details
    const tour = await Tour.findById(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    // Import Booking model dynamically to avoid circular dependency
    const Booking = (await import("../models/booking.js")).default;

    // Parse the date
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

    // Calculate total booked members for this date
    const bookings = await Booking.aggregate([
      {
        $match: {
          tourId: new mongoose.Types.ObjectId(tourId),
          bookingDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          bookingStatus: { $nin: ["cancelled"] }, // Exclude cancelled bookings
        },
      },
      {
        $group: {
          _id: null,
          totalBooked: { $sum: "$numberOfMembers" },
        },
      },
    ]);

    const totalBooked = bookings.length > 0 ? bookings[0].totalBooked : 0;
    const availableSeats = tour.maxGroupSize - totalBooked;

    res.status(200).json({
      success: true,
      data: {
        tourId: tour._id,
        tourName: tour.name,
        date: bookingDate,
        maxGroupSize: tour.maxGroupSize,
        totalBooked,
        availableSeats: Math.max(0, availableSeats),
        isAvailable: availableSeats > 0,
      },
    });
  } catch (error) {
    console.error("Error checking tour availability:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check availability",
    });
  }
};

// Check available seats for a specific trek on a specific date
export const checkTrekAvailability = async (req, res) => {
  try {
    const { trekId, date } = req.query;

    if (!trekId || !date) {
      return res.status(400).json({
        success: false,
        message: "Trek ID and date are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(trekId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trek ID",
      });
    }

    // Get trek details
    const trek = await Trek.findById(trekId);

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    // Import Booking model dynamically
    const Booking = (await import("../models/booking.js")).default;

    // Parse the date
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

    // Calculate total booked members for this date
    const bookings = await Booking.aggregate([
      {
        $match: {
          trekId: new mongoose.Types.ObjectId(trekId),
          bookingDate: {
            $gte: startOfDay,
            $lte: endOfDay,
          },
          bookingStatus: { $nin: ["cancelled"] },
        },
      },
      {
        $group: {
          _id: null,
          totalBooked: { $sum: "$numberOfMembers" },
        },
      },
    ]);

    const totalBooked = bookings.length > 0 ? bookings[0].totalBooked : 0;
    const availableSeats = trek.maxGroupSize - totalBooked;

    res.status(200).json({
      success: true,
      data: {
        trekId: trek._id,
        trekName: trek.name,
        date: bookingDate,
        maxGroupSize: trek.maxGroupSize,
        totalBooked,
        availableSeats: Math.max(0, availableSeats),
        isAvailable: availableSeats > 0,
      },
    });
  } catch (error) {
    console.error("Error checking trek availability:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to check availability",
    });
  }
};

// Get availability for all dates of a tour
export const getTourAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid tour ID",
      });
    }

    // Get tour details
    const tour = await Tour.findById(id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Tour not found",
      });
    }

    if (!tour.availableDates || tour.availableDates.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No available dates for this tour",
      });
    }

    // Import Booking model dynamically
    const Booking = (await import("../models/booking.js")).default;

    // Calculate availability for each date
    const availabilityPromises = tour.availableDates.map(async (date) => {
      const bookingDate = new Date(date);
      const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

      // Calculate total booked members for this date
      const bookings = await Booking.aggregate([
        {
          $match: {
            tourId: new mongoose.Types.ObjectId(id),
            bookingDate: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            bookingStatus: { $nin: ["cancelled"] },
          },
        },
        {
          $group: {
            _id: null,
            totalBooked: { $sum: "$numberOfMembers" },
          },
        },
      ]);

      const totalBooked = bookings.length > 0 ? bookings[0].totalBooked : 0;
      const availableSeats = tour.maxGroupSize - totalBooked;

      return {
        date: new Date(date).toISOString().split('T')[0],
        maxGroupSize: tour.maxGroupSize,
        totalBooked,
        availableSeats: Math.max(0, availableSeats),
        isAvailable: availableSeats > 0,
      };
    });

    const availability = await Promise.all(availabilityPromises);

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error getting tour availability:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get availability",
    });
  }
};

// Get availability for all dates of a trek
export const getTrekAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trek ID",
      });
    }

    // Get trek details
    const trek = await Trek.findById(id);

    if (!trek) {
      return res.status(404).json({
        success: false,
        message: "Trek not found",
      });
    }

    if (!trek.availableDates || trek.availableDates.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No available dates for this trek",
      });
    }

    // Import Booking model dynamically
    const Booking = (await import("../models/booking.js")).default;

    // Calculate availability for each date
    const availabilityPromises = trek.availableDates.map(async (date) => {
      const bookingDate = new Date(date);
      const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

      // Calculate total booked members for this date
      const bookings = await Booking.aggregate([
        {
          $match: {
            trekId: new mongoose.Types.ObjectId(id),
            bookingDate: {
              $gte: startOfDay,
              $lte: endOfDay,
            },
            bookingStatus: { $nin: ["cancelled"] },
          },
        },
        {
          $group: {
            _id: null,
            totalBooked: { $sum: "$numberOfMembers" },
          },
        },
      ]);

      const totalBooked = bookings.length > 0 ? bookings[0].totalBooked : 0;
      const availableSeats = trek.maxGroupSize - totalBooked;

      return {
        date: new Date(date).toISOString().split('T')[0],
        maxGroupSize: trek.maxGroupSize,
        totalBooked,
        availableSeats: Math.max(0, availableSeats),
        isAvailable: availableSeats > 0,
      };
    });

    const availability = await Promise.all(availabilityPromises);

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error) {
    console.error("Error getting trek availability:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get availability",
    });
  }
};
