import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showSuccess, showError } from '../utils/toast';
import { API_BASE_URL } from '../api/api';

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedTestimonials, setSelectedTestimonials] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Color palette
  const colors = {
    primary: "#1E9ABF",      // Main blue
    secondary: "#E66926",    // Orange accent
    background: "#F8FAFC",   // Light background
    cardBg: "#FFFFFF",       // White cards
    text: "#1F2937",         // Dark text
    lightText: "#6B7280",    // Light text
    border: "#E5E7EB",       // Borders
    success: "#059669",      // Success green
    warning: "#D97706",      // Warning amber
    error: "#DC2626",        // Error red
    accentLight: "#FEF6EE",  // Light orange background
    accentBlue: "#EFF6FF",   // Light blue background
  };

  useEffect(() => {
    fetchTestimonials();
  }, [statusFilter, featuredFilter, verifiedFilter, currentPage]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (featuredFilter !== 'all') params.append('isFeatured', featuredFilter);
      if (verifiedFilter !== 'all') params.append('isVerified', verifiedFilter);
      params.append('page', currentPage);
      params.append('limit', 20);
      params.append('sortBy', 'createdAt');
      params.append('order', 'desc');

      const response = await axios.get(
        `${API_BASE_URL}/admin/testimonials?${params.toString()}`
      );

      if (response.data.success) {
        setTestimonials(response.data.testimonials);
        setStatistics(response.data.statistics);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch testimonials');
      showError('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (testimonialId, newStatus, notes = '') => {
    try {
      setActionLoading(testimonialId);
      const response = await axios.patch(
        `${API_BASE_URL}/admin/testimonials/${testimonialId}/status`,
        { 
          status: newStatus,
          ...(notes && { adminNotes: notes })
        }
      );

      if (response.data.success) {
        setSuccessMessage(`✅ Testimonial ${newStatus.toLowerCase()} successfully!`);
        fetchTestimonials();
        showSuccess('Testimonial status updated');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update testimonial status');
      setTimeout(() => setError(''), 5000);
      showError('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleFeatured = async (testimonialId, currentFeatured) => {
    try {
      setActionLoading(`feature-${testimonialId}`);
      const response = await axios.patch(
        `${API_BASE_URL}/admin/testimonials/${testimonialId}/status`,
        { isFeatured: !currentFeatured }
      );

      if (response.data.success) {
        setSuccessMessage(`⭐ Testimonial ${!currentFeatured ? 'featured' : 'unfeatured'} successfully!`);
        fetchTestimonials();
        showSuccess('Featured status updated');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update featured status');
      setTimeout(() => setError(''), 5000);
      showError('Failed to update featured status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerified = async (testimonialId, currentVerified) => {
    try {
      setActionLoading(`verify-${testimonialId}`);
      const response = await axios.patch(
        `${API_BASE_URL}/admin/testimonials/${testimonialId}/status`,
        { isVerified: !currentVerified }
      );

      if (response.data.success) {
        setSuccessMessage(`✓ Testimonial ${!currentVerified ? 'verified' : 'unverified'} successfully!`);
        fetchTestimonials();
        showSuccess('Verification status updated');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update verification status');
      setTimeout(() => setError(''), 5000);
      showError('Failed to update verification');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (testimonialId, testimonialName) => {
    if (!window.confirm(`Are you sure you want to delete "${testimonialName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(`delete-${testimonialId}`);
      const response = await axios.delete(
        `${API_BASE_URL}/admin/testimonials/${testimonialId}`
      );

      if (response.data.success) {
        setSuccessMessage('🗑️ Testimonial deleted successfully!');
        fetchTestimonials();
        showSuccess('Testimonial deleted successfully');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete testimonial');
      setTimeout(() => setError(''), 5000);
      showError('Failed to delete testimonial');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedTestimonials.length === 0) {
      setError('Please select at least one testimonial');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const actionText = {
      'approve': 'approve',
      'reject': 'reject', 
      'feature': 'feature',
      'unfeature': 'unfeature',
      'delete': 'delete'
    }[action];

    if (!window.confirm(`Are you sure you want to ${actionText} ${selectedTestimonials.length} testimonial(s)?`)) {
      return;
    }

    try {
      setActionLoading('bulk');
      const response = await axios.patch(
        'http://localhost:5000/api/admin/testimonials/bulk-update',
        { 
          action,
          ids: selectedTestimonials 
        }
      );

      if (response.data.success) {
        setSuccessMessage(`✅ ${response.data.message}`);
        setSelectedTestimonials([]);
        fetchTestimonials();
        showSuccess('Bulk action completed');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to perform bulk action');
      setTimeout(() => setError(''), 5000);
      showError('Failed to perform bulk action');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTestimonials(filteredTestimonials.map(t => t._id));
    } else {
      setSelectedTestimonials([]);
    }
  };

  const handleSelectOne = (testimonialId) => {
    setSelectedTestimonials(prev => 
      prev.includes(testimonialId)
        ? prev.filter(id => id !== testimonialId)
        : [...prev, testimonialId]
    );
  };

  const handleViewDetails = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setAdminNotes(testimonial.adminNotes || '');
    setShowDetailsModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedTestimonial) return;

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/testimonials/${selectedTestimonial._id}/status`,
        { adminNotes }
      );

      if (response.data.success) {
        setSuccessMessage('📝 Admin notes saved successfully!');
        fetchTestimonials();
        setShowDetailsModal(false);
        showSuccess('Admin notes saved');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save admin notes');
      setTimeout(() => setError(''), 5000);
      showError('Failed to save notes');
    }
  };

  // Filter testimonials based on search term
  const filteredTestimonials = (testimonials || []).filter(testimonial =>
    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (testimonial.message && testimonial.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (testimonial.tourName && testimonial.tourName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return { bg: '#F0FDF4', text: '#059669', border: '#05966940' };
      case 'Rejected':
        return { bg: '#FEF2F2', text: colors.error, border: colors.error + '40' };
      case 'Pending':
        return { bg: '#FFFBEB', text: colors.warning, border: colors.warning + '40' };
      default:
        return { bg: '#F9FAFB', text: colors.lightText, border: colors.border };
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          <span 
            key={index} 
            className={`text-base ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const colors = getStatusColor(status);
    return (
      <span 
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border"
        style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }}
      >
        <span 
          className="w-1.5 h-1.5 rounded-full mr-1.5"
          style={{ backgroundColor: colors.text }}
        ></span>
        {status}
      </span>
    );
  };

  const StatCard = ({ title, value, subtitle, icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border p-4 transition-all duration-300 hover:shadow-md" style={{ borderColor: colors.border }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: colors.lightText }}>{title}</p>
          <p className="text-xl font-bold mb-1" style={{ color: colors.text }}>{value}</p>
          {subtitle && <p className="text-xs" style={{ color: colors.lightText }}>{subtitle}</p>}
        </div>
        <div className="p-2 rounded" style={{ backgroundColor: color || colors.accentBlue }}>
          <div style={{ color: colors.primary }} className="text-lg">{icon}</div>
        </div>
      </div>
    </div>
  );

  if (loading && testimonials.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: colors.primary }}
          ></div>
          <p className="font-medium mb-2" style={{ color: colors.text }}>Loading testimonials...</p>
          <p className="text-sm" style={{ color: colors.lightText }}>Fetching customer feedback and reviews</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6" style={{ backgroundColor: colors.background }}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
            Testimonials Management
          </h1>
          <p className="text-base" style={{ color: colors.lightText }}>
            Manage customer feedback, approve submissions, and showcase amazing reviews
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <span className="text-sm px-3 py-1 rounded" style={{ backgroundColor: colors.accentBlue, color: colors.primary }}>
            📊 {statistics?.total || 0} Total Reviews
          </span>
        </div>
      </div>

      {/* Success & Error Messages */}
      {successMessage && (
        <div className="rounded-lg p-4 flex items-center animate-pulse" style={{ backgroundColor: '#F0FDF4', border: '1px solid #05966940' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#05966920' }}>
            <span className="text-sm" style={{ color: '#059669' }}>✓</span>
          </div>
          <span className="flex-1 text-sm font-medium" style={{ color: '#059669' }}>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage('')}
            style={{ color: '#059669' }}
            className="hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg p-4 flex items-center" style={{ backgroundColor: '#FEF2F2', border: '1px solid #DC262640' }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#DC262620' }}>
            <span className="text-sm" style={{ color: colors.error }}>!</span>
          </div>
          <span className="flex-1 text-sm font-medium" style={{ color: colors.error }}>{error}</span>
          <button 
            onClick={() => setError('')}
            style={{ color: colors.error }}
            className="hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Reviews" 
          value={statistics?.total || 0}
          subtitle="All customer feedback"
          icon="💬"
          color={colors.accentBlue}
        />
        <StatCard 
          title="Pending" 
          value={statistics?.pending || 0}
          subtitle="Awaiting approval"
          icon="🟡"
          color="#FFFBEB"
        />
        <StatCard 
          title="Approved" 
          value={statistics?.approved || 0}
          subtitle="Live on website"
          icon="🟢"
          color="#F0FDF4"
        />
        <StatCard 
          title="Featured" 
          value={statistics?.featured || 0}
          subtitle="Highlighted reviews"
          icon="⭐"
          color="#FEF6EE"
        />
        <StatCard 
          title="Avg Rating" 
          value={(Number(statistics?.averageRating) || 0).toFixed(1)}
          subtitle="Out of 5 stars"
          icon="⭐"
          color="#FFFBEB"
        />
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: colors.border }}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold mb-2" style={{ color: colors.text }}>🔍 Search Testimonials</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.lightText }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name, email, message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border rounded-lg focus:ring-1 w-full transition-all text-sm"
                style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: colors.text }}>📊 Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-1 transition-all text-sm"
              style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
            >
              <option value="all">All Status</option>
              <option value="Pending">🟡 Pending</option>
              <option value="Approved">🟢 Approved</option>
              <option value="Rejected">🔴 Rejected</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: colors.text }}>⭐ Featured</label>
            <select
              value={featuredFilter}
              onChange={(e) => {
                setFeaturedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-1 transition-all text-sm"
              style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
            >
              <option value="all">All</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>

          {/* Verified Filter */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: colors.text }}>✓ Verified</label>
            <select
              value={verifiedFilter}
              onChange={(e) => {
                setVerifiedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border rounded-lg focus:ring-1 transition-all text-sm"
              style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
            >
              <option value="all">All</option>
              <option value="true">Verified Only</option>
              <option value="false">Not Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTestimonials.length > 0 && (
        <div className="rounded-lg p-4" style={{ backgroundColor: colors.accentBlue, border: `1px solid ${colors.primary}40` }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            <p className="text-sm font-semibold flex items-center" style={{ color: colors.text }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2" style={{ backgroundColor: colors.primary, color: 'white' }}>
                {selectedTestimonials.length}
              </span>
              {selectedTestimonials.length} testimonial(s) selected
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction('approve')}
                disabled={actionLoading === 'bulk'}
                className="inline-flex items-center px-3 py-1.5 text-white rounded-lg transition-all disabled:opacity-50 font-medium text-sm"
                style={{ backgroundColor: '#059669' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
              >
                {actionLoading === 'bulk' ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                ) : (
                  '✓'
                )}
                Approve Selected
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                disabled={actionLoading === 'bulk'}
                className="inline-flex items-center px-3 py-1.5 text-white rounded-lg transition-all disabled:opacity-50 font-medium text-sm"
                style={{ backgroundColor: colors.error }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#B91C1C'}
                onMouseOut={(e) => e.target.style.backgroundColor = colors.error}
              >
                {actionLoading === 'bulk' ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                ) : (
                  '✗'
                )}
                Reject Selected
              </button>
              <button
                onClick={() => handleBulkAction('feature')}
                disabled={actionLoading === 'bulk'}
                className="inline-flex items-center px-3 py-1.5 text-white rounded-lg transition-all disabled:opacity-50 font-medium text-sm"
                style={{ backgroundColor: colors.secondary }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#C2410C'}
                onMouseOut={(e) => e.target.style.backgroundColor = colors.secondary}
              >
                ⭐ Feature Selected
              </button>
              <button
                onClick={() => setSelectedTestimonials([])}
                className="inline-flex items-center px-3 py-1.5 border rounded-lg transition-all font-medium text-sm"
                style={{ borderColor: colors.border, color: colors.text, backgroundColor: 'white' }}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: colors.border }}>
        {filteredTestimonials.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.background }}>
              <span className="text-2xl" style={{ color: colors.lightText }}>💬</span>
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>No testimonials found</h3>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: colors.lightText }}>
              {searchTerm || statusFilter !== 'all' || featuredFilter !== 'all' || verifiedFilter !== 'all'
                ? "No testimonials match your current filters. Try adjusting your search criteria."
                : "No testimonials available yet. Customer reviews will appear here once submitted."
              }
            </p>
            {(searchTerm || statusFilter !== 'all' || featuredFilter !== 'all' || verifiedFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setFeaturedFilter('all');
                  setVerifiedFilter('all');
                }}
                className="inline-flex items-center px-4 py-2 text-white rounded-lg transition-all font-medium text-sm"
                style={{ backgroundColor: colors.primary }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1A87A9'}
                onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ divideColor: colors.border }}>
              <thead>
                <tr style={{ backgroundColor: colors.background }}>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTestimonials.length === filteredTestimonials.length && filteredTestimonials.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 h-4 w-4"
                      style={{ color: colors.primary }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.lightText }}>
                    Customer & Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.lightText }}>
                    Review Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.lightText }}>
                    Status & Flags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.lightText }}>
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: colors.lightText }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y" style={{ divideColor: colors.border }}>
                {filteredTestimonials.map((testimonial) => (
                  <tr key={testimonial._id} className="hover:bg-gray-50 transition-all duration-200">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTestimonials.includes(testimonial._id)}
                        onChange={() => handleSelectOne(testimonial._id)}
                        className="rounded border-gray-300 h-4 w-4"
                        style={{ color: colors.primary }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.primary }}>
                            {testimonial.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold" style={{ color: colors.text }}>{testimonial.name}</h3>
                          <p className="text-xs mt-0.5" style={{ color: colors.lightText }}>{testimonial.email}</p>
                          <div className="mt-1.5">
                            {renderStars(testimonial.rating)}
                            <span className="text-xs ml-1.5" style={{ color: colors.lightText }}>{testimonial.rating}/5</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-md">
                        <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: colors.text }}>
                          {testimonial.message}
                        </p>
                        {testimonial.tourName && (
                          <div className="mt-1.5 flex items-center text-xs">
                            <span className="px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.accentBlue, color: colors.primary }}>
                              🏖️ {testimonial.tourName}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1.5">
                        <StatusBadge status={testimonial.status} />
                        <div className="flex flex-wrap gap-1">
                          {testimonial.isFeatured && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border" style={{ backgroundColor: colors.accentLight, color: colors.secondary, borderColor: colors.secondary + '40' }}>
                              ⭐ Featured
                            </span>
                          )}
                          {testimonial.isVerified && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border" style={{ backgroundColor: '#F0FDF4', color: '#059669', borderColor: '#05966940' }}>
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: colors.lightText }}>
                      <div className="text-center">
                        <div className="font-medium" style={{ color: colors.text }}>
                          {new Date(testimonial.createdAt).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-xs mt-0.5">
                          {new Date(testimonial.createdAt).toLocaleTimeString('en-IN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col space-y-1.5 items-end">
                        {/* Quick Actions for Pending */}
                        {testimonial.status === 'Pending' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleStatusUpdate(testimonial._id, 'Approved')}
                              disabled={actionLoading === testimonial._id}
                              className="inline-flex items-center p-1.5 text-white rounded transition-all disabled:opacity-50 text-xs"
                              style={{ backgroundColor: '#059669' }}
                              title="Approve"
                            >
                              {actionLoading === testimonial._id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                '✓'
                              )}
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(testimonial._id, 'Rejected')}
                              disabled={actionLoading === testimonial._id}
                              className="inline-flex items-center p-1.5 text-white rounded transition-all disabled:opacity-50 text-xs"
                              style={{ backgroundColor: colors.error }}
                              title="Reject"
                            >
                              {actionLoading === testimonial._id ? (
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                '✗'
                              )}
                            </button>
                          </div>
                        )}
                        
                        {/* Additional Actions */}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleToggleFeatured(testimonial._id, testimonial.isFeatured)}
                            disabled={actionLoading === `feature-${testimonial._id}`}
                            className={`inline-flex items-center p-1.5 rounded transition-all disabled:opacity-50 text-xs ${
                              testimonial.isFeatured 
                                ? 'text-white' 
                                : 'text-gray-600'
                            }`}
                            style={{ 
                              backgroundColor: testimonial.isFeatured ? colors.secondary : colors.background 
                            }}
                            title={testimonial.isFeatured ? 'Unfeature' : 'Feature'}
                          >
                            ⭐
                          </button>
                          <button
                            onClick={() => handleToggleVerified(testimonial._id, testimonial.isVerified)}
                            disabled={actionLoading === `verify-${testimonial._id}`}
                            className={`inline-flex items-center p-1.5 rounded transition-all disabled:opacity-50 text-xs ${
                              testimonial.isVerified 
                                ? 'text-white' 
                                : 'text-gray-600'
                            }`}
                            style={{ 
                              backgroundColor: testimonial.isVerified ? '#059669' : colors.background 
                            }}
                            title={testimonial.isVerified ? 'Unverify' : 'Verify'}
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleViewDetails(testimonial)}
                            className="inline-flex items-center p-1.5 text-white rounded transition-all text-xs"
                            style={{ backgroundColor: colors.primary }}
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDelete(testimonial._id, testimonial.name)}
                            disabled={actionLoading === `delete-${testimonial._id}`}
                            className="inline-flex items-center p-1.5 text-white rounded transition-all disabled:opacity-50 text-xs"
                            style={{ backgroundColor: colors.error }}
                            title="Delete"
                          >
                            {actionLoading === `delete-${testimonial._id}` ? (
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              '🗑️'
                            )}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination?.totalPages > 1 && (
          <div className="px-4 py-3 border-t" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
              <div className="text-sm" style={{ color: colors.text }}>
                <span className="font-semibold">Page {pagination?.currentPage}</span> of{' '}
                <span className="font-semibold">{pagination?.totalPages}</span> •{' '}
                <span className="font-semibold">{pagination?.totalItems}</span> total testimonials
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={!pagination?.hasPrevPage}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    pagination?.hasPrevPage
                      ? 'text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: pagination?.hasPrevPage ? colors.primary : undefined }}
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination?.totalPages || 1, prev + 1))}
                  disabled={!pagination?.hasNextPage}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    pagination?.hasNextPage
                      ? 'text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  style={{ backgroundColor: pagination?.hasNextPage ? colors.primary : undefined }}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                  Testimonial Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-1.5 rounded transition-colors hover:bg-gray-100"
                  style={{ color: colors.lightText }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column - Customer Info */}
                <div className="space-y-4">
                  <div className="rounded-lg p-4 border" style={{ borderColor: colors.border, backgroundColor: colors.accentBlue }}>
                    <h3 className="text-base font-semibold mb-3" style={{ color: colors.text }}>Customer Information</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.lightText }}>Name</label>
                        <p className="text-sm font-medium" style={{ color: colors.text }}>{selectedTestimonial.name}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.lightText }}>Email</label>
                        <p className="text-sm" style={{ color: colors.text }}>{selectedTestimonial.email}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.lightText }}>Rating</label>
                        <div className="flex items-center space-x-2">
                          {renderStars(selectedTestimonial.rating)}
                          <span className="text-sm font-semibold" style={{ color: colors.text }}>
                            {selectedTestimonial.rating}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg p-4 border" style={{ borderColor: colors.border, backgroundColor: '#F0FDF4' }}>
                    <h3 className="text-base font-semibold mb-3" style={{ color: colors.text }}>Review Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium" style={{ color: colors.lightText }}>Status</span>
                        <StatusBadge status={selectedTestimonial.status} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium" style={{ color: colors.lightText }}>Featured</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          selectedTestimonial.isFeatured 
                            ? 'text-white' 
                            : 'text-gray-600'
                        }`}
                        style={{ 
                          backgroundColor: selectedTestimonial.isFeatured ? colors.secondary : colors.background,
                          borderColor: selectedTestimonial.isFeatured ? colors.secondary + '40' : colors.border
                        }}>
                          {selectedTestimonial.isFeatured ? '⭐ Featured' : 'Not Featured'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium" style={{ color: colors.lightText }}>Verified</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          selectedTestimonial.isVerified 
                            ? 'text-white' 
                            : 'text-gray-600'
                        }`}
                        style={{ 
                          backgroundColor: selectedTestimonial.isVerified ? '#059669' : colors.background,
                          borderColor: selectedTestimonial.isVerified ? '#05966940' : colors.border
                        }}>
                          {selectedTestimonial.isVerified ? '✓ Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Message & Actions */}
                <div className="space-y-4">
                  <div className="rounded-lg p-4 border" style={{ borderColor: colors.border, backgroundColor: '#FFFBEB' }}>
                    <h3 className="text-base font-semibold mb-3" style={{ color: colors.text }}>Review Details</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.lightText }}>Tour/Trek</label>
                        <p className="text-sm" style={{ color: colors.text }}>
                          {selectedTestimonial.tourName || 'Not specified'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.lightText }}>Message</label>
                        <div className="mt-1 p-3 rounded border" style={{ backgroundColor: 'white', borderColor: colors.border }}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: colors.text }}>
                            {selectedTestimonial.message}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: colors.lightText }}>Submitted</label>
                        <p className="text-sm" style={{ color: colors.text }}>
                          {new Date(selectedTestimonial.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'full',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg p-4 border" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
                    <h3 className="text-base font-semibold mb-3" style={{ color: colors.text }}>Admin Notes</h3>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all text-sm"
                      style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
                      placeholder="Add internal notes about this testimonial (only visible to admins)..."
                    />
                    <div className="flex justify-end space-x-2 mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
                      <button
                        onClick={() => setShowDetailsModal(false)}
                        className="px-3 py-1.5 border rounded-lg text-sm font-medium transition-all"
                        style={{ borderColor: colors.border, color: colors.text, backgroundColor: 'white' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="px-3 py-1.5 text-white rounded-lg transition-all font-medium text-sm"
                        style={{ backgroundColor: colors.primary }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1A87A9'}
                        onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
                      >
                        💾 Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManagement;