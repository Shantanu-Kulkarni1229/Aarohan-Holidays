import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [300, 'Subtitle cannot exceed 300 characters'],
    default: ''
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    default: 'Aarohan Holidays'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['Travel Tips', 'Destinations', 'Adventure', 'Culture', 'Food', 'Trekking', 'Wildlife', 'Photography', 'Budget Travel', 'Luxury Travel', 'Other']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  featuredImage: {
    type: String,
    required: [true, 'Featured image is required']
  },
  tags: {
    type: [String],
    default: []
  },
  readTime: {
    type: Number,
    default: 5 // in minutes
  },
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters'],
    default: ''
  },
  metaKeywords: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Generate slug from title before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Set publishedAt when published status changes to true
  if (this.isModified('published') && this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// Index for search and filtering
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
blogSchema.index({ category: 1 });
blogSchema.index({ featured: 1, published: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ createdAt: -1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
