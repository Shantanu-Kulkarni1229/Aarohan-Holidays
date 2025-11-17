import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../api/api';
import { showSuccess, showError } from '../utils/toast';
import {
  Search,
  Filter,
  Download,
  Eye,
  Mail,
  Trash2,
  Edit3,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Phone,
  User,
  BarChart3,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  MessageCircle,
  CreditCard,
  Shield
} from 'lucide-react';

const BookingsManagement = () => {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [filteredItemId, setFilteredItemId] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookingsPerPage] = useState(20);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    revenue: 0,
    today: 0
  });

  // Offline Booking State
  const [showOfflineBookingForm, setShowOfflineBookingForm] = useState(false);
  const [offlineBookingData, setOfflineBookingData] = useState({
    name: '',
    email: '',
    mobile: '',
    bookingType: 'tour',
    tourId: '',
    trekId: '',
    bookingDate: '',
    amountPaid: ''
  });
  const [availableTours, setAvailableTours] = useState([]);
  const [availableTreks, setAvailableTreks] = useState([]);
  const [creatingOfflineBooking, setCreatingOfflineBooking] = useState(false);

  // Color constants
  const colors = {
    primary: '#1E9ABF',
    secondary: '#E66926',
    background: '#F8FAFC',
    text: '#1F2937',
    textLight: '#6B7280',
    border: '#E5E7EB',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626'
  };

  useEffect(() => {
    const urlType = searchParams.get('type');
    const urlItemId = searchParams.get('itemId');
    
    if (urlType && (urlType === 'tour' || urlType === 'trek')) {
      setTypeFilter(urlType);
    }
    
    if (urlItemId) {
      setFilteredItemId(urlItemId);
    }
    
    fetchBookings();
    fetchToursAndTreks(); // Fetch tours and treks for offline booking
  }, [searchParams]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/admin/bookings`);
      
      if (response.data.success) {
        const bookingsData = response.data.data;
        setBookings(bookingsData);
        
        // Calculate stats
        const today = new Date().toDateString();
        const todayBookings = bookingsData.filter(booking => 
          new Date(booking.createdAt).toDateString() === today
        );

        setStats({
          total: bookingsData.length,
          pending: bookingsData.filter(b => b.bookingStatus === 'pending').length,
          confirmed: bookingsData.filter(b => b.bookingStatus === 'confirmed').length,
          revenue: bookingsData.reduce((sum, b) => sum + (b.amountPaid || 0), 0),
          today: todayBookings.length
        });
      }
    } catch (error) {
      setError('Unable to load bookings data. Please check your connection and try again.');
      showError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available tours and treks for offline booking
  const fetchToursAndTreks = async () => {
    try {
      const [toursResponse, treksResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/tours`),
        axios.get(`${API_BASE_URL}/treks`)
      ]);

      if (toursResponse.data.success) {
        setAvailableTours(toursResponse.data.data);
      }
      if (treksResponse.data.success) {
        setAvailableTreks(treksResponse.data.data);
      }
    } catch (error) {
      // Silently fail - not critical for main functionality
    }
  };

  // Handle offline booking form submission
  const handleOfflineBookingSubmit = async (e) => {
    e.preventDefault();
    setCreatingOfflineBooking(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/admin/bookings/offline`, offlineBookingData);

      if (response.data.success) {
        setSuccessMessage('Offline booking created successfully! Confirmation email sent to customer.');
        setShowOfflineBookingForm(false);
        setOfflineBookingData({
          name: '',
          email: '',
          mobile: '',
          bookingType: 'tour',
          tourId: '',
          trekId: '',
          bookingDate: '',
          amountPaid: ''
        });
        fetchBookings();
        showSuccess('Offline booking created successfully');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create offline booking. Please try again.');
      setTimeout(() => setError(''), 5000);
      showError('Failed to create offline booking');
    } finally {
      setCreatingOfflineBooking(false);
    }
  };

  // Handle offline booking input changes
  const handleOfflineBookingChange = (e) => {
    const { name, value } = e.target;
    setOfflineBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/bookings/${bookingId}/status`,
        { bookingStatus: newStatus }
      );

      if (response.data.success) {
        showSuccess(`Booking status updated to ${newStatus}`);
        fetchBookings();
      }
    } catch (error) {
      setError('Failed to update booking status. Please try again.');
      setTimeout(() => setError(''), 5000);
      showError('Failed to update booking status');
    }
  };

  const handlePaymentStatusUpdate = async (bookingId, newPaymentStatus, booking) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/bookings/${bookingId}/payment`,
        { 
          paymentStatus: newPaymentStatus,
          amountPaid: newPaymentStatus === 'completed' ? booking.totalPrice : booking.amountPaid
        }
      );

      if (response.data.success) {
        showSuccess(`Payment status updated to ${newPaymentStatus}`);
        fetchBookings();
      }
    } catch (error) {
      setError('Failed to update payment status. Please try again.');
      setTimeout(() => setError(''), 5000);
      showError('Failed to update payment status');
    }
  };

  const handleResendConfirmation = async (bookingId) => {
    try {
      setResendingConfirmation(bookingId);
      const response = await axios.post(
        `${API_BASE_URL}/admin/bookings/${bookingId}/resend`
      );

      if (response.data.success) {
        showSuccess('Confirmation email and WhatsApp message sent successfully!');
      }
    } catch (error) {
      setError('Failed to resend confirmation. Please try again.');
      setTimeout(() => setError(''), 5000);
      showError('Failed to resend confirmation');
    } finally {
      setResendingConfirmation(null);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/bookings/${bookingId}`
      );

      if (response.data.success) {
        showSuccess('Booking deleted successfully!');
        fetchBookings();
      }
    } catch (error) {
      setError('Failed to delete booking. Please try again.');
      setTimeout(() => setError(''), 5000);
      showError('Failed to delete booking');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };



  const exportToExcel = () => {
    const exportData = filteredBookings.map(booking => ({
      'Reference': booking.bookingReference,
      'Type': booking.bookingType.toUpperCase(),
      'Item': booking.bookingType === 'tour' 
        ? booking.tourId?.name || 'N/A'
        : booking.trekId?.name || 'N/A',
      'Customer Name': booking.name,
      'Email': booking.email,
      'Mobile': booking.mobile,
      'Pickup City': booking.pickupCity,
      'Members': booking.numberOfMembers,
      'Adults': booking.adults || 0,
      'Women': booking.women || 0,
      'Infants': booking.infants || 0,
      'Booking Date': new Date(booking.bookingDate).toLocaleDateString('en-IN'),
      'Status': booking.bookingStatus.toUpperCase(),
      'Payment Status': booking.paymentStatus.toUpperCase(),
      'Price Per Person': `₹${booking.pricePerPerson}`,
      'Total Price': `₹${booking.totalPrice}`,
      'Amount Paid': `₹${booking.amountPaid}`,
      'Balance': `₹${booking.totalPrice - booking.amountPaid}`,
      'Email Sent': booking.emailSent ? 'Yes' : 'No',
      'WhatsApp Sent': booking.whatsappSent ? 'Yes' : 'No',
      'Special Requests': booking.specialRequests || 'None',
      'Created At': new Date(booking.createdAt).toLocaleString('en-IN'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    const maxWidth = exportData.reduce((w, r) => Math.max(w, ...Object.keys(r).map(k => k.length)), 10);
    worksheet['!cols'] = Object.keys(exportData[0] || {}).map(() => ({ wch: maxWidth }));

    const fileName = `Bookings_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    setSuccessMessage(`Excel file "${fileName}" downloaded successfully!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mobile.includes(searchTerm) ||
      booking.bookingReference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.bookingStatus === statusFilter;
    const matchesType = typeFilter === 'all' || booking.bookingType === typeFilter;
    
    const matchesItem = !filteredItemId || 
      (booking.bookingType === 'tour' && booking.tourId?._id === filteredItemId) ||
      (booking.bookingType === 'trek' && booking.trekId?._id === filteredItemId);
    
    const bookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const matchesDate = 
      dateFilter === 'all' ||
      (dateFilter === 'current' && bookingDate >= now) ||
      (dateFilter === 'previous' && bookingDate < now);

    return matchesSearch && matchesStatus && matchesType && matchesItem && matchesDate;
  });

  // Pagination
  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'partial': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'refunded': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const StatCard = ({ title, value, subtitle, icon, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6 transition-all hover:shadow-md"
         style={{ borderColor: colors.border }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: colors.textLight }}>{title}</p>
          <p className="text-3xl font-bold mb-2" style={{ color: colors.text }}>{value}</p>
          {subtitle && <p className="text-sm" style={{ color: colors.textLight }}>{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {trend > 0 ? '+' : ''}{trend}% from last week
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg text-white" style={{ backgroundColor: colors.primary }}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text }}>Loading Bookings</h3>
          <p style={{ color: colors.textLight }}>We're gathering your booking information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2" style={{ color: colors.primary }}>
              Bookings Management
            </h1>
            <p className="text-lg" style={{ color: colors.textLight }}>
              Manage and track all tour and trek reservations in one place
            </p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <button 
              type="button"
              onClick={() => setShowOfflineBookingForm(!showOfflineBookingForm)}
              className="inline-flex items-center px-6 py-3 text-white rounded-lg font-medium transition-colors shadow-sm"
              style={{ backgroundColor: colors.secondary }}
            >
              <User className="w-5 h-5 mr-2" />
              {showOfflineBookingForm ? 'Close' : 'Create Offline Booking'}
            </button>
            <button 
              type="button"
              onClick={fetchBookings}
              className="inline-flex items-center px-6 py-3 bg-white border rounded-lg font-medium transition-colors hover:bg-gray-50 cursor-pointer shadow-sm"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Offline Booking Form */}
        {showOfflineBookingForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1" style={{ color: colors.secondary }}>
                  Create Offline Booking
                </h2>
                <p className="text-sm" style={{ color: colors.textLight }}>
                  Manually create a booking for customers who paid offline
                </p>
              </div>
              <button
                onClick={() => setShowOfflineBookingForm(false)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: colors.textLight }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleOfflineBookingSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                    Customer Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Full Name <span style={{ color: colors.error }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={offlineBookingData.name}
                      onChange={handleOfflineBookingChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                      style={{ borderColor: colors.border, focusRingColor: colors.primary }}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Email Address <span style={{ color: colors.error }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={offlineBookingData.email}
                      onChange={handleOfflineBookingChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                      style={{ borderColor: colors.border, focusRingColor: colors.primary }}
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Mobile Number <span style={{ color: colors.error }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={offlineBookingData.mobile}
                      onChange={handleOfflineBookingChange}
                      required
                      pattern="[0-9]{10}"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                      style={{ borderColor: colors.border, focusRingColor: colors.primary }}
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
                    Booking Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Booking Type <span style={{ color: colors.error }}>*</span>
                    </label>
                    <select
                      name="bookingType"
                      value={offlineBookingData.bookingType}
                      onChange={handleOfflineBookingChange}
                      required
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                      style={{ borderColor: colors.border, focusRingColor: colors.primary }}
                    >
                      <option value="tour">Tour</option>
                      <option value="trek">Trek</option>
                    </select>
                  </div>

                  {offlineBookingData.bookingType === 'tour' ? (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        Select Tour <span style={{ color: colors.error }}>*</span>
                      </label>
                      <select
                        name="tourId"
                        value={offlineBookingData.tourId}
                        onChange={handleOfflineBookingChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                        style={{ borderColor: colors.border, focusRingColor: colors.primary }}
                      >
                        <option value="">-- Select a Tour --</option>
                        {availableTours.map(tour => (
                          <option key={tour._id} value={tour._id}>
                            {tour.name} - {tour.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                        Select Trek <span style={{ color: colors.error }}>*</span>
                      </label>
                      <select
                        name="trekId"
                        value={offlineBookingData.trekId}
                        onChange={handleOfflineBookingChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                        style={{ borderColor: colors.border, focusRingColor: colors.primary }}
                      >
                        <option value="">-- Select a Trek --</option>
                        {availableTreks.map(trek => (
                          <option key={trek._id} value={trek._id}>
                            {trek.name} - {trek.location}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Travel Date <span style={{ color: colors.error }}>*</span>
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={offlineBookingData.bookingDate}
                      onChange={handleOfflineBookingChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                      style={{ borderColor: colors.border, focusRingColor: colors.primary }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                      Amount Paid (₹) <span style={{ color: colors.error }}>*</span>
                    </label>
                    <input
                      type="number"
                      name="amountPaid"
                      value={offlineBookingData.amountPaid}
                      onChange={handleOfflineBookingChange}
                      required
                      min="1"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                      style={{ borderColor: colors.border, focusRingColor: colors.primary }}
                      placeholder="Enter amount received"
                    />
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="border-l-4 rounded-r-lg p-4" style={{ backgroundColor: '#FFF7ED', borderColor: colors.secondary }}>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 mr-3 mt-0.5" style={{ color: colors.secondary }} />
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: colors.secondary }}>Important Note</h4>
                    <p className="text-sm" style={{ color: colors.text }}>
                      This booking will be automatically marked as "Confirmed" and "Payment Completed". 
                      A confirmation email will be sent to the customer with all booking details.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4 border-t" style={{ borderColor: colors.border }}>
                <button
                  type="submit"
                  disabled={creatingOfflineBooking}
                  className="flex-1 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: creatingOfflineBooking ? colors.textLight : colors.secondary,
                    opacity: creatingOfflineBooking ? 0.6 : 1
                  }}
                >
                  {creatingOfflineBooking ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Create Offline Booking
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOfflineBookingForm(false)}
                  className="px-6 py-3 rounded-lg transition-colors font-semibold"
                  style={{ 
                    backgroundColor: '#F3F4F6', 
                    color: colors.text,
                    borderColor: colors.border
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Info Badge */}
        {filteredItemId && (
          <div className="border rounded-lg p-4" style={{ backgroundColor: '#F8FAFE', borderColor: colors.primary }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5" style={{ color: colors.primary }} />
                <div>
                  <p className="font-medium" style={{ color: colors.primary }}>Filtered View</p>
                  <p className="text-sm" style={{ color: colors.textLight }}>
                    Showing bookings for specific {typeFilter === 'tour' ? 'tour' : 'trek'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFilteredItemId(null);
                  setTypeFilter('all');
                  window.history.replaceState({}, '', '/admin/bookings');
                }}
                className="p-1 rounded-lg transition-colors hover:bg-gray-100"
                style={{ color: colors.primary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="border-l-4 rounded-r-lg p-4" style={{ backgroundColor: '#F0F9FF', borderColor: colors.success }}>
            <div className="flex items-center">
              <CheckCircle2 className="h-6 w-6 mr-3" style={{ color: colors.success }} />
              <div>
                <h4 className="font-semibold" style={{ color: colors.success }}>Success!</h4>
                <p className="mt-1" style={{ color: colors.text }}>{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="border-l-4 rounded-r-lg p-4" style={{ backgroundColor: '#FEF2F2', borderColor: colors.error }}>
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 mr-3" style={{ color: colors.error }} />
              <div>
                <h4 className="font-semibold" style={{ color: colors.error }}>Attention Required</h4>
                <p className="mt-1" style={{ color: colors.text }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Bookings" 
            value={stats.total}
            subtitle="All time reservations"
            icon={<BarChart3 className="w-6 h-6" />}
          />
          <StatCard 
            title="Pending Approval" 
            value={stats.pending}
            subtitle="Require attention"
            icon={<Clock className="w-6 h-6" />}
          />
          <StatCard 
            title="Confirmed" 
            value={stats.confirmed}
            subtitle="Active reservations"
            icon={<CheckCircle2 className="w-6 h-6" />}
          />
          <StatCard 
            title="Revenue Collected" 
            value={`₹${stats.revenue.toLocaleString('en-IN')}`}
            subtitle="Total amount received"
            icon={<DollarSign className="w-6 h-6" />}
          />
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6" style={{ borderColor: colors.border }}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                <Search className="w-4 h-4 inline mr-1" />
                Search Bookings
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textLight }} />
                <input
                  type="text"
                  placeholder="Search by name, email, mobile, reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all"
                  style={{ borderColor: colors.border, focusRingColor: colors.primary }}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
               
                Booking Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setFilteredItemId(null);
                }}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                style={{ borderColor: colors.border, focusRingColor: colors.primary }}
              >
                <option value="all">All Types</option>
                <option value="tour">Tours</option>
                <option value="trek">Treks</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                <Filter className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                style={{ borderColor: colors.border, focusRingColor: colors.primary }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Export Button */}
            <div className="flex items-end">
              <button
                onClick={exportToExcel}
                disabled={filteredBookings.length === 0}
                className="w-full text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: filteredBookings.length === 0 ? colors.textLight : colors.primary,
                  opacity: filteredBookings.length === 0 ? 0.6 : 1
                }}
              >
                <Download className="w-5 h-5" />
                Export Excel
              </button>
            </div>
          </div>

          {/* Additional Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>
                <Calendar className="w-4 h-4 inline mr-1" />
                Time Period
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                style={{ borderColor: colors.border, focusRingColor: colors.primary }}
              >
                <option value="all">All Bookings</option>
                <option value="current">Current/Upcoming</option>
                <option value="previous">Previous/Past</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: colors.border }}>
          {/* Table Header */}
          <div className="px-6 py-4 border-b" style={{ backgroundColor: '#F9FAFB', borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Bookings List</h3>
                <p className="text-sm" style={{ color: colors.textLight }}>
                  Showing {Math.min(indexOfLastBooking, filteredBookings.length)} of {filteredBookings.length} bookings
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textLight }}>
                <Users className="w-4 h-4" />
                <span>{filteredBookings.length} total</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ divideColor: colors.border }}>
              <thead style={{ backgroundColor: '#F9FAFB' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textLight }}>
                    Booking Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textLight }}>
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textLight }}>
                    Trip Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textLight }}>
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textLight }}>
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textLight }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y" style={{ divideColor: colors.border }}>
                {currentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-16 h-16 mb-4" style={{ color: colors.textLight }} />
                        <h4 className="text-lg font-semibold mb-2" style={{ color: colors.textLight }}>No bookings found</h4>
                        <p style={{ color: colors.textLight }}>Try adjusting your search criteria or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            booking.bookingType === 'tour' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {booking.bookingType === 'tour' ? <MapPin className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: colors.text }}>{booking.bookingReference}</div>
                            <div className="text-xs" style={{ color: colors.textLight }}>
                              {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium" style={{ color: colors.text }}>{booking.name}</div>
                        <div className="text-xs flex items-center gap-1 mt-1" style={{ color: colors.textLight }}>
                          <Mail className="w-3 h-3" />
                          {booking.email}
                        </div>
                        <div className="text-xs flex items-center gap-1" style={{ color: colors.textLight }}>
                          <Phone className="w-3 h-3" />
                          {booking.mobile}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium" style={{ color: colors.text }}>
                          {booking.bookingType === 'tour' 
                            ? booking.tourId?.name || 'N/A'
                            : booking.trekId?.name || 'N/A'}
                        </div>
                        <div className="text-xs flex items-center gap-1 mt-1" style={{ color: colors.textLight }}>
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.bookingDate).toLocaleDateString('en-IN')}
                        </div>
                        <div className="text-xs flex items-center gap-1" style={{ color: colors.textLight }}>
                          <MapPin className="w-3 h-3" />
                          {booking.pickupCity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold" style={{ color: colors.text }}>
                            ₹{booking.totalPrice.toLocaleString('en-IN')}
                          </div>
                          {booking.couponCode && (
                            <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded inline-flex items-center gap-1">
                              <span className="font-mono font-semibold">{booking.couponCode}</span>
                              <span>-{booking.discountPercentage}%</span>
                            </div>
                          )}
                          <div className="text-xs" style={{ color: colors.textLight }}>
                            Paid: ₹{booking.amountPaid.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs flex items-center gap-2" style={{ color: colors.textLight }}>
                            <span>👥 {booking.numberOfMembers}</span>
                            <span className="text-[10px]">
                              ({booking.adults || 0}A {booking.women || 0}W {booking.children || 0}C {booking.infants || 0}I)
                            </span>
                          </div>
                        </div>
                        <select
                          value={booking.paymentStatus}
                          onChange={(e) => handlePaymentStatusUpdate(booking._id, e.target.value, booking)}
                          className={`mt-1 text-xs px-2 py-1 rounded-full border focus:ring-2 ${getPaymentStatusColor(booking.paymentStatus)}`}
                          style={{ focusRingColor: colors.primary }}
                        >
                          <option value="pending">Pending</option>
                          <option value="partial">Partial</option>
                          <option value="completed">Completed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={booking.bookingStatus}
                          onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1 rounded-full border focus:ring-2 ${getStatusColor(booking.bookingStatus)}`}
                          style={{ focusRingColor: colors.primary }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                            style={{ color: colors.primary }}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResendConfirmation(booking._id)}
                            disabled={resendingConfirmation === booking._id}
                            className="p-2 rounded-lg transition-colors hover:bg-gray-100 disabled:cursor-not-allowed"
                            style={{ color: resendingConfirmation === booking._id ? colors.textLight : colors.success }}
                            title="Resend Confirmation"
                          >
                            {resendingConfirmation === booking._id ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                            style={{ color: colors.error }}
                            title="Delete Booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-6 py-4 border-t" style={{ borderColor: colors.border }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: colors.text }}>
                    Showing <span className="font-medium">{indexOfFirstBooking + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastBooking, filteredBookings.length)}</span> of{' '}
                    <span className="font-medium">{filteredBookings.length}</span> results
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg text-sm font-medium bg-white transition-colors disabled:cursor-not-allowed"
                    style={{ 
                      borderColor: colors.border, 
                      color: colors.text,
                      disabledBackgroundColor: '#F9FAFB'
                    }}
                  >
                    Previous
                  </button>
                  <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index + 1}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-4 py-2 border text-sm font-medium rounded-lg transition-colors ${
                          currentPage === index + 1
                            ? 'text-white border-transparent'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                        style={
                          currentPage === index + 1
                            ? { backgroundColor: colors.primary }
                            : { borderColor: colors.border, color: colors.text }
                        }
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg text-sm font-medium bg-white transition-colors disabled:cursor-not-allowed"
                    style={{ 
                      borderColor: colors.border, 
                      color: colors.text,
                      disabledBackgroundColor: '#F9FAFB'
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    selectedBooking.bookingType === 'tour' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {selectedBooking.bookingType === 'tour' ? <MapPin className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.text }}>Booking Details</h2>
                    <p className="text-sm" style={{ color: colors.textLight }}>{selectedBooking.bookingReference}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: colors.textLight }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Customer Information */}
                <div className="border rounded-lg p-6" style={{ borderColor: colors.border, backgroundColor: '#F8FAFE' }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                    <User className="w-5 h-5" style={{ color: colors.primary }} />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.textLight }}>Full Name</p>
                        <p className="text-lg font-semibold" style={{ color: colors.text }}>{selectedBooking.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.textLight }}>Email Address</p>
                        <p className="text-lg flex items-center gap-2" style={{ color: colors.text }}>
                          <Mail className="w-4 h-4" style={{ color: colors.textLight }} />
                          {selectedBooking.email}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.textLight }}>Mobile Number</p>
                        <p className="text-lg flex items-center gap-2" style={{ color: colors.text }}>
                          <Phone className="w-4 h-4" style={{ color: colors.textLight }} />
                          {selectedBooking.mobile}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.textLight }}>Pickup City</p>
                        <p className="text-lg flex items-center gap-2" style={{ color: colors.text }}>
                          <MapPin className="w-4 h-4" style={{ color: colors.textLight }} />
                          {selectedBooking.pickupCity}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Information */}
                <div className="border rounded-lg p-6" style={{ borderColor: colors.border, backgroundColor: '#F0F9F0' }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                    <Package className="w-5 h-5" style={{ color: colors.success }} />
                    Trip Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.textLight }}>Trip Type</p>
                        <p className="text-lg font-semibold" style={{ color: colors.text }}>
                          {selectedBooking.bookingType === 'tour' ? '🏖️ Tour' : '🏔️ Trek'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.textLight }}>Trip Name</p>
                        <p className="text-lg" style={{ color: colors.text }}>
                          {selectedBooking.bookingType === 'tour' 
                            ? selectedBooking.tourId?.name || 'N/A'
                            : selectedBooking.trekId?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.textLight }}>Booking Date</p>
                        <p className="text-lg flex items-center gap-2" style={{ color: colors.text }}>
                          <Calendar className="w-4 h-4" style={{ color: colors.textLight }} />
                          {new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: colors.textLight }}>Booking Created</p>
                        <p className="text-lg" style={{ color: colors.text }}>
                          {new Date(selectedBooking.createdAt).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Group & Payment Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Group Details */}
                  <div className="border rounded-lg p-6" style={{ borderColor: colors.border, backgroundColor: '#F8FAFE' }}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                      <Users className="w-5 h-5" style={{ color: colors.primary }} />
                      Group Details
                    </h3>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold" style={{ color: colors.primary }}>{selectedBooking.numberOfMembers}</p>
                        <p className="text-sm" style={{ color: colors.textLight }}>Total Members</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-xl font-semibold" style={{ color: colors.text }}>{selectedBooking.adults || 0}</p>
                          <p className="text-xs" style={{ color: colors.textLight }}>Adults</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold" style={{ color: colors.text }}>{selectedBooking.women || 0}</p>
                          <p className="text-xs" style={{ color: colors.textLight }}>Women</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold" style={{ color: colors.text }}>{selectedBooking.children || 0}</p>
                          <p className="text-xs" style={{ color: colors.textLight }}>Children</p>
                        </div>
                        <div>
                          <p className="text-xl font-semibold" style={{ color: colors.text }}>{selectedBooking.infants || 0}</p>
                          <p className="text-xs" style={{ color: colors.textLight }}>Infants</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="border rounded-lg p-6" style={{ borderColor: colors.border, backgroundColor: '#FFF7ED' }}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                      <CreditCard className="w-5 h-5" style={{ color: colors.secondary }} />
                      Payment Details
                    </h3>
                    <div className="space-y-3">
                      {selectedBooking.originalPrice && selectedBooking.originalPrice > selectedBooking.totalPrice ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: colors.textLight }}>Original Price</span>
                            <span className="font-semibold line-through" style={{ color: colors.textLight }}>
                              ₹{selectedBooking.originalPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {selectedBooking.couponCode && (
                            <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                              <span className="text-sm font-medium text-green-700">
                                Coupon: {selectedBooking.couponCode}
                              </span>
                              <span className="font-semibold text-green-700">
                                -{selectedBooking.discountPercentage}% (₹{(selectedBooking.discountAmount || 0).toLocaleString('en-IN')})
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="text-sm" style={{ color: colors.textLight }}>Price Per Person</span>
                          <span className="font-semibold" style={{ color: colors.text }}>
                            ₹{(selectedBooking.pricePerPerson || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-sm font-medium" style={{ color: colors.text }}>Total Price</span>
                        <span className="text-lg font-bold" style={{ color: colors.primary }}>
                          ₹{selectedBooking.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: colors.textLight }}>Amount Paid</span>
                        <span className="text-lg font-bold" style={{ color: colors.success }}>
                          ₹{selectedBooking.amountPaid.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t pt-2">
                        <span className="text-sm font-medium" style={{ color: colors.text }}>Balance Due</span>
                        <span className="text-lg font-bold" style={{ 
                          color: (selectedBooking.totalPrice - selectedBooking.amountPaid) > 0 ? colors.error : colors.success 
                        }}>
                          ₹{(selectedBooking.totalPrice - selectedBooking.amountPaid).toLocaleString('en-IN')}
                        </span>
                      </div>
                      {selectedBooking.razorpayPaymentId && (
                        <div className="border-t pt-2 mt-2">
                          <p className="text-xs" style={{ color: colors.textLight }}>Payment ID</p>
                          <p className="text-xs font-mono" style={{ color: colors.text }}>
                            {selectedBooking.razorpayPaymentId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comprehensive Price Breakdown */}
                <div className="border rounded-lg p-6" style={{ borderColor: colors.border, backgroundColor: '#F0F9FF' }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                    <DollarSign className="w-5 h-5" style={{ color: colors.primary }} />
                    Complete Price Breakdown
                  </h3>
                  <div className="space-y-4">
                    {/* Fetch and display individual prices from tour/trek */}
                    {(() => {
                      const item = selectedBooking.bookingType === 'tour' 
                        ? selectedBooking.tourId 
                        : selectedBooking.trekId;
                      
                      if (!item || !item.cityPricing) {
                        return (
                          <div className="bg-amber-50 border border-amber-200 rounded p-3">
                            <p className="text-sm text-amber-800">
                              Pricing details not available for this booking.
                            </p>
                          </div>
                        );
                      }

                      const cityPrice = item.cityPricing.find(cp => cp.city === selectedBooking.pickupCity);
                      
                      if (!cityPrice) {
                        return (
                          <div className="bg-amber-50 border border-amber-200 rounded p-3">
                            <p className="text-sm text-amber-800">
                              Pricing not found for {selectedBooking.pickupCity}
                            </p>
                          </div>
                        );
                      }

                      const adultPrice = cityPrice.adultPrice || cityPrice.price || 0;
                      const womenPrice = cityPrice.womenPrice || cityPrice.price || 0;
                      const childrenPrice = cityPrice.childrenPrice || cityPrice.price || 0;
                      const infantPrice = cityPrice.infantPrice || 0;

                      const adultsTotal = (selectedBooking.adults || 0) * adultPrice;
                      const womenTotal = (selectedBooking.women || 0) * womenPrice;
                      const childrenTotal = (selectedBooking.children || 0) * childrenPrice;
                      const infantsTotal = (selectedBooking.infants || 0) * infantPrice;
                      const subtotal = adultsTotal + womenTotal + childrenTotal + infantsTotal;

                      return (
                        <>
                          {/* Individual Member Type Breakdown */}
                          <div className="bg-white rounded-lg border p-4 space-y-3" style={{ borderColor: colors.border }}>
                            <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
                              Member-wise Price Calculation
                            </h4>
                            
                            {selectedBooking.adults > 0 && (
                              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#EFF6FF' }}>
                                <div className="flex items-center gap-3">
                                  <div className="bg-blue-500 text-white rounded-lg px-3 py-2 font-bold">
                                    {selectedBooking.adults}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold" style={{ color: colors.text }}>Adults</p>
                                    <p className="text-xs" style={{ color: colors.textLight }}>
                                      ₹{adultPrice.toLocaleString('en-IN')} per person
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs" style={{ color: colors.textLight }}>
                                    {selectedBooking.adults} × ₹{adultPrice.toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-lg font-bold text-blue-700">
                                    ₹{adultsTotal.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            )}

                            {selectedBooking.women > 0 && (
                              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FCE7F3' }}>
                                <div className="flex items-center gap-3">
                                  <div className="bg-pink-500 text-white rounded-lg px-3 py-2 font-bold">
                                    {selectedBooking.women}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold" style={{ color: colors.text }}>Women</p>
                                    <p className="text-xs" style={{ color: colors.textLight }}>
                                      ₹{womenPrice.toLocaleString('en-IN')} per person
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs" style={{ color: colors.textLight }}>
                                    {selectedBooking.women} × ₹{womenPrice.toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-lg font-bold text-pink-700">
                                    ₹{womenTotal.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            )}

                            {selectedBooking.children > 0 && (
                              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                                <div className="flex items-center gap-3">
                                  <div className="bg-yellow-500 text-white rounded-lg px-3 py-2 font-bold">
                                    {selectedBooking.children}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold" style={{ color: colors.text }}>Children</p>
                                    <p className="text-xs" style={{ color: colors.textLight }}>
                                      ₹{childrenPrice.toLocaleString('en-IN')} per person
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs" style={{ color: colors.textLight }}>
                                    {selectedBooking.children} × ₹{childrenPrice.toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-lg font-bold text-yellow-700">
                                    ₹{childrenTotal.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            )}

                            {selectedBooking.infants > 0 && (
                              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F3E8FF' }}>
                                <div className="flex items-center gap-3">
                                  <div className="bg-purple-500 text-white rounded-lg px-3 py-2 font-bold">
                                    {selectedBooking.infants}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold" style={{ color: colors.text }}>Infants</p>
                                    <p className="text-xs" style={{ color: colors.textLight }}>
                                      ₹{infantPrice.toLocaleString('en-IN')} per person
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs" style={{ color: colors.textLight }}>
                                    {selectedBooking.infants} × ₹{infantPrice.toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-lg font-bold text-purple-700">
                                    ₹{infantsTotal.toLocaleString('en-IN')}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Price Summary */}
                          <div className="bg-white rounded-lg border p-4 space-y-3" style={{ borderColor: colors.border }}>
                            <div className="flex justify-between items-center pb-3 border-b" style={{ borderColor: colors.border }}>
                              <span className="text-sm font-semibold" style={{ color: colors.text }}>Subtotal</span>
                              <span className="text-lg font-bold" style={{ color: colors.text }}>
                                ₹{subtotal.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {selectedBooking.couponCode && selectedBooking.discountAmount > 0 && (
                              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 border border-green-200">
                                <div>
                                  <p className="text-sm font-semibold text-green-700">
                                    Coupon Applied: {selectedBooking.couponCode}
                                  </p>
                                  <p className="text-xs text-green-600">
                                    {selectedBooking.discountPercentage}% discount
                                  </p>
                                </div>
                                <span className="text-lg font-bold text-green-700">
                                  -₹{selectedBooking.discountAmount.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: colors.border }}>
                              <span className="text-base font-bold" style={{ color: colors.text }}>Final Amount</span>
                              <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                                ₹{selectedBooking.totalPrice.toLocaleString('en-IN')}
                              </span>
                            </div>

                            {/* Payment Status */}
                            <div className="border-t pt-3 space-y-2" style={{ borderColor: colors.border }}>
                              <div className="flex justify-between items-center">
                                <span className="text-sm" style={{ color: colors.textLight }}>Amount Paid</span>
                                <span className="text-base font-semibold" style={{ color: colors.success }}>
                                  ₹{selectedBooking.amountPaid.toLocaleString('en-IN')}
                                </span>
                              </div>
                              {selectedBooking.totalPrice > selectedBooking.amountPaid && (
                                <div className="flex justify-between items-center p-2 rounded bg-red-50">
                                  <span className="text-sm font-semibold text-red-700">Balance Due</span>
                                  <span className="text-base font-bold text-red-700">
                                    ₹{(selectedBooking.totalPrice - selectedBooking.amountPaid).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Info Note */}
                          <div className="bg-blue-50 border border-blue-200 rounded p-3">
                            <p className="text-xs text-blue-800">
                              <strong>📊 Calculation Info:</strong> This breakdown shows the exact price calculation for {selectedBooking.pickupCity}. 
                              {(adultPrice !== womenPrice || adultPrice !== childrenPrice) 
                                ? ' Different member types have different rates in this booking.'
                                : ' All member types have the same rate in this booking.'}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Status & Communication */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Information */}
                  <div className="border rounded-lg p-6" style={{ borderColor: colors.border }}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                      <Shield className="w-5 h-5" style={{ color: colors.textLight }} />
                      Status Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: colors.textLight }}>Booking Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.bookingStatus)}`}>
                          {selectedBooking.bookingStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: colors.textLight }}>Payment Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedBooking.paymentStatus)}`}>
                          {selectedBooking.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Communication Status */}
                  <div className="border rounded-lg p-6" style={{ borderColor: colors.border }}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                      <MessageCircle className="w-5 h-5" style={{ color: colors.textLight }} />
                      Communication
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: colors.textLight }}>Email Confirmation</span>
                        <span className={`flex items-center gap-1 text-sm font-medium ${
                          selectedBooking.emailSent ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedBooking.emailSent ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          {selectedBooking.emailSent ? 'Sent' : 'Not Sent'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm" style={{ color: colors.textLight }}>WhatsApp Message</span>
                        <span className={`flex items-center gap-1 text-sm font-medium ${
                          selectedBooking.whatsappSent ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedBooking.whatsappSent ? <CheckCircle2 className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          {selectedBooking.whatsappSent ? 'Sent' : 'Not Sent'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {selectedBooking.specialRequests && (
                  <div className="border rounded-lg p-6" style={{ borderColor: colors.border, backgroundColor: '#FEF2F2' }}>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: colors.text }}>
                      <FileText className="w-5 h-5" style={{ color: colors.error }} />
                      Special Requests
                    </h3>
                    <p className="bg-white rounded-lg p-4 border" style={{ color: colors.text, borderColor: colors.border }}>
                      {selectedBooking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t" style={{ borderColor: colors.border }}>
                  <button
                    onClick={() => handleResendConfirmation(selectedBooking._id)}
                    disabled={resendingConfirmation === selectedBooking._id}
                    className="flex-1 text-white px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 font-semibold disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: resendingConfirmation === selectedBooking._id ? colors.textLight : colors.primary,
                      opacity: resendingConfirmation === selectedBooking._id ? 0.6 : 1
                    }}
                  >
                    {resendingConfirmation === selectedBooking._id ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Mail className="w-5 h-5" />
                    )}
                    Resend Confirmation
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1 px-6 py-3 rounded-lg transition-colors font-semibold"
                    style={{ 
                      backgroundColor: '#F3F4F6', 
                      color: colors.text,
                      borderColor: colors.border
                    }}
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingsManagement;