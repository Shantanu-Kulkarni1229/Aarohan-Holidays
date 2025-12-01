import OtherService from "../models/otherServices.js";
import nodemailer from "nodemailer";
import axios from "axios";

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Function to send enquiry confirmation email to customer
const sendCustomerConfirmationEmail = async (enquiryData) => {
  try {
    const mailOptions = {
      from: `Aarohan Holidays <${process.env.EMAIL_USER}>`,
      to: enquiryData.email,
      subject: `Enquiry Received - ${enquiryData.enquiryReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .enquiry-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #667eea; }
            .detail-value { color: #555; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #667eea; color: #777; }
            .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 25px; display: inline-block; margin: 20px 0; }
            .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Enquiry Received!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">We'll get back to you soon</p>
            </div>
            
            <div class="content">
              <div style="text-align: center;">
                <div class="success-badge">✓ Successfully Submitted</div>
              </div>
              
              <p>Dear <strong>${enquiryData.name}</strong>,</p>
              
              <p>Thank you for your enquiry with <strong>Aarohan Holidays</strong>! We have received your request for <strong>${enquiryData.serviceType}</strong> and our team will review it shortly.</p>
              
              <div class="highlight">
                <strong>📋 Enquiry Reference:</strong> <span style="font-size: 18px; color: #667eea;">${enquiryData.enquiryReference}</span>
                <br><small>Please save this reference number for future correspondence.</small>
              </div>
              
              <div class="enquiry-details">
                <h3 style="color: #667eea; margin-top: 0;">📝 Your Enquiry Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Service Type:</span>
                  <span class="detail-value">${enquiryData.serviceType}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${enquiryData.name}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${enquiryData.email}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">${enquiryData.phone}</span>
                </div>
                
                ${enquiryData.destination ? `
                <div class="detail-row">
                  <span class="detail-label">Destination:</span>
                  <span class="detail-value">${enquiryData.destination}</span>
                </div>
                ` : ''}
                
                ${enquiryData.travelStartDate ? `
                <div class="detail-row">
                  <span class="detail-label">Travel Start Date:</span>
                  <span class="detail-value">${new Date(enquiryData.travelStartDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                ` : ''}
                
                ${enquiryData.numberOfMembers > 1 ? `
                <div class="detail-row">
                  <span class="detail-label">Number of Members:</span>
                  <span class="detail-value">${enquiryData.numberOfMembers}</span>
                </div>
                ` : ''}
                
                ${enquiryData.membersExpected ? `
                <div class="detail-row">
                  <span class="detail-label">Members Expected:</span>
                  <span class="detail-value">${enquiryData.membersExpected}</span>
                </div>
                ` : ''}
                
                ${enquiryData.specialRequests ? `
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Special Requests:</span>
                </div>
                <p style="margin: 10px 0 0 0; color: #555; padding: 10px; background: #f3f4f6; border-radius: 5px;">${enquiryData.specialRequests}</p>
                ` : ''}
              </div>
              
              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #3b82f6; margin-top: 0;">⏰ What's Next?</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Our team will review your enquiry within 24 hours</li>
                  <li>You'll receive a call or email with more details</li>
                  <li>We'll provide a customized quote based on your requirements</li>
                  <li>Feel free to contact us if you have any questions</li>
                </ul>
              </div>
              
              <div class="footer">
                <p><strong>Need Immediate Assistance?</strong></p>
                <p>📧 Email: <a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea;">${process.env.EMAIL_USER}</a></p>
                <p>📱 Phone: +91-XXXXXXXXXX</p>
                <p>💬 WhatsApp: +91-XXXXXXXXXX</p>
                <p style="margin-top: 20px; color: #999; font-size: 12px;">
                  This is an automated email. Please do not reply directly to this message.
                </p>
                <p style="color: #667eea; font-weight: bold; margin-top: 20px;">
                  Thank you for choosing Aarohan Holidays! 🌟
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Customer confirmation email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error sending customer email:", error);
    throw error;
  }
};

// ✅ Function to send enquiry notification email to admin
const sendAdminNotificationEmail = async (enquiryData) => {
  try {
    // Prepare service-specific details
    let serviceDetails = '';
    
    if (enquiryData.destination) {
      serviceDetails += `<li><strong>Destination:</strong> ${enquiryData.destination}</li>`;
    }
    if (enquiryData.pickupLocation) {
      serviceDetails += `<li><strong>Pickup Location:</strong> ${enquiryData.pickupLocation}</li>`;
    }
    if (enquiryData.dropLocation) {
      serviceDetails += `<li><strong>Drop Location:</strong> ${enquiryData.dropLocation}</li>`;
    }
    if (enquiryData.travelStartDate) {
      serviceDetails += `<li><strong>Travel Start Date:</strong> ${new Date(enquiryData.travelStartDate).toLocaleDateString('en-IN')}</li>`;
    }
    if (enquiryData.travelEndDate) {
      serviceDetails += `<li><strong>Travel End Date:</strong> ${new Date(enquiryData.travelEndDate).toLocaleDateString('en-IN')}</li>`;
    }
    if (enquiryData.numberOfMembers > 1) {
      serviceDetails += `<li><strong>Number of Members:</strong> ${enquiryData.numberOfMembers} (Adults: ${enquiryData.adults}, Children: ${enquiryData.children}, Infants: ${enquiryData.infants})</li>`;
    }
    if (enquiryData.preferredSeason && enquiryData.preferredSeason !== 'Any') {
      serviceDetails += `<li><strong>Preferred Season:</strong> ${enquiryData.preferredSeason}</li>`;
    }
    if (enquiryData.visaCountry) {
      serviceDetails += `<li><strong>Visa Country:</strong> ${enquiryData.visaCountry}</li>`;
    }
    if (enquiryData.visaType) {
      serviceDetails += `<li><strong>Visa Type:</strong> ${enquiryData.visaType}</li>`;
    }
    if (enquiryData.taxiType) {
      serviceDetails += `<li><strong>Taxi Type:</strong> ${enquiryData.taxiType}</li>`;
    }
    if (enquiryData.journeyType) {
      serviceDetails += `<li><strong>Journey Type:</strong> ${enquiryData.journeyType}</li>`;
    }
    if (enquiryData.checkInDate) {
      serviceDetails += `<li><strong>Check-in Date:</strong> ${new Date(enquiryData.checkInDate).toLocaleDateString('en-IN')}</li>`;
    }
    if (enquiryData.checkOutDate) {
      serviceDetails += `<li><strong>Check-out Date:</strong> ${new Date(enquiryData.checkOutDate).toLocaleDateString('en-IN')}</li>`;
    }
    if (enquiryData.numberOfRooms > 1) {
      serviceDetails += `<li><strong>Number of Rooms:</strong> ${enquiryData.numberOfRooms}</li>`;
    }
    if (enquiryData.hotelPreference && enquiryData.hotelPreference !== 'Any') {
      serviceDetails += `<li><strong>Hotel Preference:</strong> ${enquiryData.hotelPreference}</li>`;
    }
    if (enquiryData.cruiseDestination) {
      serviceDetails += `<li><strong>Cruise Destination:</strong> ${enquiryData.cruiseDestination}</li>`;
    }
    if (enquiryData.cruiseDuration) {
      serviceDetails += `<li><strong>Cruise Duration:</strong> ${enquiryData.cruiseDuration}</li>`;
    }
    if (enquiryData.parcelWeight) {
      serviceDetails += `<li><strong>Parcel Weight:</strong> ${enquiryData.parcelWeight}</li>`;
    }
    if (enquiryData.transportMode) {
      serviceDetails += `<li><strong>Transport Mode:</strong> ${enquiryData.transportMode}</li>`;
    }

    const mailOptions = {
      from: `Aarohan Holidays System <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Admin email
      subject: `🔔 New Enquiry: ${enquiryData.serviceType} - ${enquiryData.enquiryReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .enquiry-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #f59e0b; }
            .urgent-badge { background: #ef4444; color: white; padding: 5px 15px; border-radius: 15px; display: inline-block; font-size: 12px; }
            .priority-badge { background: #3b82f6; color: white; padding: 5px 15px; border-radius: 15px; display: inline-block; font-size: 12px; }
            .action-button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Service Enquiry</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Immediate attention required</p>
            </div>
            
            <div class="content">
              ${enquiryData.urgency === 'Very Urgent' ? '<span class="urgent-badge">⚠️ URGENT</span>' : ''}
              ${enquiryData.priority === 'Urgent' || enquiryData.priority === 'High' ? `<span class="priority-badge">${enquiryData.priority.toUpperCase()} PRIORITY</span>` : ''}
              
              <div class="enquiry-details">
                <h3 style="color: #f59e0b; margin-top: 0;">📋 Enquiry Reference: ${enquiryData.enquiryReference}</h3>
                
                <div class="detail-row">
                  <span class="label">Service Type:</span> ${enquiryData.serviceType}
                </div>
                
                <div class="detail-row">
                  <span class="label">Customer Name:</span> ${enquiryData.name}
                </div>
                
                <div class="detail-row">
                  <span class="label">Email:</span> <a href="mailto:${enquiryData.email}">${enquiryData.email}</a>
                </div>
                
                <div class="detail-row">
                  <span class="label">Phone:</span> <a href="tel:${enquiryData.phone}">${enquiryData.phone}</a>
                </div>
                
                ${enquiryData.membersExpected ? `
                <div class="detail-row">
                  <span class="label">Members Expected:</span> ${enquiryData.membersExpected}
                </div>
                ` : ''}
                
                <div class="detail-row">
                  <span class="label">Urgency Level:</span> ${enquiryData.urgency}
                </div>
                
                <div class="detail-row">
                  <span class="label">Received At:</span> ${new Date(enquiryData.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
              
              ${serviceDetails ? `
              <div class="enquiry-details">
                <h3 style="color: #f59e0b; margin-top: 0;">🎯 Service-Specific Details</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  ${serviceDetails}
                </ul>
              </div>
              ` : ''}
              
              ${enquiryData.specialRequests ? `
              <div class="enquiry-details">
                <h3 style="color: #f59e0b; margin-top: 0;">📝 Special Requests</h3>
                <p style="margin: 0; padding: 15px; background: #fef3c7; border-radius: 5px; border-left: 4px solid #f59e0b;">${enquiryData.specialRequests}</p>
              </div>
              ` : ''}
              
              ${enquiryData.additionalDetails ? `
              <div class="enquiry-details">
                <h3 style="color: #f59e0b; margin-top: 0;">ℹ️ Additional Details</h3>
                <p style="margin: 0; padding: 15px; background: #eff6ff; border-radius: 5px; border-left: 4px solid #3b82f6;">${enquiryData.additionalDetails}</p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="tel:${enquiryData.phone}" class="action-button">📞 Call Customer</a>
                <a href="mailto:${enquiryData.email}" class="action-button">📧 Email Customer</a>
                <a href="https://wa.me/91${enquiryData.phone}" class="action-button" target="_blank">💬 WhatsApp</a>
              </div>
              
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <h3 style="color: #ef4444; margin-top: 0;">⏰ Action Required</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Review the enquiry details carefully</li>
                  <li>Contact the customer within 24 hours</li>
                  <li>Update enquiry status in admin panel</li>
                  <li>Prepare a customized quote if applicable</li>
                </ul>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Admin notification email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error sending admin email:", error);
    throw error;
  }
};

// ========================================
// MAIN CONTROLLER FUNCTIONS
// ========================================

// ✅ Create new enquiry
export const createEnquiry = async (req, res) => {
  try {
    const enquiryData = req.body;

    // Create the enquiry
    const newEnquiry = new OtherService(enquiryData);
    await newEnquiry.save();

    // Send confirmation email to customer
    try {
      await sendCustomerConfirmationEmail(newEnquiry);
      newEnquiry.emailSent = true;
    } catch (emailError) {
      console.error("Failed to send customer email:", emailError);
    }

    // Send notification email to admin
    try {
      await sendAdminNotificationEmail(newEnquiry);
      newEnquiry.adminNotified = true;
    } catch (adminEmailError) {
      console.error("Failed to send admin email:", adminEmailError);
    }

    // Save updated flags
    await newEnquiry.save();

    res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully! We'll get back to you soon.",
      data: newEnquiry,
      enquiryReference: newEnquiry.enquiryReference
    });
  } catch (error) {
    console.error("Error creating enquiry:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit enquiry. Please try again.",
      error: error.message
    });
  }
};

// ✅ Get all enquiries (Admin only)
export const getAllEnquiries = async (req, res) => {
  try {
    const { status, enquiryStatus, serviceType, priority, page = 1, limit = 20 } = req.query;

    const filter = {};
    // Accept both 'status' and 'enquiryStatus' for backwards compatibility
    if (status || enquiryStatus) filter.enquiryStatus = status || enquiryStatus;
    if (serviceType) filter.serviceType = serviceType;
    if (priority) filter.priority = priority;

    const enquiries = await OtherService.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await OtherService.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: enquiries,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries",
      error: error.message
    });
  }
};

// ✅ Get enquiry by ID
export const getEnquiryById = async (req, res) => {
  try {
    const enquiry = await OtherService.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry",
      error: error.message
    });
  }
};

// ✅ Get enquiry by reference number
export const getEnquiryByReference = async (req, res) => {
  try {
    const enquiry = await OtherService.findOne({ 
      enquiryReference: req.params.reference 
    });

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error("Error fetching enquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry",
      error: error.message
    });
  }
};

// ✅ Update enquiry status (Admin only)
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { status, adminNotes, followUpDate, priority } = req.body;

    const updateData = {};
    if (status) updateData.enquiryStatus = status;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (followUpDate) updateData.followUpDate = followUpDate;
    if (priority) updateData.priority = priority;
    updateData.lastContactedAt = new Date();

    const enquiry = await OtherService.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry updated successfully",
      data: enquiry
    });
  } catch (error) {
    console.error("Error updating enquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update enquiry",
      error: error.message
    });
  }
};

