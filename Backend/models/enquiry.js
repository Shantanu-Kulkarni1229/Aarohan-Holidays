import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number']
  },
  
  // Enquiry Details
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'Tour Package',
      'Trek Package',
      'Taxi Booking Services',
      'Hotel Bookings and Accommodation',
      'Visa and Passport Assistance',
      'Season-Wise Segregated Tours',
      'Cruise Holidays',
      'Bus, Train, and Flight Booking',
      'Parcel and Courier Services',
      'Customized Tours',
      'Tour Packages',
      'Treks and Adventure Packages',
      'Tours and Travel Services',
      'Online Taxi Booking - Local & Outstation',
      'Cab Booking',
      'Flight Booking',
      'Hotel Reservation',
      'Travel Insurance',
      'Custom Package',
      'Other'
    ],
    default: 'Tour Package'
  },
  
  destination: {
    type: String,
    trim: true,
    maxlength: [200, 'Destination cannot exceed 200 characters']
  },
  
  numberOfPeople: {
    type: Number,
    min: [1, 'Number of people must be at least 1'],
    max: [100, 'Number of people cannot exceed 100']
  },
  
  startDate: {
    type: Date
  },
  
  endDate: {
    type: Date
  },
  
  budget: {
    type: String,
    enum: ['Under 10k', '10k-25k', '25k-50k', '50k-1L', 'Above 1L', 'Flexible'],
    default: 'Flexible'
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  
  // Reference & Status
  referenceNumber: {
    type: String,
    unique: true,
    index: true
  },
  
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Contacted', 'Quoted', 'Converted', 'Closed', 'Cancelled'],
    default: 'Pending'
  },
  
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    maxlength: [2000, 'Admin notes cannot exceed 2000 characters']
  },
  
  assignedTo: {
    type: String,
    trim: true
  },
  
  // Tracking
  source: {
    type: String,
    enum: ['Website', 'Mobile App', 'WhatsApp', 'Phone Call', 'Email', 'Social Media', 'Walk-in', 'Referral'],
    default: 'Website'
  },
  
  ipAddress: {
    type: String
  },
  
  userAgent: {
    type: String
  },
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['Email', 'Phone', 'WhatsApp', 'SMS', 'Meeting'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [500, 'Communication notes cannot exceed 500 characters']
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: Date
  }],
  
  // Email Status
  emailSent: {
    userConfirmation: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    },
    adminNotification: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      error: String
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
enquirySchema.index({ status: 1, createdAt: -1 });
enquirySchema.index({ priority: 1, status: 1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ phone: 1 });
enquirySchema.index({ serviceType: 1 });

// Virtual for days since enquiry
enquirySchema.virtual('daysSinceEnquiry').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.createdAt);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is overdue (pending for more than 3 days)
enquirySchema.virtual('isOverdue').get(function() {
  return this.status === 'Pending' && this.daysSinceEnquiry > 3;
});

// Generate unique reference number before saving
enquirySchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate reference number: ENQ-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.referenceNumber = `ENQ-${dateStr}-${randomNum}`;
  }
  next();
});

// Static method to get enquiry statistics
enquirySchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $facet: {
        statusCounts: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        priorityCounts: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        serviceTypeCounts: [
          { $group: { _id: '$serviceType', count: { $sum: 1 } } }
        ],
        totalEnquiries: [
          { $count: 'count' }
        ],
        recentEnquiries: [
          { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
          { $count: 'count' }
        ],
        pendingEnquiries: [
          { $match: { status: 'Pending' } },
          { $count: 'count' }
        ],
        urgentEnquiries: [
          { $match: { priority: 'Urgent', status: { $in: ['Pending', 'In Progress'] } } },
          { $count: 'count' }
        ]
      }
    }
  ]);
  
  return {
    statusCounts: stats[0].statusCounts,
    priorityCounts: stats[0].priorityCounts,
    serviceTypeCounts: stats[0].serviceTypeCounts,
    total: stats[0].totalEnquiries[0]?.count || 0,
    recentWeek: stats[0].recentEnquiries[0]?.count || 0,
    pending: stats[0].pendingEnquiries[0]?.count || 0,
    urgent: stats[0].urgentEnquiries[0]?.count || 0
  };
};

const Enquiry = mongoose.model('Enquiry', enquirySchema);

export default Enquiry;
