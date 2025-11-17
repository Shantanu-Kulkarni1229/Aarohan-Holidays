import mongoose from "mongoose";

// ✅ Schema for Other Services Enquiry
const otherServiceSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { 
      type: String, 
      required: [true, "Name is required"], 
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"]
    },
    
    email: { 
      type: String, 
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address"
      ]
    },
    
    phone: { 
      type: String, 
      required: [true, "Phone number is required"],
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please provide a valid 10-digit Indian phone number"
      ]
    },

    // Service Type Selection
    serviceType: {
      type: String,
      required: [true, "Service type is required"],
      enum: [
        "Taxi Booking Services",
        "Online Taxi Booking - Local & Outstation",
        "Season-Wise Segregated Tours",
        "Visa and Passport Assistance",
        "Hotel Bookings and Accommodation",
        "Cruise Holidays",
        "Parcel and Courier Services",
        "Tours and Travel Services",
        "Bus, Train, and Flight Booking",
        "Tour Packages",
        "Treks and Adventure Packages",
        "Customized Tours"
      ]
    },

    // Service-Specific Fields (conditionally required based on service type)
    
    // For Travel/Tour/Taxi services
    destination: {
      type: String,
      trim: true,
      default: ""
    },

    pickupLocation: {
      type: String,
      trim: true,
      default: ""
    },

    dropLocation: {
      type: String,
      trim: true,
      default: ""
    },

    // Travel Dates
    travelStartDate: {
      type: Date,
      validate: {
        validator: function(v) {
          return !v || v >= new Date();
        },
        message: "Travel start date must be a future date"
      }
    },

    travelEndDate: {
      type: Date,
      validate: {
        validator: function(v) {
          if (!v || !this.travelStartDate) return true;
          return v >= this.travelStartDate;
        },
        message: "Travel end date must be after start date"
      }
    },

    // For Tour/Trek Packages
    numberOfMembers: {
      type: Number,
      min: [1, "Number of members must be at least 1"],
      default: 1
    },

    adults: {
      type: Number,
      min: 0,
      default: 0
    },

    children: {
      type: Number,
      min: 0,
      default: 0
    },

    infants: {
      type: Number,
      min: 0,
      default: 0
    },

    // For Season-Wise Tours
    preferredSeason: {
      type: String,
      enum: ["Summer", "Monsoon", "Winter", "Spring", "Autumn", "Any"],
      default: "Any"
    },

    // For Hotel Bookings
    checkInDate: {
      type: Date
    },

    checkOutDate: {
      type: Date,
      validate: {
        validator: function(v) {
          if (!v || !this.checkInDate) return true;
          return v > this.checkInDate;
        },
        message: "Check-out date must be after check-in date"
      }
    },

    numberOfRooms: {
      type: Number,
      min: 1,
      default: 1
    },

    hotelPreference: {
      type: String,
      enum: ["Budget", "Standard", "Premium", "Luxury", "Any"],
      default: "Any"
    },

    // For Visa/Passport Services
    visaCountry: {
      type: String,
      trim: true,
      default: ""
    },

    visaType: {
      type: String,
      enum: ["Tourist", "Business", "Student", "Transit", "Other", ""],
      default: ""
    },

    urgency: {
      type: String,
      enum: ["Normal", "Urgent", "Very Urgent"],
      default: "Normal"
    },

    // For Taxi Services
    taxiType: {
      type: String,
      enum: ["4 Seater", "6 Seater", "7 Seater", "Mini Bus", "Big Bus", "Any", ""],
      default: ""
    },

    journeyType: {
      type: String,
      enum: ["One Way", "Round Trip", "Multi-City", "Hourly Rental", ""],
      default: ""
    },

    // For Flight/Train/Bus Booking
    transportMode: {
      type: String,
      enum: ["Flight", "Train", "Bus", "All", ""],
      default: ""
    },

    classPreference: {
      type: String,
      trim: true,
      default: ""
    },

    // For Cruise Holidays
    cruiseDestination: {
      type: String,
      trim: true,
      default: ""
    },

    cruiseDuration: {
      type: String,
      trim: true,
      default: ""
    },

    // For Parcel/Courier Services
    parcelWeight: {
      type: String,
      trim: true,
      default: ""
    },

    parcelDimensions: {
      type: String,
      trim: true,
      default: ""
    },

    deliverySpeed: {
      type: String,
      enum: ["Standard", "Express", "Same Day", ""],
      default: ""
    },

    // Members Expected (replaced budget field)
    membersExpected: {
      type: String,
      trim: true,
      default: ""
    },

    // Additional Requirements/Special Requests
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [1000, "Special requests cannot exceed 1000 characters"],
      default: ""
    },

    additionalDetails: {
      type: String,
      trim: true,
      maxlength: [2000, "Additional details cannot exceed 2000 characters"],
      default: ""
    },

    // Status Tracking
    enquiryStatus: {
      type: String,
      enum: ["Pending", "In Progress", "Contacted", "Quoted", "Confirmed", "Cancelled", "Completed"],
      default: "Pending"
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium"
    },

    // Admin Notes (internal use)
    adminNotes: {
      type: String,
      trim: true,
      default: ""
    },

    // Reference Number (auto-generated)
    enquiryReference: {
      type: String,
      unique: true,
      index: true
    },

    // Communication Tracking
    emailSent: {
      type: Boolean,
      default: false
    },

    whatsappSent: {
      type: Boolean,
      default: false
    },

    adminNotified: {
      type: Boolean,
      default: false
    },

    // Follow-up
    followUpDate: {
      type: Date
    },

    lastContactedAt: {
      type: Date
    },

    // Source tracking
    source: {
      type: String,
      enum: ["Website", "WhatsApp", "Phone", "Email", "Walk-in", "Referral"],
      default: "Website"
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ✅ Pre-save middleware to generate enquiry reference
otherServiceSchema.pre("save", async function (next) {
  if (!this.enquiryReference) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    
    // Generate random 4-digit number
    const random = Math.floor(1000 + Math.random() * 9000);
    
    // Format: OS-YYMMDD-XXXX (OS = Other Services)
    this.enquiryReference = `OS-${year}${month}${day}-${random}`;
  }
  next();
});

