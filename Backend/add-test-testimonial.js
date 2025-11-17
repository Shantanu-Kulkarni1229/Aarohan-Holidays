import mongoose from "mongoose";
import dotenv from "dotenv";
import Testimonial from "./models/testomonial.js";

dotenv.config();

// Script to add test testimonials
const addTestTestimonials = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Sample test testimonials
    const testTestimonials = [
      {
        name: "Rahul Sharma",
        rating: 5,
        review: "Amazing experience with Ravi Tours! The Goa trip was perfectly organized. Our guide was knowledgeable and friendly. Highly recommend their services!",
        email: "rahul@example.com",
        tourOrTrek: "Goa Beach Paradise",
        location: "Mumbai",
        status: "Approved",
        isFeatured: true
      },
      {
        name: "Priya Patel",
        rating: 5,
        review: "Best trekking experience ever! The Himalayan trek was challenging but rewarding. The team took great care of us. Will definitely book again!",
        email: "priya@example.com",
        tourOrTrek: "Himalayan Adventure Trek",
        location: "Pune",
        status: "Approved",
        isFeatured: true
      },
      {
        name: "Amit Kumar",
        rating: 4,
        review: "Great tour package to Kerala. The accommodations were comfortable and the food was delicious. Only minor issue was the timing, but overall a wonderful trip!",
        tourOrTrek: "Kerala Backwaters Tour",
        location: "Delhi",
        status: "Approved"
      },
      {
        name: "Sneha Desai",
        rating: 5,
        review: "Ravi Tours made our honeymoon special! Everything from flight bookings to hotel stays was seamless. Thank you for the memories!",
        email: "sneha@example.com",
        tourOrTrek: "Romantic Udaipur Package",
        location: "Ahmedabad",
        status: "Approved",
        isFeatured: true
      },
      {
        name: "Karan Singh",
        rating: 4,
        review: "Good experience overall. The Rajasthan cultural tour was informative and well-planned. Our tour guide was excellent!",
        tourOrTrek: "Rajasthan Heritage Tour",
        location: "Jaipur",
        status: "Approved"
      },
      {
        name: "Anjali Verma",
        rating: 5,
        review: "Fantastic service! I booked a family trip to Manali and everything was perfect. The team was very responsive and helpful throughout.",
        email: "anjali@example.com",
        tourOrTrek: "Manali Family Package",
        location: "Chandigarh",
        status: "Approved",
        isFeatured: true
      },
      {
        name: "Vikram Malhotra",
        rating: 3,
        review: "Decent experience but could be better. The tour was good but had some delays. Would recommend improving punctuality.",
        tourOrTrek: "Shimla Weekend Getaway",
        location: "Delhi",
        status: "Pending"
      },
      {
        name: "Neha Kapoor",
        rating: 5,
        review: "Absolutely loved the Andaman tour! Crystal clear waters, beautiful beaches, and great hospitality. Worth every penny!",
        email: "neha@example.com",
        tourOrTrek: "Andaman Island Paradise",
        location: "Bangalore",
        status: "Approved",
        isFeatured: true
      }
    ];

    // Insert testimonials
    const result = await Testimonial.insertMany(testTestimonials);
    console.log(`\n✅ Successfully added ${result.length} test testimonials!`);

    // Display summary
    const approved = result.filter(t => t.status === "Approved").length;
    const pending = result.filter(t => t.status === "Pending").length;
    const featured = result.filter(t => t.isFeatured).length;

    console.log(`\n📊 Summary:`);
    console.log(`   - Approved: ${approved}`);
    console.log(`   - Pending: ${pending}`);
    console.log(`   - Featured: ${featured}`);

    // Get statistics
    const stats = await Testimonial.getAverageRating();
    console.log(`\n⭐ Average Rating: ${stats.averageRating}`);
    console.log(`📊 Total Reviews: ${stats.totalReviews}`);

    mongoose.connection.close();
    console.log(`\n✅ Done! You can now view testimonials on the homepage.`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

addTestTestimonials();
