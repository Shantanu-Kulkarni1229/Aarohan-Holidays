import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../api/api';
import { showSuccess, showError } from '../utils/toast';

const EnquiriesManagement = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedEnquiries, setSelectedEnquiries] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [enquiryStatus, setEnquiryStatus] = useState('');
  const [priority, setPriority] = useState('');

  const serviceTypes = [
    { value: 'carRental', label: 'Car Rental' },
    { value: 'hotelBooking', label: 'Hotel Booking' },
    { value: 'flightTickets', label: 'Flight Tickets' },
    { value: 'trainTickets', label: 'Train Tickets' },
    { value: 'cabService', label: 'Cab Service' },
    { value: 'railwayReservation', label: 'Railway Reservation' },
    { value: 'airTicketing', label: 'Air Ticketing' },
    { value: 'holidayPackage', label: 'Holiday Package' },
    { value: 'hotelReservation', label: 'Hotel Reservation' },
    { value: 'eventManagement', label: 'Event Management' },
    { value: 'corporateTravel', label: 'Corporate Travel' },
    { value: 'visaAssistance', label: 'Visa Assistance' }
  ];

  useEffect(() => {
    fetchEnquiries();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, serviceFilter, currentPage]);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('enquiryStatus', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      if (serviceFilter !== 'all') params.append('serviceType', serviceFilter);
      params.append('page', currentPage);
      params.append('limit', 20);
      params.append('sortBy', 'createdAt');
      params.append('order', 'desc');

      const response = await axios.get(
        `${API_BASE_URL}/admin/enquiries?${params.toString()}`
      );

      if (response.data.success) {
        setEnquiries(response.data.enquiries);
        setStatistics(response.data.statistics);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch enquiries');
      showError('Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/enquiries/${enquiryId}`
      );

      if (response.data.success) {
        setSuccessMessage('Enquiry deleted successfully!');
        showSuccess('Enquiry deleted successfully');
        fetchEnquiries();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete enquiry');
      setTimeout(() => setError(''), 5000);
      showError('Failed to delete enquiry');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedEnquiries.length === 0) {
      setError('Please select at least one enquiry');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!window.confirm(`Are you sure you want to ${action} ${selectedEnquiries.length} enquiry(ies)?`)) {
      return;
    }

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/enquiries/bulk-update`,
        { 
          action,
          ids: selectedEnquiries 
        }
      );

      if (response.data.success) {
        setSuccessMessage(response.data.message);
        setSelectedEnquiries([]);
        showSuccess('Bulk action completed successfully');
        fetchEnquiries();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to perform bulk action');
      setTimeout(() => setError(''), 5000);
      showError('Failed to perform bulk action');
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedEnquiries(filteredEnquiries.map(e => e._id));
    } else {
      setSelectedEnquiries([]);
    }
  };

  const handleSelectOne = (enquiryId) => {
    setSelectedEnquiries(prev => 
      prev.includes(enquiryId)
        ? prev.filter(id => id !== enquiryId)
        : [...prev, enquiryId]
    );
  };

  const handleViewDetails = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setAdminNotes(enquiry.adminNotes || '');
    setEnquiryStatus(enquiry.enquiryStatus);
    setPriority(enquiry.priority);
    setShowDetailsModal(true);
  };

  const handleSaveUpdates = async () => {
    if (!selectedEnquiry) return;

    try {
      const response = await axios.patch(
        `${API_BASE_URL}/admin/enquiries/${selectedEnquiry._id}/status`,
        { 
          enquiryStatus,
          priority,
          adminNotes 
        }
      );

      if (response.data.success) {
        setSuccessMessage('Enquiry updated successfully!');
        fetchEnquiries();
        showSuccess('Enquiry updated successfully');
        setShowDetailsModal(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update enquiry');
      setTimeout(() => setError(''), 5000);
      showError('Failed to update enquiry');
    }
  };

  const exportToExcel = () => {
    const exportData = filteredEnquiries.map(enquiry => ({
      'Reference': enquiry.enquiryReference,
      'Service Type': serviceTypes.find(s => s.value === enquiry.serviceType)?.label || enquiry.serviceType,
      'Customer Name': enquiry.name,
      'Email': enquiry.email,
      'Phone': enquiry.phone,
      'Status': enquiry.enquiryStatus,
      'Priority': enquiry.priority,
      'Preferred Date': enquiry.preferredDate ? new Date(enquiry.preferredDate).toLocaleDateString('en-IN') : 'N/A',
      'Budget': enquiry.budget ? `₹${enquiry.budget}` : 'N/A',
      'Admin Notes': enquiry.adminNotes || 'None',
      'Created At': new Date(enquiry.createdAt).toLocaleString('en-IN'),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Enquiries');

    const fileName = `Enquiries_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    setSuccessMessage(`Excel file "${fileName}" downloaded successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Filter enquiries based on search term
  const filteredEnquiries = (enquiries || []).filter(enquiry =>
    enquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    enquiry.phone.includes(searchTerm) ||
    (enquiry.enquiryReference && enquiry.enquiryReference.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-indigo-100 text-indigo-800';
      case 'Quoted':
        return 'bg-purple-100 text-purple-800';
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && enquiries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading enquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enquiries Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage service enquiries and track their progress
          </p>
        </div>
        <button
          onClick={exportToExcel}
          disabled={filteredEnquiries.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filteredEnquiries.length > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          📥 Export to Excel
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Enquiries</p>
              <p className="text-2xl font-bold text-gray-900">{statistics?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📧</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics?.pending || 0}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">{statistics?.confirmed || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{statistics?.highPriority || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{statistics?.pending || 0}</p>
            <p className="text-xs text-gray-600">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{statistics?.inProgress || 0}</p>
            <p className="text-xs text-gray-600">In Progress</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">{statistics?.contacted || 0}</p>
            <p className="text-xs text-gray-600">Contacted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{statistics?.quoted || 0}</p>
            <p className="text-xs text-gray-600">Quoted</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{statistics?.confirmed || 0}</p>
            <p className="text-xs text-gray-600">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{statistics?.cancelled || 0}</p>
            <p className="text-xs text-gray-600">Cancelled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">{statistics?.completed || 0}</p>
            <p className="text-xs text-gray-600">Completed</p>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Name, email, phone, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Contacted">Contacted</option>
              <option value="Quoted">Quoted</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
            <select
              value={serviceFilter}
              onChange={(e) => {
                setServiceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Services</option>
              {serviceTypes.map(service => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEnquiries.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">
              {selectedEnquiries.length} enquiry(ies) selected
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkAction('contacted')}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Mark Contacted
              </button>
              <button
                onClick={() => handleBulkAction('quoted')}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                Mark Quoted
              </button>
              <button
                onClick={() => handleBulkAction('confirmed')}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Mark Confirmed
              </button>
              <button
                onClick={() => handleBulkAction('completed')}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Mark Completed
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enquiries Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedEnquiries.length === filteredEnquiries.length && filteredEnquiries.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    No enquiries found
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedEnquiries.includes(enquiry._id)}
                        onChange={() => handleSelectOne(enquiry._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900">{enquiry.enquiryReference}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{enquiry.name}</div>
                      <div className="text-sm text-gray-500">{enquiry.email}</div>
                      <div className="text-sm text-gray-500">{enquiry.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {serviceTypes.find(s => s.value === enquiry.serviceType)?.label || enquiry.serviceType}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(enquiry.enquiryStatus)}`}>
                        {enquiry.enquiryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(enquiry.priority)}`}>
                        {enquiry.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(enquiry.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleViewDetails(enquiry)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleDelete(enquiry._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination?.currentPage} of {pagination?.totalPages} 
              ({pagination?.totalItems} total enquiries)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination?.hasPrevPage}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  pagination?.hasPrevPage
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(pagination?.totalPages || 1, prev + 1))}
                disabled={!pagination?.hasNextPage}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  pagination?.hasNextPage
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedEnquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Enquiry Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                    <p className="mt-1 text-gray-900 font-mono">{selectedEnquiry.enquiryReference}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Service Type</label>
                    <p className="mt-1 text-gray-900">
                      {serviceTypes.find(s => s.value === selectedEnquiry.serviceType)?.label || selectedEnquiry.serviceType}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                    <p className="mt-1 text-gray-900">{selectedEnquiry.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{selectedEnquiry.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-gray-900">{selectedEnquiry.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                    <p className="mt-1 text-gray-900">
                      {selectedEnquiry.preferredDate 
                        ? new Date(selectedEnquiry.preferredDate).toLocaleDateString('en-IN')
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                {selectedEnquiry.budget && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Budget</label>
                    <p className="mt-1 text-gray-900">₹{selectedEnquiry.budget.toLocaleString('en-IN')}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={enquiryStatus}
                      onChange={(e) => setEnquiryStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Quoted">Quoted</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {selectedEnquiry.details && Object.keys(selectedEnquiry.details).length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Details</label>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {Object.entries(selectedEnquiry.details).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <span className="font-medium text-gray-700">{key}: </span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add internal notes about this enquiry..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted On</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedEnquiry.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSaveUpdates}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Updates
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

export default EnquiriesManagement;
