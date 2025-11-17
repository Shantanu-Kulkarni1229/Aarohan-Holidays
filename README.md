# 🏔️ Aarohan Holidays - Travel Booking Platform

<div align="center">

![Aarohan Holidays Banner](https://img.shields.io/badge/Aarohan-Holidays-E66926?style=for-the-badge&logo=mountain&logoColor=white)

**A Modern, Full-Stack Travel Booking Platform for Tours & Treks**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment-0C2451?style=flat&logo=razorpay&logoColor=white)](https://razorpay.com/)

[Live Demo](#) | [Documentation](#features) | [Contact](#contact)

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [What's New in Version 2](#whats-new-in-version-2)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## 🎯 About the Project

**Aarohan Holidays** is a comprehensive travel booking platform developed as a **freelance project** for Aarohan Tours & Travels, a travel agency specializing in adventure tours and treks across India. This full-stack MERN application provides a seamless booking experience for customers while offering powerful administrative tools for managing tours, bookings, and customer interactions.

### 🎨 Project Highlights

- **Freelance Commercial Project** - Built for real-world business needs
- **Modern UI/UX** - Stunning animations with GSAP and smooth scrolling
- **Secure Payments** - Integrated Razorpay payment gateway with verification
- **Admin Dashboard** - Complete tour/trek/booking management system
- **Responsive Design** - Optimized for all devices (mobile, tablet, desktop)
- **Real-time Notifications** - Email confirmations for bookings and payments
- **Professional Grade** - Production-ready with error handling and validation

---

## 🚀 What's New in Version 2

**Release Date:** Nov 2025

Version 2 brings major enhancements to both the admin panel and customer experience, with a focus on custom bookings, improved navigation, and professional documentation.

### 🎨 Frontend Enhancements

#### **1. Enhanced Navigation System**
- ✅ **Integrated Enquiry Form** - Quick enquiry submission directly from navbar dropdown
  - Modal-based form with smooth animations
  - Real-time validation and error handling
  - Auto-generated reference numbers (ENQ-YYYYMMDD-XXXX)
  - Instant admin email notifications
  - Success confirmation with reference number display

- ✅ **Persistent Dropdown Menus** - Improved UX for service exploration
  - Dropdowns remain open until manually closed via X button
  - Prevents accidental closure on mouse movement
  - Better accessibility for browsing all services

- ✅ **Active State Visual Feedback** - Enhanced navigation clarity
  - Active navigation icons turn white when selected
  - Consistent visual language with blue background indicators
  - Improved wayfinding for users

#### **2. Custom Booking System**
- ✅ **Custom Booking Form** - Tailored package creation
  - Multi-step form for personalized tour/trek packages
  - Dynamic pricing calculator based on traveler categories
  - Date range selection with availability checking
  - Special requests and requirements field
  - Real-time total cost calculation

- ✅ **Custom Booking Management** - Admin dashboard for custom packages
  - View all custom booking requests
  - Detailed booking information display
  - Status management (pending, confirmed, rejected)
  - Customer contact information quick access
  - Package customization and editing

- ✅ **Custom Booking Detail View** - Comprehensive booking overview
  - Full customer information display
  - Complete package details with itinerary
  - Traveler breakdown (adults, women, children, infants)
  - Pricing transparency with savings calculation
  - Timeline tracking (created, updated dates)
  - Quick action buttons (approve, contact, edit)

#### **3. Professional PDF Generation**
- ✅ **Enhanced PDF Quotations** - Client-ready travel documents
  - **Aarohan Holidays logo integration** - Brand identity on all PDFs
  - **Improved itinerary formatting** - Rectangular "DAY 1", "DAY 2" badges
  - Better readability for multi-digit day numbers
  - Professional layout with consistent spacing
  - Color-coded sections (highlights, inclusions, exclusions)
  - Pricing breakdown with savings display

### 📧 Email Enhancements

#### **1. Custom Booking Email Templates**
- ✅ **Responsive HTML Email Design** - Professional client communications
  - Fixed all alignment issues for cross-email-client compatibility
  - Table-based layout (replaces flexbox for Outlook support)
  - Proper vertical alignment for multi-line content
  - No overlapping text in price sections
  - Consistent rendering in Gmail, Outlook, Apple Mail, Yahoo

- ✅ **Enhanced Email Features**
  - Numbered highlights with proper alignment
  - Check/cross marks for inclusions/exclusions
  - Structured pricing table with clear breakdowns
  - Savings badges and discount indicators
  - Call-to-action buttons (Confirm Booking, Contact Us)
  - Footer with social media links and contact info

#### **2. Enquiry Email Notifications**
- ✅ **Admin Notification System** - Real-time enquiry alerts
  - Instant email to admin on enquiry submission
  - Complete enquiry details in structured format
  - Service type categorization (20+ options)
  - Customer contact information
  - Automatic reference number generation

### 🔧 Backend Improvements

#### **1. Offline Booking System**
- ✅ **Manual Booking Creation** - Admin can create bookings for offline payments
  - Support for cash, bank transfer, UPI payments
  - Auto-confirmation email to customers
  - Pre-filled booking status as "confirmed"
  - Payment marked as "completed"
  - Seamless integration with existing booking system

#### **2. Enhanced API Endpoints**
- ✅ **Custom Booking APIs**
  - `POST /api/custom-bookings` - Create custom booking request
  - `GET /api/custom-bookings` - Retrieve all custom bookings
  - `GET /api/custom-bookings/:id` - Get single booking details
  - `PUT /api/custom-bookings/:id` - Update booking status
  - `DELETE /api/custom-bookings/:id` - Delete custom booking

- ✅ **Enquiry Management APIs**
  - `POST /api/enquiries` - Submit enquiry with auto-reference generation
  - `GET /api/enquiries` - Admin retrieval of all enquiries
  - Expanded service type enum (20+ service categories)
  - Automatic timestamp tracking

- ✅ **Offline Booking API**
  - `POST /api/admin/bookings/offline` - Admin manual booking creation
  - Automatic email confirmation to customers
  - Support for all payment methods

#### **3. Bug Fixes & Optimizations**
- ✅ **Fixed Custom Booking API URLs** - Resolved 404 errors
  - Standardized API base URL across 6+ components
  - Hardcoded fallback for environment variable issues
  
- ✅ **Fixed MongoDB CastError** - Tour/Trek update issues
  - Added missing arrayFields to updateTour function
  - Proper JSON parsing for availableDates, faqs, itinerary
  - Symmetric serialization/deserialization for FormData

- ✅ **Fixed Enquiry Form Validation**
  - Expanded serviceType enum to 20+ options
  - Removed required constraint from auto-generated referenceNumber
  - Pre-save hook for reference number generation

- ✅ **Enhanced PDF Generator**
  - ES6 module support for file path handling
  - Logo image loading with error fallback
  - Rectangle badges for better day numbering readability
  - Adjusted content positioning for new badge width

### 📱 User Experience Improvements

- ✅ **Improved Form Validation** - Better error messages and inline validation
- ✅ **Loading States** - Spinners and progress indicators for async operations
- ✅ **Success Notifications** - Clear confirmation messages with reference numbers
- ✅ **Mobile Responsiveness** - Enhanced mobile navigation and forms
- ✅ **Accessibility** - Better keyboard navigation and screen reader support

### 🛠️ Technical Debt Addressed

- ✅ **Code Refactoring** - Modularized components and improved code structure
- ✅ **Error Handling** - Comprehensive try-catch blocks and error logging
- ✅ **Email Compatibility** - Table-based layouts for universal email client support
- ✅ **File Upload Optimization** - Streamlined Cloudinary integration
- ✅ **Database Schema Updates** - Enhanced models with better validation

### 📊 Admin Dashboard Enhancements

- ✅ **Custom Bookings Management Section** - New dedicated tab
- ✅ **Enquiries Dashboard** - Track and manage customer enquiries
- ✅ **Offline Booking Creation** - Manual booking entry system
- ✅ **Enhanced Booking Filters** - Better search and filter options
- ✅ **Quick Actions** - One-click approve, reject, contact buttons

---

## ✨ Features

### 🌍 Customer Features

- **🏔️ Tour & Trek Browsing**
  - Browse curated tours and adventure treks
  - Filter by destination, duration, difficulty level
  - Detailed itineraries with day-by-day breakdowns
  - Photo galleries and video showcases
  - Real customer testimonials and reviews

- **💳 Secure Booking System**
  - Multi-step booking form with validation
  - Real-time price calculation
  - Razorpay payment gateway integration
  - HMAC SHA256 signature verification
  - Instant booking confirmation via email
  - Payment failure handling and retry mechanism

- **📱 Other Services**
  - Hotel bookings
  - Visa assistance
  - Flight/train/bus ticket booking
  - Travel insurance
  - Custom tour packages
  - Cruise holidays

- **📧 Communication**
  - Contact forms and enquiry system
  - **NEW: Quick enquiry form in navbar** ⭐
  - WhatsApp integration for quick support
  - Email notifications for booking updates
  - Admin notification system
  - **NEW: Auto-generated enquiry reference numbers** ⭐

- **🎯 Custom Packages** ⭐ **NEW**
  - Request personalized tour/trek packages
  - Flexible traveler category selection
  - Custom itinerary creation
  - Special requirements accommodation
  - Instant quotation generation
  - Professional PDF proposals

### 🔧 Admin Features

- **📊 Dashboard**
  - Real-time statistics and analytics
  - Revenue tracking
  - Booking overview
  - Customer insights

- **🗺️ Tour Management**
  - Create, edit, delete tours
  - Upload multiple images (Cloudinary CDN)
  - Manage pricing and availability
  - Itinerary builder
  - Featured/upcoming tours

- **⛰️ Trek Management**
  - Difficulty level classification
  - Altitude and terrain information
  - Safety guidelines
  - Equipment requirements

- **📋 Booking Management**
  - View all bookings
  - Filter by status, date, payment
  - Payment verification
  - Refund processing
  - Export booking reports
  - **NEW: Offline booking creation** ⭐
  - **NEW: Manual payment entry support** ⭐

- **🎨 Custom Booking Management** ⭐ **NEW**
  - View all custom booking requests
  - Detailed package information
  - Status management (pending/confirmed/rejected)
  - Generate professional PDF quotations
  - Email quotations to customers
  - Track custom package history

- **💬 Customer Management**
  - Testimonials approval system
  - **NEW: Enquiry management dashboard** ⭐
  - Customer communication logs
  - **NEW: Enquiry reference tracking** ⭐

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI Library |
| **Vite** | 5.4.8 | Build Tool & Dev Server |
| **React Router DOM** | 7.0.1 | Client-side Routing |
| **Axios** | 1.7.7 | HTTP Client |
| **GSAP** | 3.12.5 | Animation Library |
| **Lenis** | 1.1.17 | Smooth Scrolling |
| **TailwindCSS** | 3.4.14 | Utility-first CSS |
| **React Icons** | 5.3.0 | Icon Components |
| **Locomotive Scroll** | 5.0.0-beta.21 | Scroll Effects |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | Runtime Environment |
| **Express** | 5.1.0 | Web Framework |
| **MongoDB** | 8.19.1 | Database |
| **Mongoose** | 8.8.4 | ODM for MongoDB |
| **Razorpay** | 2.9.4 | Payment Gateway SDK |
| **Nodemailer** | 7.0.9 | Email Service |
| **Cloudinary** | 2.5.1 | Image CDN & Storage |
| **Multer** | 1.4.5-lts.1 | File Upload Middleware |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |
| **Dotenv** | 16.4.7 | Environment Variables |

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **Postman** - API testing
- **VS Code** - Code editor

---

## 🏗️ Architecture

```
Aarohan-Holidays/
│
├── Frontend/                    # React + Vite Application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── admin/              # Admin dashboard components
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ToursManagement.jsx
│   │   │   ├── TreksManagement.jsx
│   │   │   ├── BookingsManagement.jsx
│   │   │   ├── CustomBookingForm.jsx          # NEW ⭐
│   │   │   ├── CustomBookingsManagement.jsx   # NEW ⭐
│   │   │   ├── CustomBookingDetail.jsx        # NEW ⭐
│   │   │   ├── EnquiriesManagement.jsx        # NEW ⭐
│   │   │   └── TestimonialsManagement.jsx
│   │   ├── api/                # API integration
│   │   │   ├── api.js
│   │   │   └── userAPI.js
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.jsx                     # UPDATED ⭐
│   │   │   ├── EnquiryForm.jsx                # NEW ⭐
│   │   │   ├── Footer.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Featured.jsx
│   │   │   ├── Testimonial.jsx
│   │   │   └── ...
│   │   ├── pages/              # Route pages
│   │   │   ├── HomePage.jsx
│   │   │   ├── BookTour.jsx
│   │   │   ├── BookTrek.jsx
│   │   │   ├── Gallery.jsx
│   │   │   ├── PrivacyPolicy.jsx
│   │   │   ├── TermsOfService.jsx
│   │   │   └── ContactSupport.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── Backend/                     # Node.js + Express API
│   ├── config/                 # Configuration files
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary setup
│   ├── controllers/            # Business logic
│   │   ├── adminController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── userController.js
│   │   └── testimonialController.js
│   ├── models/                 # MongoDB schemas
│   │   ├── booking.js
│   │   ├── customBooking.js               # NEW ⭐
│   │   ├── offlineBooking.js              # NEW ⭐
│   │   ├── tours.js
│   │   ├── treks.js
│   │   ├── testimonial.js
│   │   └── enquiry.js                     # UPDATED ⭐
│   ├── routes/                 # API routes
│   │   ├── adminRoutes.js
│   │   ├── bookingRoutes.js               # UPDATED ⭐
│   │   ├── customBookingRoutes.js         # NEW ⭐
│   │   ├── enquiryRoutes.js               # UPDATED ⭐
│   │   ├── paymentRoutes.js
│   │   └── userRoutes.js
│   ├── middlewares/            # Custom middleware
│   │   ├── upload.js
│   │   └── uploadMiddleware.js
│   ├── utils/                  # Helper functions
│   │   ├── emailService.js
│   │   ├── customBookingPDFGenerator.js   # NEW ⭐
│   │   ├── customBookingEmailTemplate.js  # NEW ⭐
│   │   ├── pdfGenerator.js
│   │   └── cloudinaryUtils.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v8 or higher)
- npm or yarn
- Razorpay account (for payment integration)
- Cloudinary account (for image hosting)
- Gmail account (for email service)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/aarohan-holidays.git
cd aarohan-holidays
```

### Step 2: Install Dependencies

#### Backend Setup

```bash
cd Backend
npm install
```

#### Frontend Setup

```bash
cd ../Frontend
npm install
```

### Step 3: Configure Environment Variables

Create `.env` files in both Backend and Frontend directories:

#### Backend `.env`

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/aarohan-holidays

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
ADMIN_EMAIL=admin@aarohanholidays.com

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# WhatsApp Business API (Optional)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
```

#### Frontend `.env`

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Razorpay
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

### Step 4: Run the Application

#### Start Backend Server

```bash
cd Backend
npm start
# or for development with auto-reload
npm run dev
```

Server runs on: `http://localhost:5000`

#### Start Frontend Development Server

```bash
cd Frontend
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port number | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `EMAIL_USER` | Gmail address for sending emails | Yes |
| `EMAIL_PASS` | Gmail app-specific password | Yes |
| `ADMIN_EMAIL` | Admin email for notifications | Yes |
| `RAZORPAY_KEY_ID` | Razorpay API key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret | Yes |
| `WHATSAPP_API_URL` | WhatsApp Business API URL | Optional |
| `WHATSAPP_API_TOKEN` | WhatsApp API token | Optional |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID (must match backend) | Yes |

---

## 📱 Usage

### For Customers

1. **Browse Tours/Treks**
   - Visit homepage
   - Explore featured destinations
   - Click on any tour/trek for details

2. **Make a Booking**
   - Select your preferred tour/trek
   - Fill in booking details (name, email, phone, dates)
   - Choose number of travelers
   - Select pickup location
   - Review total price
   - Click "Confirm Booking"
   - Complete payment via Razorpay
   - Receive confirmation email

3. **Contact Support**
   - Use contact form
   - Call/WhatsApp directly
   - Check FAQs in footer

### For Administrators

1. **Access Admin Panel**
   - Navigate to `/admin`
   - Login with credentials

2. **Manage Tours**
   - Add new tour with images, itinerary, pricing
   - Edit existing tours
   - Mark tours as featured/upcoming
   - Delete tours

3. **Process Bookings**
   - View all bookings in dashboard
   - Filter by status (pending, confirmed, cancelled)
   - Verify payments
   - Process refunds if needed
   - Send custom emails to customers

4. **Handle Testimonials**
   - Review customer testimonials
   - Approve/reject submissions
   - Feature on homepage

---

## 🔌 API Endpoints

### Public Routes

#### Tours
- `GET /api/tours` -  Get all tours
- `GET /api/tours/:id` - Get single tour
- `GET /api/tours/featured` - Get featured tours
- `GET /api/tours/upcoming` - Get upcoming tours

#### Treks
- `GET /api/treks` - Get all treks
- `GET /api/treks/:id` - Get single trek
- `GET /api/treks/featured` - Get featured treks

#### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/:id` - Get booking details

#### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/verify` - Verify payment and create booking
- `POST /api/payment/failure` - Log payment failure
- `GET /api/payment/status/:paymentId` - Get payment status

#### Testimonials
- `POST /api/testimonials` - Submit testimonial
- `GET /api/testimonials` - Get approved testimonials

#### Enquiries ⭐ **UPDATED**
- `POST /api/enquiries` - Submit enquiry (auto-generates reference number)
- `GET /api/enquiries` - Get all enquiries (admin)
- `POST /api/contact` - Contact form submission

#### Custom Bookings ⭐ **NEW**
- `POST /api/custom-bookings` - Create custom booking request
- `GET /api/custom-bookings` - Get all custom bookings (admin)
- `GET /api/custom-bookings/:id` - Get single custom booking
- `PUT /api/custom-bookings/:id` - Update custom booking
- `DELETE /api/custom-bookings/:id` - Delete custom booking
- `POST /api/custom-bookings/:id/pdf` - Generate PDF quotation

### Admin Routes (Protected)

#### Admin Authentication
- `POST /api/admin/login` - Admin login

#### Tour Management
- `POST /api/admin/tours` - Create tour
- `PUT /api/admin/tours/:id` - Update tour
- `DELETE /api/admin/tours/:id` - Delete tour

#### Trek Management
- `POST /api/admin/treks` - Create trek
- `PUT /api/admin/treks/:id` - Update trek
- `DELETE /api/admin/treks/:id` - Delete trek

#### Booking Management
- `GET /api/admin/bookings` - Get all bookings
- `PUT /api/admin/bookings/:id/status` - Update booking status
- `POST /api/payment/admin/refund/:bookingId` - Process refund
- `POST /api/admin/bookings/offline` - Create offline booking ⭐ **NEW**

#### Custom Booking Management ⭐ **NEW**
- `GET /api/admin/custom-bookings` - Get all custom bookings
- `PUT /api/admin/custom-bookings/:id/status` - Update status
- `POST /api/admin/custom-bookings/:id/send-pdf` - Email PDF to customer

#### Testimonial Management
- `GET /api/admin/testimonials` - Get all testimonials
- `PUT /api/admin/testimonials/:id/approve` - Approve testimonial
- `DELETE /api/admin/testimonials/:id` - Delete testimonial

#### Enquiry Management ⭐ **NEW**
- `GET /api/admin/enquiries` - Get all enquiries
- `PUT /api/admin/enquiries/:id/status` - Update enquiry status
- `DELETE /api/admin/enquiries/:id` - Delete enquiry

---

## 📸 Screenshots

### Customer Interface

**Homepage**
- Hero section with smooth animations
- Featured tours and treks
- Customer testimonials
- Call-to-action sections
- **Quick enquiry form in navbar** ⭐ **NEW**

**Tour/Trek Booking Page**
- Detailed itinerary
- Photo gallery with lightbox
- Booking form with validation
- Razorpay payment integration
- **Custom package request option** ⭐ **NEW**

**Payment Flow**
- Secure Razorpay checkout
- Payment verification
- Confirmation screen with booking reference
- Email notifications

### Admin Dashboard

**Dashboard Overview**
- Total bookings, revenue, customers
- Recent bookings table
- Quick actions

**Tour Management**
- Create/Edit tours with rich text editor
- Image upload with Cloudinary
- Pricing and availability management

**Booking Management**
- Filter and search bookings
- View payment details
- Process refunds
- Export reports
- **Create offline bookings** ⭐ **NEW**

**Custom Booking Management** ⭐ **NEW**
- View all custom booking requests
- Detailed booking information
- Generate PDF quotations
- Email quotations to customers
- Status management workflow

**Enquiry Management** ⭐ **NEW**
- View all customer enquiries
- Filter by service type
- Track enquiry status
- Quick customer contact access

---

## 🚢 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Create a production build
2. Set environment variables on hosting platform
3. Deploy using Git or Docker
4. Ensure MongoDB Atlas is accessible
5. Configure CORS for frontend domain

### Frontend Deployment (Vercel/Netlify)

1. Build production bundle:
   ```bash
   npm run build
   ```
2. Deploy `dist` folder
3. Set environment variables
4. Configure redirects for SPA routing

### Production Checklist

- [ ] Use production MongoDB cluster
- [ ] Use live Razorpay keys (rzp_live_...)
- [ ] Enable SSL/HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up domain and DNS
- [ ] Enable production error logging
- [ ] Set up backup strategy
- [ ] Configure CDN for assets
- [ ] Enable email service
- [ ] Test payment flow end-to-end
- [ ] Test custom booking PDF generation ⭐
- [ ] Verify email template rendering across clients ⭐
- [ ] Test enquiry form auto-reference generation ⭐
- [ ] Verify offline booking workflow ⭐

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR

---

## 👥 Team

### **Developed by Team Pravartak**

<div align="center">

| **Shantanu Kulkarni** | **Vaishnavi Kothawade** |
|:---:|:---:|
| Co-Founder & Lead Developer | Co-Founder & Developer |
| [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/shantanu-kulkarni) | [![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/in/vaishnavi-kothawade) |
| [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](#) | [![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](#) |
| 📧 shantanu@pravartak.com | 📧 vaishnavi@pravartak.com |

</div>

---

## 📞 Contact

**Aarohan Holidays**

- 🌐 Website: [aarohanholidays.com](#)
- 📧 Email: info@aarohanholidays.com
- 📱 Phone: +91 90112 68465
- 💬 WhatsApp: [Click to Chat](https://wa.me/919011268465)
- 📍 Location: Pune, Maharashtra, India

**Social Media**

[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white)](https://facebook.com/aarohanholidays)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=flat&logo=instagram&logoColor=white)](https://instagram.com/aarohanholidays)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://linkedin.com/company/aarohanholidays)
[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=flat&logo=youtube&logoColor=white)](https://youtube.com/aarohanholidays)

---

## 📄 License

This project is **proprietary software** developed as a freelance project for Aarohan Tours & Travels. All rights reserved.

**© 2025 Aarohan Holidays | Developed by Team Pravartak**

**Current Version:** 2.0 (January 2025)

---

## 📝 Version History

### **Version 2.0** - January 2025
- ✅ Custom booking system with PDF generation
- ✅ Enhanced navbar with quick enquiry form
- ✅ Persistent dropdown menus
- ✅ Active navigation state indicators
- ✅ Offline booking creation for admins
- ✅ Professional email templates (cross-client compatible)
- ✅ Enquiry management dashboard
- ✅ Bug fixes: API URLs, MongoDB validation, form errors
- ✅ PDF enhancements: Logo integration, improved formatting

### **Version 1.0** - December 2024
- ✅ Initial release with core booking functionality
- ✅ Razorpay payment integration
- ✅ Tour and trek management
- ✅ Admin dashboard
- ✅ Testimonial system
- ✅ Email notifications
- ✅ Cloudinary image hosting

---

## 🌟 Acknowledgments

- **Aarohan Tours & Travels** - For trusting us with this project
- **GSAP** - For amazing animation capabilities
- **Razorpay** - For seamless payment integration
- **Cloudinary** - For reliable image CDN
- **MongoDB Atlas** - For scalable database hosting
- **Vercel/Netlify** - For easy frontend deployment
- **Open Source Community** - For incredible tools and libraries

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Made with ❤️ by Team Pravartak**

[⬆ Back to Top](#-aarohan-holidays---travel-booking-platform)

</div>