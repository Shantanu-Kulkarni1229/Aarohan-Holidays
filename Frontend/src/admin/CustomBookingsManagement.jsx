import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/api';
import { showSuccess, showError } from '../utils/toast';
import {
  Plus, Search, Filter, Eye, Edit, Trash2, Send, Calendar,
  DollarSign, User, Package, CheckCircle2, Clock, XCircle,
  Download, RefreshCw, TrendingUp, Users, Mail, Phone
} from 'lucide-react';

const CustomBookingsManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    byStatus: {}
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    packageType: '',
    paymentStatus: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalBookings: 0
  });

  const colors = {
    primary: "#E66926",
    secondary: "#1E9ABF",
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    textDark: "#334155",
    border: "#E2E8F0"
  };

  const statusColors = {
    'Quote Sent': 'bg-blue-100 text-blue-700',
    'Payment Pending': 'bg-yellow-100 text-yellow-700',
    'Confirmed': 'bg-green-100 text-green-700',
    'Completed': 'bg-purple-100 text-purple-700',
    'Cancelled': 'bg-red-100 text-red-700'
  };

  const paymentStatusColors = {
    'Pending': 'bg-gray-100 text-gray-700',
    'Partial': 'bg-orange-100 text-orange-700',
    'Paid': 'bg-green-100 text-green-700',
    'Refunded': 'bg-red-100 text-red-700'
  };

  useEffect(() => {
    fetchBookings();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.page]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await axios.get(
        `${API_BASE_URL}/custom-bookings?${params}`
      );

      if (response.data.success) {
        setBookings(response.data.data);
        setPagination(prev => ({
          ...prev,
          totalPages: response.data.pagination.totalPages,
          totalBookings: response.data.pagination.totalBookings
        }));
      }
    } catch (error) {
      showError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/custom-bookings/stats`
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      // Stats are optional, silently fail
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/custom-bookings/${id}`);
      fetchBookings();
      fetchStats();
      showSuccess('Booking deleted successfully');
    } catch (error) {
      showError('Failed to delete booking');
    }
  };

  const handleResend = async (id) => {
    if (!window.confirm('Resend this booking to the customer?')) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/custom-bookings/${id}/resend`
      );

      if (response.data.success) {
        showSuccess('Booking resent successfully!');
        fetchBookings();
      }
    } catch (error) {
      showError('Failed to resend booking');
    }
  };

  const handlePaymentStatusUpdate = async (id, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/custom-bookings/${id}/payment`,
        { paymentStatus: newStatus }
      );

      if (response.data.success) {
        fetchBookings();
        fetchStats();
        showSuccess('Payment status updated successfully');
      }
    } catch (error) {
      showError('Failed to update payment status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.lightBg }}>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
            Custom Bookings Management
          </h1>
          <p className="text-gray-600">
            Manage personalized tour and trek packages
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/custom-bookings/create')}
          className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all"
          style={{ backgroundColor: colors.primary }}
        >
          <Plus className="mr-2" size={20} />
          Create New Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold" style={{ color: colors.textDark }}>
                {stats.totalBookings}
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: colors.lightBg }}>
              <Package size={32} style={{ color: colors.primary }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.totalRevenue || 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp size={32} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Revenue</p>
              <p className="text-3xl font-bold text-orange-600">
                {formatCurrency(stats.pendingRevenue || 0)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Clock size={32} className="text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.byStatus?.Confirmed || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <CheckCircle2 size={32} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg border p-6 mb-6" style={{ borderColor: colors.border }}>
        <div className="flex items-center mb-4">
          <Filter className="mr-2" style={{ color: colors.primary }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.textDark }}>
            Filters
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Name, email, package..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Package Type</label>
            <select
              value={filters.packageType}
              onChange={(e) => setFilters({ ...filters, packageType: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="Tour">Tour</option>
              <option value="Trek">Trek</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="Quote Sent">Quote Sent</option>
              <option value="Payment Pending">Payment Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Payment Status</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setFilters({ status: '', packageType: '', paymentStatus: '', search: '' });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 text-sm rounded-lg border transition-all hover:bg-gray-50"
          >
            <RefreshCw size={16} className="inline mr-2" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-lg border" style={{ borderColor: colors.border }}>
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <h3 className="text-lg font-semibold" style={{ color: colors.textDark }}>
            All Custom Bookings ({pagination.totalBookings})
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="mx-auto mb-4 animate-spin" size={48} style={{ color: colors.primary }} />
            <p className="text-gray-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="mx-auto mb-4 text-gray-400" size={64} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
            <p className="text-gray-500 mb-6">Create your first custom booking to get started</p>
            <button
              onClick={() => navigate('/admin/custom-bookings/create')}
              className="inline-flex items-center px-6 py-3 rounded-lg text-white font-semibold"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus className="mr-2" size={20} />
              Create New Booking
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b" style={{ borderColor: colors.border }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Travel Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: colors.border }}>
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold"
                               style={{ backgroundColor: colors.secondary }}>
                            {booking.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customerName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail size={12} className="mr-1" />
                              {booking.customerEmail}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Phone size={12} className="mr-1" />
                              {booking.customerPhone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.packageName}</div>
                        <div className="text-sm text-gray-500">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            booking.packageType === 'Tour' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {booking.packageType}
                          </span>
                          <span className="ml-2">{booking.duration}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {booking.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar size={14} className="mr-2 text-gray-400" />
                          {formatDate(booking.startDate)}
                        </div>
                        {booking.endDate && (
                          <div className="text-xs text-gray-500 ml-6">
                            to {formatDate(booking.endDate)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold" style={{ color: colors.primary }}>
                          {formatCurrency(booking.pricing.totalAmount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          <Users size={12} className="inline mr-1" />
                          {(booking.pricing.adults + booking.pricing.women + booking.pricing.children + booking.pricing.infants)} travelers
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={booking.paymentStatus}
                          onChange={(e) => handlePaymentStatusUpdate(booking._id, e.target.value)}
                          className={`text-xs font-semibold rounded px-2 py-1 border-0 ${paymentStatusColors[booking.paymentStatus]}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Partial">Partial</option>
                          <option value="Paid">Paid</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/admin/custom-bookings/${booking._id}`)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleResend(booking._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Resend Email"
                          >
                            <Send size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-6 border-t flex items-center justify-between" style={{ borderColor: colors.border }}>
                <div className="text-sm text-gray-600">
                  Showing page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomBookingsManagement;
