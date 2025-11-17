import Razorpay from "razorpay";
import crypto from "crypto";
import Booking from "../models/booking.js";
import Tour from "../models/tours.js";
import Trek from "../models/treks.js";

// Log Razorpay configuration (without exposing secrets)
console.log("🔐 Razorpay Configuration:");
console.log("Key ID:", process.env.RAZORPAY_KEY_ID ? `${process.env.RAZORPAY_KEY_ID.substring(0, 12)}...` : "NOT SET");
console.log("Key Secret:", process.env.RAZORPAY_KEY_SECRET ? "SET (hidden)" : "NOT SET");

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("✅ Razorpay instance created successfully");

// ====================================
// 🟢 CREATE RAZORPAY ORDER
// ====================================
export const createOrder = async (req, res) => {
  try {
    console.log("📥 Create order request received:", req.body);
    
    const { amount, bookingData } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      console.log("❌ Invalid amount:", amount);
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // Validate booking data
    if (!bookingData || !bookingData.bookingType) {
      console.log("❌ Invalid booking data:", bookingData);
      return res.status(400).json({
        success: false,
        message: "Booking data is required",
      });
    }

    console.log("✅ Validation passed. Creating Razorpay order...");
    console.log("💰 Amount:", amount, "INR");
    console.log("📋 Booking type:", bookingData.bookingType);

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        bookingType: bookingData.bookingType,
        customerName: bookingData.name,
        customerEmail: bookingData.email,
        customerMobile: bookingData.mobile,
      },
    };

    console.log("🔧 Razorpay options:", options);

    const order = await razorpay.orders.create(options);

    console.log("✅ Razorpay order created:", order.id);

    res.status(200).json({
      success: true,
      data: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    console.error("❌ Error details:", {
      message: error.message,
      description: error.error?.description,
      statusCode: error.statusCode,
      error: error.error
    });
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create payment order",
      error: process.env.NODE_ENV === 'development' ? error.error : undefined,
    });
  }
};

// ====================================
// 🟢 VERIFY PAYMENT & CREATE BOOKING
// ====================================
export const verifyPaymentAndCreateBooking = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData,
    } = req.body;

    console.log("📝 Payment verification request received");

    // Verify payment signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      console.error("❌ Invalid payment signature");
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    console.log("✅ Payment signature verified");

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    console.log("💰 Payment details fetched:", {
      id: payment.id,
      amount: payment.amount / 100,
      status: payment.status,
      method: payment.method,
    });

    // Check if payment is captured
    if (payment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: "Payment not captured",
      });
    }

    // Validate booking data
    const {
      name,
      email,
      mobile,
      bookingType,
      tourId,
      trekId,
      numberOfMembers,
      adults,
      women,
      children,
      infants,
      selectedCategory, // NEW: Category selection for tours
      pickupCity,
      bookingDate,
      pricePerPerson,
      totalPrice, // Total price from frontend (after discount if coupon applied)
      originalPrice, // Original price before discount
      specialRequests,
      couponCode,
      discountPercentage,
      discountAmount,
    } = bookingData;

    if (!name || !email || !mobile || !bookingType || !numberOfMembers || !pickupCity || !bookingDate || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required booking fields",
      });
    }

    // Validate booking type and corresponding ID
    if (bookingType === "tour" && !tourId) {
      return res.status(400).json({
        success: false,
        message: "Tour ID is required for tour bookings",
      });
    }

    if (bookingType === "trek" && !trekId) {
      return res.status(400).json({
        success: false,
        message: "Trek ID is required for trek bookings",
      });
    }

    // Fetch tour or trek details
    let itemDetails;
    if (bookingType === "tour") {
      itemDetails = await Tour.findById(tourId);
      if (!itemDetails) {
        return res.status(404).json({
          success: false,
          message: "Tour not found",
        });
      }
    } else {
      itemDetails = await Trek.findById(trekId);
      if (!itemDetails) {
        return res.status(404).json({
          success: false,
          message: "Trek not found",
        });
      }
    }

    // Use totalPrice from frontend (already calculated with multi-price logic)
    // Frontend sends finalAmount (after discount) as totalPrice
    const paidAmount = payment.amount / 100; // Convert from paise to rupees

    // Verify amount matches
    if (Math.abs(totalPrice - paidAmount) > 1) {
      // Allow 1 rupee difference for rounding
      console.error("❌ Amount mismatch:", { totalPrice, paidAmount });
      return res.status(400).json({
        success: false,
        message: "Payment amount does not match booking amount",
      });
    }

    // Create booking with payment details
    const newBooking = await Booking.create({
      name,
      email,
      mobile,
      bookingType,
      tourId: bookingType === "tour" ? tourId : undefined,
      trekId: bookingType === "trek" ? trekId : undefined,
      numberOfMembers,
      adults: adults || 0,
      women: women || 0,
      children: children || 0,
      infants: infants || 0,
      selectedCategory: bookingType === "tour" ? selectedCategory : undefined, // NEW: Save category for tours
      pickupCity,
      bookingDate,
      pricePerPerson,
      totalPrice, // Final price (after discount)
      originalPrice: originalPrice || totalPrice, // Original price before discount
      discountAmount: discountAmount || 0,
      couponCode: couponCode || null,
      discountPercentage: discountPercentage || 0,
      specialRequests: specialRequests || "",
      bookingStatus: "confirmed",
      paymentStatus: "completed",
      amountPaid: paidAmount,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentMethod: "razorpay",
      transactionId: razorpay_payment_id,
      paidAt: new Date(),
    });

    console.log("✅ Booking created with payment:", newBooking._id, "Reference:", newBooking.bookingReference);

    // Update tour/trek total bookings
    if (bookingType === "tour") {
      await Tour.findByIdAndUpdate(tourId, {
        $inc: { totalBookings: numberOfMembers },
      });
    } else {
      await Trek.findByIdAndUpdate(trekId, {
        $inc: { totalBookings: numberOfMembers },
      });
    }

    // Send confirmation emails
    try {
      // Import email functions from bookingController
      const { sendBookingConfirmationEmail, sendAdminNotification } = await import('./bookingController.js');
      
      // Send customer confirmation email
      console.log("📧 Sending customer confirmation email...");
      await sendBookingConfirmationEmail(newBooking, itemDetails);
      
      // Send admin notification email
      console.log("📧 Sending admin notification email...");
      await sendAdminNotification(newBooking, itemDetails);
      
      console.log("✅ Emails sent successfully");
    } catch (emailError) {
      console.error("⚠️ Error sending emails:", emailError);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: "Payment verified and booking confirmed successfully!",
      data: newBooking,
      bookingReference: newBooking.bookingReference,
    });
  } catch (error) {
    console.error("❌ Error verifying payment and creating booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment and create booking",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// ====================================
// 🟢 GET PAYMENT STATUS
// ====================================
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
      });
    }

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: payment.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching payment status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch payment status",
    });
  }
};

// ====================================
// 🟢 HANDLE PAYMENT FAILURE
// ====================================
export const handlePaymentFailure = async (req, res) => {
  try {
    const { error, orderId, bookingData } = req.body;

    console.error("❌ Payment failed:", {
      orderId,
      error: error?.description || error?.reason || "Unknown error",
    });

    // Send failure notification emails
    try {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send customer notification
      if (bookingData && bookingData.email) {
        await transporter.sendMail({
          from: `Aarohan-holidays <${process.env.EMAIL_USER}>`,
          to: bookingData.email,
          subject: "Payment Failed - Aarohan-holidays Booking",
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1>❌ Payment Failed</h1>
                </div>
                <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p>Dear ${bookingData.name},</p>
                  <p>We're sorry, but your payment for the ${bookingData.bookingType} booking could not be processed.</p>
                  
                  <div style="background: #fee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                    <p style="margin: 0; color: #991b1b;"><strong>Error:</strong> ${error?.description || error?.reason || "Payment processing failed"}</p>
                  </div>
                  
                  <p><strong>What you can do:</strong></p>
                  <ul>
                    <li>Check your card details and try again</li>
                    <li>Ensure you have sufficient balance</li>
                    <li>Try a different payment method</li>
                    <li>Contact your bank if the issue persists</li>
                  </ul>
                  
                  <p>You can try booking again by visiting our website. If you need assistance, please contact us.</p>
                  
                  <div style="text-align: center; margin-top: 30px;">
                    <p style="margin: 0;"><strong>Need Help?</strong></p>
                    <p>📧 Email: ${process.env.EMAIL_USER || 'support@aarohan-holidays.com'}</p>
                    <p>📱 Phone: +91-XXXXXXXXXX</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        });
      }

      // Send admin notification
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      await transporter.sendMail({
        from: `Aarohan-holidays System <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `⚠️ Payment Failed - ${bookingData?.name || 'Unknown Customer'}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #ef4444;">⚠️ Payment Failure Alert</h2>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Error:</strong> ${error?.description || error?.reason || "Unknown error"}</p>
              ${bookingData ? `
                <h3>Customer Details:</h3>
                <ul>
                  <li><strong>Name:</strong> ${bookingData.name}</li>
                  <li><strong>Email:</strong> ${bookingData.email}</li>
                  <li><strong>Mobile:</strong> ${bookingData.mobile}</li>
                  <li><strong>Booking Type:</strong> ${bookingData.bookingType}</li>
                </ul>
              ` : ''}
              <p style="color: #666; font-size: 12px;">Timestamp: ${new Date().toLocaleString('en-IN')}</p>
            </div>
          </body>
          </html>
        `,
      });

      console.log("✅ Failure notification emails sent");
    } catch (emailError) {
      console.error("⚠️ Error sending failure notification emails:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Payment failure recorded",
    });
  } catch (error) {
    console.error("❌ Error handling payment failure:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to handle payment failure",
    });
  }
};

// ====================================
// 🟢 REFUND PAYMENT (ADMIN)
// ====================================
export const refundPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { amount, reason } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (!booking.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: "No payment found for this booking",
      });
    }

    if (booking.paymentStatus === "refunded") {
      return res.status(400).json({
        success: false,
        message: "Payment already refunded",
      });
    }

    // Create refund
    const refundAmount = amount ? Math.round(amount * 100) : Math.round(booking.amountPaid * 100);
    
    const refund = await razorpay.payments.refund(booking.razorpayPaymentId, {
      amount: refundAmount,
      notes: {
        reason: reason || "Booking cancellation",
        bookingReference: booking.bookingReference,
      },
    });

    // Update booking
    booking.paymentStatus = "refunded";
    booking.bookingStatus = "cancelled";
    await booking.save();

    console.log("✅ Refund processed:", refund.id);

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status,
      },
    });
  } catch (error) {
    console.error("❌ Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process refund",
    });
  }
};
