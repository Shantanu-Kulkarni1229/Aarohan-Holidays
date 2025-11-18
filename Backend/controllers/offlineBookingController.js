import OfflineBooking from "../models/offlineBooking.js";
import Tour from "../models/tours.js";
import Trek from "../models/treks.js";
import CustomBooking from "../models/customBooking.js";
import { sendCustomBookingEmail } from "../utils/emailServiceResend.js";

// ====================================
// 🟢 CREATE OFFLINE BOOKING (ADMIN ONLY)
// ====================================
export const createOfflineBooking = async (req, res) => {
  try {

    const logoUrl = "https://res.cloudinary.com/dvlsgka21/image/upload/v1761288219/Aarohan_Holidays_2_tdpfor.jpg";

    const bookingType = bookingData.bookingType === 'tour' ? 'Tour' : 'Trek';    user: process.env.EMAIL_USER,    const bookingData = req.body;

    

    const mailOptions = {    pass: process.env.EMAIL_PASS,

      from: `Aarohan Holidays <${process.env.EMAIL_USER}>`,

      to: bookingData.email,  },    console.log("📋 Creating offline booking...");

      subject: `✅ Booking Confirmed - ${itemDetails.name} | Ref: ${bookingData.bookingReference}`,

      html: `});    console.log("📦 Package Type:", bookingData.packageType);

        <!DOCTYPE html>

        <html lang="en">    console.log("📦 Package ID:", bookingData.packageId);

        <head>

          <meta charset="UTF-8">// Offline Booking Confirmation Email Template

          <meta name="viewport" content="width=device-width, initial-scale=1.0">

          <title>Offline Booking Confirmation - Aarohan Holidays</title>const sendOfflineBookingConfirmationEmail = async (bookingData, itemDetails) => {    // Validate required fields

          <style>

            * { margin: 0; padding: 0; box-sizing: border-box; }  try {    if (!bookingData.packageId) {

            body { 

              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;     const logoUrl = "https://res.cloudinary.com/dvlsgka21/image/upload/v1761288219/Aarohan_Holidays_2_tdpfor.jpg";      return res.status(400).json({

              line-height: 1.6; 

              color: #333;     const bookingType = bookingData.bookingType === 'tour' ? 'Tour' : 'Trek';        success: false,

              background-color: #f5f5f5;

            }            message: "Package ID is required",

            .email-container { 

              max-width: 650px;     const mailOptions = {      });

              margin: 20px auto; 

              background: #ffffff;       from: `Aarohan Holidays <${process.env.EMAIL_USER}>`,    }

              border-radius: 12px; 

              overflow: hidden;      to: bookingData.email,

              box-shadow: 0 4px 20px rgba(0,0,0,0.1);

            }      subject: `✅ Booking Confirmed - ${itemDetails.name} | Ref: ${bookingData.bookingReference}`,    if (!bookingData.packageType) {

            .header { 

              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);       html: `      return res.status(400).json({

              color: white; 

              padding: 40px 30px;         <!DOCTYPE html>        success: false,

              text-align: center;

            }        <html lang="en">        message: "Package Type is required",

            .logo { 

              max-width: 180px;         <head>      });

              height: auto; 

              margin-bottom: 20px;          <meta charset="UTF-8">    }

              background: white;

              padding: 10px;          <meta name="viewport" content="width=device-width, initial-scale=1.0">

              border-radius: 8px;

            }          <title>Offline Booking Confirmation - Aarohan Holidays</title>    // Fetch package details based on packageType and packageId

            .header h1 { 

              font-size: 28px;           <style>    let packageDetails;

              margin: 15px 0 10px; 

              font-weight: 600;            * { margin: 0; padding: 0; box-sizing: border-box; }    try {

            }

            .content {             body {       if (bookingData.packageType === "Tour") {

              padding: 40px 30px; 

            }              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;         packageDetails = await Tour.findById(bookingData.packageId);

            .greeting { 

              font-size: 18px;               line-height: 1.6;       } else if (bookingData.packageType === "Trek") {

              color: #333; 

              margin-bottom: 20px;              color: #333;         packageDetails = await Trek.findById(bookingData.packageId);

              font-weight: 500;

            }              background-color: #f5f5f5;      } else if (bookingData.packageType === "CustomBooking") {

            .booking-ref-box {

              background: #d4edda;            }        packageDetails = await CustomBooking.findById(bookingData.packageId);

              border-left: 4px solid #28a745;

              padding: 20px;            .email-container {       } else {

              margin: 25px 0;

              border-radius: 6px;              max-width: 650px;         return res.status(400).json({

            }

            .booking-ref-box .ref-number {              margin: 20px auto;           success: false,

              color: #155724;

              font-size: 24px;              background: #ffffff;           message: `Invalid package type: ${bookingData.packageType}. Must be Tour, Trek, or CustomBooking.`,

              font-weight: 700;

              margin-top: 8px;              border-radius: 12px;         });

            }

            .info-card {               overflow: hidden;      }

              background: #f8f9fa; 

              border: 1px solid #e9ecef;              box-shadow: 0 4px 20px rgba(0,0,0,0.1);    } catch (err) {

              border-radius: 8px; 

              padding: 25px;             }      console.error("❌ Error fetching package:", err);

              margin: 25px 0;

            }            .header {       return res.status(400).json({

            .info-card h2 { 

              color: #28a745;               background: linear-gradient(135deg, #28a745 0%, #20c997 100%);         success: false,

              font-size: 20px; 

              margin-bottom: 20px;              color: white;         message: "Invalid package ID format",

              font-weight: 600;

            }              padding: 40px 30px;         error: err.message,

            .info-row { 

              display: flex;               text-align: center;      });

              justify-content: space-between; 

              padding: 12px 0;             }    }

              border-bottom: 1px solid #e9ecef;

            }            .logo { 

            .info-row:last-child { 

              border-bottom: none;               max-width: 180px;     if (!packageDetails) {

            }

            .info-label {               height: auto;       return res.status(404).json({

              font-weight: 600; 

              color: #495057;              margin-bottom: 20px;        success: false,

            }

            .info-value {               background: white;        message: `${bookingData.packageType} not found with ID: ${bookingData.packageId}`,

              color: #212529;

              text-align: right;              padding: 10px;      });

            }

            .payment-summary {              border-radius: 8px;    }

              background: #d1ecf1;

              border: 2px solid #17a2b8;            }

              border-radius: 8px;

              padding: 20px;            .header h1 {     console.log("📦 Package found:", packageDetails.name || packageDetails.packageName);

              margin: 25px 0;

            }              font-size: 28px; 

            .payment-total {

              border-top: 2px solid #0c5460;              margin: 15px 0 10px;     // Calculate total amount

              margin-top: 10px;

              padding-top: 15px;              font-weight: 600;    const { adults, women, children, infants, adultPrice, womenPrice, childrenPrice, infantPrice } = bookingData.pricing;

              font-weight: 700;

              font-size: 18px;            }    

            }

            .offline-badge {            .header p {     const totalAmount = 

              background: #fff3cd;

              border-left: 4px solid #ffc107;              font-size: 16px;       (adults * adultPrice) + 

              padding: 20px;

              margin: 25px 0;              opacity: 0.95;      (women * womenPrice) + 

              border-radius: 6px;

            }              margin: 5px 0;      (children * childrenPrice) + 

            .footer { 

              background: #f8f9fa;             }      (infants * infantPrice);

              padding: 30px; 

              text-align: center;             .success-badge {

              border-top: 3px solid #28a745;

            }              display: inline-block;    console.log("💰 Pricing calculation:");

          </style>

        </head>              background: #d4edda;    console.log(`  Adults: ${adults} × ₹${adultPrice} = ₹${adults * adultPrice}`);

        <body>

          <div class="email-container">              color: #155724;    console.log(`  Women: ${women} × ₹${womenPrice} = ₹${women * womenPrice}`);

            <div class="header">

              <img src="${logoUrl}" alt="Aarohan Holidays" class="logo">              padding: 8px 20px;    console.log(`  Children: ${children} × ₹${childrenPrice} = ₹${children * childrenPrice}`);

              <h1>✅ Booking Confirmed!</h1>

              <p>Your ${bookingType} adventure awaits</p>              border-radius: 20px;    console.log(`  Infants: ${infants} × ₹${infantPrice} = ₹${infants * infantPrice}`);

            </div>

              font-weight: 600;    console.log(`  Total Amount: ₹${totalAmount}`);

            <div class="content">

              <div class="greeting">Dear ${bookingData.name},</div>              margin-top: 15px;

              

              <p>Thank you for choosing <strong>Aarohan Holidays</strong>! We are delighted to confirm your booking for <strong>${itemDetails.name}</strong>.</p>              font-size: 14px;    bookingData.pricing.totalAmount = totalAmount;



              <div class="booking-ref-box">            }    bookingData.numberOfTravelers = adults + women + children + infants;

                <div class="label">📋 Booking Reference</div>

                <div class="ref-number">${bookingData.bookingReference}</div>            .content {     bookingData.balanceAmount = totalAmount;

              </div>

              padding: 40px 30px; 

              <div class="offline-badge">

                <strong>💼 Offline Booking Confirmed</strong>            }    console.log("👥 Total travelers:", bookingData.numberOfTravelers);

                <p>This booking was processed offline by our team. Your payment has been received and verified.</p>

              </div>            .greeting { 



              <div class="info-card">              font-size: 18px;     // Create offline booking

                <h2>📝 ${bookingType} Details</h2>

                <div class="info-row">              color: #333;     const offlineBooking = new OfflineBooking(bookingData);

                  <span class="info-label">${bookingType} Name:</span>

                  <span class="info-value">${itemDetails.name}</span>              margin-bottom: 20px;    await offlineBooking.save();

                </div>

                <div class="info-row">              font-weight: 500;

                  <span class="info-label">Location:</span>

                  <span class="info-value">${itemDetails.location}</span>            }    console.log("✅ Offline booking created successfully!");

                </div>

                <div class="info-row">            .intro-text {    console.log("🆔 Booking ID:", offlineBooking._id);

                  <span class="info-label">Travel Date:</span>

                  <span class="info-value">${new Date(bookingData.bookingDate).toLocaleDateString('en-IN')}</span>              color: #555;

                </div>

              </div>              margin-bottom: 25px;    // Populate the package details for email



              <div class="info-card">              font-size: 15px;    const populatedBooking = await OfflineBooking.findById(offlineBooking._id).populate('packageId');

                <h2>👤 Contact Information</h2>

                <div class="info-row">              line-height: 1.8;

                  <span class="info-label">Name:</span>

                  <span class="info-value">${bookingData.name}</span>            }    if (!populatedBooking) {

                </div>

                <div class="info-row">            .booking-ref-box {      console.log("⚠️ Failed to populate booking for email");

                  <span class="info-label">Email:</span>

                  <span class="info-value">${bookingData.email}</span>              background: #d4edda;      return res.status(201).json({

                </div>

                <div class="info-row">              border-left: 4px solid #28a745;        success: true,

                  <span class="info-label">Mobile:</span>

                  <span class="info-value">${bookingData.mobile}</span>              padding: 20px;        message: "Offline booking created successfully, but email sending failed",

                </div>

              </div>              margin: 25px 0;        booking: offlineBooking,



              <div class="payment-summary">              border-radius: 6px;        emailSent: false,

                <h3>💰 Payment Summary</h3>

                <div class="payment-total">            }      });

                  <span>Total Amount Paid:</span>

                  <span>₹${bookingData.amountPaid.toLocaleString('en-IN')}</span>            .booking-ref-box .label {    }

                </div>

                <div style="margin-top: 10px;">              color: #155724;

                  <span>Payment Method: Offline Payment</span>

                </div>              font-weight: 600;    console.log("✅ Booking populated successfully");

              </div>

            </div>              font-size: 14px;    console.log("📧 Package details for email:", {



            <div class="footer">              text-transform: uppercase;      name: populatedBooking.packageId?.name || populatedBooking.packageId?.packageName,

              <h3>Aarohan Holidays</h3>

              <p>📧 Email: infoaarohanholidays@gmail.com</p>              letter-spacing: 0.5px;      type: populatedBooking.packageType,

              <p>📱 Phone: +91 7276644221</p>

            </div>            }    });

          </div>

        </body>            .booking-ref-box .ref-number {

        </html>

      `,              color: #155724;    // Send email (without PDF for offline bookings - pass null as second parameter)

    };

              font-size: 24px;    console.log("📧 Attempting to send email to:", bookingData.customerEmail);

    await transporter.sendMail(mailOptions);

    console.log("✅ Offline booking confirmation email sent successfully");              font-weight: 700;    const emailSent = await sendCustomBookingEmail(populatedBooking, null);

    return true;

  } catch (error) {              margin-top: 8px;

    console.error("❌ Error sending offline booking email:", error);

    throw error;              letter-spacing: 1px;    if (emailSent) {

  }

};            }      populatedBooking.emailSent = true;



// ====================================            .info-card {       populatedBooking.emailSentAt = new Date();

// 🟢 CREATE OFFLINE BOOKING (ADMIN ONLY)

// ====================================              background: #f8f9fa;       populatedBooking.quoteSentDate = new Date();

export const createOfflineBooking = async (req, res) => {

  try {              border: 1px solid #e9ecef;      await populatedBooking.save();

    console.log("📝 Received offline booking request:", req.body);

                  border-radius: 8px;       console.log("✅ Email sent successfully!");

    const {

      name,              padding: 25px;     } else {

      email,

      mobile,              margin: 25px 0;      console.log("⚠️ Email sending failed, but booking was created.");

      bookingType,

      tourId,            }    }

      trekId,

      bookingDate,            .info-card h2 { 

      amountPaid,

    } = req.body;              color: #28a745;     res.status(201).json({



    // Validate required fields              font-size: 20px;       success: true,

    if (!name || !email || !mobile || !bookingType || !bookingDate || !amountPaid) {

      return res.status(400).json({              margin-bottom: 20px;      message: "Offline booking created successfully",

        success: false,

        message: "Please provide all required fields: name, email, mobile, bookingType, bookingDate, and amountPaid",              font-weight: 600;      booking: populatedBooking,

      });

    }              display: flex;      emailSent,



    // Validate booking type and corresponding ID              align-items: center;    });

    if (bookingType === "tour" && !tourId) {

      return res.status(400).json({              gap: 10px;  } catch (error) {

        success: false,

        message: "Tour ID is required for tour bookings",            }    console.error("❌ Error creating offline booking:", error);

      });

    }            .info-row {     console.error("❌ Error name:", error.name);



    if (bookingType === "trek" && !trekId) {              display: flex;     console.error("❌ Error message:", error.message);

      return res.status(400).json({

        success: false,              justify-content: space-between;     

        message: "Trek ID is required for trek bookings",

      });              padding: 12px 0;     // Send detailed error for validation errors

    }

              border-bottom: 1px solid #e9ecef;    if (error.name === 'ValidationError') {

    // Fetch tour or trek details

    let itemDetails;            }      const validationErrors = Object.values(error.errors).map(err => err.message);

    if (bookingType === "tour") {

      itemDetails = await Tour.findById(tourId);            .info-row:last-child {       console.error("❌ Validation errors:", validationErrors);

      if (!itemDetails) {

        return res.status(404).json({              border-bottom: none;       return res.status(400).json({

          success: false,

          message: "Tour not found",            }        success: false,

        });

      }            .info-label {         message: "Validation failed",

    } else {

      itemDetails = await Trek.findById(trekId);              font-weight: 600;         errors: validationErrors,

      if (!itemDetails) {

        return res.status(404).json({              color: #495057;        error: error.message,

          success: false,

          message: "Trek not found",              font-size: 14px;      });

        });

      }            }    }

    }

            .info-value {     

    // Create offline booking

    const newBooking = await Booking.create({              color: #212529;    res.status(500).json({

      name,

      email,              font-size: 14px;      success: false,

      mobile,

      bookingType,              text-align: right;      message: "Failed to create offline booking",

      tourId: bookingType === "tour" ? tourId : undefined,

      trekId: bookingType === "trek" ? trekId : undefined,            }      error: error.message,

      numberOfMembers: 1,

      adults: 1,            .payment-summary {      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,

      women: 0,

      children: 0,              background: #d1ecf1;    });

      infants: 0,

      pickupCity: "Offline Booking",              border: 2px solid #17a2b8;  }

      bookingDate,

      pricePerPerson: amountPaid,              border-radius: 8px;};

      totalPrice: amountPaid,

      originalPrice: amountPaid,              padding: 20px;

      discountAmount: 0,

      bookingStatus: "confirmed",              margin: 25px 0;// Get all offline bookings (with filters)

      paymentStatus: "completed",

      paymentMethod: "offline",            }export const getAllOfflineBookings = async (req, res) => {

      amountPaid: amountPaid,

      paidAt: new Date(),            .payment-summary h3 {  try {

    });

              color: #0c5460;    const {

    console.log("✅ Offline booking created:", newBooking.bookingReference);

              font-size: 18px;      page = 1,

    // Send confirmation email

    let emailSent = false;              margin-bottom: 15px;      limit = 10,

    try {

      await sendOfflineBookingConfirmationEmail(newBooking, itemDetails);              font-weight: 600;      paymentStatus,

      emailSent = true;

      newBooking.emailSent = true;            }      bookingStatus,

      await newBooking.save();

    } catch (emailError) {            .payment-row {      startDate,

      console.error("⚠️ Email sending failed:", emailError.message);

    }              display: flex;      endDate,



    res.status(201).json({              justify-content: space-between;      search,

      success: true,

      message: "Offline booking created successfully! Confirmation email sent to customer.",              padding: 10px 0;      sortBy = "createdAt",

      data: newBooking,

      notifications: {              font-size: 15px;      sortOrder = "desc",

        email: emailSent,

      },            }    } = req.query;

    });

  } catch (error) {            .payment-total {

    console.error("❌ Error creating offline booking:", error);

    res.status(500).json({              border-top: 2px solid #0c5460;    const query = {};

      success: false,

      message: error.message || "Failed to create offline booking",              margin-top: 10px;

    });

  }              padding-top: 15px;    // Filters

};

              font-weight: 700;    if (paymentStatus) {

              font-size: 18px;      query.paymentStatus = paymentStatus;

              color: #0c5460;    }

            }

            .offline-badge {    if (bookingStatus) {

              background: #fff3cd;      query.bookingStatus = bookingStatus;

              border-left: 4px solid #ffc107;    }

              padding: 20px;

              margin: 25px 0;    if (startDate || endDate) {

              border-radius: 6px;      query.startDate = {};

            }      if (startDate) query.startDate.$gte = new Date(startDate);

            .offline-badge strong {      if (endDate) query.startDate.$lte = new Date(endDate);

              color: #856404;    }

              font-size: 16px;

            }    // Search by customer name, email, or phone

            .offline-badge p {    if (search) {

              color: #856404;      query.$or = [

              margin-top: 10px;        { customerName: { $regex: search, $options: "i" } },

              font-size: 14px;        { customerEmail: { $regex: search, $options: "i" } },

              line-height: 1.6;        { customerPhone: { $regex: search, $options: "i" } },

            }        { packageName: { $regex: search, $options: "i" } },

            .next-steps {      ];

              background: #d1ecf1;    }

              border-left: 4px solid #17a2b8;

              padding: 20px;    const skip = (page - 1) * limit;

              margin: 25px 0;    const sortOptions = {};

              border-radius: 6px;    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

            }

            .next-steps h3 {    const [bookings, totalCount] = await Promise.all([

              color: #0c5460;      OfflineBooking.find(query)

              font-size: 18px;        .sort(sortOptions)

              margin-bottom: 15px;        .skip(skip)

              font-weight: 600;        .limit(Number(limit))

            }        .populate("packageId")

            .next-steps ul {        .populate("assignedTo", "name email")

              margin: 0;        .lean(),

              padding-left: 20px;      OfflineBooking.countDocuments(query),

            }    ]);

            .next-steps li {

              color: #0c5460;    res.status(200).json({

              margin: 10px 0;      success: true,

              font-size: 14px;      bookings,

              line-height: 1.6;      pagination: {

            }        currentPage: Number(page),

            .contact-buttons {        totalPages: Math.ceil(totalCount / limit),

              text-align: center;        totalBookings: totalCount,

              margin: 30px 0;        hasMore: skip + bookings.length < totalCount,

            }      },

            .btn {    });

              display: inline-block;  } catch (error) {

              padding: 14px 30px;    console.error("❌ Error fetching offline bookings:", error);

              margin: 8px;    res.status(500).json({

              text-decoration: none;      success: false,

              border-radius: 6px;      message: "Failed to fetch offline bookings",

              font-weight: 600;      error: error.message,

              font-size: 14px;    });

              transition: all 0.3s;  }

            }};

            .btn-primary {

              background: #28a745;// Get single offline booking

              color: white;export const getOfflineBookingById = async (req, res) => {

            }  try {

            .btn-whatsapp {    const { id } = req.params;

              background: #25D366;

              color: white;    const booking = await OfflineBooking.findById(id)

            }      .populate("packageId")

            .footer {       .populate("assignedTo", "name email phone");

              background: #f8f9fa; 

              padding: 30px;     if (!booking) {

              text-align: center;       return res.status(404).json({

              border-top: 3px solid #28a745;        success: false,

            }        message: "Offline booking not found",

            .footer-logo {      });

              max-width: 120px;    }

              margin-bottom: 15px;

            }    res.status(200).json({

            .footer h3 {      success: true,

              color: #28a745;      booking,

              font-size: 18px;    });

              margin-bottom: 15px;  } catch (error) {

              font-weight: 600;    console.error("❌ Error fetching offline booking:", error);

            }    res.status(500).json({

            .footer p {       success: false,

              color: #6c757d;       message: "Failed to fetch offline booking",

              margin: 8px 0;       error: error.message,

              font-size: 14px;    });

            }  }

            .disclaimer {};

              background: #e9ecef;

              padding: 15px;// Update offline booking

              margin-top: 20px;export const updateOfflineBooking = async (req, res) => {

              border-radius: 6px;  try {

              font-size: 12px;    const { id } = req.params;

              color: #6c757d;    const updateData = req.body;

              line-height: 1.6;

            }    // Recalculate total amount if pricing is updated

            @media only screen and (max-width: 600px) {    if (updateData.pricing) {

              .email-container { margin: 10px; }      const { adults, women, children, infants, adultPrice, womenPrice, childrenPrice, infantPrice } = updateData.pricing;

              .header, .content, .footer { padding: 20px 15px; }      

              .header h1 { font-size: 24px; }      updateData.pricing.totalAmount = 

              .info-row { flex-direction: column; gap: 5px; }        (adults * adultPrice) + 

              .info-value { text-align: left; }        (women * womenPrice) + 

              .btn { display: block; margin: 10px 0; }        (children * childrenPrice) + 

            }        (infants * infantPrice);

          </style>      

        </head>      updateData.numberOfTravelers = adults + women + children + infants;

        <body>    }

          <div class="email-container">

            <!-- Header -->    const booking = await OfflineBooking.findByIdAndUpdate(

            <div class="header">      id,

              <img src="${logoUrl}" alt="Aarohan Holidays" class="logo" onerror="this.style.display='none'">      { $set: updateData },

              <h1>✅ Booking Confirmed!</h1>      { new: true, runValidators: true }

              <p>Your ${bookingType} adventure awaits</p>    );

              <span class="success-badge">✓ Successfully Confirmed</span>

            </div>    if (!booking) {

      return res.status(404).json({

            <!-- Content -->        success: false,

            <div class="content">        message: "Offline booking not found",

              <div class="greeting">Dear ${bookingData.name},</div>      });

                  }

              <p class="intro-text">

                Thank you for choosing <strong>Aarohan Holidays</strong>! We are delighted to confirm your booking for     res.status(200).json({

                <strong>${itemDetails.name}</strong>. Your journey to creating unforgettable memories begins here!      success: true,

              </p>      message: "Offline booking updated successfully",

      booking,

              <!-- Booking Reference -->    });

              <div class="booking-ref-box">  } catch (error) {

                <div class="label">📋 Your Booking Reference</div>    console.error("❌ Error updating offline booking:", error);

                <div class="ref-number">${bookingData.bookingReference}</div>    res.status(500).json({

                <p style="margin-top: 10px; font-size: 13px; color: #155724;">      success: false,

                  Please save this reference number for all future correspondence.      message: "Failed to update offline booking",

                </p>      error: error.message,

              </div>    });

  }

              <!-- Offline Booking Notice -->};

              <div class="offline-badge">

                <strong>💼 Offline Booking Confirmed</strong>// Add payment to offline booking

                <p>export const addPayment = async (req, res) => {

                  This booking was processed offline by our team. Your payment has been received and verified.   try {

                  Thank you for your trust in Aarohan Holidays!    const { id } = req.params;

                </p>    const paymentData = req.body;

              </div>

    const booking = await OfflineBooking.findById(id);

              <!-- Booking Details -->

              <div class="info-card">    if (!booking) {

                <h2>📝 ${bookingType} Details</h2>      return res.status(404).json({

                <div class="info-row">        success: false,

                  <span class="info-label">${bookingType} Name:</span>        message: "Offline booking not found",

                  <span class="info-value">${itemDetails.name}</span>      });

                </div>    }

                <div class="info-row">

                  <span class="info-label">Location:</span>    // Add payment to payments array

                  <span class="info-value">${itemDetails.location}</span>    booking.payments.push({

                </div>      amount: paymentData.amount,

                <div class="info-row">      paymentDate: paymentData.paymentDate || new Date(),

                  <span class="info-label">Duration:</span>      paymentMethod: paymentData.paymentMethod,

                  <span class="info-value">${itemDetails.duration}</span>      receiptNumber: paymentData.receiptNumber,

                </div>      notes: paymentData.notes,

                <div class="info-row">      receivedBy: paymentData.receivedBy,

                  <span class="info-label">Travel Date:</span>      chequeNumber: paymentData.chequeNumber,

                  <span class="info-value">${new Date(bookingData.bookingDate).toLocaleDateString('en-IN', {       bankName: paymentData.bankName,

                    weekday: 'long',       transactionId: paymentData.transactionId,

                    year: 'numeric',     });

                    month: 'long', 

                    day: 'numeric'     // Update total paid

                  })}</span>    booking.totalPaid += paymentData.amount;

                </div>

              </div>    // Save (pre-save hook will update payment status and balance)

    await booking.save();

              <!-- Contact Information -->

              <div class="info-card">    res.status(200).json({

                <h2>👤 Contact Information</h2>      success: true,

                <div class="info-row">      message: "Payment added successfully",

                  <span class="info-label">Name:</span>      booking,

                  <span class="info-value">${bookingData.name}</span>      balanceAmount: booking.balanceAmount,

                </div>      paymentStatus: booking.paymentStatus,

                <div class="info-row">    });

                  <span class="info-label">Email:</span>  } catch (error) {

                  <span class="info-value">${bookingData.email}</span>    console.error("❌ Error adding payment:", error);

                </div>    res.status(500).json({

                <div class="info-row">      success: false,

                  <span class="info-label">Mobile:</span>      message: "Failed to add payment",

                  <span class="info-value">${bookingData.mobile}</span>      error: error.message,

                </div>    });

              </div>  }

};

              <!-- Payment Summary -->

              <div class="payment-summary">// Update booking status

                <h3>💰 Payment Summary</h3>export const updateBookingStatus = async (req, res) => {

                <div class="payment-row payment-total">  try {

                  <span>Total Amount Paid:</span>    const { id } = req.params;

                  <span>₹${bookingData.amountPaid.toLocaleString('en-IN')}</span>    const { bookingStatus, cancellationReason } = req.body;

                </div>

                <div class="payment-row">    const updateData = { bookingStatus };

                  <span>Payment Method:</span>

                  <span>Offline Payment</span>    if (bookingStatus === "Cancelled") {

                </div>      updateData.cancelledAt = new Date();

                <div class="payment-row">      if (cancellationReason) {

                  <span>Payment Status:</span>        updateData.cancellationReason = cancellationReason;

                  <span style="color: #28a745; font-weight: 600;">✓ Completed</span>      }

                </div>    }

              </div>

    const booking = await OfflineBooking.findByIdAndUpdate(

              <!-- Next Steps -->      id,

              <div class="next-steps">      { $set: updateData },

                <h3>📌 What Happens Next?</h3>      { new: true }

                <ul>    );

                  <li><strong>Confirmation Call:</strong> Our team will contact you within 24 hours to confirm all details</li>

                  <li><strong>Travel Information:</strong> You'll receive detailed itinerary and travel guidelines 3 days before departure</li>    if (!booking) {

                  <li><strong>Documents Required:</strong> Please keep your ID proofs ready</li>      return res.status(404).json({

                  <li><strong>24/7 Support:</strong> Our team is available round the clock for any assistance</li>        success: false,

                </ul>        message: "Offline booking not found",

              </div>      });

    }

              <!-- Contact Buttons -->

              <div class="contact-buttons">    res.status(200).json({

                <a href="tel:+917276644221" class="btn btn-primary">📞 Call Us: +91 7276644221</a>      success: true,

                <a href="https://wa.me/917276644221" class="btn btn-whatsapp">💬 WhatsApp Support</a>      message: `Booking status updated to ${bookingStatus}`,

              </div>      booking,

            </div>    });

  } catch (error) {

            <!-- Footer -->    console.error("❌ Error updating booking status:", error);

            <div class="footer">    res.status(500).json({

              <img src="${logoUrl}" alt="Aarohan Holidays" class="footer-logo" onerror="this.style.display='none'">      success: false,

              <h3>Aarohan Holidays</h3>      message: "Failed to update booking status",

              <p><strong>Feel Free to Fly...</strong></p>      error: error.message,

                  });

              <div style="margin: 20px 0;">  }

                <p>📧 Email: infoaarohanholidays@gmail.com</p>};

                <p>📱 Phone: +91 7276644221</p>

                <p>💬 WhatsApp: +91 7276644221</p>// Delete offline booking

              </div>export const deleteOfflineBooking = async (req, res) => {

  try {

              <div class="disclaimer">    const { id } = req.params;

                <strong>Note:</strong> This is an automated confirmation email for your offline booking. 

                For any queries, please contact us through the provided phone numbers or email address.    const booking = await OfflineBooking.findByIdAndDelete(id);

              </div>

            </div>    if (!booking) {

          </div>      return res.status(404).json({

        </body>        success: false,

        </html>        message: "Offline booking not found",

      `,      });

    };    }



    await transporter.sendMail(mailOptions);    res.status(200).json({

    console.log("✅ Offline booking confirmation email sent successfully");      success: true,

    return true;      message: "Offline booking deleted successfully",

  } catch (error) {    });

    console.error("❌ Error sending offline booking email:", error);  } catch (error) {

    throw error;    console.error("❌ Error deleting offline booking:", error);

  }    res.status(500).json({

};      success: false,

      message: "Failed to delete offline booking",

// ====================================      error: error.message,

// 🟢 CREATE OFFLINE BOOKING (ADMIN ONLY)    });

// ====================================  }

export const createOfflineBooking = async (req, res) => {};

  try {

    console.log("📝 Received offline booking request:", req.body);// Resend email (without PDF for offline bookings)

    export const resendOfflineBookingEmail = async (req, res) => {

    const {  try {

      name,    const { id } = req.params;

      email,

      mobile,    const booking = await OfflineBooking.findById(id).populate('packageId');

      bookingType,

      tourId,    if (!booking) {

      trekId,      return res.status(404).json({

      bookingDate,        success: false,

      amountPaid,        message: "Offline booking not found",

    } = req.body;      });

    }

    // Validate required fields

    if (!name || !email || !mobile || !bookingType || !bookingDate || !amountPaid) {    console.log("📧 Sending email to:", booking.customerEmail);

      console.log("❌ Validation failed - missing required fields");    const emailSent = await sendCustomBookingEmail(booking, null);

      return res.status(400).json({

        success: false,    if (emailSent) {

        message: "Please provide all required fields: name, email, mobile, bookingType, bookingDate, and amountPaid",      booking.emailSent = true;

      });      booking.emailSentAt = new Date();

    }      await booking.save();

      console.log("✅ Email sent successfully!");

    // Validate booking type and corresponding ID    }

    if (bookingType === "tour" && !tourId) {

      console.log("❌ Tour ID missing for tour booking");    res.status(200).json({

      return res.status(400).json({      success: true,

        success: false,      message: emailSent ? "Email sent successfully" : "Failed to send email",

        message: "Tour ID is required for tour bookings",      emailSent,

      });    });

    }  } catch (error) {

    console.error("❌ Error resending email:", error);

    if (bookingType === "trek" && !trekId) {    res.status(500).json({

      console.log("❌ Trek ID missing for trek booking");      success: false,

      return res.status(400).json({      message: "Failed to resend email",

        success: false,      error: error.message,

        message: "Trek ID is required for trek bookings",    });

      });  }

    }};



    // Fetch tour or trek details// Get offline booking statistics

    let itemDetails;export const getOfflineBookingStats = async (req, res) => {

    if (bookingType === "tour") {  try {

      console.log("🔍 Fetching tour details for ID:", tourId);    const [

      itemDetails = await Tour.findById(tourId);      totalBookings,

      if (!itemDetails) {      pendingBookings,

        console.log("❌ Tour not found:", tourId);      confirmedBookings,

        return res.status(404).json({      completedBookings,

          success: false,      cancelledBookings,

          message: "Tour not found",      pendingPayments,

        });      partialPayments,

      }      paidBookings,

    } else {      totalRevenue,

      console.log("🔍 Fetching trek details for ID:", trekId);      totalPending,

      itemDetails = await Trek.findById(trekId);    ] = await Promise.all([

      if (!itemDetails) {      OfflineBooking.countDocuments(),

        console.log("❌ Trek not found:", trekId);      OfflineBooking.countDocuments({ bookingStatus: "Pending" }),

        return res.status(404).json({      OfflineBooking.countDocuments({ bookingStatus: "Confirmed" }),

          success: false,      OfflineBooking.countDocuments({ bookingStatus: "Completed" }),

          message: "Trek not found",      OfflineBooking.countDocuments({ bookingStatus: "Cancelled" }),

        });      OfflineBooking.countDocuments({ paymentStatus: "Pending" }),

      }      OfflineBooking.countDocuments({ paymentStatus: "Partial" }),

    }      OfflineBooking.countDocuments({ paymentStatus: "Paid" }),

      OfflineBooking.aggregate([

    console.log("✅ Item details found:", itemDetails.name);        { $match: { paymentStatus: { $ne: "Cancelled" } } },

        { $group: { _id: null, total: { $sum: "$totalPaid" } } },

    // Create offline booking      ]),

    const newBooking = await Booking.create({      OfflineBooking.aggregate([

      name,        { $match: { paymentStatus: { $in: ["Pending", "Partial"] } } },

      email,        { $group: { _id: null, total: { $sum: "$balanceAmount" } } },

      mobile,      ]),

      bookingType,    ]);

      tourId: bookingType === "tour" ? tourId : undefined,

      trekId: bookingType === "trek" ? trekId : undefined,    res.status(200).json({

      numberOfMembers: 1, // Default to 1 for offline booking      success: true,

      adults: 1,      stats: {

      women: 0,        bookings: {

      children: 0,          total: totalBookings,

      infants: 0,          pending: pendingBookings,

      pickupCity: "Offline Booking", // Default value          confirmed: confirmedBookings,

      bookingDate,          completed: completedBookings,

      pricePerPerson: amountPaid,          cancelled: cancelledBookings,

      totalPrice: amountPaid,        },

      originalPrice: amountPaid,        payments: {

      discountAmount: 0,          pending: pendingPayments,

      bookingStatus: "confirmed", // Offline bookings are auto-confirmed          partial: partialPayments,

      paymentStatus: "completed", // Offline payment is already received          paid: paidBookings,

      paymentMethod: "offline",        },

      amountPaid: amountPaid,        revenue: {

      paidAt: new Date(),          totalCollected: totalRevenue[0]?.total || 0,

    });          totalPending: totalPending[0]?.total || 0,

        },

    console.log("✅ Offline booking created:", newBooking._id, "Reference:", newBooking.bookingReference);      },

    });

    // Send confirmation email  } catch (error) {

    let emailSent = false;    console.error("❌ Error fetching statistics:", error);

    try {    res.status(500).json({

      console.log("📧 Attempting to send confirmation email...");      success: false,

      await sendOfflineBookingConfirmationEmail(newBooking, itemDetails);      message: "Failed to fetch statistics",

      emailSent = true;      error: error.message,

      newBooking.emailSent = true;    });

      await newBooking.save();  }

      console.log("✅ Email sent successfully");};

    } catch (emailError) {

      console.error("⚠️ Email sending failed:", emailError.message);// Get payment history for a booking

      console.error("Email error details:", emailError);export const getPaymentHistory = async (req, res) => {

    }  try {

    const { id } = req.params;

    console.log("🎉 Offline booking process completed successfully");

    const booking = await OfflineBooking.findById(id).select("payments totalPaid balanceAmount paymentStatus");

    res.status(201).json({

      success: true,    if (!booking) {

      message: "Offline booking created successfully! Confirmation email sent to customer.",      return res.status(404).json({

      data: newBooking,        success: false,

      notifications: {        message: "Offline booking not found",

        email: emailSent,      });

      },    }

    });

  } catch (error) {    res.status(200).json({

    console.error("❌ Error creating offline booking:", error);      success: true,

    console.error("Error stack:", error.stack);      payments: booking.payments,

    res.status(500).json({      summary: {

      success: false,        totalPaid: booking.totalPaid,

      message: error.message || "Failed to create offline booking",        balanceAmount: booking.balanceAmount,

      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,        paymentStatus: booking.paymentStatus,

    });      },

  }    });

};  } catch (error) {

    console.error("❌ Error fetching payment history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const { refundAmount, refundReason, refundMethod } = req.body;

    const booking = await OfflineBooking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Offline booking not found",
      });
    }

    if (refundAmount > booking.totalPaid) {
      return res.status(400).json({
        success: false,
        message: "Refund amount cannot exceed total paid amount",
      });
    }

    booking.refundAmount = refundAmount;
    booking.refundDate = new Date();
    booking.paymentStatus = "Refunded";
    booking.bookingStatus = "Cancelled";
    booking.cancellationReason = refundReason;

    // Add refund as negative payment
    booking.payments.push({
      amount: -refundAmount,
      paymentDate: new Date(),
      paymentMethod: refundMethod || "Cash",
      notes: `Refund: ${refundReason}`,
    });

    booking.totalPaid -= refundAmount;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Refund processed successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Error processing refund:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process refund",
      error: error.message,
    });
  }
};
