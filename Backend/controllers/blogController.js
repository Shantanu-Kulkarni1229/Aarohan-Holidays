import Blog from '../models/blog.js';

// ==================== ADMIN CONTROLLERS ====================

// Create new blog post
export const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create blog post'
    });
  }
};

// Get all blog posts (Admin)
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      published,
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    
    if (category && category !== 'all') filter.category = category;
    if (published !== undefined) filter.published = published === 'true';
    if (featured !== undefined) filter.featured = featured === 'true';
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const blogs = await Blog.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const totalBlogs = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / limit);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalBlogs,
        itemsPerPage: Number(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blog posts'
    });
  }
};

// Get single blog by ID
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blog post'
    });
  }
};

// Update blog post
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update blog post'
    });
  }
};

// Delete blog post
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete blog post'
    });
  }
};

// Toggle published status
export const toggleBlogPublished = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    blog.published = !blog.published;
    if (blog.published && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog post ${blog.published ? 'published' : 'unpublished'} successfully`,
      data: blog
    });
  } catch (error) {
    console.error('Error toggling published status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update published status'
    });
  }
};

// Toggle featured status
export const toggleBlogFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    blog.featured = !blog.featured;
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog post ${blog.featured ? 'featured' : 'unfeatured'} successfully`,
      data: blog
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update featured status'
    });
  }
};

// ==================== PUBLIC CONTROLLERS ====================

// Get all published blog posts (Public)
export const getAllBlogsPublic = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      featured,
      search,
      tag,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter - only published posts
    const filter = { published: true };
    
    if (category && category !== 'all') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (tag) filter.tags = { $in: [new RegExp(tag, 'i')] };
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subtitle: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const blogs = await Blog.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const totalBlogs = await Blog.countDocuments(filter);
    const totalPages = Math.ceil(totalBlogs / limit);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: totalBlogs,
        itemsPerPage: Number(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blog posts'
    });
  }
};

// Get single blog by ID or slug (Public)
export const getBlogByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let blog;
    
    // Check if identifier is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
    
    if (isValidObjectId) {
      // Try to find by ID first
      blog = await Blog.findOne({
        _id: identifier,
        published: true
      });
    }
    
    // If not found by ID or not a valid ObjectId, try by slug
    if (!blog) {
      blog = await Blog.findOne({
        slug: identifier,
        published: true
      });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blog post'
    });
  }
};

// Get featured blog posts (Public)
export const getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const blogs = await Blog.find({ 
      featured: true, 
      published: true 
    })
      .sort({ publishedAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: blogs,
      count: blogs.length
    });
  } catch (error) {
    console.error('Error fetching featured blogs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch featured blogs'
    });
  }
};

// Get latest blog posts (Public)
export const getLatestBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({ published: true })
      .sort({ publishedAt: -1 })
      .limit(Number(limit))
      .select('title slug excerpt featuredImage author publishedAt category readTime');

    res.status(200).json({
      success: true,
      data: blogs,
      count: blogs.length
    });
  } catch (error) {
    console.error('Error fetching latest blogs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch latest blogs'
    });
  }
};

// Get blog categories (Public)
export const getBlogCategories = async (req, res) => {
  try {
    const categories = await Blog.distinct('category', { published: true });
    
    res.status(200).json({
      success: true,
      data: categories.sort()
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories'
    });
  }
};

// Get popular tags (Public)
export const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const blogs = await Blog.find({ published: true }, 'tags');
    
    // Count tag occurrences
    const tagCount = {};
    blogs.forEach(blog => {
      blog.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    // Sort by count and limit
    const popularTags = Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, Number(limit))
      .map(([tag, count]) => ({ tag, count }));

    res.status(200).json({
      success: true,
      data: popularTags
    });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch popular tags'
    });
  }
};

// Increment blog likes
export const incrementBlogLikes = async (req, res) => {
  try {
    const { id } = req.params;
    
    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Blog liked successfully',
      data: { likes: blog.likes }
    });
  } catch (error) {
    console.error('Error incrementing likes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to like blog post'
    });
  }
};
