import mongoose from 'mongoose';import mongoose from 'mongoose';import mongoose from "mongoose";



const offlineBookingSchema = new mongoose.Schema({

  // Customer Information

  customerName: {const offlineBookingSchema = new mongoose.Schema({const offlineBookingSchema = new mongoose.Schema(

    type: String,

    required: true,  // Customer Information  {

    trim: true

  },  customerName: {    // Customer Information

  customerEmail: {

    type: String,    type: String,    customerName: {

    required: true,

    trim: true,    required: true,      type: String,

    lowercase: true

  },    trim: true      required: true,

  customerPhone: {

    type: String,  },      trim: true,

    required: true,

    trim: true  customerEmail: {    },

  },

    type: String,    customerEmail: {

  // Package Information

  packageType: {    required: true,      type: String,

    type: String,

    required: true,    trim: true,      required: true,

    enum: ['tour', 'trek']

  },    lowercase: true      trim: true,

  packageId: {

    type: mongoose.Schema.Types.ObjectId,  },      lowercase: true,

    required: true,

    refPath: 'packageType'  customerPhone: {    },

  },

  packageName: {    type: String,    customerPhone: {

    type: String,

    required: true    required: true,      type: String,

  },

    trim: true      required: true,

  // Booking Details

  bookingDate: {  },      trim: true,

    type: Date,

    required: true    },

  },

  pickupCity: {  // Package Information    customerAddress: {

    type: String,

    required: true  packageType: {      type: String,

  },

    type: String,      trim: true,

  // Pricing Information

  numberOfMembers: {    required: true,    },

    type: Number,

    required: true,    enum: ['tour', 'trek']    alternatePhone: {

    min: 1

  },  },      type: String,

  adults: {

    type: Number,  packageId: {      trim: true,

    default: 0

  },    type: mongoose.Schema.Types.ObjectId,    },

  women: {

    type: Number,    required: true,

    default: 0

  },    refPath: 'packageType'    // Package Information (Reference to Tour/Trek/CustomBooking)

  children: {

    type: Number,  },    packageType: {

    default: 0

  },  packageName: {      type: String,

  infants: {

    type: Number,    type: String,      enum: ["Tour", "Trek", "CustomBooking"],

    default: 0

  },    required: true      required: true,

  totalAmount: {

    type: Number,  },    },

    required: true,

    min: 0    packageId: {

  },

  // Booking Details      type: mongoose.Schema.Types.ObjectId,

  // Booking Reference

  bookingReference: {  bookingDate: {      required: true,

    type: String,

    unique: true    type: Date,      refPath: "packageType",

  },

    required: true    },

  // Status

  bookingStatus: {  },    

    type: String,

    enum: ['confirmed', 'completed', 'cancelled'],  pickupCity: {    // Customer-specific booking details

    default: 'confirmed'

  },    type: String,    startDate: {

  paymentStatus: {

    type: String,    required: true      type: Date,

    enum: ['pending', 'partial', 'completed'],

    default: 'pending'  },      required: true,

  },

  amountPaid: {    },

    type: Number,

    default: 0  // Pricing Information    endDate: {

  },

  numberOfMembers: {      type: Date,

  // Communication

  emailSent: {    type: Number,    },

    type: Boolean,

    default: false    required: true,    pickupCity: {

  },

      min: 1      type: String,

  // Special Requests

  specialRequests: {  },      required: true,

    type: String,

    trim: true  adults: {    },

  },

    type: Number,

  // Admin Notes

  adminNotes: {    default: 0    // Traveler counts and pricing

    type: String,

    trim: true  },    pricing: {

  }

}, {  women: {      adults: { type: Number, default: 0 },

  timestamps: true

});    type: Number,      women: { type: Number, default: 0 },



// Generate booking reference before saving    default: 0      children: { type: Number, default: 0 },

offlineBookingSchema.pre('save', async function(next) {

  if (!this.bookingReference) {  },      infants: { type: Number, default: 0 },

    const date = new Date();

    const year = date.getFullYear().toString().slice(-2);  children: {      adultPrice: { type: Number, default: 0 },

    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');    type: Number,      womenPrice: { type: Number, default: 0 },

    this.bookingReference = `OFF${year}${month}${random}`;

  }    default: 0      childrenPrice: { type: Number, default: 0 },

  next();

});  },      infantPrice: { type: Number, default: 0 },



// Populate package details before finding  infants: {      totalAmount: { type: Number, default: 0 },

offlineBookingSchema.pre(/^find/, function(next) {

  this.populate({    type: Number,      originalAmount: { type: Number },

    path: 'packageId',

    select: 'name location duration'    default: 0      discount: { type: Number, default: 0 },

  });

  next();  },      discountType: {

});

  totalAmount: {        type: String,

const OfflineBooking = mongoose.model('OfflineBooking', offlineBookingSchema);

    type: Number,        enum: ["percentage", "fixed"],

export default OfflineBooking;

    required: true,      },

    min: 0    },

  },

    // Special Requests

  // Booking Reference    specialRequests: {

  bookingReference: {      type: String,

    type: String,    },

    unique: true

  },    // Payment Information

    paymentStatus: {

  // Status      type: String,

  bookingStatus: {      enum: ["Pending", "Partial", "Paid", "Cancelled", "Refunded"],

    type: String,      default: "Pending",

    enum: ['confirmed', 'completed', 'cancelled'],    },

    default: 'confirmed'    paymentMethod: {

  },      type: String,

  paymentStatus: {      enum: ["Cash", "Bank Transfer", "Cheque", "Card (Swipe)"],

    type: String,      default: "Cash",

    enum: ['pending', 'partial', 'completed'],    },

    default: 'pending'    payments: [

  },      {

  amountPaid: {        amount: { type: Number, required: true },

    type: Number,        paymentDate: { type: Date, default: Date.now },

    default: 0        paymentMethod: {

  },          type: String,

          enum: ["Cash", "Bank Transfer", "Cheque", "Card (Swipe)"],

  // Communication          required: true,

  emailSent: {        },

    type: Boolean,        receiptNumber: { type: String },

    default: false        notes: { type: String },

  },        receivedBy: { type: String }, // Staff member who received payment

          chequeNumber: { type: String },

  // Special Requests        bankName: { type: String },

  specialRequests: {        transactionId: { type: String },

    type: String,      },

    trim: true    ],

  },    totalPaid: {

      type: Number,

  // Admin Notes      default: 0,

  adminNotes: {    },

    type: String,    balanceAmount: {

    trim: true      type: Number,

  }      default: 0,

}, {    },

  timestamps: true

});    // Booking Status

    bookingStatus: {

// Generate booking reference before saving      type: String,

offlineBookingSchema.pre('save', async function(next) {      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],

  if (!this.bookingReference) {      default: "Pending",

    const date = new Date();    },

    const year = date.getFullYear().toString().slice(-2);    bookingSource: {

    const month = (date.getMonth() + 1).toString().padStart(2, '0');      type: String,

    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');      enum: ["Walk-in", "Phone", "Email", "WhatsApp", "Reference"],

    this.bookingReference = `OFF${year}${month}${random}`;      default: "Walk-in",

  }    },

  next();    referenceBy: {

});      type: String,

      trim: true,

// Populate package details before finding    },

offlineBookingSchema.pre(/^find/, function(next) {

  this.populate({    // Communication

    path: 'packageId',    quoteSentDate: {

    select: 'name location duration'      type: Date,

  });    },

  next();    emailSent: {

});      type: Boolean,

      default: false,

const OfflineBooking = mongoose.model('OfflineBooking', offlineBookingSchema);    },

    emailSentAt: {

export default OfflineBooking;      type: Date,

    },
    remindersSent: {
      type: Number,
      default: 0,
    },
    lastReminderDate: {
      type: Date,
    },

    // Additional Information
    numberOfTravelers: {
      type: Number,
      required: true,
    },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
    medicalConditions: {
      type: String,
    },
    dietaryRequirements: {
      type: String,
    },
    notes: {
      type: String,
    },
    internalNotes: {
      type: String, // Private notes for staff only
    },

    // Assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Cancellation
    cancellationReason: {
      type: String,
    },
    cancelledAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for remaining balance
offlineBookingSchema.virtual("remainingBalance").get(function () {
  return this.pricing.totalAmount - this.totalPaid;
});

// Update balance amount before saving
offlineBookingSchema.pre("save", function (next) {
  this.balanceAmount = this.pricing.totalAmount - this.totalPaid;
  
  // Update payment status based on payments
  if (this.totalPaid === 0) {
    this.paymentStatus = "Pending";
  } else if (this.totalPaid >= this.pricing.totalAmount) {
    this.paymentStatus = "Paid";
  } else {
    this.paymentStatus = "Partial";
  }
  
  next();
});

// Index for faster queries
offlineBookingSchema.index({ customerEmail: 1 });
offlineBookingSchema.index({ customerPhone: 1 });
offlineBookingSchema.index({ bookingStatus: 1 });
offlineBookingSchema.index({ paymentStatus: 1 });
offlineBookingSchema.index({ startDate: 1 });
offlineBookingSchema.index({ createdAt: -1 });

const OfflineBooking = mongoose.model("OfflineBooking", offlineBookingSchema);

export default OfflineBooking;
