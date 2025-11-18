import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import otherServicesRoutes from "./routes/otherServices.js";
import testimonialRoutes from "./routes/testomonialRoute.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import customBookingRoutes from "./routes/customBookingRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";

dotenv.config();

const app = express();

// Set production environment if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = process.env.PORT ? 'production' : 'development';
}

console.log(`🚀 Starting server in ${process.env.NODE_ENV} mode`);


// Middlewares
const allowedOrigins = [
  "https://4zb5qb7j-5173.inc1.devtunnels.ms", 
  "http://localhost:5173",
  "https://aarohan-holidays.vercel.app", // Add your production frontend URL
  "https://aarohan-holidays.netlify.app", // If using Netlify
  // Add any other frontend domains you're using
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or matches a pattern
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        if (origin === allowedOrigin) return true;
        // Allow any vercel preview deployments
        if (origin.includes('vercel.app')) return true;
        // Allow any netlify preview deployments
        if (origin.includes('netlify.app')) return true;
        return false;
      });
      
      if (isAllowed) {
        return callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
      "HEAD",
    ],
    credentials: true,
  })
);


app.use(express.json());

// Connect to MongoDB with error handling for serverless
let dbConnected = false;
connectDB()
  .then(() => {
    dbConnected = true;
    console.log("✅ Database connection established");
  })
  .catch((error) => {
    console.error("❌ Initial database connection failed:", error.message);
    console.log("⚠️ Server will attempt to reconnect on requests");
  });

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  if (!dbConnected) {
    try {
      await connectDB();
      dbConnected = true;
    } catch (error) {
      console.error("❌ DB connection failed on request:", error.message);
      return res.status(503).json({ 
        error: "Database connection unavailable",
        message: "Please try again in a moment"
      });
    }
  }
  next();
});

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', userRoutes);
app.use('/api', bookingRoutes);
app.use('/api/other-services', otherServicesRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api', enquiryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/custom-bookings', customBookingRoutes);
app.use('/api', historyRoutes);
app.use('/api', blogRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