// ✅ Get pending enquiries (Admin only)
export const getPendingEnquiries = async (req, res) => {
  try {
    const enquiries = await OtherService.getPendingEnquiries();

    res.status(200).json({
      success: true,
      data: enquiries,
      count: enquiries.length
    });
  } catch (error) {
    console.error("Error fetching pending enquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending enquiries",
      error: error.message
    });
  }
};

// ✅ Get urgent enquiries (Admin only)
export const getUrgentEnquiries = async (req, res) => {
  try {
    const enquiries = await OtherService.getUrgentEnquiries();

    res.status(200).json({
      success: true,
      data: enquiries,
      count: enquiries.length
    });
  } catch (error) {
    console.error("Error fetching urgent enquiries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch urgent enquiries",
      error: error.message
    });
  }
};

// ✅ Delete enquiry (Admin only)
export const deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await OtherService.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting enquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete enquiry",
      error: error.message
    });
  }
};

// ✅ Get enquiry statistics (Admin only)
export const getEnquiryStats = async (req, res) => {
  try {
    const totalEnquiries = await OtherService.countDocuments();
    const pendingEnquiries = await OtherService.countDocuments({ 
      enquiryStatus: "Pending" 
    });
    const urgentEnquiries = await OtherService.countDocuments({ 
      $or: [
        { urgency: "Very Urgent" },
        { priority: "Urgent" }
      ]
    });
    const todayEnquiries = await OtherService.countDocuments({
      createdAt: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
      }
    });

    // Get enquiries by service type
    const byServiceType = await OtherService.aggregate([
      {
        $group: {
          _id: "$serviceType",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get enquiries by status
    const byStatus = await OtherService.aggregate([
      {
        $group: {
          _id: "$enquiryStatus",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEnquiries,
        pendingEnquiries,
        urgentEnquiries,
        todayEnquiries,
        byServiceType,
        byStatus
      }
    });
  } catch (error) {
    console.error("Error fetching enquiry stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry statistics",
      error: error.message
    });
  }
};
