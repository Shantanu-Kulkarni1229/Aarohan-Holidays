import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, User, Clock, Tag, ArrowLeft, Heart, 
  Share2, Search, Filter, ThumbsUp, Eye, BookOpen,
  ChevronRight, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { showSuccess, showApiError } from '../utils/toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../api/api';

const BlogPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  
  // States
  const [view, setView] = useState(identifier ? 'detail' : 'list');
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const colors = {
    primary: '#1E9ABF',
    secondary: '#E66926',
    background: '#F8FAFC',
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 9,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`${API_BASE_URL}/blogs?${params}`);
      if (response.data.success) {
        setBlogs(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogDetail = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/blogs/${id}`);
      if (response.data.success) {
        setSelectedBlog(response.data.data);
      }
    } catch (error) {
      showApiError(error);
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blogs/categories`);
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const fetchPopularTags = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blogs/tags/popular?limit=15`);
      if (response.data.success) {
        setPopularTags(response.data.data);
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const fetchLatestBlogs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blogs/latest?limit=5`);
      if (response.data.success) {
        setLatestBlogs(response.data.data);
      }
    } catch (error) {
      showApiError(error);
    }
  };

  useEffect(() => {
    if (identifier) {
      fetchBlogDetail(identifier);
      setView('detail');
    } else {
      setView('list');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifier]);

  useEffect(() => {
    if (view === 'list') {
      fetchBlogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, currentPage, selectedCategory, searchTerm]);

  useEffect(() => {
    fetchCategories();
    fetchPopularTags();
    fetchLatestBlogs();
  }, []);

  const handleLike = async () => {
    if (!selectedBlog || liking) return;
    
    try {
      setLiking(true);
      const response = await axios.post(`${API_BASE_URL}/blogs/${selectedBlog._id}/like`);
      if (response.data.success) {
        setSelectedBlog(prev => ({
          ...prev,
          likes: response.data.data.likes
        }));
        showSuccess('Thanks for liking this post!');
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLiking(false);
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

  const handleShare = () => {
    if (navigator.share && selectedBlog) {
      navigator.share({
        title: selectedBlog.title,
        text: selectedBlog.excerpt,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  // Blog List View
  const BlogListView = () => (
    <> 
    <Navbar />
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-[#1E9ABF] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Blog</h1>
            <p className="text-xl opacity-90">
              Travel stories, tips, and inspiration from around the world
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E9ABF] focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E9ABF] focus:border-transparent appearance-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Blog Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {blogs.map((blog) => (
                    <div
                      key={blog._id}
                      onClick={() => navigate(`/blogs/${blog.slug || blog._id}`)}
                      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
                    >
                      <div className="relative h-48 overflow-hidden">
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
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{blog.readTime} min</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1E9ABF] transition-colors">
                          {blog.title}
                        </h3>
                        
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {truncateText(blog.excerpt, 100)}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Eye size={14} />
                              {blog.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart size={14} />
                              {blog.likes || 0}
                            </span>
                          </div>
                          <ChevronRight size={20} className="text-[#E66926] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg ${
                          currentPage === i + 1
                            ? 'bg-[#1E9ABF] text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">No blogs found. Try adjusting your filters.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-4 space-y-6">
              {/* Latest Posts */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp size={20} style={{ color: colors.primary }} />
                  Latest Posts
                </h3>
                <div className="space-y-4">
                  {latestBlogs.map((blog) => (
                    <div
                      key={blog._id}
                      onClick={() => navigate(`/blogs/${blog.slug || blog._id}`)}
                      className="flex gap-3 cursor-pointer group"
                    >
                      <img
                        src={blog.featuredImage || '/api/placeholder/80/80'}
                        alt={blog.title}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#1E9ABF] transition-colors">
                          {blog.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {formatDate(blog.publishedAt || blog.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular Tags */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag size={20} style={{ color: colors.secondary }} />
                  Popular Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tagData) => (
                    <button
                      key={tagData.tag}
                      onClick={() => setSearchTerm(tagData.tag)}
                      className="px-3 py-1 bg-gray-100 hover:bg-[#1E9ABF] hover:text-white rounded-full text-sm transition-colors"
                    >
                      {tagData.tag} ({tagData.count})
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );

  // Blog Detail View
  const BlogDetailView = () => {
    if (!selectedBlog) return null;

    return (
      <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <img
            src={selectedBlog.featuredImage || '/api/placeholder/1200/400'}
            alt={selectedBlog.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
          
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-12">
              <button
                onClick={() => navigate('/blogs')}
                className="mb-6 flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Blogs
              </button>
              
              <div className="max-w-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                    style={{ backgroundColor: colors.secondary }}
                  >
                    {selectedBlog.category}
                  </span>
                  {selectedBlog.featured && (
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Featured
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {selectedBlog.title}
                </h1>
                
                {selectedBlog.subtitle && (
                  <p className="text-xl text-gray-200 mb-6">
                    {selectedBlog.subtitle}
                  </p>
                )}
                
                <div className="flex items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
                    <User size={18} />
                    <span>{selectedBlog.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{formatDate(selectedBlog.publishedAt || selectedBlog.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>{selectedBlog.readTime} min read</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye size={18} />
                    <span>{selectedBlog.views || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
                {/* Excerpt */}
                <div className="text-lg text-gray-700 mb-8 pb-8 border-b border-gray-200 italic">
                  {selectedBlog.excerpt}
                </div>
                
                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: selectedBlog.content.replace(/\n/g, '<br/>') }}
                  />
                </div>
                
                {/* Tags */}
                {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlog.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-[#1E9ABF] hover:text-white transition-colors cursor-pointer"
                        >
                          <Tag size={14} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="mt-8 pt-8 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={handleLike}
                    disabled={liking}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp size={20} />
                    <span className="font-semibold">{selectedBlog.likes || 0} Likes</span>
                  </button>
                  
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Share2 size={20} />
                    <span className="font-semibold">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:w-1/3">
              <div className="sticky top-4 space-y-6">
                {/* Author Info */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">About the Author</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#1E9ABF] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedBlog.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedBlog.author}</p>
                      <p className="text-sm text-gray-600">Travel Writer</p>
                    </div>
                  </div>
                </div>

                {/* Latest Posts */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">More Articles</h3>
                  <div className="space-y-4">
                    {latestBlogs.filter(b => b._id !== selectedBlog._id).slice(0, 4).map((blog) => (
                      <div
                        key={blog._id}
                        onClick={() => navigate(`/blogs/${blog.slug || blog._id}`)}
                        className="flex gap-3 cursor-pointer group"
                      >
                        <img
                          src={blog.featuredImage || '/api/placeholder/80/80'}
                          alt={blog.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#1E9ABF] transition-colors">
                            {blog.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#1E9ABF]"></div>
      </div>
      
    );
  }

  return view === 'detail' ? <BlogDetailView /> : <BlogListView />;
};

export default BlogPage;