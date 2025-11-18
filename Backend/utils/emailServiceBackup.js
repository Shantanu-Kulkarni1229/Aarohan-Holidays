import nodemailer from 'nodemailer';

/**
 * BACKUP EMAIL SERVICE - Use if primary service fails
 * This tries multiple SMTP configurations to bypass Render's port restrictions
 */

// Try different SMTP configurations
const createBackupTransporter = (config = 1) => {
  const configs = [
    // Config 1: Gmail with port 465 (SSL)
    {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    },
    // Config 2: Gmail with port 587 (TLS)
    {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    },
    // Config 3: Gmail service (lets nodemailer decide)
    {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    }
  ];

  return nodemailer.createTransporter(configs[config - 1] || configs[0]);
};

// Test all email configurations
export const testEmailConfigurations = async () => {
  console.log('🧪 Testing all email configurations...');
  
  for (let i = 1; i <= 3; i++) {
    try {
      console.log(`\n📧 Testing configuration ${i}...`);
      const transporter = createBackupTransporter(i);
      await transporter.verify();
      console.log(`✅ Configuration ${i} works!`);
      return i; // Return working config number
    } catch (error) {
      console.error(`❌ Configuration ${i} failed:`, error.message);
    }
  }
  
  console.error('❌ All email configurations failed');
  return null;
};

export default createBackupTransporter;
