import nodemailer from 'nodemailer';
import { customBookingEmailTemplate } from './customBookingEmailTemplate.js';

// Create transporter with Render-compatible settings
const createTransporter = () => {
  // Explicit SMTP settings for better compatibility with Render
  return nodemailer.createTransport({
    host: 'smtp.gmail.com', // Use explicit host instead of service
    port: 587, // Use port 587 (TLS) - Render blocks port 25
    secure: false, // false for port 587, true for port 465
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS // Your Gmail app password (NOT regular password)
    },
    tls: {
      rejectUnauthorized: true, // Enable TLS
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000, // 10 seconds timeout
    greetingTimeout: 10000, // 10 seconds timeout
    socketTimeout: 20000, // 20 seconds socket timeout
    pool: true, // Use connection pooling for better performance
    maxConnections: 5, // Max 5 concurrent connections
    maxMessages: 100, // Max messages per connection
    rateLimit: 10, // Max 10 messages per second
  });
};

// User confirmation email template
const userConfirmationTemplate = (enquiry) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a365d 0%, #2d3748 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #d4af37; border-radius: 5px; }
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .info-label { font-weight: bold; width: 150px; color: #1a365d; }
        .info-value { flex: 1; color: #2d3748; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background: #d4af37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .highlight { color: #d4af37; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Thank You for Your Enquiry!</h1>
          <p>Aarohan Holidays</p>
        </div>
        <div class="content">
          <p>Dear <strong>${enquiry.name}</strong>,</p>
          
          <p>Thank you for reaching out to <strong>Aarohan Holidays</strong>! We have received your enquiry and our team will get back to you shortly.</p>
          
          <div class="info-box">
            <h3 style="color: #1a365d; margin-top: 0;">📋 Enquiry Details</h3>
            <div class="info-row">
              <span class="info-label">Reference Number:</span>
              <span class="info-value highlight">${enquiry.referenceNumber}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Service Type:</span>
              <span class="info-value">${enquiry.serviceType}</span>
            </div>
            ${enquiry.destination ? `
            <div class="info-row">
              <span class="info-label">Destination:</span>
              <span class="info-value">${enquiry.destination}</span>
            </div>
            ` : ''}
            ${enquiry.numberOfPeople ? `
            <div class="info-row">
              <span class="info-label">Number of People:</span>
              <span class="info-value">${enquiry.numberOfPeople}</span>
            </div>
            ` : ''}
            ${enquiry.startDate ? `
            <div class="info-row">
              <span class="info-label">Start Date:</span>
              <span class="info-value">${new Date(enquiry.startDate).toLocaleDateString('en-IN')}</span>
            </div>
            ` : ''}
            ${enquiry.budget ? `
            <div class="info-row">
              <span class="info-label">Budget:</span>
              <span class="info-value">${enquiry.budget}</span>
            </div>
            ` : ''}
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Your Message:</span>
              <span class="info-value">${enquiry.message}</span>
            </div>
          </div>
          
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our travel expert will review your requirements</li>
            <li>We'll contact you within 24 hours</li>
            <li>You'll receive a customized quote based on your needs</li>
          </ul>
          
          <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
            <strong>📌 Important:</strong> Please save your reference number <span class="highlight">${enquiry.referenceNumber}</span> for future communication.
          </p>
          
          <div style="text-align: center;">
            <a href="tel:+918482813688" class="button">📞 Call Us: +91 8482813688</a>
            <a href="https://wa.me/918482813688" class="button" style="background: #25D366;">💬 WhatsApp</a>
          </div>
        </div>
        <div class="footer">
          <p><strong>Aarohan Holidays</strong></p>
          <p>📧 Email: info@ravitours.com | 📞 Phone: +91 8482813688</p>
          <p>🌐 Website: www.ravitours.com</p>
          <p style="font-size: 12px; color: #94a3b8;">This is an automated confirmation email. Please do not reply directly to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Admin notification email template
const adminNotificationTemplate = (enquiry) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fee2e2; border: 2px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .info-label { font-weight: bold; width: 180px; color: #1a365d; }
        .info-value { flex: 1; color: #2d3748; }
        .priority-high { background: #fee2e2; color: #dc2626; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
        .priority-medium { background: #fef3c7; color: #d97706; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
        .button { display: inline-block; background: #1a365d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 5px; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚨 New Enquiry Received!</h1>
          <p>Immediate Action Required</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <h3 style="margin-top: 0; color: #dc2626;">⚡ Priority: ${enquiry.priority}</h3>
            <p style="margin: 0;"><strong>Reference:</strong> ${enquiry.referenceNumber}</p>
            <p style="margin: 5px 0 0 0;"><strong>Received:</strong> ${new Date(enquiry.createdAt).toLocaleString('en-IN')}</p>
          </div>
          
          <div class="info-box">
            <h3 style="color: #1a365d; margin-top: 0;">👤 Customer Information</h3>
            <div class="info-row">
              <span class="info-label">Name:</span>
              <span class="info-value"><strong>${enquiry.name}</strong></span>
            </div>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value"><a href="mailto:${enquiry.email}">${enquiry.email}</a></span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value"><a href="tel:+91${enquiry.phone}">+91 ${enquiry.phone}</a></span>
            </div>
          </div>
          
          <div class="info-box">
            <h3 style="color: #1a365d; margin-top: 0;">📋 Enquiry Details</h3>
            <div class="info-row">
              <span class="info-label">Service Type:</span>
              <span class="info-value"><strong>${enquiry.serviceType}</strong></span>
            </div>
            ${enquiry.destination ? `
            <div class="info-row">
              <span class="info-label">Destination:</span>
              <span class="info-value">${enquiry.destination}</span>
            </div>
            ` : ''}
            ${enquiry.numberOfPeople ? `
            <div class="info-row">
              <span class="info-label">Number of People:</span>
              <span class="info-value">${enquiry.numberOfPeople}</span>
            </div>
            ` : ''}
            ${enquiry.startDate ? `
            <div class="info-row">
              <span class="info-label">Start Date:</span>
              <span class="info-value">${new Date(enquiry.startDate).toLocaleDateString('en-IN')}</span>
            </div>
            ` : ''}
            ${enquiry.endDate ? `
            <div class="info-row">
              <span class="info-label">End Date:</span>
              <span class="info-value">${new Date(enquiry.endDate).toLocaleDateString('en-IN')}</span>
            </div>
            ` : ''}
            ${enquiry.budget ? `
            <div class="info-row">
              <span class="info-label">Budget:</span>
              <span class="info-value">${enquiry.budget}</span>
            </div>
            ` : ''}
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Message:</span>
              <span class="info-value">${enquiry.message}</span>
            </div>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 5px; border-left: 4px solid #2563eb;">
            <strong>📊 System Info:</strong><br>
            Source: ${enquiry.source}<br>
            IP Address: ${enquiry.ipAddress || 'N/A'}<br>
            Status: ${enquiry.status}
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.ADMIN_URL || 'http://localhost:5173'}/admin/enquiries/${enquiry._id}" class="button">
              👁️ View in Admin Panel
            </a>
            <a href="tel:+91${enquiry.phone}" class="button" style="background: #16a34a;">
              📞 Call Customer
            </a>
            <a href="https://wa.me/91${enquiry.phone}" class="button" style="background: #25D366;">
              💬 WhatsApp
            </a>
          </div>
          
          <p style="background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #ffc107;">
            <strong>⏰ Action Required:</strong> Please contact the customer within 24 hours to ensure high satisfaction and conversion rate.
          </p>
        </div>
        <div class="footer">
          <p><strong>Aarohan Holidays - Admin Panel</strong></p>
          <p>This is an automated notification from your enquiry management system.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send user confirmation email
export const sendUserConfirmationEmail = async (enquiry) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Sending user confirmation email (attempt ${attempt}/${maxRetries})...`);
      const transporter = createTransporter();
      
      // Verify transporter configuration
      if (attempt === 1) {
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');
      }
      
      const mailOptions = {
        from: `"Aarohan Holidays" <${process.env.EMAIL_USER}>`,
        to: enquiry.email,
        subject: `✅ Enquiry Confirmation - ${enquiry.referenceNumber}`,
        html: userConfirmationTemplate(enquiry)
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ User confirmation email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      lastError = error;
      console.error(`❌ Error sending user confirmation email (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error('❌ Failed to send user confirmation email after all retries');
  return { success: false, error: lastError.message };
};

// Send admin notification email
export const sendAdminNotificationEmail = async (enquiry) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Sending admin notification email (attempt ${attempt}/${maxRetries})...`);
      const transporter = createTransporter();
      
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
      
      const mailOptions = {
        from: `"Ravi Tours System" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `🚨 New Enquiry - ${enquiry.serviceType} - ${enquiry.referenceNumber}`,
        html: adminNotificationTemplate(enquiry),
        priority: enquiry.priority === 'Urgent' || enquiry.priority === 'High' ? 'high' : 'normal'
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Admin notification email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      lastError = error;
      console.error(`❌ Error sending admin notification email (attempt ${attempt}/${maxRetries}):`, error.message);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error('❌ Failed to send admin notification email after all retries');
  return { success: false, error: lastError.message };
};

// Send both emails
export const sendEnquiryEmails = async (enquiry) => {
  const results = {
    userConfirmation: null,
    adminNotification: null
  };
  
  // Send user confirmation
  results.userConfirmation = await sendUserConfirmationEmail(enquiry);
  
  // Send admin notification
  results.adminNotification = await sendAdminNotificationEmail(enquiry);
  
  return results;
};

// Send Custom Booking Email with PDF Buffer (no file saved)
export const sendCustomBookingEmail = async (booking, pdfBuffer) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔧 Sending custom booking email (attempt ${attempt}/${maxRetries})...`);
      console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
      console.log("🔑 EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
      
      const transporter = createTransporter();
      
      // Verify transporter on first attempt
      if (attempt === 1) {
        await transporter.verify();
        console.log('✅ Email transporter verified successfully');
      }
      
      console.log("📄 PDF Buffer size:", pdfBuffer ? pdfBuffer.length : 0, "bytes");
      console.log("✉️ Sending to:", booking.customerEmail);
      
      // Prepare booking data for email template
      const emailData = {
        ...booking._doc || booking,
        packageName: booking.packageId?.name || booking.packageId?.packageName || booking.packageName || 'Package',
        packageType: booking.packageType,
        description: booking.packageId?.description || booking.description || '',
        highlights: booking.packageId?.highlights || booking.highlights || [],
        itinerary: booking.packageId?.itinerary || booking.itinerary || [],
        inclusions: booking.packageId?.inclusions || booking.inclusions || [],
        exclusions: booking.packageId?.exclusions || booking.exclusions || [],
        location: booking.packageId?.location || booking.location || '',
        duration: booking.packageId?.duration || booking.duration || '',
        thumbnail: booking.thumbnail || null, // ✅ Explicitly include thumbnail
      };
      
      console.log('📧 Email - Thumbnail URL:', emailData.thumbnail || 'No thumbnail');
      
      const mailOptions = {
        from: `"Aarohan Holidays" <${process.env.EMAIL_USER}>`,
        to: booking.customerEmail,
        subject: `🎉 Your Customized ${booking.packageType} Package - ${emailData.packageName}`,
        html: customBookingEmailTemplate(emailData),
      };

      // Add PDF attachment if provided
      if (pdfBuffer) {
        mailOptions.attachments = [
          {
            filename: `${emailData.packageName.replace(/\s+/g, '-')}-Quote.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ];
      }
      
      console.log("📮 Sending email...");
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Custom booking email sent successfully! Message ID:', info.messageId);
      return true;
    } catch (error) {
      lastError = error;
      console.error(`❌ Error sending custom booking email (attempt ${attempt}/${maxRetries}):`);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  console.error('❌ Failed to send custom booking email after all retries');
  console.error('Final error:', lastError);
  return false;
};

export default {
  sendUserConfirmationEmail,
  sendAdminNotificationEmail,
  sendEnquiryEmails,
  sendCustomBookingEmail
};
