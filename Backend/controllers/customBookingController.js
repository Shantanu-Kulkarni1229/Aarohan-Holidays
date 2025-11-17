import CustomBooking from "../models/customBooking.js";
import { sendCustomBookingEmail } from "../utils/emailService.js";
import { generateCustomBookingPDF } from "../utils/customBookingPDFGenerator.js";
import { uploadThumbnail } from "../utils/cloudinaryUtils.js";
import Razorpay from "razorpay";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create and send custom booking quote
export const createCustomBooking = async (req, res) => {
  try {
    // Parse JSON data from FormData
    const bookingData = req.body.data ? JSON.parse(req.body.data) : req.body;
    console.log("📝 Received booking data");
    console.log("📷 Thumbnail file received:", req.file ? 'Yes' : 'No');
    
    // Upload thumbnail to Cloudinary if image was uploaded
    if (req.file) {
      console.log("☁️ Uploading thumbnail to Cloudinary...");
      const cloudinaryResult = await uploadThumbnail(req.file.buffer);
      bookingData.thumbnail = cloudinaryResult.url; // Cloudinary URL
      console.log("✅ Thumbnail uploaded to Cloudinary:", cloudinaryResult.url);
    }

    // Calculate total amount using category-based pricing
    const { numberOfMembers, pricePerPerson } = bookingData.pricing;
    console.log("💰 Pricing details:", { numberOfMembers, pricePerPerson });
    
    const totalAmount = numberOfMembers * pricePerPerson;
    bookingData.pricing.totalAmount = totalAmount;
    console.log("💵 Total amount calculated:", totalAmount);

    // Create Razorpay order (optional - skip if not configured)
    try {
      if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        console.log("🔄 Creating Razorpay order...");
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // Amount in paise
          currency: "INR",
          receipt: `custom_booking_${Date.now()}`,
          notes: {
            customerName: bookingData.customerName,
            customerEmail: bookingData.customerEmail,
            packageName: bookingData.packageName,
            packageType: bookingData.packageType,
          }
        });

        // Generate Razorpay payment link
        const paymentLink = `${process.env.FRONTEND_URL}/payment?orderId=${razorpayOrder.id}&amount=${totalAmount}&customerEmail=${bookingData.customerEmail}&bookingId=`;
        bookingData.paymentLink = paymentLink;
        bookingData.razorpayOrderId = razorpayOrder.id;
        console.log("✅ Razorpay order created:", razorpayOrder.id);
      } else {
        console.log("⚠️ Razorpay not configured, skipping payment order creation");
      }
    } catch (razorpayError) {
      console.error("⚠️ Razorpay order creation failed (non-critical):", razorpayError.message);
      // Continue without Razorpay - this is non-critical
    }

    // Create the custom booking
    console.log("💾 Creating custom booking in database...");
    let customBooking;
    try {
      customBooking = await CustomBooking.create(bookingData);
      console.log("✅ Custom booking created with ID:", customBooking._id);
    } catch (dbError) {
      console.error("❌ Database validation error:");
      console.error("Error name:", dbError.name);
      console.error("Error message:", dbError.message);
      if (dbError.errors) {
        console.error("Field errors:");
        Object.keys(dbError.errors).forEach(field => {
          console.error(`  - ${field}: ${dbError.errors[field].message}`);
        });
      }
      throw dbError; // Re-throw to be caught by outer catch
    }

    // Generate PDF in memory (no file saved)
    console.log("📄 Generating PDF in memory...");
    console.log("📷 Booking thumbnail for PDF:", customBooking.thumbnail || 'No thumbnail');
    const pdfBuffer = await generateCustomBookingPDF(customBooking);
    console.log("✅ PDF generated successfully! Size:", pdfBuffer.length, "bytes");
    customBooking.pdfGenerated = true;
    // No pdfPath saved - PDF is only in memory

    // Send email with PDF buffer
    console.log("📧 Attempting to send email to:", bookingData.customerEmail);
    const emailSent = await sendCustomBookingEmail(customBooking, pdfBuffer);
    console.log("📧 Email sent status:", emailSent);
    
    if (emailSent) {
      customBooking.emailSent = true;
      customBooking.emailSentAt = new Date();
      customBooking.quoteSentDate = new Date();
      console.log("✅ Email sent successfully! PDF was not saved to disk.");
    } else {
      console.log("❌ Email failed to send!");
    }

    await customBooking.save();

    res.status(201).json({
      success: true,
      message: "Custom booking created and sent to customer successfully!",
      data: customBooking
    });

  } catch (error) {
    console.error("❌ Error creating custom booking:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    if (error.errors) {
      console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
    }
    res.status(500).json({
      success: false,
      message: "Failed to create custom booking",
      error: error.message,
      details: error.errors || {}
    });
  }
};

