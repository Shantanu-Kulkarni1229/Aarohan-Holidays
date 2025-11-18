

import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { customBookingEmailTemplate } from './customBookingEmailTemplate.js';

// ============================================
// 🌐 ENVIRONMENT & PROVIDER DETECTION
// ============================================
const isProduction = process.env.NODE_ENV === 'production';
const hasResendConfig = !!(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);

// Initialize Resend client
const resend = hasResendConfig ? new Resend(process.env.RESEND_API_KEY) : null;

// Log provider selection on startup
console.log('📧 Email Service Configuration:');
console.log(`   Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`   Resend API Key: ${hasResendConfig ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Provider: ${isProduction ? 'Resend (FORCED)' : (hasResendConfig ? 'Resend' : 'Nodemailer SMTP')}`);

/**
 * Determine which email service to use
 * PRODUCTION: Always use Resend (SMTP is blocked on Render)
 * DEVELOPMENT: Use Resend if configured, otherwise fallback to Nodemailer
 */
const shouldUseResend = () => {
  // In production, ALWAYS use Resend (Render blocks SMTP)
  if (isProduction) {
    if (!hasResendConfig) {
      console.error('🚨 CRITICAL: Production mode but Resend is not configured!');
      console.error('   Add RESEND_API_KEY and RESEND_FROM_EMAIL to environment variables');
      throw new Error('Email service not configured for production. Resend API key required.');
    }
    return true;
  }
  
  // In development, prefer Resend but allow Nodemailer fallback
  return hasResendConfig;
};

/**
 * Create Nodemailer transporter for local development ONLY
 * This will NEVER be used in production
 */
const createNodemailerTransporter = () => {
  if (isProduction) {
    console.error('🚨 ERROR: Attempted to use SMTP in production!');
    console.error('   Render blocks SMTP ports (25, 465, 587)');
    console.error('   Use Resend instead by setting RESEND_API_KEY');
    throw new Error('SMTP not available in production environment');
  }
  
  console.log('📧 Creating Nodemailer transporter for LOCAL DEVELOPMENT');
  return nodemailer.createTransporter({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
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
            <h3 style="margin-top: 0; color: #dc2626;">⚡ Priority: ${enquiry.priority || 'Normal'}</h3>
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
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="tel:+91${enquiry.phone}" class="button" style="background: #16a34a;">
              📞 Call Customer
            </a>
            <a href="https://wa.me/91${enquiry.phone}" class="button" style="background: #25D366;">
              💬 WhatsApp
            </a>
          </div>
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

// ============================================
// 📧 RESEND EMAIL FUNCTIONS
// ============================================

/**
 * Send user confirmation email using Resend API
 * Used in production (Render) - no SMTP ports needed
 */
const sendUserConfirmationEmailResend = async (enquiry) => {
  try {
    console.log('📧 [Resend] Sending user confirmation email...');
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [enquiry.email],
      subject: `✅ Enquiry Confirmation - ${enquiry.referenceNumber}`,
      html: userConfirmationTemplate(enquiry),
    });

    if (error) {
      console.error('❌ [Resend] Error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Resend] User confirmation email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ [Resend] Exception:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send admin notification email using Resend API
 * Used in production (Render) - no SMTP ports needed
 */
const sendAdminNotificationEmailResend = async (enquiry) => {
  try {
    console.log('📧 [Resend] Sending admin notification email...');
    
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: [adminEmail],
      subject: `🚨 New Enquiry - ${enquiry.serviceType} - ${enquiry.referenceNumber}`,
      html: adminNotificationTemplate(enquiry),
    });

    if (error) {
      console.error('❌ [Resend] Error:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Resend] Admin notification email sent:', data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('❌ [Resend] Exception:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send custom booking email with PDF attachment using Resend API
 * Used in production (Render) - no SMTP ports needed
 */
const sendCustomBookingEmailResend = async (booking, pdfBuffer) => {
  try {
    console.log('📧 [Resend] Sending custom booking email...');
    
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
      thumbnail: booking.thumbnail || null,
    };

    const emailPayload = {
      from: process.env.RESEND_FROM_EMAIL,
      to: [booking.customerEmail],
      subject: `🎉 Your Customized ${booking.packageType} Package - ${emailData.packageName}`,
      html: customBookingEmailTemplate(emailData),
    };

    // Add PDF attachment if provided
    if (pdfBuffer) {
      emailPayload.attachments = [
        {
          filename: `${emailData.packageName.replace(/\s+/g, '-')}-Quote.pdf`,
          content: pdfBuffer.toString('base64'),
        }
      ];
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error('❌ [Resend] Error:', error);
      return false;
    }

    console.log('✅ [Resend] Custom booking email sent:', data.id);
    return true;
  } catch (error) {
    console.error('❌ [Resend] Exception:', error.message);
    return false;
  }
};

// ============================================
// 📧 NODEMAILER FALLBACK (LOCAL DEV ONLY)
// ============================================

/**
 * Send user confirmation email using Nodemailer SMTP
 * ONLY used in local development - NEVER in production
 */
const sendUserConfirmationEmailNodemailer = async (enquiry) => {
  if (isProduction) {
    throw new Error('SMTP not available in production. Use Resend.');
  }
  
  console.log('📧 [Nodemailer] Sending user confirmation email (LOCAL DEV)...');
  const transporter = createNodemailerTransporter();
  
  const mailOptions = {
    from: `"Aarohan Holidays" <${process.env.EMAIL_USER}>`,
    to: enquiry.email,
    subject: `✅ Enquiry Confirmation - ${enquiry.referenceNumber}`,
    html: userConfirmationTemplate(enquiry)
  };
  
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ [Nodemailer] User confirmation email sent:', info.messageId);
  return { success: true, messageId: info.messageId };
};

/**
 * Send admin notification email using Nodemailer SMTP
 * ONLY used in local development - NEVER in production
 */
const sendAdminNotificationEmailNodemailer = async (enquiry) => {
  if (isProduction) {
    throw new Error('SMTP not available in production. Use Resend.');
  }
  
  console.log('📧 [Nodemailer] Sending admin notification email (LOCAL DEV)...');
  const transporter = createNodemailerTransporter();
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
  
  const mailOptions = {
    from: `"Aarohan Holidays" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🚨 New Enquiry - ${enquiry.serviceType} - ${enquiry.referenceNumber}`,
    html: adminNotificationTemplate(enquiry)
  };
  
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ [Nodemailer] Admin notification email sent:', info.messageId);
  return { success: true, messageId: info.messageId };
};

/**
 * Send custom booking email using Nodemailer SMTP
 * ONLY used in local development - NEVER in production
 */
const sendCustomBookingEmailNodemailer = async (booking, pdfBuffer) => {
  if (isProduction) {
    throw new Error('SMTP not available in production. Use Resend.');
  }
  
  console.log('📧 [Nodemailer] Sending custom booking email (LOCAL DEV)...');
  const transporter = createNodemailerTransporter();
  
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
    thumbnail: booking.thumbnail || null,
  };
  
  const mailOptions = {
    from: `"Aarohan Holidays" <${process.env.EMAIL_USER}>`,
    to: booking.customerEmail,
    subject: `🎉 Your Customized ${booking.packageType} Package - ${emailData.packageName}`,
    html: customBookingEmailTemplate(emailData),
  };

  if (pdfBuffer) {
    mailOptions.attachments = [
      {
        filename: `${emailData.packageName.replace(/\s+/g, '-')}-Quote.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ];
  }
  
  const info = await transporter.sendMail(mailOptions);
  console.log('✅ [Nodemailer] Custom booking email sent:', info.messageId);
  return true;
};

