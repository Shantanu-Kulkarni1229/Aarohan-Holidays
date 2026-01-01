import React, { useState, useEffect } from 'react';
import { Calendar, User, ArrowRight, Clock, Tag, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showApiError } from '../utils/toast';
import { API_BASE_URL } from '../api/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BlogsPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);

  const colors = {
    primary: "#1E9ABF",
    secondary: "#E66926",
    background: "#F8FAFC",
    text: "#1F2937",
    lightText: "#6B7280",
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    // Extract unique categories from blogs
    if (blogs.length > 0) {
      const uniqueCategories = ['All', ...new Set(blogs.map(blog => blog.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [blogs]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/blogs?sortBy=publishedAt&sortOrder=desc`);
      if (response.data.success) {
        setBlogs(response.data.data || []);
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

  // Filter blogs based on search and category
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
            style={{ backgroundColor: colors.secondary }}
          >
            {blog.category}
          </span>
        </div>
        {blog.featured && (
          <div className="absolute top-4 right-4">
            <span 
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: colors.primary }}
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
        <div 
          className="text-gray-700 mb-4 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: truncateText(blog.excerpt, 120) }}
        />

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
              setNavigatingId(blog._id);
              setTimeout(() => {
                navigate(`/blogs/${blog.slug || blog._id}`);
              }, 300);
            }}
            disabled={navigatingId === blog._id}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: colors.secondary }}
          >
            {navigatingId === blog._id ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Loading...
              </>
            ) : (
              <>
                Read More
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: colors.background }}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Blog</h1>
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
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: colors.background }}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Our Blog
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover travel tips, destination guides, and inspiring stories from our adventures
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none transition-colors"
                style={{ color: colors.text }}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-4 py-2 rounded-full font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: selectedCategory === category ? colors.primary : 'white',
                    color: selectedCategory === category ? 'white' : colors.text,
                    border: `2px solid ${selectedCategory === category ? colors.primary : '#E5E7EB'}`
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={40} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filters' 
                  : 'No blog posts available yet. Check back soon!'}
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogsPage;
