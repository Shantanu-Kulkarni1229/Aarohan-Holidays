import Booking from "../models/booking.js";
import Tour from "../models/tours.js";
import Trek from "../models/treks.js";
import nodemailer from "nodemailer";
import axios from "axios";

// ✅ Configure Nodemailer (Gmail example)
// You'll need to set these in your .env file:
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASS=your-app-specific-password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ WhatsApp API Configuration (using WhatsApp Business API or third-party like Twilio)
// You'll need to set these in your .env file:
// WHATSAPP_API_URL=your-whatsapp-api-url
// WHATSAPP_API_TOKEN=your-api-token
// WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

// Function to send confirmation email
const sendBookingConfirmationEmail = async (bookingData, itemDetails) => {
  try {
    const logoUrl = "https://res.cloudinary.com/dvlsgka21/image/upload/v1761288219/Aarohan_Holidays_2_tdpfor.jpg"; // Update with your actual logo URL
    const bookingType = bookingData.bookingType === 'tour' ? 'Tour' : 'Trek';
    const mailOptions = {
      from: `Aarohan Holidays <${process.env.EMAIL_USER}>`,
      to: bookingData.email,
      subject: `🎉 Booking Confirmed - ${itemDetails.name} | Ref: ${bookingData.bookingReference}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation - Aarohan Holidays</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background-color: #f5f5f5;
            }
            .email-container { 
              max-width: 650px; 
              margin: 20px auto; 
              background: #ffffff; 
              border-radius: 12px; 
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header { 
              background: #28a745; 
              color: white; 
              padding: 40px 30px; 
              text-align: center;
            }
            .logo { 
              max-width: 180px; 
              height: auto; 
              margin-bottom: 20px;
              background: white;
              padding: 10px;
              border-radius: 8px;
            }
            .header h1 { 
              font-size: 28px; 
              margin: 15px 0 10px; 
              font-weight: 600;
            }
            .header p { 
              font-size: 16px; 
              opacity: 0.95;
              margin: 5px 0;
            }
            .success-badge {
              display: inline-block;
              background: #d4edda;
              color: #155724;
              padding: 8px 20px;
              border-radius: 20px;
              font-weight: 600;
              margin-top: 15px;
              font-size: 14px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .greeting { 
              font-size: 18px; 
              color: #333; 
              margin-bottom: 20px;
              font-weight: 500;
            }
            .intro-text {
              color: #555;
              margin-bottom: 25px;
              font-size: 15px;
              line-height: 1.8;
            }
            .booking-ref-box {
              background: #d4edda;
              border-left: 4px solid #28a745;
              padding: 20px;
              margin: 25px 0;
              border-radius: 6px;
            }
            .booking-ref-box .label {
              color: #155724;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .booking-ref-box .ref-number {
              color: #155724;
              font-size: 24px;
              font-weight: 700;
              margin-top: 8px;
              letter-spacing: 1px;
            }
            .info-card { 
              background: #f8f9fa; 
              border: 1px solid #e9ecef;
              border-radius: 8px; 
              padding: 25px; 
              margin: 25px 0;
            }
            .info-card h2 { 
              color: #28a745; 
              font-size: 20px; 
              margin-bottom: 20px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              padding: 12px 0; 
              border-bottom: 1px solid #e9ecef;
            }
            .info-row:last-child { 
              border-bottom: none; 
            }
            .info-label { 
              font-weight: 600; 
              color: #495057;
              font-size: 14px;
            }
            .info-value { 
              color: #212529;
              font-size: 14px;
              text-align: right;
            }
            .payment-summary {
              background: #fff3cd;
              border: 2px solid #ffc107;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .payment-summary h3 {
              color: #856404;
              font-size: 18px;
              margin-bottom: 15px;
              font-weight: 600;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              font-size: 15px;
            }
            .payment-total {
              border-top: 2px solid #856404;
              margin-top: 10px;
              padding-top: 15px;
              font-weight: 700;
              font-size: 18px;
              color: #856404;
            }
            .next-steps {
              background: #d1ecf1;
              border-left: 4px solid #17a2b8;
              padding: 20px;
              margin: 25px 0;
              border-radius: 6px;
            }
            .next-steps h3 {
              color: #0c5460;
              font-size: 18px;
              margin-bottom: 15px;
              font-weight: 600;
            }
            .next-steps ul {
              margin: 0;
              padding-left: 20px;
            }
            .next-steps li {
              color: #0c5460;
              margin: 10px 0;
              font-size: 14px;
              line-height: 1.6;
            }
            .important-note {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 20px;
              margin: 25px 0;
              border-radius: 6px;
            }
            .important-note strong {
              color: #856404;
              font-size: 16px;
            }
            .important-note p {
              color: #856404;
              margin-top: 10px;
              font-size: 14px;
              line-height: 1.6;
            }
            .contact-buttons {
              text-align: center;
              margin: 30px 0;
            }
            .btn {
              display: inline-block;
              padding: 14px 30px;
              margin: 8px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 14px;
              transition: all 0.3s;
            }
            .btn-primary {
              background: #28a745;
              color: white;
            }
            .btn-secondary {
              background: #17a2b8;
              color: white;
            }
            .btn-whatsapp {
              background: #25D366;
              color: white;
            }
            .footer { 
              background: #f8f9fa; 
              padding: 30px; 
              text-align: center; 
              border-top: 3px solid #28a745;
            }
            .footer-logo {
              max-width: 120px;
              margin-bottom: 15px;
            }
            .footer h3 {
              color: #28a745;
              font-size: 18px;
              margin-bottom: 15px;
              font-weight: 600;
            }
            .footer p { 
              color: #6c757d; 
              margin: 8px 0; 
              font-size: 14px;
            }
            .footer-links {
              margin: 20px 0;
            }
            .footer-links a {
              color: #28a745;
              text-decoration: none;
              margin: 0 10px;
              font-weight: 500;
            }
            .social-links {
              margin: 20px 0;
            }
            .social-links a {
              display: inline-block;
              margin: 0 8px;
              color: #495057;
              text-decoration: none;
              font-size: 14px;
            }
            .disclaimer {
              background: #e9ecef;
              padding: 15px;
              margin-top: 20px;
              border-radius: 6px;
              font-size: 12px;
              color: #6c757d;
              line-height: 1.6;
            }
            @media only screen and (max-width: 600px) {
              .email-container { margin: 10px; }
              .header, .content, .footer { padding: 20px 15px; }
              .header h1 { font-size: 24px; }
              .info-row { flex-direction: column; gap: 5px; }
              .info-value { text-align: left; }
              .btn { display: block; margin: 10px 0; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <img src="${logoUrl}" alt="Aarohan Holidays" class="logo" onerror="this.style.display='none'">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your ${bookingType} adventure awaits</p>
              <span class="success-badge">✓ Successfully Confirmed</span>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="greeting">Dear ${bookingData.name},</div>
              
              <p class="intro-text">
                Thank you for choosing <strong>Aarohan Holidays</strong>! We are thrilled to confirm your booking for 
                <strong>${itemDetails.name}</strong>. Your journey to creating unforgettable memories begins here!
              </p>

              <!-- Booking Reference -->
              <div class="booking-ref-box">
                <div class="label">📋 Your Booking Reference</div>
                <div class="ref-number">${bookingData.bookingReference}</div>
                <p style="margin-top: 10px; font-size: 13px; color: #155724;">
                  Please save this reference number for all future correspondence.
                </p>
              </div>

              <!-- Booking Details -->
              <div class="info-card">
                <h2>📝 ${bookingType} Details</h2>
                <div class="info-row">
                  <span class="info-label">${bookingType} Name:</span>
                  <span class="info-value">${itemDetails.name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Location:</span>
                  <span class="info-value">${itemDetails.location}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Duration:</span>
                  <span class="info-value">${itemDetails.duration}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Travel Date:</span>
                  <span class="info-value">${new Date(bookingData.bookingDate).toLocaleDateString('en-IN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Pickup City:</span>
                  <span class="info-value">${bookingData.pickupCity}</span>
                </div>
                ${bookingData.pickupPoint ? `
                <div class="info-row">
                  <span class="info-label">Pickup Point:</span>
                  <span class="info-value">${bookingData.pickupPoint}</span>
                </div>
                ` : ''}
                ${bookingData.selectedCategory ? `
                <div class="info-row">
                  <span class="info-label">Category:</span>
                  <span class="info-value">${bookingData.selectedCategory}</span>
                </div>
                ` : ''}
              </div>

              <!-- Add-Ons Selected -->
              ${bookingData.selectedAddOns && bookingData.selectedAddOns.length > 0 ? `
              <div class="info-card">
                <h2>🎁 Selected Add-Ons</h2>
                ${bookingData.selectedAddOns.map(addon => `
                <div class="info-row">
                  <span class="info-label">${addon.name}:</span>
                  <span class="info-value">₹${addon.price.toLocaleString('en-IN')}</span>
                </div>
                `).join('')}
              </div>
              ` : ''}

              <!-- Itinerary Summary -->
              ${itemDetails.itinerary && itemDetails.itinerary.length > 0 ? `
              <div class="info-card">
                <h2>📍 Itinerary Overview</h2>
                ${itemDetails.itinerary.slice(0, 3).map((day, index) => `
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e9ecef;">
                  <div style="font-weight: 600; color: #28a745; margin-bottom: 5px;">Day ${index + 1}: ${day.title || `Day ${index + 1}`}</div>
                  <div style="font-size: 13px; color: #666;">${day.description ? day.description.substring(0, 150) + '...' : 'Details will be shared soon'}</div>
                </div>
                `).join('')}
                ${itemDetails.itinerary.length > 3 ? `
                <p style="margin-top: 10px; font-size: 13px; color: #666;">
                  ...and ${itemDetails.itinerary.length - 3} more days. Complete itinerary will be shared 3 days before departure.
                </p>
                ` : ''}
              </div>
              ` : ''}

              <!-- Traveler Information -->
              <div class="info-card">
                <h2>👥 Traveler Information</h2>
                <div class="info-row">
                  <span class="info-label">Lead Traveler:</span>
                  <span class="info-value">${bookingData.name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${bookingData.email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Mobile:</span>
                  <span class="info-value">${bookingData.mobile}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Total Members:</span>
                  <span class="info-value">${bookingData.numberOfMembers}</span>
                </div>
                ${bookingData.adults > 0 ? `
                <div class="info-row">
                  <span class="info-label">Adults:</span>
                  <span class="info-value">${bookingData.adults}</span>
                </div>
                ` : ''}
                ${bookingData.women > 0 ? `
                <div class="info-row">
                  <span class="info-label">Women:</span>
                  <span class="info-value">${bookingData.women}</span>
                </div>
                ` : ''}
                ${bookingData.children > 0 ? `
                <div class="info-row">
                  <span class="info-label">Children (5-18 years):</span>
                  <span class="info-value">${bookingData.children}</span>
                </div>
                ` : ''}
                ${bookingData.infants > 0 ? `
                <div class="info-row">
                  <span class="info-label">Infants (Below 5 years):</span>
                  <span class="info-value">${bookingData.infants}</span>
                </div>
                ` : ''}
                ${bookingData.specialRequests ? `
                <div class="info-row">
                  <span class="info-label">Special Requests:</span>
                  <span class="info-value">${bookingData.specialRequests}</span>
                </div>
                ` : ''}
              </div>

              <!-- Payment Summary -->
              <div class="payment-summary">
                <h3>💳 Payment Summary</h3>
                ${bookingData.originalPrice && bookingData.originalPrice !== bookingData.totalPrice ? `
                <div class="payment-row">
                  <span>Original Amount:</span>
                  <span>₹${bookingData.originalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div class="payment-row" style="color: #28a745;">
                  <span>Discount ${bookingData.couponCode ? `(${bookingData.couponCode})` : ''}:</span>
                  <span>-₹${(bookingData.originalPrice - bookingData.totalPrice).toLocaleString('en-IN')}</span>
                </div>
                ` : ''}
                <div class="payment-row payment-total">
                  <span>Total Amount Paid:</span>
                  <span>₹${bookingData.amountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div class="payment-row">
                  <span>Payment Method:</span>
                  <span>Razorpay</span>
                </div>
                <div class="payment-row">
                  <span>Transaction ID:</span>
                  <span style="font-size: 12px;">${bookingData.razorpayPaymentId}</span>
                </div>
                <div class="payment-row">
                  <span>Payment Status:</span>
                  <span style="color: #28a745; font-weight: 600;">✓ Completed</span>
                </div>
              </div>

              <!-- Next Steps -->
              <div class="next-steps">
                <h3>📌 What Happens Next?</h3>
                <ul>
                  <li><strong>Confirmation Call:</strong> Our team will contact you within 24 hours to confirm all details</li>
                  <li><strong>Travel Information:</strong> You'll receive detailed itinerary and travel guidelines 3 days before departure</li>
                  <li><strong>Documents Required:</strong> Please keep your ID proofs and medical certificates ready</li>
                  <li><strong>Preparation Guide:</strong> A comprehensive packing list and preparation guide will be shared soon</li>
                  <li><strong>24/7 Support:</strong> Our team is available round the clock for any assistance</li>
                </ul>
              </div>

              <!-- Important Note -->
              <div class="important-note">
                <strong>⚠️ Important Information</strong>
                <p>
                  • Please carry valid photo ID proof and medical fitness certificate<br>
                  • Arrive at the pickup point 15 minutes before scheduled time<br>
                  • Read our cancellation policy on our website<br>
                  • Weather conditions may cause itinerary changes<br>
                  • Travel insurance is highly recommended
                </p>
              </div>

              <!-- Contact Buttons -->
              <div class="contact-buttons">
                <a href="tel:+917276644221" class="btn btn-primary">📞 Call Us: +91 7276644221</a>
                <a href="https://wa.me/917276644221" class="btn btn-whatsapp">💬 WhatsApp Support</a>
                <a href="mailto:infoaarohanholidays@gmail.com" class="btn btn-secondary">📧 Email Us</a>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <img src="${logoUrl}" alt="Aarohan Holidays" class="footer-logo" onerror="this.style.display='none'">
              <h3>Aarohan Holidays</h3>
              <p><strong>Feel Free to Fly...</strong></p>
              
              <div style="margin: 20px 0;">
                <p>📧 Email: infoaarohanholidays@gmail.com</p>
                <p>📱 Phone: +91 7276644221</p>
                <p>💬 WhatsApp: +91 7276644221</p>
              </div>

              <div class="footer-links">
                <a href="#">Website</a> | 
                <a href="#">Terms & Conditions</a> | 
                <a href="#">Privacy Policy</a>
              </div>

              <div class="social-links">
                <p>Follow us on:</p>
                <a href="#">Facebook</a> | 
                <a href="#">Instagram</a> | 
                <a href="#">Twitter</a> | 
                <a href="#">YouTube</a>
              </div>

              <div class="disclaimer">
                <strong>Disclaimer:</strong> This is an automated confirmation email. Please do not reply directly to this email. 
                For any queries, please contact us through the provided phone numbers or email address. 
                All bookings are subject to our terms and conditions available on our website.
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
    console.error("❌ Error sending email:", error);
    throw error;
  }
};

// Function to send WhatsApp message
const sendWhatsAppMessage = async (bookingData, itemDetails) => {
  try {
    // Option 1: Using WhatsApp Business API (Meta)
    if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
      const message = `🎉 *Booking Confirmed!*

Dear ${bookingData.name},

Your booking with *Aarohan Holidays* has been confirmed!

📋 *Booking Reference:* ${bookingData.bookingReference}

📍 *${bookingData.bookingType === 'tour' ? 'Tour' : 'Trek'} Details:*
${bookingData.bookingType === 'tour' ? '🏖️' : '⛰️'} Name: ${itemDetails.name}
📍 Location: ${itemDetails.location}
⏱️ Duration: ${itemDetails.duration}
📅 Date: ${new Date(bookingData.bookingDate).toLocaleDateString('en-IN')}

👥 *Group Details:*
Total Members: ${bookingData.numberOfMembers}
Adults: ${bookingData.adults} | Women: ${bookingData.women} | Infants: ${bookingData.infants}
🚗 Pickup: ${bookingData.pickupCity}

💰 *Payment:*
Per Person: ₹${bookingData.pricePerPerson.toLocaleString('en-IN')}
*Total: ₹${bookingData.totalPrice.toLocaleString('en-IN')}*

⚠️ *Important:*
• Carry valid ID proof
• Reach 15 mins before departure
• Contact us for any changes

Need help? Reply to this message!

Thank you for choosing Aarohan Holidays! 🌟`;

      const response = await axios.post(
        `${process.env.WHATSAPP_API_URL}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: `91${bookingData.mobile}`, // Assuming Indian numbers
          type: "text",
          text: {
            body: message,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ WhatsApp message sent successfully:", response.data);
      return true;
    } else {
      console.warn("⚠️ WhatsApp API credentials not configured. Skipping WhatsApp notification.");
      return false;
    }
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error.response?.data || error.message);
    // Don't throw error - we don't want to fail the booking if WhatsApp fails
    return false;
  }
};

// Function to send admin notification email
const sendAdminNotification = async (bookingData, itemDetails) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    const mailOptions = {
      from: `Aarohan-holidays Bookings <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: `🔔 New Booking: ${bookingData.bookingReference} - ${bookingData.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #ef4444; }
            .detail-value { color: #555; }
            .payment-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 New Booking Received!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Action Required</p>
            </div>
            
            <div class="content">
              <div class="booking-details">
                <h2 style="color: #ef4444; margin-top: 0;">Booking Reference: ${bookingData.bookingReference}</h2>
                
                <div class="detail-row">
                  <span class="detail-label">Booking Status:</span>
                  <span class="detail-value" style="font-weight: bold; color: #10b981;">${bookingData.bookingStatus.toUpperCase()}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Payment Status:</span>
                  <span class="payment-badge">${bookingData.paymentStatus === 'completed' ? '✅ PAID' : '⏳ PENDING'}</span>
                </div>
              </div>

              <div class="booking-details">
                <h3 style="color: #ef4444; margin-top: 0;">Customer Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${bookingData.name}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${bookingData.email}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Mobile:</span>
                  <span class="detail-value">${bookingData.mobile}</span>
                </div>
              </div>

              <div class="booking-details">
                <h3 style="color: #ef4444; margin-top: 0;">${bookingData.bookingType === 'tour' ? '🏖️ Tour' : '⛰️ Trek'} Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${itemDetails.name}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">${itemDetails.location}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">${itemDetails.duration}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Travel Date:</span>
                  <span class="detail-value">${new Date(bookingData.bookingDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>

              <div class="booking-details">
                <h3 style="color: #ef4444; margin-top: 0;">👥 Group Information</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Total Members:</span>
                  <span class="detail-value">${bookingData.numberOfMembers}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Adults:</span>
                  <span class="detail-value">${bookingData.adults}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Women:</span>
                  <span class="detail-value">${bookingData.women}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Infants:</span>
                  <span class="detail-value">${bookingData.infants}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Pickup City:</span>
                  <span class="detail-value">${bookingData.pickupCity}</span>
                </div>
                
                ${bookingData.pickupPoint ? `
                <div class="detail-row">
                  <span class="detail-label">Pickup Point:</span>
                  <span class="detail-value">${bookingData.pickupPoint}</span>
                </div>
                ` : ''}
                
                ${bookingData.selectedCategory ? `
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${bookingData.selectedCategory}</span>
                </div>
                ` : ''}
              </div>

              ${bookingData.selectedAddOns && bookingData.selectedAddOns.length > 0 ? `
              <div class="booking-details">
                <h3 style="color: #ef4444; margin-top: 0;">🎁 Selected Add-Ons</h3>
                ${bookingData.selectedAddOns.map(addon => `
                <div class="detail-row">
                  <span class="detail-label">${addon.name}:</span>
                  <span class="detail-value">₹${addon.price.toLocaleString('en-IN')}</span>
                </div>
                `).join('')}
              </div>
              ` : ''}

              <div class="booking-details">
                <h3 style="color: #ef4444; margin-top: 0;">💰 Payment Details</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Price Per Person:</span>
                  <span class="detail-value">₹${bookingData.pricePerPerson.toLocaleString('en-IN')}</span>
                </div>
                
                <div class="detail-row" style="border-bottom: none; font-size: 18px; font-weight: bold;">
                  <span class="detail-label" style="color: #10b981;">Total Amount:</span>
                  <span class="detail-value" style="color: #10b981;">₹${bookingData.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              ${bookingData.paymentStatus === 'completed' ? `
              <div class="booking-details">
                <h3 style="color: #10b981; margin-top: 0;">✅ Payment Confirmation</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Amount Paid:</span>
                  <span class="detail-value" style="color: #10b981; font-weight: bold;">₹${bookingData.amountPaid.toLocaleString('en-IN')}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Payment Method:</span>
                  <span class="detail-value">${bookingData.paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : bookingData.paymentMethod}</span>
                </div>
                
                ${bookingData.transactionId ? `
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">${bookingData.transactionId}</span>
                </div>
                ` : ''}
                
                ${bookingData.paidAt ? `
                <div class="detail-row">
                  <span class="detail-label">Payment Date:</span>
                  <span class="detail-value">${new Date(bookingData.paidAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                ` : ''}
              </div>
              ` : ''}
              
              ${bookingData.specialRequests ? `
              <div class="booking-details">
                <h3 style="color: #ef4444; margin-top: 0;">📝 Special Requests</h3>
                <p style="margin: 0; color: #555;">${bookingData.specialRequests}</p>
              </div>
              ` : ''}

              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ Action Required:</p>
                <ul style="margin: 10px 0 0 0; color: #92400e;">
                  <li>Verify booking details in admin panel</li>
                  <li>Contact customer if any clarifications needed</li>
                  <li>Prepare tour/trek arrangements</li>
                  ${bookingData.paymentStatus !== 'completed' ? '<li style="color: #ef4444; font-weight: bold;">Follow up on pending payment</li>' : ''}
                </ul>
              </div>

              <div class="footer" style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ef4444; color: #777;">
                <p style="margin: 0;">
                  <strong>Aarohan-holidays Admin Panel</strong><br>
                  Log in to view full details and manage this booking
                </p>
                <p style="margin: 10px 0 0 0; font-size: 12px;">
                  Booking created at: ${new Date(bookingData.createdAt).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Admin notification email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Error sending admin notification:", error);
    throw error;
  }
};

// Offline Booking Confirmation Email Template
const sendOfflineBookingConfirmationEmail = async (bookingData, itemDetails) => {
  try {
    const logoUrl = "https://res.cloudinary.com/dvlsgka21/image/upload/v1761288219/Aarohan_Holidays_2_tdpfor.jpg";
    const bookingType = bookingData.bookingType === 'tour' ? 'Tour' : 'Trek';
    
    const mailOptions = {
      from: `Aarohan Holidays <${process.env.EMAIL_USER}>`,
      to: bookingData.email,
      subject: `✅ Booking Confirmed - ${itemDetails.name} | Ref: ${bookingData.bookingReference}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-ref { background: #d4edda; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .offline-badge { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; color: #856404; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Booking Confirmed!</h1>
              <p>Your ${bookingType} adventure awaits</p>
            </div>
            <div class="content">
              <p>Dear <strong>${bookingData.name}</strong>,</p>
              <p>Thank you for choosing Aarohan Holidays! Your booking has been confirmed.</p>
              
              <div class="booking-ref">
                <strong>📋 Booking Reference:</strong>
                <h2 style="margin: 10px 0; color: #155724;">${bookingData.bookingReference}</h2>
              </div>

              <div class="offline-badge">
                <strong>💼 Offline Booking</strong>
                <p style="margin: 5px 0 0 0;">This booking was processed offline by our team. Your payment has been received and verified.</p>
              </div>

              <div class="info-box">
                <h3 style="color: #28a745;">📝 ${bookingType} Details</h3>
                <div class="info-row">
                  <span><strong>${bookingType} Name:</strong></span>
                  <span>${itemDetails.name}</span>
                </div>
                <div class="info-row">
                  <span><strong>Location:</strong></span>
                  <span>${itemDetails.location}</span>
                </div>
                <div class="info-row">
                  <span><strong>Travel Date:</strong></span>
                  <span>${new Date(bookingData.bookingDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              <div class="info-box">
                <h3 style="color: #28a745;">👤 Contact Information</h3>
                <div class="info-row">
                  <span><strong>Name:</strong></span>
                  <span>${bookingData.name}</span>
                </div>
                <div class="info-row">
                  <span><strong>Email:</strong></span>
                  <span>${bookingData.email}</span>
                </div>
                <div class="info-row" style="border-bottom: none;">
                  <span><strong>Mobile:</strong></span>
                  <span>${bookingData.mobile}</span>
                </div>
              </div>

              <div class="info-box" style="background: #d1ecf1; border: 2px solid #17a2b8;">
                <h3 style="color: #0c5460;">💰 Payment Summary</h3>
                <div class="info-row" style="border-top: 2px solid #0c5460; padding-top: 15px; margin-top: 10px; font-size: 18px; font-weight: bold;">
                  <span>Total Amount Paid:</span>
                  <span style="color: #0c5460;">₹${bookingData.amountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div style="margin-top: 10px; text-align: center;">
                  <p style="margin: 0;">Payment Method: <strong>Offline Payment</strong></p>
                  <p style="margin: 5px 0 0 0; color: #28a745;"><strong>✓ Payment Completed</strong></p>
                </div>
              </div>

              <div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0;">
                <strong>📌 What's Next?</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Our team will contact you within 24 hours</li>
                  <li>You'll receive detailed itinerary 3 days before departure</li>
                  <li>Keep your ID proofs ready</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="tel:+917276644221" style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 5px;">📞 Call Us</a>
                <a href="https://wa.me/917276644221" style="display: inline-block; background: #25D366; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 5px;">💬 WhatsApp</a>
              </div>

              <div style="text-align: center; padding: 20px; border-top: 2px solid #28a745; margin-top: 20px;">
                <h3 style="color: #28a745;">Aarohan Holidays</h3>
                <p>📧 Email: infoaarohanholidays@gmail.com</p>
                <p>📱 Phone: +91 7276644221</p>
                <p style="font-size: 12px; color: #777; margin-top: 15px;">Feel Free to Fly...</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Offline booking confirmation email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error sending offline booking email:", error);
    throw error;
  }
};

// Export email functions for use in payment controller
export { sendBookingConfirmationEmail, sendAdminNotification };

// ====================================
// 🟢 CREATE BOOKING
// ====================================
export const createBooking = async (req, res) => {
  try {
    console.log("📝 Received booking request:", req.body);
    
    const {
      name,
      email,
      mobile,
      bookingType,
      tourId,
      trekId,
      numberOfMembers,
      adults,
      infants,
      women,
      pickupCity,
      bookingDate,
      pricePerPerson,
      specialRequests,
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !bookingType || !numberOfMembers || !pickupCity || !bookingDate || !pricePerPerson) {
      console.log("❌ Validation failed - missing required fields");
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Validate booking type and corresponding ID
    if (bookingType === "tour" && !tourId) {
      console.log("❌ Tour ID missing for tour booking");
      return res.status(400).json({
        success: false,
        message: "Tour ID is required for tour bookings",
      });
    }

    if (bookingType === "trek" && !trekId) {
      console.log("❌ Trek ID missing for trek booking");
      return res.status(400).json({
        success: false,
        message: "Trek ID is required for trek bookings",
      });
    }

    // Fetch tour or trek details
    let itemDetails;
    if (bookingType === "tour") {
      console.log("🔍 Fetching tour details for ID:", tourId);
      itemDetails = await Tour.findById(tourId);
      if (!itemDetails) {
        console.log("❌ Tour not found:", tourId);
        return res.status(404).json({
          success: false,
          message: "Tour not found",
        });
      }
    } else {
      console.log("🔍 Fetching trek details for ID:", trekId);
      itemDetails = await Trek.findById(trekId);
      if (!itemDetails) {
        console.log("❌ Trek not found:", trekId);
        return res.status(404).json({
          success: false,
          message: "Trek not found",
        });
      }
    }

    console.log("✅ Item details found:", itemDetails.name);

    // Calculate total price
    const totalPrice = pricePerPerson * numberOfMembers;

    console.log("💰 Calculated total price:", totalPrice);

    // Create booking
    const newBooking = await Booking.create({
      name,
      email,
      mobile,
      bookingType,
      tourId: bookingType === "tour" ? tourId : undefined,
      trekId: bookingType === "trek" ? trekId : undefined,
      numberOfMembers,
      adults: adults || 0,
      infants: infants || 0,
      women: women || 0,
      pickupCity,
      bookingDate,
      pricePerPerson,
      totalPrice,
      specialRequests: specialRequests || "",
      bookingStatus: "confirmed",
    });

    console.log("✅ Booking created:", newBooking._id, "Reference:", newBooking.bookingReference);

    // Send confirmation email
    let emailSent = false;
    try {
      console.log("📧 Attempting to send confirmation email...");
      await sendBookingConfirmationEmail(newBooking, itemDetails);
      emailSent = true;
      newBooking.emailSent = true;
      await newBooking.save();
      console.log("✅ Email sent successfully");
    } catch (emailError) {
      console.error("⚠️ Email sending failed:", emailError.message);
      console.error("Email error details:", emailError);
    }

    // Send admin notification email
    let adminEmailSent = false;
    try {
      console.log("📧 Attempting to send admin notification email...");
      await sendAdminNotification(newBooking, itemDetails);
      adminEmailSent = true;
      console.log("✅ Admin email sent successfully");
    } catch (adminEmailError) {
      console.error("⚠️ Admin email sending failed:", adminEmailError.message);
      console.error("Admin email error details:", adminEmailError);
    }

    // Send WhatsApp message
    let whatsappSent = false;
    try {
      console.log("📱 Attempting to send WhatsApp message...");
      whatsappSent = await sendWhatsAppMessage(newBooking, itemDetails);
      if (whatsappSent) {
        newBooking.whatsappSent = true;
        await newBooking.save();
        console.log("✅ WhatsApp sent successfully");
      }
    } catch (whatsappError) {
      console.error("⚠️ WhatsApp sending failed:", whatsappError.message);
    }

    // Update tour/trek total bookings
    if (bookingType === "tour") {
      await Tour.findByIdAndUpdate(tourId, {
        $inc: { totalBookings: numberOfMembers },
      });
      console.log("✅ Updated tour bookings count");
    } else {
      await Trek.findByIdAndUpdate(trekId, {
        $inc: { totalBookings: numberOfMembers },
      });
      console.log("✅ Updated trek bookings count");
    }

    console.log("🎉 Booking process completed successfully");

    res.status(201).json({
      success: true,
      message: "Booking created successfully!",
      data: newBooking,
      notifications: {
        email: emailSent,
        adminEmail: adminEmailSent,
        whatsapp: whatsappSent,
      },
    });
  } catch (error) {
    console.error("❌ Error creating booking:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking",
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// ====================================
// 🟢 GET ALL BOOKINGS (ADMIN)
// ====================================
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("tourId", "name location duration thumbnail cityPricing")
      .populate("trekId", "name location duration thumbnail cityPricing")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};

// ====================================
// 🟢 GET BOOKINGS BY TOUR ID (ADMIN)
// ====================================
export const getBookingsByTourId = async (req, res) => {
  try {
    const { tourId } = req.params;

    const bookings = await Booking.find({ tourId, bookingType: "tour" })
      .populate("tourId", "name location duration thumbnail")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching tour bookings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tour bookings",
    });
  }
};

// ====================================
// 🟢 GET BOOKINGS BY TREK ID (ADMIN)
// ====================================
export const getBookingsByTrekId = async (req, res) => {
  try {
    const { trekId } = req.params;

    const bookings = await Booking.find({ trekId, bookingType: "trek" })
      .populate("trekId", "name location duration thumbnail")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("❌ Error fetching trek bookings:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch trek bookings",
    });
  }
};

// ====================================
// 🟢 GET BOOKING BY ID
// ====================================
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("tourId")
      .populate("trekId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch booking",
    });
  }
};

// ====================================
// 🟢 UPDATE BOOKING STATUS (ADMIN)
// ====================================
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    const validStatuses = ["pending", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    // First, get the booking to check current status
    const existingBooking = await Booking.findById(id)
      .populate("tourId")
      .populate("trekId");

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Track if status changed to confirmed
    const wasNotConfirmed = existingBooking.bookingStatus !== "confirmed";
    const nowConfirmed = bookingStatus === "confirmed";

    // Update the booking
    const booking = await Booking.findByIdAndUpdate(
      id,
      { bookingStatus },
      { new: true }
    ).populate("tourId").populate("trekId");

    // 🎯 If status changed to "confirmed", send confirmation emails/WhatsApp
    if (wasNotConfirmed && nowConfirmed) {
      const itemDetails = booking.bookingType === "tour" ? booking.tourId : booking.trekId;
      
      if (itemDetails) {
        console.log(`✅ Booking ${booking.bookingReference} confirmed! Sending notifications...`);
        
        // Send email confirmation
        try {
          await sendBookingConfirmationEmail(booking, itemDetails);
          booking.emailSent = true;
          await booking.save();
          console.log(`✅ Email sent to ${booking.email}`);
        } catch (emailError) {
          console.error("❌ Failed to send confirmation email:", emailError.message);
        }

        // Send WhatsApp message
        try {
          await sendWhatsAppMessage(booking, itemDetails);
          booking.whatsappSent = true;
          await booking.save();
          console.log(`✅ WhatsApp message sent to ${booking.mobile}`);
        } catch (whatsappError) {
          console.error("❌ Failed to send WhatsApp message:", whatsappError.message);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: nowConfirmed 
        ? "Booking confirmed! Confirmation email and WhatsApp message sent to customer."
        : "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update booking status",
    });
  }
};

// ====================================
// 🟢 UPDATE PAYMENT STATUS (ADMIN)
// ====================================
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, amountPaid } = req.body;

    const validPaymentStatuses = ["pending", "partial", "completed", "refunded"];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Update payment status
    booking.paymentStatus = paymentStatus;
    
    // Update amount paid if provided
    if (amountPaid !== undefined) {
      booking.amountPaid = amountPaid;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: `Payment status updated to ${paymentStatus}`,
      data: booking,
    });
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update payment status",
    });
  }
};

// ====================================
// 🟢 DELETE BOOKING (ADMIN)
// ====================================
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete booking",
    });
  }
};

// ====================================
// 🟢 RESEND CONFIRMATION (ADMIN)
// ====================================
export const resendConfirmation = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("tourId")
      .populate("trekId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const itemDetails = booking.bookingType === "tour" ? booking.tourId : booking.trekId;

    // Resend email
    let emailSent = false;
    try {
      await sendBookingConfirmationEmail(booking, itemDetails);
      emailSent = true;
    } catch (emailError) {
      console.error("⚠️ Email resend failed:", emailError.message);
    }

    // Resend WhatsApp
    let whatsappSent = false;
    try {
      whatsappSent = await sendWhatsAppMessage(booking, itemDetails);
    } catch (whatsappError) {
      console.error("⚠️ WhatsApp resend failed:", whatsappError.message);
    }

    res.status(200).json({
      success: true,
      message: "Confirmation resent",
      notifications: {
        email: emailSent,
        whatsapp: whatsappSent,
      },
    });
  } catch (error) {
    console.error("❌ Error resending confirmation:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to resend confirmation",
    });
  }
};

// ====================================
// 🟢 CREATE OFFLINE BOOKING (ADMIN ONLY)
// ====================================
export const createOfflineBooking = async (req, res) => {
  try {
    console.log("📝 Received offline booking request:", req.body);
    
    const {
      name,
      email,
      mobile,
      bookingType,
      tourId,
      trekId,
      bookingDate,
      amountPaid,
    } = req.body;

    // Validate required fields
    if (!name || !email || !mobile || !bookingType || !bookingDate || !amountPaid) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: name, email, mobile, bookingType, bookingDate, and amountPaid",
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

    // Create offline booking
    const newBooking = await Booking.create({
      name,
      email,
      mobile,
      bookingType,
      tourId: bookingType === "tour" ? tourId : undefined,
      trekId: bookingType === "trek" ? trekId : undefined,
      numberOfMembers: 1,
      adults: 1,
      women: 0,
      children: 0,
      infants: 0,
      pickupCity: "Offline Booking",
      bookingDate,
      pricePerPerson: amountPaid,
      totalPrice: amountPaid,
      originalPrice: amountPaid,
      discountAmount: 0,
      bookingStatus: "confirmed",
      paymentStatus: "completed",
      paymentMethod: "offline",
      amountPaid: amountPaid,
      paidAt: new Date(),
    });

    console.log("✅ Offline booking created:", newBooking.bookingReference);

    // Send confirmation email
    let emailSent = false;
    try {
      await sendOfflineBookingConfirmationEmail(newBooking, itemDetails);
      emailSent = true;
      newBooking.emailSent = true;
      await newBooking.save();
    } catch (emailError) {
      console.error("⚠️ Email sending failed:", emailError.message);
    }

    res.status(201).json({
      success: true,
      message: "Offline booking created successfully! Confirmation email sent to customer.",
      data: newBooking,
      notifications: {
        email: emailSent,
      },
    });
  } catch (error) {
    console.error("❌ Error creating offline booking:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create offline booking",
    });
  }
};

