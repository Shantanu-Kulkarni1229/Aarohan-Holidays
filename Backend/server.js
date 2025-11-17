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


// Middlewares
const allowedOrigins = [
  "https://4zb5qb7j-5173.inc1.devtunnels.ms", 
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
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

// Connect to MongoDB
connectDB();

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