// ============================================
// 🎯 MAIN EXPORT FUNCTIONS - SMART PROVIDER SELECTION
// ============================================

/**
 * Send user confirmation email
 * PRODUCTION: Always uses Resend
 * DEVELOPMENT: Uses Resend if configured, otherwise Nodemailer
 */
export const sendUserConfirmationEmail = async (enquiry) => {
  try {
    if (shouldUseResend()) {
      console.log('🎯 [PRODUCTION] Using Resend for user confirmation email');
      return await sendUserConfirmationEmailResend(enquiry);
    } else {
      console.log('🎯 [DEVELOPMENT] Using Nodemailer for user confirmation email');
      return await sendUserConfirmationEmailNodemailer(enquiry);
    }
  } catch (error) {
    console.error('❌ Failed to send user confirmation email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send admin notification email
 * PRODUCTION: Always uses Resend
 * DEVELOPMENT: Uses Resend if configured, otherwise Nodemailer
 */
export const sendAdminNotificationEmail = async (enquiry) => {
  try {
    if (shouldUseResend()) {
      console.log('🎯 [PRODUCTION] Using Resend for admin notification email');
      return await sendAdminNotificationEmailResend(enquiry);
    } else {
      console.log('🎯 [DEVELOPMENT] Using Nodemailer for admin notification email');
      return await sendAdminNotificationEmailNodemailer(enquiry);
    }
  } catch (error) {
    console.error('❌ Failed to send admin notification email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send custom booking email with PDF attachment
 * PRODUCTION: Always uses Resend
 * DEVELOPMENT: Uses Resend if configured, otherwise Nodemailer
 */
export const sendCustomBookingEmail = async (booking, pdfBuffer) => {
  try {
    if (shouldUseResend()) {
      console.log('🎯 [PRODUCTION] Using Resend for custom booking email');
      return await sendCustomBookingEmailResend(booking, pdfBuffer);
    } else {
      console.log('🎯 [DEVELOPMENT] Using Nodemailer for custom booking email');
      return await sendCustomBookingEmailNodemailer(booking, pdfBuffer);
    }
  } catch (error) {
    console.error('❌ Failed to send custom booking email:', error.message);
    return false;
  }
};

export const sendEnquiryEmails = async (enquiry) => {
  const results = {
    userConfirmation: null,
    adminNotification: null
  };
  
  results.userConfirmation = await sendUserConfirmationEmail(enquiry);
  results.adminNotification = await sendAdminNotificationEmail(enquiry);
  
  return results;
};

export default {
  sendUserConfirmationEmail,
  sendAdminNotificationEmail,
  sendEnquiryEmails,
  sendCustomBookingEmail
};
