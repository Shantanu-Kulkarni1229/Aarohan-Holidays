import express from 'express';
import {
  // Admin controllers
  createBlog,
  getAllBlogsAdmin,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleBlogPublished,
  toggleBlogFeatured,
  // Public controllers
  getAllBlogsPublic,
  getBlogByIdOrSlug,
  getFeaturedBlogs,
  getLatestBlogs,
  getBlogCategories,
  getPopularTags,
  incrementBlogLikes
} from '../controllers/blogController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================
// Get all published blogs
router.get('/blogs', getAllBlogsPublic);

// Get featured blogs
router.get('/blogs/featured', getFeaturedBlogs);

// Get latest blogs
router.get('/blogs/latest', getLatestBlogs);

// Get all categories
router.get('/blogs/categories', getBlogCategories);

// Get popular tags
router.get('/blogs/tags/popular', getPopularTags);

// Get single blog by ID or slug
router.get('/blogs/:identifier', getBlogByIdOrSlug);

// Increment blog likes
router.post('/blogs/:id/like', incrementBlogLikes);

// ==================== ADMIN ROUTES ====================
// NOTE: Add authentication middleware before deploying
// Example: router.post('/admin/blogs', authenticateAdmin, createBlog);

// Create new blog post
router.post('/admin/blogs', createBlog);

// Get all blogs (with admin filters)
router.get('/admin/blogs', getAllBlogsAdmin);

// Get single blog by ID
router.get('/admin/blogs/:id', getBlogById);

// Update blog post
router.put('/admin/blogs/:id', updateBlog);

// Delete blog post
router.delete('/admin/blogs/:id', deleteBlog);

// Toggle published status
router.patch('/admin/blogs/:id/published', toggleBlogPublished);

// Toggle featured status
router.patch('/admin/blogs/:id/featured', toggleBlogFeatured);

export default router;
