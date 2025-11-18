# 📧 Email Configuration for Render Deployment

## ⚠️ CRITICAL: Render SMTP Restrictions

**IMPORTANT:** Render FREE tier blocks outbound SMTP connections on ports 25, 465, and 587 by default. This is why emails work locally but fail on Render.

### Solutions:
1. **Upgrade to Render Paid Plan** ($7/month) - Enables SMTP ports ✅ RECOMMENDED
2. **Use Email API Service** (SendGrid, Mailgun, AWS SES, Resend) - Works on free tier
3. **Use Render's SMTP Relay** (if available)

## Problem Fixed
Your Render deployment was experiencing email connection timeouts because:
1. Ports 25, 465, 587 are blocked by Render on free tier
2. No retry mechanism for failed connections
3. No connection pooling for better performance

## ✅ Solutions Implemented

### 1. Updated SMTP Configuration
- **Port 587** (TLS) instead of default port 25
- Explicit host configuration (`smtp.gmail.com`)
- Connection pooling enabled
- Proper timeout settings
- TLS version enforcement

### 2. Retry Logic with Exponential Backoff
- 3 retry attempts for each email
- Exponential backoff: 2s, 4s, 8s wait between retries
- Better error logging

### 3. Connection Verification
- Verifies SMTP connection before sending
- Fails fast if credentials are invalid

## 🚨 RENDER FREE TIER LIMITATION

**Render's free tier blocks SMTP ports (25, 465, 587).** You have 3 options:

### Option 1: Upgrade Render Plan (Easiest)
- Upgrade to **Starter Plan ($7/month)**
- This unlocks all SMTP ports
- Then follow Gmail setup below
- ✅ **Most reliable solution**

### Option 2: Use SendGrid (Free Alternative)
SendGrid offers 100 emails/day for free and works on Render free tier:

1. Sign up at https://sendgrid.com/
2. Get your API key
3. Set environment variable: `SENDGRID_API_KEY=your_api_key`
4. Set `EMAIL_PROVIDER=sendgrid` on Render
5. I'll add SendGrid support to your code

### Option 3: Test if Render Allows Gmail
Sometimes it works, let's try:

## 🔧 Required Setup on Render

### Step 1: Generate Gmail App Password

**Important:** You MUST use an App Password, NOT your regular Gmail password!

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Enable **2-Step Verification** (if not already enabled)
4. Scroll down to **App passwords** or visit: https://myaccount.google.com/apppasswords
5. Select **Mail** and **Other (Custom name)** → Enter "Render Backend"
6. Click **Generate**
7. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)

### Step 2: Set Environment Variables on Render

Go to your Render dashboard → Your Web Service → Environment

Add/Update these variables:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
ADMIN_EMAIL=admin-email@gmail.com (optional, defaults to EMAIL_USER)
```

**Example:**
```
EMAIL_USER=aarohanholidays@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
ADMIN_EMAIL=admin@aarohanholidays.com
```

### Step 3: Redeploy

After adding environment variables:
1. Go to **Manual Deploy** → **Clear build cache & deploy**
2. Or just push new changes to trigger auto-deploy

## 🧪 Testing Email Configuration

After deployment, check Render logs for:

```
✅ Email transporter verified successfully
✅ User confirmation email sent: <message-id>
```

If you see errors, check:
1. ❌ `Invalid login` → Wrong email or app password
2. ❌ `Connection timeout` → Check port 587 is used
3. ❌ `Self signed certificate` → TLS configuration issue

## 📊 Email Features

### Current Email Types:
1. **User Confirmation** - Sent to customers after enquiry
2. **Admin Notification** - Sent to admin for new enquiries
3. **Custom Booking** - Sent with PDF quote attached

### Retry Mechanism:
- Each email has 3 attempts
- Exponential backoff between retries
- Detailed logging for debugging

### Performance Optimization:
- Connection pooling (max 5 connections)
- Rate limiting (max 10 emails/second)
- Socket timeout: 20 seconds
- Connection timeout: 10 seconds

## 🔍 Monitoring Email Delivery

Check Render logs for:
```bash
# Success
✅ Email transporter verified successfully
📧 Sending user confirmation email (attempt 1/3)...
✅ User confirmation email sent: <message-id>

# Failure with retry
❌ Error sending user confirmation email (attempt 1/3): Connection timeout
⏳ Waiting 2s before retry...
📧 Sending user confirmation email (attempt 2/3)...
✅ User confirmation email sent: <message-id>
```

## ⚠️ Important Notes

1. **Gmail Limits**: Free Gmail accounts have sending limits (~500 emails/day)
2. **App Password**: Never commit app passwords to Git
3. **Production**: Consider using dedicated email services like:
   - SendGrid
   - AWS SES
   - Mailgun
   - Resend

4. **Port 587 vs 465**:
   - Port 587: STARTTLS (recommended) ✅
   - Port 465: SSL/TLS (legacy)
   - Port 25: Blocked by Render ❌

## 🚀 Alternative Email Providers (If Gmail Doesn't Work)

### SendGrid (Recommended for Production)
```javascript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'recipient@example.com',
  from: 'verified-sender@yourdomain.com',
  subject: 'Subject',
  html: '<strong>HTML content</strong>',
};

await sgMail.send(msg);
```

### AWS SES
```javascript
// More reliable for high-volume emails
// Requires AWS account and verified domain
```

### Resend (Modern Alternative)
```javascript
// Simple API, developer-friendly
// npm install resend
```

## 📞 Support

If emails still fail after setup:
1. Check Render logs for specific error messages
2. Verify App Password is correctly copied (no spaces)
3. Ensure EMAIL_USER matches the Gmail account
4. Try disabling "Less secure app access" in Gmail (not recommended)
5. Consider switching to SendGrid or AWS SES for production

## ✅ Checklist

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated
- [ ] Environment variables set on Render
- [ ] Application redeployed
- [ ] Test email sent successfully
- [ ] Logs show "✅ Email transporter verified successfully"
