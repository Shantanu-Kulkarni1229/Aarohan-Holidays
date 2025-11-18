# 🚀 Resend Email Setup for Render (RECOMMENDED)

## ✅ Why Resend?

- **Works on Render Free Tier** - Uses API instead of blocked SMTP ports
- **3,000 Free Emails/Month** - Plenty for most applications
- **5-Minute Setup** - Super easy to configure
- **100% Reliable** - No connection timeouts
- **Better Deliverability** - Professional email infrastructure

---

## 📋 Step-by-Step Setup

### Step 1: Create Resend Account (2 minutes)

1. Go to https://resend.com/
2. Click **"Sign Up"** (Free forever plan)
3. Verify your email address
4. Log in to your Resend dashboard

### Step 2: Get Your API Key (1 minute)

1. In Resend dashboard, go to **"API Keys"**
2. Click **"Create API Key"**
3. Name it: `Aarohan Holidays Production`
4. Copy the API key (format: `re_xxxxxxxxxxxxx`)
   - ⚠️ **Save it now!** You can only see it once

### Step 3: Add Domain (Optional but Recommended)

**Option A: Use Default Domain (Easiest)**
- Resend provides `onboarding@resend.dev` for testing
- Emails will work but may go to spam
- Good for testing, not ideal for production

**Option B: Add Your Own Domain (Recommended)**
1. Go to **"Domains"** in Resend dashboard
2. Click **"Add Domain"**
3. Enter your domain: `aarohanholidays.com`
4. Add DNS records (provided by Resend)
5. Wait for verification (5-30 minutes)
6. Use: `noreply@aarohanholidays.com`

### Step 4: Configure Render Environment Variables

Go to your Render service → **Environment** tab

Add these variables:

```bash
# Email Provider Selection
EMAIL_PROVIDER=resend

# Resend Configuration
RESEND_API_KEY=re_your_api_key_here

# Sender Email (choose one):
# Option A: Using Resend's test domain
RESEND_FROM_EMAIL=Aarohan Holidays <onboarding@resend.dev>

# Option B: Using your verified domain (after DNS setup)
RESEND_FROM_EMAIL=Aarohan Holidays <noreply@aarohanholidays.com>

# Admin Email (where to receive notifications)
ADMIN_EMAIL=admin@aarohanholidays.com
```

**Example Configuration:**
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_123abc456def789ghi
RESEND_FROM_EMAIL=Aarohan Holidays <onboarding@resend.dev>
ADMIN_EMAIL=admin@aarohanholidays.com
```

### Step 5: Install Resend Package

In your Backend directory, run:
```bash
npm install resend
```

### Step 6: Deploy to Render

```bash
# Commit your changes
git add .
git commit -m "Add Resend email service"
git push origin main

# Render will auto-deploy
```

Or use **Manual Deploy** → **Clear build cache & deploy**

---

## 🧪 Testing Your Setup

### Test 1: Check Render Logs

After deployment, look for:
```
🎯 Using Resend for user confirmation email
📧 Sending user confirmation email via Resend...
✅ User confirmation email sent via Resend: <message-id>
```

### Test 2: Send Test Email

Submit an enquiry on your website and check:
1. Customer receives confirmation email
2. Admin receives notification email
3. No timeout errors in logs

### Test 3: Check Resend Dashboard

1. Go to Resend dashboard → **"Logs"**
2. You should see your sent emails
3. Check delivery status

---

## 📊 Email Provider Logic

The system automatically chooses the email provider:

```javascript
// If RESEND configured → Use Resend ✅
if (EMAIL_PROVIDER === 'resend' && RESEND_API_KEY exists) {
  → Use Resend API (works on Render free tier)
}

// Otherwise → Use Nodemailer (SMTP)
else {
  → Use Gmail SMTP (requires Render paid plan)
}
```

---

## 🔍 Troubleshooting

### ❌ Error: "Invalid API key"
**Solution:** 
- Check your `RESEND_API_KEY` is correct
- Make sure it starts with `re_`
- Regenerate API key if needed

### ❌ Error: "Domain not verified"
**Solution:**
- Use `onboarding@resend.dev` temporarily
- Or wait for DNS verification (check Resend dashboard)

### ❌ Emails going to spam
**Solution:**
- Add and verify your own domain
- Set up SPF, DKIM records (provided by Resend)
- Don't use `onboarding@resend.dev` in production

### ❌ "Resend is not defined"
**Solution:**
```bash
cd Backend
npm install resend
git add package.json package-lock.json
git commit -m "Add resend dependency"
git push
```

---

## 📈 Monitoring Email Usage

### Check Resend Dashboard
1. Go to https://resend.com/overview
2. See emails sent today/this month
3. Track delivery rates
4. View bounces and complaints

### Free Tier Limits
- **3,000 emails/month** - More than enough for most sites
- **Unlimited** API requests
- **No credit card** required

### If You Need More
- Pro Plan: $20/month for 50,000 emails
- Enterprise: Custom pricing

---

## 🎯 Production Best Practices

### 1. Use Your Own Domain ✅
```bash
RESEND_FROM_EMAIL=Aarohan Holidays <noreply@aarohanholidays.com>
```

### 2. Set Up DNS Records
- SPF: Prevents spoofing
- DKIM: Email authentication
- DMARC: Email policy
(All provided by Resend)

### 3. Monitor Deliverability
- Check bounce rates in Resend dashboard
- Remove invalid email addresses
- Handle unsubscribes properly

### 4. Keep API Key Secret
- ❌ Never commit to Git
- ✅ Only in Render environment variables
- 🔄 Rotate keys periodically

---

## 🔄 Switching Between Providers

### Use Resend (Production - Render)
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxx
```

### Use Gmail SMTP (Local Development)
```bash
EMAIL_PROVIDER=nodemailer
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
```

### Automatic Fallback
If Resend fails, the system will NOT fallback to Gmail automatically.
This is intentional to avoid confusion.

---

## 📞 Support & Resources

- **Resend Docs:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Status Page:** https://status.resend.com/
- **Support:** support@resend.com

---

## ✅ Quick Checklist

- [ ] Created Resend account
- [ ] Generated API key
- [ ] Added `RESEND_API_KEY` to Render
- [ ] Set `EMAIL_PROVIDER=resend` on Render
- [ ] Set `RESEND_FROM_EMAIL` on Render
- [ ] Installed `npm install resend`
- [ ] Deployed to Render
- [ ] Tested email sending
- [ ] Verified in Resend dashboard
- [ ] (Optional) Added custom domain

---

## 🎉 You're Done!

Your emails will now be sent via Resend API, which works perfectly on Render's free tier without any SMTP port restrictions!

**No more connection timeouts!** 🚀