// Get all custom bookings (for admin)
export const getAllCustomBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      packageType,
      paymentStatus,
      search 
    } = req.query;

    const query = {};
    
    if (status) query.status = status;
    if (packageType) query.packageType = packageType;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { packageName: { $regex: search, $options: 'i' } }
      ];
    }

    const bookings = await CustomBooking.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await CustomBooking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        totalItems: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error("Error fetching custom bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch custom bookings",
      error: error.message
    });
  }
};

// Get single custom booking
export const getCustomBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await CustomBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Custom booking not found"
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error("Error fetching custom booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch custom booking",
      error: error.message
    });
  }
};

// Update custom booking
export const updateCustomBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Recalculate total if pricing is updated (category-based)
    if (updates.pricing) {
      const { numberOfMembers, pricePerPerson } = updates.pricing;
      updates.pricing.totalAmount = numberOfMembers * pricePerPerson;
    }

    const booking = await CustomBooking.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Custom booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Custom booking updated successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error updating custom booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update custom booking",
      error: error.message
    });
  }
};

// Resend email and PDF
export const resendCustomBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await CustomBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Custom booking not found"
      });
    }

    // Regenerate PDF in memory (no file saved)
    console.log("📄 Regenerating PDF in memory for resend...");
    const pdfBuffer = await generateCustomBookingPDF(booking);
    console.log("✅ PDF regenerated! Size:", pdfBuffer.length, "bytes");

    // Resend email with PDF buffer
    const emailSent = await sendCustomBookingEmail(booking, pdfBuffer);
    
    if (emailSent) {
      booking.emailSent = true;
      booking.emailSentAt = new Date();
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Custom booking resent successfully"
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send email"
      });
    }

  } catch (error) {
    console.error("Error resending custom booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend custom booking",
      error: error.message
    });
  }
};

// Delete custom booking
export const deleteCustomBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await CustomBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Custom booking not found"
      });
    }

    // Delete associated PDF file
    if (booking.pdfPath && fs.existsSync(booking.pdfPath)) {
      fs.unlinkSync(booking.pdfPath);
    }

    await CustomBooking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Custom booking deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting custom booking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete custom booking",
      error: error.message
    });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const booking = await CustomBooking.findByIdAndUpdate(
      id,
      { 
        paymentStatus,
        status: paymentStatus === "Paid" ? "Confirmed" : "Payment Pending",
        confirmedDate: paymentStatus === "Paid" ? new Date() : undefined
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Custom booking not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: booking
    });

  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message
    });
  }
};

// Get booking statistics
export const getCustomBookingStats = async (req, res) => {
  try {
    const totalBookings = await CustomBooking.countDocuments();
    const quotesSent = await CustomBooking.countDocuments({ status: "Quote Sent" });
    const confirmed = await CustomBooking.countDocuments({ status: "Confirmed" });
    const cancelled = await CustomBooking.countDocuments({ status: "Cancelled" });
    const completed = await CustomBooking.countDocuments({ status: "Completed" });
    
    const totalRevenue = await CustomBooking.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$pricing.totalAmount" } } }
    ]);

    const pendingRevenue = await CustomBooking.aggregate([
      { $match: { paymentStatus: { $in: ["Pending", "Partial"] } } },
      { $group: { _id: null, total: { $sum: "$pricing.totalAmount" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        quotesSent,
        confirmed,
        cancelled,
        completed,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingRevenue: pendingRevenue[0]?.total || 0
      }
    });

  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking statistics",
      error: error.message
    });
  }
};

// Download PDF for a custom booking
export const downloadCustomBookingPDF = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📥 PDF download requested for booking:", id);

    // Find booking
    const booking = await CustomBooking.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    console.log("📄 Generating PDF for download...");
    
    // Generate PDF
    const pdfBuffer = await generateCustomBookingPDF(booking);
    
    console.log("✅ PDF generated successfully, sending to client...");

    // Generate filename
    const fileName = `Custom_Booking_${booking.packageName.replace(/\s+/g, '_')}_${booking._id}.pdf`;

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error("❌ Error downloading PDF:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download PDF",
      error: error.message
    });
  }
};
