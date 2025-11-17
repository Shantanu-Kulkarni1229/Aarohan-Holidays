import History from '../models/history.js';

// ==================== ADMIN CONTROLLERS ====================

// Create new history entry
export const createHistory = async (req, res) => {
  try {
    const history = await History.create(req.body);
    res.status(201).json({
      success: true,
      message: 'History entry created successfully',
      data: history
    });
  } catch (error) {
    console.error('Error creating history:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create history entry'
    });
  }
};

// Get all history entries (Admin)
export const getAllHistoriesAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      location,
      featured,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (featured !== undefined) filter.featured = featured === 'true';
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const histories = await History.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const totalHistories = await History.countDocuments(filter);
    const totalPages = Math.ceil(totalHistories / limit);

    res.status(200).json({
      success: true,
      data: histories,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalHistories,
        itemsPerPage: Number(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching histories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch history entries'
    });
  }
};

// Get single history by ID
export const getHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await History.findById(id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'History entry not found'
      });
    }

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch history entry'
    });
  }
};

// Update history entry
export const updateHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const history = await History.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'History entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'History entry updated successfully',
      data: history
    });
  } catch (error) {
    console.error('Error updating history:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update history entry'
    });
  }
};

// Delete history entry
export const deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const history = await History.findByIdAndDelete(id);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'History entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'History entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete history entry'
    });
  }
};

// Toggle featured status
export const toggleHistoryFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    const history = await History.findById(id);
    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'History entry not found'
      });
    }

    history.featured = !history.featured;
    await history.save();

    res.status(200).json({
      success: true,
      message: `History entry ${history.featured ? 'featured' : 'unfeatured'} successfully`,
      data: history
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update featured status'
    });
  }
};

// Toggle active status
export const toggleHistoryActive = async (req, res) => {
  try {
    const { id } = req.params;
    
    const history = await History.findById(id);
    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'History entry not found'
      });
    }

    history.isActive = !history.isActive;
    await history.save();

    res.status(200).json({
      success: true,
      message: `History entry ${history.isActive ? 'activated' : 'deactivated'} successfully`,
      data: history
    });
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update active status'
    });
  }
};

// ==================== PUBLIC CONTROLLERS ====================

// Get all active history entries (Public)
export const getAllHistoriesPublic = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      location,
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter - only active entries
    const filter = { isActive: true };
    
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (featured === 'true') filter.featured = true;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const histories = await History.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const totalHistories = await History.countDocuments(filter);
    const totalPages = Math.ceil(totalHistories / limit);

    res.status(200).json({
      success: true,
      data: histories,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalHistories,
        itemsPerPage: Number(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching histories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch history entries'
    });
  }
};

// Get single history by ID or slug (Public)
export const getHistoryByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let history;
    
    // Check if identifier is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    if (isValidObjectId) {
      // Try to find by ID first
      history = await History.findOne({
        _id: identifier,
        isActive: true
      });
    }
    
    // If not found by ID or not a valid ObjectId, try by slug
    if (!history) {
      history = await History.findOne({
        slug: identifier,
        isActive: true
      });
    }

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'History entry not found'
      });
    }

    // Increment views
    history.views += 1;
    await history.save();

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch history entry'
    });
  }
};

// Get featured histories (Public)
export const getFeaturedHistories = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const histories = await History.find({ 
      featured: true, 
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: histories,
      count: histories.length
    });
  } catch (error) {
    console.error('Error fetching featured histories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch featured histories'
    });
  }
};

// Get unique locations (Public)
export const getHistoryLocations = async (req, res) => {
  try {
    const locations = await History.distinct('location', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: locations.sort()
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch locations'
    });
  }
};
