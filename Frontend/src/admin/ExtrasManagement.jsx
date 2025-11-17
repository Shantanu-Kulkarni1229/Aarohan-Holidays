import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Calendar, Percent, CheckCircle, XCircle, Tag, TrendingUp, Clock, Users, BookOpen, MapPin, Eye, Heart, Star, Image, Video } from 'lucide-react';
import { API_BASE_URL } from '../api/api';
import { showSuccess, showError } from '../utils/toast';

const ExtrasManagement = () => {
  const [activeTab, setActiveTab] = useState('coupons');
  const [coupons, setCoupons] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingHistory, setEditingHistory] = useState(null);
  const [statistics, setStatistics] = useState({});
  
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '',
    description: '',
    validFrom: '',
    validTo: '',
    isActive: true,
    usageLimit: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    applicableToType: 'all',
    applicableToIds: []
  });

  const [blogFormData, setBlogFormData] = useState({
    title: '',
    subtitle: '',
    author: 'Aarohan Holidays',
    category: 'Travel Tips',
    excerpt: '',
    content: '',
    featuredImage: '',
    tags: [],
    readTime: 5,
    featured: false,
    published: false,
    metaDescription: '',
    metaKeywords: []
  });

  const [historyFormData, setHistoryFormData] = useState({
    title: '',
    location: '',
    description: '',
    content: '',
    images: [],
    videoLink: '',
    featured: false,
    isActive: true
  });

  const [filters, setFilters] = useState({
    search: '',
    isActive: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const colors = {
    primary: '#1E9ABF',
    secondary: '#E66926',
    success: '#059669',
    error: '#DC2626',
    warning: '#D97706',
    background: '#F8FAFC',
    cardBg: '#FFFFFF',
    text: '#1F2937',
    lightText: '#6B7280',
    border: '#E5E7EB'
  };

  useEffect(() => {
    if (activeTab === 'coupons') {
      fetchCoupons();
    } else if (activeTab === 'blogs') {
      fetchBlogs();
    } else if (activeTab === 'history') {
      fetchHistories();
    }
  }, [filters, activeTab]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await axios.get(`${API_BASE_URL}/coupons/admin/coupons?${params.toString()}`);
      
      if (response.data.success) {
        setCoupons(response.data.data);
        setStatistics(response.data.statistics || {});
      }
    } catch (error) {
      showError('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== 'all') params.append('published', filters.isActive);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await axios.get(`${API_BASE_URL}/admin/blogs?${params.toString()}`);
      
      if (response.data.success) {
        setBlogs(response.data.data);
        const stats = {
          total: response.data.pagination?.totalItems || 0,
          published: response.data.data.filter(b => b.published).length,
          draft: response.data.data.filter(b => !b.published).length,
          featured: response.data.data.filter(b => b.featured).length
        };
        setStatistics(stats);
      }
    } catch (error) {
      showError('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.isActive !== 'all') params.append('isActive', filters.isActive);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await axios.get(`${API_BASE_URL}/admin/history?${params.toString()}`);
      
      if (response.data.success) {
        setHistories(response.data.data);
        const stats = {
          total: response.data.pagination?.totalItems || 0,
          active: response.data.data.filter(h => h.isActive).length,
          inactive: response.data.data.filter(h => !h.isActive).length,
          featured: response.data.data.filter(h => h.featured).length
        };
        setStatistics(stats);
      }
    } catch (error) {
      showError('Failed to fetch histories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountPercentage: '',
      description: '',
      validFrom: '',
      validTo: '',
      isActive: true,
      usageLimit: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      applicableToType: 'all',
      applicableToIds: []
    });
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountPercentage: Number(formData.discountPercentage),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null
      };

      if (editingCoupon) {
        await axios.put(
          `${API_BASE_URL}/coupons/admin/coupons/${editingCoupon._id}`,
          payload
        );
        alert('Coupon updated successfully!');
      } else {
        await axios.post(
          `${API_BASE_URL}/coupons/admin/coupons`,
          payload
        );
        alert('Coupon created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchCoupons();
      showSuccess('Coupon saved successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      description: coupon.description || '',
      validFrom: coupon.validFrom?.split('T')[0] || '',
      validTo: coupon.validTo?.split('T')[0] || '',
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit || '',
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      applicableToType: coupon.applicableToType || 'all',
      applicableToIds: coupon.applicableToIds || []
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/coupons/admin/coupons/${id}`);
      showSuccess('Coupon deleted successfully');
      fetchCoupons();
    } catch (error) {
      showError('Failed to delete coupon');
    }
  };

  // ============ BLOG HANDLERS ============
  const handleBlogInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBlogFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetBlogForm = () => {
    setBlogFormData({
      title: '',
      subtitle: '',
      author: 'Aarohan Holidays',
      category: 'Travel Tips',
      excerpt: '',
      content: '',
      featuredImage: '',
      tags: [],
      readTime: 5,
      featured: false,
      published: false,
      metaDescription: '',
      metaKeywords: []
    });
    setEditingBlog(null);
  };

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...blogFormData,
        tags: typeof blogFormData.tags === 'string' ? blogFormData.tags.split(',').map(t => t.trim()) : blogFormData.tags,
        metaKeywords: typeof blogFormData.metaKeywords === 'string' ? blogFormData.metaKeywords.split(',').map(k => k.trim()) : blogFormData.metaKeywords
      };

      if (editingBlog) {
        await axios.put(`${API_BASE_URL}/admin/blogs/${editingBlog._id}`, payload);
        alert('Blog updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/admin/blogs`, payload);
        alert('Blog created successfully!');
      }

      setShowModal(false);
      resetBlogForm();
      fetchBlogs();
      showSuccess('Blog saved successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const handleBlogEdit = (blog) => {
    setEditingBlog(blog);
    setBlogFormData({
      title: blog.title,
      subtitle: blog.subtitle || '',
      author: blog.author,
      category: blog.category,
      excerpt: blog.excerpt,
      content: blog.content,
      featuredImage: blog.featuredImage,
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags,
      readTime: blog.readTime,
      featured: blog.featured,
      published: blog.published,
      metaDescription: blog.metaDescription || '',
      metaKeywords: Array.isArray(blog.metaKeywords) ? blog.metaKeywords.join(', ') : blog.metaKeywords
    });
    setShowModal(true);
  };

  const handleBlogDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/blogs/${id}`);
      alert('Blog deleted successfully!');
      fetchBlogs();
    } catch (error) {
      showError('Failed to delete blog');
    }
  };

  const toggleBlogPublished = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/blogs/${id}/published`);
      fetchBlogs();
    } catch (error) {
      showError('Failed to toggle published status');
    }
  };

  const toggleBlogFeatured = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/blogs/${id}/featured`);
      fetchBlogs();
      showSuccess('Blog featured status updated');
    } catch (error) {
      showError('Failed to toggle blog featured status');
    }
  };

  // ============ HISTORY HANDLERS ============
  const handleHistoryInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHistoryFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetHistoryForm = () => {
    setHistoryFormData({
      title: '',
      location: '',
      description: '',
      content: '',
      images: [],
      videoLink: '',
      featured: false,
      isActive: true
    });
    setEditingHistory(null);
  };

  const handleHistorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...historyFormData,
        images: typeof historyFormData.images === 'string' ? historyFormData.images.split(',').map(i => i.trim()) : historyFormData.images
      };

      if (editingHistory) {
        await axios.put(`${API_BASE_URL}/admin/history/${editingHistory._id}`, payload);
        alert('History updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/admin/history`, payload);
        alert('History created successfully!');
      }

      setShowModal(false);
      resetHistoryForm();
      fetchHistories();
      showSuccess('History saved successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save history');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryEdit = (history) => {
    setEditingHistory(history);
    setHistoryFormData({
      title: history.title,
      location: history.location,
      description: history.description,
      content: history.content,
      images: Array.isArray(history.images) ? history.images.join(', ') : history.images,
      videoLink: history.videoLink || '',
      featured: history.featured,
      isActive: history.isActive
    });
    setShowModal(true);
  };

  const handleHistoryDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this history?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/admin/history/${id}`);
      alert('History deleted successfully!');
      fetchHistories();
      showSuccess('History deleted successfully');
    } catch (error) {
      showError('Failed to delete history');
    }
  };

  const toggleHistoryFeatured = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/history/${id}/featured`);
      fetchHistories();
      showSuccess('History featured status updated');
    } catch (error) {
      showError('Failed to toggle history featured status');
    }
  };

  const toggleHistoryActive = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/admin/history/${id}/active`);
      fetchHistories();
      showSuccess('Active status updated');
    } catch (error) {
      showError('Failed to toggle active status');
    }
  };

  const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border" style={{ borderColor: colors.border }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: colors.lightText }}>{label}</p>
          <p className="text-3xl font-bold mt-2" style={{ color: colors.text }}>{value}</p>
          {subtext && (
            <p className="text-xs mt-1" style={{ color: colors.lightText }}>{subtext}</p>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}15` }}>
          <Icon size={24} style={{ color }} />
        </div>
      </div>
    </div>
  );

  const CouponCard = ({ coupon }) => {
    const isExpired = new Date(coupon.validTo) < new Date();
    const isLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
    const statusColor = coupon.isActive && !isExpired && !isLimitReached 
      ? colors.success 
      : colors.error;

    return (
      <div className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow" style={{ borderColor: colors.border }}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${colors.secondary}15` }}>
                <Tag size={20} style={{ color: colors.secondary }} />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                  {coupon.code}
                </h3>
                <p className="text-sm" style={{ color: colors.lightText }}>
                  {coupon.discountPercentage}% OFF
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ 
                  backgroundColor: `${statusColor}15`,
                  color: statusColor 
                }}
              >
                {isExpired ? 'Expired' : isLimitReached ? 'Limit Reached' : coupon.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Description */}
          {coupon.description && (
            <p className="text-sm mb-4" style={{ color: colors.lightText }}>
              {coupon.description}
            </p>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: colors.lightText }}>Valid From</p>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                {new Date(coupon.validFrom).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: colors.lightText }}>Valid To</p>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                {new Date(coupon.validTo).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: colors.lightText }}>Usage</p>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                {coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : '/ Unlimited'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: colors.lightText }}>Min Amount</p>
              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                ₹{coupon.minOrderAmount || 0}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border }}>
            <div className="flex items-center space-x-4">
              <span className="text-xs px-2 py-1 rounded" style={{ 
                backgroundColor: `${colors.primary}10`,
                color: colors.primary 
              }}>
                {coupon.applicableToType.toUpperCase()}
              </span>
              {coupon.maxDiscountAmount && (
                <span className="text-xs" style={{ color: colors.lightText }}>
                  Max: ₹{coupon.maxDiscountAmount}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(coupon)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Edit"
              >
                <Edit2 size={16} style={{ color: colors.primary }} />
              </button>
              <button
                onClick={() => handleDelete(coupon._id)}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} style={{ color: colors.error }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BlogCard = ({ blog }) => (
    <div className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow" style={{ borderColor: colors.border }}>
      <div className="p-6">
        {/* Header with Featured Image */}
        {blog.featuredImage && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img src={blog.featuredImage} alt={blog.title} className="w-full h-48 object-cover" />
          </div>
        )}

        {/* Title and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>
              {blog.title}
            </h3>
            {blog.subtitle && (
              <p className="text-sm mb-2" style={{ color: colors.lightText }}>
                {blog.subtitle}
              </p>
            )}
          </div>
          <div className="flex flex-col space-y-1 ml-2">
            <span 
              className="px-2 py-1 rounded-full text-xs font-semibold text-center"
              style={{ 
                backgroundColor: blog.published ? `${colors.success}15` : `${colors.warning}15`,
                color: blog.published ? colors.success : colors.warning
              }}
            >
              {blog.published ? 'Published' : 'Draft'}
            </span>
            {blog.featured && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-semibold text-center"
                style={{ 
                  backgroundColor: `${colors.secondary}15`,
                  color: colors.secondary
                }}
              >
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-sm mb-4" style={{ color: colors.lightText }}>
          {blog.excerpt.substring(0, 100)}{blog.excerpt.length > 100 ? '...' : ''}
        </p>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Tag size={14} style={{ color: colors.lightText }} />
            <span className="text-xs" style={{ color: colors.lightText }}>{blog.category}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock size={14} style={{ color: colors.lightText }} />
            <span className="text-xs" style={{ color: colors.lightText }}>{blog.readTime} min</span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye size={14} style={{ color: colors.lightText }} />
            <span className="text-xs" style={{ color: colors.lightText }}>{blog.views} views</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart size={14} style={{ color: colors.lightText }} />
            <span className="text-xs" style={{ color: colors.lightText }}>{blog.likes} likes</span>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {blog.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-1 rounded text-xs" style={{ 
                backgroundColor: `${colors.primary}10`,
                color: colors.primary 
              }}>
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="px-2 py-1 rounded text-xs" style={{ color: colors.lightText }}>
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border }}>
          <div className="flex space-x-2">
            <button
              onClick={() => toggleBlogPublished(blog._id)}
              className="px-3 py-1 rounded text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: blog.published ? `${colors.warning}15` : `${colors.success}15`,
                color: blog.published ? colors.warning : colors.success
              }}
            >
              {blog.published ? 'Unpublish' : 'Publish'}
            </button>
            <button
              onClick={() => toggleBlogFeatured(blog._id)}
              className="px-3 py-1 rounded text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: `${colors.secondary}15`,
                color: colors.secondary
              }}
            >
              {blog.featured ? '★ Featured' : '☆ Feature'}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBlogEdit(blog)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <Edit2 size={16} style={{ color: colors.primary }} />
            </button>
            <button
              onClick={() => handleBlogDelete(blog._id)}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} style={{ color: colors.error }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const HistoryCard = ({ history }) => (
    <div className="bg-white rounded-xl shadow-md border hover:shadow-lg transition-shadow" style={{ borderColor: colors.border }}>
      <div className="p-6">
        {/* Images Preview */}
        {history.images && history.images.length > 0 && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 gap-2">
              <img src={history.images[0]} alt={history.title} className="w-full h-32 object-cover rounded-lg" />
              {history.images[1] && (
                <img src={history.images[1]} alt={history.title} className="w-full h-32 object-cover rounded-lg" />
              )}
            </div>
            {history.images.length > 2 && (
              <p className="text-xs mt-2 text-center" style={{ color: colors.lightText }}>
                +{history.images.length - 2} more images
              </p>
            )}
          </div>
        )}

        {/* Title and Location */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>
              {history.title}
            </h3>
            <div className="flex items-center space-x-2 mb-2">
              <MapPin size={14} style={{ color: colors.primary }} />
              <span className="text-sm font-semibold" style={{ color: colors.primary }}>
                {history.location}
              </span>
            </div>
          </div>
          <div className="flex flex-col space-y-1 ml-2">
            <span 
              className="px-2 py-1 rounded-full text-xs font-semibold text-center"
              style={{ 
                backgroundColor: history.isActive ? `${colors.success}15` : `${colors.error}15`,
                color: history.isActive ? colors.success : colors.error
              }}
            >
              {history.isActive ? 'Active' : 'Inactive'}
            </span>
            {history.featured && (
              <span 
                className="px-2 py-1 rounded-full text-xs font-semibold text-center"
                style={{ 
                  backgroundColor: `${colors.secondary}15`,
                  color: colors.secondary
                }}
              >
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm mb-4" style={{ color: colors.lightText }}>
          {history.description.substring(0, 120)}{history.description.length > 120 ? '...' : ''}
        </p>

        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <Image size={14} style={{ color: colors.lightText }} />
            <span className="text-xs" style={{ color: colors.lightText }}>
              {history.images?.length || 0} images
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Eye size={14} style={{ color: colors.lightText }} />
            <span className="text-xs" style={{ color: colors.lightText }}>{history.views} views</span>
          </div>
          {history.videoLink && (
            <div className="flex items-center space-x-2 col-span-2">
              <Video size={14} style={{ color: colors.secondary }} />
              <span className="text-xs" style={{ color: colors.secondary }}>Video Available</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: colors.border }}>
          <div className="flex space-x-2">
            <button
              onClick={() => toggleHistoryActive(history._id)}
              className="px-3 py-1 rounded text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: history.isActive ? `${colors.error}15` : `${colors.success}15`,
                color: history.isActive ? colors.error : colors.success
              }}
            >
              {history.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => toggleHistoryFeatured(history._id)}
              className="px-3 py-1 rounded text-xs font-semibold hover:opacity-80 transition-opacity"
              style={{ 
                backgroundColor: `${colors.secondary}15`,
                color: colors.secondary
              }}
            >
              {history.featured ? '★ Featured' : '☆ Feature'}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleHistoryEdit(history)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Edit"
            >
              <Edit2 size={16} style={{ color: colors.primary }} />
            </button>
            <button
              onClick={() => handleHistoryDelete(history._id)}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} style={{ color: colors.error }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
          Extras Management
        </h1>
        <p style={{ color: colors.lightText }}>
          Manage coupons, promotions, and other extras
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6 border-b" style={{ borderColor: colors.border }}>
        <button
          onClick={() => setActiveTab('coupons')}
          className="px-6 py-3 font-semibold transition-colors"
          style={{
            color: activeTab === 'coupons' ? colors.primary : colors.lightText,
            borderBottom: activeTab === 'coupons' ? `2px solid ${colors.primary}` : 'none'
          }}
        >
          🎟️ Coupons
        </button>
        <button
          onClick={() => setActiveTab('blogs')}
          className="px-6 py-3 font-semibold transition-colors"
          style={{
            color: activeTab === 'blogs' ? colors.primary : colors.lightText,
            borderBottom: activeTab === 'blogs' ? `2px solid ${colors.primary}` : 'none'
          }}
        >
          📝 Blogs
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className="px-6 py-3 font-semibold transition-colors"
          style={{
            color: activeTab === 'history' ? colors.primary : colors.lightText,
            borderBottom: activeTab === 'history' ? `2px solid ${colors.primary}` : 'none'
          }}
        >
          🏛️ History
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {activeTab === 'coupons' && (
          <>
            <StatCard
              icon={Tag}
              label="Total Coupons"
              value={statistics.total || 0}
              color={colors.primary}
            />
            <StatCard
              icon={CheckCircle}
              label="Active Coupons"
              value={statistics.active || 0}
              color={colors.success}
            />
            <StatCard
              icon={Clock}
              label="Expired"
              value={statistics.expired || 0}
              color={colors.error}
            />
            <StatCard
              icon={TrendingUp}
              label="Unlimited Usage"
              value={statistics.unlimited || 0}
              color={colors.secondary}
            />
          </>
        )}
        {activeTab === 'blogs' && (
          <>
            <StatCard
              icon={BookOpen}
              label="Total Blogs"
              value={statistics.total || 0}
              color={colors.primary}
            />
            <StatCard
              icon={CheckCircle}
              label="Published"
              value={statistics.published || 0}
              color={colors.success}
            />
            <StatCard
              icon={XCircle}
              label="Drafts"
              value={statistics.draft || 0}
              color={colors.warning}
            />
            <StatCard
              icon={Star}
              label="Featured"
              value={statistics.featured || 0}
              color={colors.secondary}
            />
          </>
        )}
        {activeTab === 'history' && (
          <>
            <StatCard
              icon={MapPin}
              label="Total Histories"
              value={statistics.total || 0}
              color={colors.primary}
            />
            <StatCard
              icon={CheckCircle}
              label="Active"
              value={statistics.active || 0}
              color={colors.success}
            />
            <StatCard
              icon={XCircle}
              label="Inactive"
              value={statistics.inactive || 0}
              color={colors.error}
            />
            <StatCard
              icon={Star}
              label="Featured"
              value={statistics.featured || 0}
              color={colors.secondary}
            />
          </>
        )}
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border" style={{ borderColor: colors.border }}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 flex-1">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ 
                borderColor: colors.border,
                focusRing: colors.primary 
              }}
            />
            <select
              value={filters.isActive}
              onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.value }))}
              className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: colors.border }}
            >
              <option value="all">All Status</option>
              {activeTab === 'blogs' ? (
                <>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </>
              ) : (
                <>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </>
              )}
            </select>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{ borderColor: colors.border }}
            >
              <option value="createdAt">Created Date</option>
              {activeTab === 'coupons' && <option value="discountPercentage">Discount %</option>}
              {activeTab === 'coupons' && <option value="usedCount">Usage</option>}
              {activeTab === 'coupons' && <option value="validTo">Expiry Date</option>}
              {activeTab === 'blogs' && <option value="views">Views</option>}
              {activeTab === 'blogs' && <option value="likes">Likes</option>}
              {activeTab === 'history' && <option value="views">Views</option>}
            </select>
          </div>
          <button
            onClick={() => {
              if (activeTab === 'coupons') resetForm();
              else if (activeTab === 'blogs') resetBlogForm();
              else if (activeTab === 'history') resetHistoryForm();
              setShowModal(true);
            }}
            className="px-6 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
            style={{ backgroundColor: colors.primary }}
          >
            <Plus size={20} />
            <span>New {activeTab === 'coupons' ? 'Coupon' : activeTab === 'blogs' ? 'Blog' : 'History'}</span>
          </button>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.primary }}></div>
        </div>
      ) : (
        <>
          {/* Coupons */}
          {activeTab === 'coupons' && (
            coupons.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border" style={{ borderColor: colors.border }}>
                <Tag size={48} className="mx-auto mb-4" style={{ color: colors.lightText }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>No Coupons Found</h3>
                <p className="mb-6" style={{ color: colors.lightText }}>
                  Create your first coupon to start offering discounts
                </p>
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="px-6 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.primary }}
                >
                  Create Coupon
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                  <CouponCard key={coupon._id} coupon={coupon} />
                ))}
              </div>
            )
          )}

          {/* Blogs */}
          {activeTab === 'blogs' && (
            blogs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border" style={{ borderColor: colors.border }}>
                <BookOpen size={48} className="mx-auto mb-4" style={{ color: colors.lightText }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>No Blogs Found</h3>
                <p className="mb-6" style={{ color: colors.lightText }}>
                  Create your first blog post to start sharing stories
                </p>
                <button
                  onClick={() => {
                    resetBlogForm();
                    setShowModal(true);
                  }}
                  className="px-6 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.primary }}
                >
                  Create Blog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(blog => (
                  <BlogCard key={blog._id} blog={blog} />
                ))}
              </div>
            )
          )}

          {/* Histories */}
          {activeTab === 'history' && (
            histories.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border" style={{ borderColor: colors.border }}>
                <MapPin size={48} className="mx-auto mb-4" style={{ color: colors.lightText }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>No History Found</h3>
                <p className="mb-6" style={{ color: colors.lightText }}>
                  Create your first history entry to showcase locations
                </p>
                <button
                  onClick={() => {
                    resetHistoryForm();
                    setShowModal(true);
                  }}
                  className="px-6 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: colors.primary }}
                >
                  Create History
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {histories.map(history => (
                  <HistoryCard key={history._id} history={history} />
                ))}
              </div>
            )
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-6 border-b" style={{ borderColor: colors.border }}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                  {activeTab === 'coupons' && (editingCoupon ? 'Edit Coupon' : 'Create New Coupon')}
                  {activeTab === 'blogs' && (editingBlog ? 'Edit Blog' : 'Create New Blog')}
                  {activeTab === 'history' && (editingHistory ? 'Edit History' : 'Create New History')}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    if (activeTab === 'coupons') resetForm();
                    else if (activeTab === 'blogs') resetBlogForm();
                    else if (activeTab === 'history') resetHistoryForm();
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={24} style={{ color: colors.text }} />
                </button>
              </div>
            </div>

            <form onSubmit={activeTab === 'coupons' ? handleSubmit : activeTab === 'blogs' ? handleBlogSubmit : handleHistorySubmit} className="p-6 space-y-6">
              {activeTab === 'coupons' && (
                <>
              {/* Code */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., WELCOME10"
                  required
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 uppercase"
                  style={{ borderColor: colors.border }}
                />
                <p className="text-xs mt-1" style={{ color: colors.lightText }}>
                  Will be automatically converted to uppercase
                </p>
              </div>

              {/* Discount Percentage */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Discount Percentage *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountPercentage"
                    value={formData.discountPercentage}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    required
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  />
                  <Percent size={20} className="absolute right-4 top-3" style={{ color: colors.lightText }} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the coupon"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                />
              </div>

              {/* Validity Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    Valid From *
                  </label>
                  <input
                    type="date"
                    name="validFrom"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    Valid To *
                  </label>
                  <input
                    type="date"
                    name="validTo"
                    value={formData.validTo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  />
                </div>
              </div>

              {/* Usage Limit */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Usage Limit
                </label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Leave empty for unlimited"
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                />
              </div>

              {/* Min & Max Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                    Max Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="No cap"
                    className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  />
                </div>
              </div>

              {/* Applicable To */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                  Applicable To
                </label>
                <select
                  name="applicableToType"
                  value={formData.applicableToType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                >
                  <option value="all">All Tours & Treks</option>
                  <option value="tour">Tours Only</option>
                  <option value="trek">Treks Only</option>
                </select>
              </div>

              {/* Is Active */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded"
                  style={{ accentColor: colors.primary }}
                />
                <label className="text-sm font-semibold" style={{ color: colors.text }}>
                  Active (Users can apply this coupon)
                </label>
              </div>

              </>
              )}

              {/* BLOG FORM */}
              {activeTab === 'blogs' && (
                <>
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Title *</label>
                    <input type="text" name="title" value={blogFormData.title} onChange={handleBlogInputChange} required
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Subtitle</label>
                    <input type="text" name="subtitle" value={blogFormData.subtitle} onChange={handleBlogInputChange}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Category & Author */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Category *</label>
                      <select name="category" value={blogFormData.category} onChange={handleBlogInputChange} required
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }}>
                        <option value="Travel Tips">Travel Tips</option>
                        <option value="Destinations">Destinations</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Culture">Culture</option>
                        <option value="Food">Food</option>
                        <option value="Trekking">Trekking</option>
                        <option value="Wildlife">Wildlife</option>
                        <option value="Photography">Photography</option>
                        <option value="Budget Travel">Budget Travel</option>
                        <option value="Luxury Travel">Luxury Travel</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Author *</label>
                      <input type="text" name="author" value={blogFormData.author} onChange={handleBlogInputChange} required
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Excerpt * (max 500 chars)</label>
                    <textarea name="excerpt" value={blogFormData.excerpt} onChange={handleBlogInputChange} required rows="3" maxLength="500"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Content *</label>
                    <textarea name="content" value={blogFormData.content} onChange={handleBlogInputChange} required rows="8"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Featured Image */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Featured Image URL *</label>
                    <input type="url" name="featuredImage" value={blogFormData.featuredImage} onChange={handleBlogInputChange} required
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Tags & Read Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Tags (comma-separated)</label>
                      <input type="text" name="tags" value={blogFormData.tags} onChange={handleBlogInputChange} placeholder="travel, adventure, nepal"
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Read Time (minutes)</label>
                      <input type="number" name="readTime" value={blogFormData.readTime} onChange={handleBlogInputChange} min="1"
                        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Meta Description (SEO, max 160 chars)</label>
                    <textarea name="metaDescription" value={blogFormData.metaDescription} onChange={handleBlogInputChange} rows="2" maxLength="160"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Meta Keywords */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Meta Keywords (comma-separated)</label>
                    <input type="text" name="metaKeywords" value={blogFormData.metaKeywords} onChange={handleBlogInputChange}
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Flags */}
                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" name="featured" checked={blogFormData.featured} onChange={handleBlogInputChange}
                        className="w-5 h-5 rounded" style={{ accentColor: colors.primary }} />
                      <label className="text-sm font-semibold" style={{ color: colors.text }}>Featured</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" name="published" checked={blogFormData.published} onChange={handleBlogInputChange}
                        className="w-5 h-5 rounded" style={{ accentColor: colors.primary }} />
                      <label className="text-sm font-semibold" style={{ color: colors.text }}>Published</label>
                    </div>
                  </div>
                </>
              )}

              {/* HISTORY FORM */}
              {activeTab === 'history' && (
                <>
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Title * (max 200 chars)</label>
                    <input type="text" name="title" value={historyFormData.title} onChange={handleHistoryInputChange} required maxLength="200"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Location *</label>
                    <input type="text" name="location" value={historyFormData.location} onChange={handleHistoryInputChange} required
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Description *</label>
                    <textarea name="description" value={historyFormData.description} onChange={handleHistoryInputChange} required rows="3"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Content *</label>
                    <textarea name="content" value={historyFormData.content} onChange={handleHistoryInputChange} required rows="8"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>Images (comma-separated URLs, max 5)</label>
                    <input type="text" name="images" value={historyFormData.images} onChange={handleHistoryInputChange}
                      placeholder="url1, url2, url3"
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                    <p className="text-xs mt-1" style={{ color: colors.lightText }}>Maximum 5 images allowed</p>
                  </div>

                  {/* Video Link */}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>YouTube Video Link</label>
                    <input type="url" name="videoLink" value={historyFormData.videoLink} onChange={handleHistoryInputChange}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2" style={{ borderColor: colors.border }} />
                  </div>

                  {/* Flags */}
                  <div className="flex space-x-6">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" name="featured" checked={historyFormData.featured} onChange={handleHistoryInputChange}
                        className="w-5 h-5 rounded" style={{ accentColor: colors.primary }} />
                      <label className="text-sm font-semibold" style={{ color: colors.text }}>Featured</label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" name="isActive" checked={historyFormData.isActive} onChange={handleHistoryInputChange}
                        className="w-5 h-5 rounded" style={{ accentColor: colors.primary }} />
                      <label className="text-sm font-semibold" style={{ color: colors.text }}>Active</label>
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    if (activeTab === 'coupons') resetForm();
                    else if (activeTab === 'blogs') resetBlogForm();
                    else if (activeTab === 'history') resetHistoryForm();
                  }}
                  className="flex-1 px-6 py-3 rounded-lg font-semibold border hover:bg-gray-50 transition-colors"
                  style={{ 
                    borderColor: colors.border,
                    color: colors.text 
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? 'Saving...' : (
                    activeTab === 'coupons' ? (editingCoupon ? 'Update Coupon' : 'Create Coupon') :
                    activeTab === 'blogs' ? (editingBlog ? 'Update Blog' : 'Create Blog') :
                    (editingHistory ? 'Update History' : 'Create History')
                  )}
                </button>
              </div>
              
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtrasManagement;
