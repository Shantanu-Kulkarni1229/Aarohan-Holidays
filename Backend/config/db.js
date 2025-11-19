import mongoose from "mongoose";

// Serverless-optimized MongoDB connection
const connectDB = async () => {
  try {
    // If already connected, return the existing connection
    if (mongoose.connection.readyState === 1) {
      console.log("✅ Using existing MongoDB connection");
      return mongoose.connection;
    }

    // Serverless-optimized connection options
    const options = {
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 30000, // Increased timeout for selecting a server
      connectTimeoutMS: 30000, // Increased connection timeout
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: "majority",
      bufferCommands: false, // Disable buffering for immediate errors
    };

    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection State: ${mongoose.connection.readyState}`);
    
    // Handle connection events
    mongoose.connection.on("connected", () => {
      console.log("✅ Mongoose connected to MongoDB");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`❌ Mongoose connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ Mongoose disconnected from MongoDB");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🛑 Mongoose connection closed due to app termination");
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // In serverless, we don't want to exit the process
    // Just log the error and let it retry
    throw error;
  }
};

export default connectDB;
