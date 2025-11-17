import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/api';
import { showSuccess, showError } from '../utils/toast';
import {
  ArrowLeft, Calendar, MapPin, Users, DollarSign, Mail, Phone,
  Clock, Package, FileText, Download, Send, Edit, Trash2,
  CheckCircle2, XCircle, AlertCircle, User, Baby, Heart
} from 'lucide-react';

const CustomBookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = {
    primary: "#E66926",
    secondary: "#1E9ABF",
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    textDark: "#334155",
    border: "#E2E8F0"
  };

  const statusColors = {
    'Quote Sent': 'bg-blue-100 text-blue-700 border-blue-200',
    'Payment Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Confirmed': 'bg-green-100 text-green-700 border-green-200',
    'Completed': 'bg-purple-100 text-purple-700 border-purple-200',
    'Cancelled': 'bg-red-100 text-red-700 border-red-200'
  };

  const paymentStatusColors = {
    'Pending': 'bg-gray-100 text-gray-700 border-gray-200',
    'Partial': 'bg-orange-100 text-orange-700 border-orange-200',
    'Paid': 'bg-green-100 text-green-700 border-green-200',
    'Refunded': 'bg-red-100 text-red-700 border-red-200'
  };

  useEffect(() => {
    fetchBookingDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/custom-bookings/${id}`);
      if (response.data.success) {
        setBooking(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details');
      showError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!window.confirm('Resend this booking to the customer?')) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/custom-bookings/${id}/resend`);
      if (response.data.success) {
        showSuccess('Booking resent successfully!');
      }
    } catch (err) {
      showError('Failed to resend booking');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) return;

    try {
      await axios.delete(`${API_BASE_URL}/custom-bookings/${id}`);
      showSuccess('Booking deleted successfully');
      navigate('/admin/custom-bookings');
    } catch (err) {
      showError('Failed to delete booking');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      
      const response = await axios.get(
        `${API_BASE_URL}/custom-bookings/${id}/download-pdf`,
        { responseType: 'blob' } // Important: treat response as blob
      );

      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `Custom_Booking_${booking.packageName.replace(/\s+/g, '_')}_${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('PDF downloaded successfully');
    } catch (err) {
      showError('Failed to download PDF');
    }
  };

  const handlePaymentStatusUpdate = async (newStatus) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/custom-bookings/${id}/payment`,
        { paymentStatus: newStatus }
      );
      if (response.data.success) {
        setBooking({ ...booking, paymentStatus: newStatus });
      }
    } catch (err) {
      showError('Failed to update payment status');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightBg }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: colors.primary }}></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightBg }}>
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <XCircle className="mx-auto mb-4 text-red-500" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/admin/custom-bookings')}
            className="px-6 py-3 rounded-lg text-white font-semibold"
            style={{ backgroundColor: colors.primary }}
          >
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.lightBg }}>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/custom-bookings')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Custom Bookings
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>
              Custom Booking Details
            </h1>
            <p className="text-gray-600">
              Booking ID: <span className="font-mono font-semibold">{booking._id}</span>
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleResend}
              className="inline-flex items-center px-4 py-2 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ backgroundColor: colors.secondary }}
            >
              <Send className="mr-2" size={18} />
              Resend Email
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white font-semibold shadow-lg hover:shadow-xl hover:bg-red-700 transition-all"
            >
              <Trash2 className="mr-2" size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: colors.textDark }}>
              Booking Status
            </h3>
            <Package size={24} style={{ color: colors.primary }} />
          </div>
          <div className={`inline-flex px-4 py-2 rounded-lg text-lg font-bold border-2 ${statusColors[booking.status]}`}>
            {booking.status}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: colors.textDark }}>
              Payment Status
            </h3>
            <DollarSign size={24} style={{ color: colors.primary }} />
          </div>
          <select
            value={booking.paymentStatus}
            onChange={(e) => handlePaymentStatusUpdate(e.target.value)}
            className={`text-lg font-bold rounded-lg px-4 py-2 border-2 ${paymentStatusColors[booking.paymentStatus]} cursor-pointer`}
          >
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
            <option value="Paid">Paid</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Package Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-4">
              <User className="mr-2" style={{ color: colors.primary }} />
              <h3 className="text-xl font-semibold" style={{ color: colors.textDark }}>
                Customer Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Name</label>
                <p className="text-lg font-semibold text-gray-900">{booking.customerName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Email</label>
                <div className="flex items-center text-gray-900">
                  <Mail size={16} className="mr-2 text-gray-400" />
                  <a href={`mailto:${booking.customerEmail}`} className="hover:underline">
                    {booking.customerEmail}
                  </a>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Phone</label>
                <div className="flex items-center text-gray-900">
                  <Phone size={16} className="mr-2 text-gray-400" />
                  <a href={`tel:${booking.customerPhone}`} className="hover:underline">
                    {booking.customerPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-4">
              <Package className="mr-2" style={{ color: colors.primary }} />
              <h3 className="text-xl font-semibold" style={{ color: colors.textDark }}>
                Package Details
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Package Name</label>
                <p className="text-lg font-semibold text-gray-900">{booking.packageName}</p>
              </div>
              
              {/* Package Thumbnail Image */}
              {booking.thumbnail && (
                <div>
                  <label className="text-sm text-gray-500 block mb-2">Package Image</label>
                  <div className="rounded-lg overflow-hidden border-2" style={{ borderColor: colors.border }}>
                    <img 
                      src={booking.thumbnail} 
                      alt={booking.packageName}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Type</label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded ${
                    booking.packageType === 'Tour' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {booking.packageType}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Duration</label>
                  <div className="flex items-center text-gray-900">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span className="font-semibold">{booking.duration}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Location</label>
                <div className="flex items-center text-gray-900">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span className="font-semibold">{booking.location}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Start Date</label>
                  <div className="flex items-center text-gray-900">
                    <Calendar size={16} className="mr-2 text-gray-400" />
                    <span className="font-semibold">{formatDate(booking.startDate)}</span>
                  </div>
                </div>
                {booking.endDate && (
                  <div>
                    <label className="text-sm text-gray-500 block mb-1">End Date</label>
                    <div className="flex items-center text-gray-900">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      <span className="font-semibold">{formatDate(booking.endDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Travelers & Pricing */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-4">
              <Users className="mr-2" style={{ color: colors.primary }} />
              <h3 className="text-xl font-semibold" style={{ color: colors.textDark }}>
                Travelers & Pricing
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <User size={20} className="mr-2 text-blue-600" />
                  <span className="text-sm text-gray-600">Adults</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{booking.pricing.adults}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <div className="flex items-center">
                  <Heart size={20} className="mr-2 text-pink-600" />
                  <span className="text-sm text-gray-600">Women</span>
                </div>
                <span className="text-xl font-bold text-pink-600">{booking.pricing.women}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Users size={20} className="mr-2 text-green-600" />
                  <span className="text-sm text-gray-600">Children</span>
                </div>
                <span className="text-xl font-bold text-green-600">{booking.pricing.children}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <Baby size={20} className="mr-2 text-purple-600" />
                  <span className="text-sm text-gray-600">Infants</span>
                </div>
                <span className="text-xl font-bold text-purple-600">{booking.pricing.infants}</span>
              </div>
            </div>

            <div className="border-t pt-4" style={{ borderColor: colors.border }}>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Adult Price ({booking.pricing.adults} × {formatCurrency(booking.pricing.adultPrice)})</span>
                  <span className="font-semibold">{formatCurrency(booking.pricing.adults * booking.pricing.adultPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Women Price ({booking.pricing.women} × {formatCurrency(booking.pricing.womenPrice)})</span>
                  <span className="font-semibold">{formatCurrency(booking.pricing.women * booking.pricing.womenPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Children Price ({booking.pricing.children} × {formatCurrency(booking.pricing.childrenPrice)})</span>
                  <span className="font-semibold">{formatCurrency(booking.pricing.children * booking.pricing.childrenPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Infant Price ({booking.pricing.infants} × {formatCurrency(booking.pricing.infantPrice)})</span>
                  <span className="font-semibold">{formatCurrency(booking.pricing.infants * booking.pricing.infantPrice)}</span>
                </div>
              </div>
              <div className="border-t pt-4 flex justify-between items-center" style={{ borderColor: colors.border }}>
                <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                <span className="text-3xl font-bold" style={{ color: colors.primary }}>
                  {formatCurrency(booking.pricing.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {booking.additionalDetails && (
            <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
              <div className="flex items-center mb-4">
                <FileText className="mr-2" style={{ color: colors.primary }} />
                <h3 className="text-xl font-semibold" style={{ color: colors.textDark }}>
                  Additional Details
                </h3>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{booking.additionalDetails}</p>
            </div>
          )}
        </div>

        {/* Right Column - Timeline & Actions */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-4">
              <Clock className="mr-2" style={{ color: colors.primary }} />
              <h3 className="text-xl font-semibold" style={{ color: colors.textDark }}>
                Timeline
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3"
                     style={{ backgroundColor: colors.primary }}>
                  <CheckCircle2 size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Booking Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.createdAt).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                </div>
              </div>
              {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <AlertCircle size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Last Updated</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.updatedAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: colors.textDark }}>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleResend}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-700 hover:text-blue-700 font-semibold"
              >
                <Send className="mr-2" size={18} />
                Resend Email to Customer
              </button>
              <button
                onClick={handleDownloadPDF}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-all text-gray-700 hover:text-green-700 font-semibold"
              >
                <Download className="mr-2" size={18} />
                Download PDF
              </button>
              <button
                onClick={handleDelete}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg border-2 border-red-300 hover:border-red-500 hover:bg-red-50 transition-all text-red-600 hover:text-red-700 font-semibold"
              >
                <Trash2 className="mr-2" size={18} />
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomBookingDetail;