// ✅ Virtual for full service description
otherServiceSchema.virtual("serviceDescription").get(function () {
  return `${this.serviceType} enquiry by ${this.name}`;
});

// ✅ Instance method to check if enquiry is urgent
otherServiceSchema.methods.isUrgent = function () {
  return this.urgency === "Very Urgent" || this.priority === "Urgent";
};

// ✅ Instance method to check if follow-up is needed
otherServiceSchema.methods.needsFollowUp = function () {
  if (!this.followUpDate) return false;
  return new Date() >= this.followUpDate;
};

// ✅ Static method to get pending enquiries
otherServiceSchema.statics.getPendingEnquiries = function () {
  return this.find({ 
    enquiryStatus: { $in: ["Pending", "In Progress"] } 
  }).sort({ createdAt: -1 });
};

// ✅ Static method to get urgent enquiries
otherServiceSchema.statics.getUrgentEnquiries = function () {
  return this.find({ 
    $or: [
      { urgency: "Very Urgent" },
      { priority: "Urgent" }
    ],
    enquiryStatus: { $nin: ["Completed", "Cancelled"] }
  }).sort({ createdAt: -1 });
};

// ✅ Indexes for better query performance
otherServiceSchema.index({ email: 1, createdAt: -1 });
otherServiceSchema.index({ phone: 1, createdAt: -1 });
otherServiceSchema.index({ enquiryStatus: 1, priority: 1 });
otherServiceSchema.index({ serviceType: 1, createdAt: -1 });

const OtherService = mongoose.model("OtherService", otherServiceSchema);

export default OtherService;
