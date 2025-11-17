import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return v.length <= 5;
      },
      message: 'Maximum 5 images allowed'
    },
    default: []
  },
  videoLink: {
    type: String,
    trim: true,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
historySchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Index for search and filtering
historySchema.index({ title: 'text', location: 'text', description: 'text', content: 'text' });
historySchema.index({ location: 1 });
historySchema.index({ featured: 1, isActive: 1 });
historySchema.index({ createdAt: -1 });

const History = mongoose.model('History', historySchema);

export default History;
