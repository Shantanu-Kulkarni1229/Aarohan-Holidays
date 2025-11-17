import React, { useState, useEffect, useRef } from 'react';
import { Calendar, User, ArrowRight, Clock, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showApiError } from '../utils/toast';

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchFeaturedBlogs();
  }, []);

  // Infinite scroll animation
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || blogs.length === 0) return;

    let animationFrameId;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Adjust speed (lower = slower)

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition += scrollSpeed;
        
        // Reset scroll position when reaching the end of first set
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [blogs, isPaused]);

  const fetchFeaturedBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/blogs/featured?limit=6');
      if (response.data.success) {
        setBlogs(response.data.data);
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const BlogCard = ({ blog }) => (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Featured Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={blog.featuredImage || '/api/placeholder/400/300'}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span 
            className="px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: '#E66926' }}
          >
            {blog.category}
          </span>
        </div>
        {blog.featured && (
          <div className="absolute top-4 right-4">
            <span 
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: '#1E9ABF' }}
            >
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta Information */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User size={16} />
            <span>{blog.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{blog.readTime} min read</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1E9ABF] transition-colors">
          {blog.title}
        </h3>

        {/* Subtitle */}
        {blog.subtitle && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
            {blog.subtitle}
          </p>
        )}

        {/* Excerpt */}
        <p className="text-gray-700 mb-4 line-clamp-3">
          {truncateText(blog.excerpt, 120)}
        </p>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats and Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{blog.views || 0} views</span>
            <span>{blog.likes || 0} likes</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/blogs/${blog.slug || blog._id}`);
            }}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E66926' }}
          >
            Read More
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest from Our Blog</h2>
            <p className="text-gray-600">Loading amazing stories...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-orange-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover travel tips, destination guides, and inspiring stories from our adventures
          </p>
        </div>

        {/* Infinite Horizontal Scroll */}
        {blogs.length > 0 ? (
          <>
            <div 
              ref={scrollContainerRef}
              className="flex gap-8 mb-12 overflow-x-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Duplicate blogs for seamless infinite scroll */}
              {[...blogs, ...blogs].map((blog, index) => (
                <div key={`${blog._id}-${index}`} className="flex-shrink-0 w-[400px]">
                  <BlogCard blog={blog} />
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button
                onClick={() => navigate('/blogs')}
                className="px-8 py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #1E9ABF 0%, #E66926 100%)'
                }}
              >
                View All Blog Posts
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;