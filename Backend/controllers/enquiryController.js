import Enquiry from '../models/enquiry.js';
import { sendEnquiryEmails } from '../utils/emailServiceResend.js';

// Create new enquiry (Public endpoint)
export const createEnquiry = async (req, res) => {
  try {
    // Get IP address and user agent
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Create enquiry data
    const enquiryData = {
      ...req.body,
      ipAddress,
      userAgent,
      source: req.body.source || 'Website'
    };
    
    // Create enquiry
    const enquiry = await Enquiry.create(enquiryData);
    
    // Send emails asynchronously
    const emailResults = await sendEnquiryEmails(enquiry);
    
    // Update email status in database
    await Enquiry.findByIdAndUpdate(enquiry._id, {
      'emailSent.userConfirmation.sent': emailResults.userConfirmation.success,
      'emailSent.userConfirmation.sentAt': emailResults.userConfirmation.success ? new Date() : undefined,
      'emailSent.userConfirmation.error': emailResults.userConfirmation.error || undefined,
      'emailSent.adminNotification.sent': emailResults.adminNotification.success,
      'emailSent.adminNotification.sentAt': emailResults.adminNotification.success ? new Date() : undefined,
      'emailSent.adminNotification.error': emailResults.adminNotification.error || undefined
    });
    
    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! You will receive a confirmation email shortly.',
      data: {
        referenceNumber: enquiry.referenceNumber,
        status: enquiry.status,
        emailSent: emailResults.userConfirmation.success
      }
    });
  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to submit enquiry',
      error: error.message
    });
  }
};

// Get enquiry by reference number (Public - for users to track)
export const getEnquiryByReference = async (req, res) => {
  try {
    const { reference } = req.params;
    
    const enquiry = await Enquiry.findOne({ referenceNumber: reference })
      .select('referenceNumber status createdAt serviceType destination numberOfPeople startDate message');
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found with this reference number'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry',
      error: error.message
    });
  }
};

// ADMIN CONTROLLERS

// Get all enquiries with filters and pagination
export const getAllEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      serviceType,
      sortBy = '-createdAt',
      search
    } = req.query;
    
    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (serviceType) filter.serviceType = serviceType;
    
    // Search by name, email, phone, or reference number
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query
    const enquiries = await Enquiry.find(filter)
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    // Get total count
    const total = await Enquiry.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: enquiries,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalEnquiries: total,
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries',
      error: error.message
    });
  }
};

// Get single enquiry by ID
export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const enquiry = await Enquiry.findById(id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry',
      error: error.message
    });
  }
};

// Update enquiry status
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNotes, assignedTo } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    
    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update enquiry',
      error: error.message
    });
  }
};

// Add communication to enquiry
export const addCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const communication = req.body;
    
    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      { $push: { communications: communication } },
      { new: true, runValidators: true }
    );
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Communication added successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error adding communication:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to add communication',
      error: error.message
    });
  }
};

// Delete enquiry
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    
    const enquiry = await Enquiry.findByIdAndDelete(id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry',
      error: error.message
    });
  }
};

// Get enquiry statistics
export const getEnquiryStats = async (req, res) => {
  try {
    const stats = await Enquiry.getStats();
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Get pending enquiries
export const getPendingEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ status: 'Pending' })
      .sort('-createdAt')
      .limit(50);
    
    res.status(200).json({
      success: true,
      data: enquiries,
      count: enquiries.length
    });
  } catch (error) {
    console.error('Error fetching pending enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending enquiries',
      error: error.message
    });
  }
};

// Get urgent enquiries
export const getUrgentEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find({
      priority: 'Urgent',
      status: { $in: ['Pending', 'In Progress'] }
    })
      .sort('-createdAt')
      .limit(50);
    
    res.status(200).json({
      success: true,
      data: enquiries,
      count: enquiries.length
    });
  } catch (error) {
    console.error('Error fetching urgent enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch urgent enquiries',
      error: error.message
    });
  }
};

export default {
  createEnquiry,
  getEnquiryByReference,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  addCommunication,
  deleteEnquiry,
  getEnquiryStats,
  getPendingEnquiries,
  getUrgentEnquiries
};
