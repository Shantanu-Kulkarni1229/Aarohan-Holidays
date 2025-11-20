import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/api';
import { showSuccess, showError } from '../utils/toast';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  BookOpen,
  Calendar,
  Users,
  Star,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  MapPin,
  TrendingUp
} from 'lucide-react';

const ToursManagement = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [toursPerPage] = useState(10);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    featured: 0
  });

  // Color palette
  const colors = {
    primary: "#E66926", // Orange
    secondary: "#1E9ABF", // Blue
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    textLight: "#FFFFFF",
    textDark: "#334155",
    border: "#E2E8F0"
  };

  useEffect(() => {
    fetchTours();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [tours]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.tours.getAll();
      
      if (response.data.success) {
        setTours(response.data.data);
      } else {
        setError('Unable to load tours data');
      }
    } catch (error) {
      setError('Error loading tours: ' + error.message);
      showError('Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = tours.length;
    const published = tours.filter(tour => tour.isActive).length;
    const draft = tours.filter(tour => !tour.isActive).length;
    const featured = tours.filter(tour => tour.isFeatured).length;
    
    setStats({ total, published, draft, featured });
  };

  const handleDelete = async (tourId, tourName) => {
    if (window.confirm(`Are you sure you want to delete "${tourName}"? This action cannot be undone.`)) {
      try {
        await adminAPI.tours.delete(tourId);
        setTours(tours.filter(tour => tour._id !== tourId));
        showSuccess(`"${tourName}" has been deleted successfully`);
      } catch (error) {
        setError('Error deleting tour: ' + error.message);
        showError('Failed to delete tour');
      }
    }
  };

  const handleStatusChange = async (tourId, newStatus, tourName) => {
    try {
      const formData = new FormData();
      formData.append('isActive', newStatus === 'published');
      
      await adminAPI.tours.update(tourId, formData);
      setTours(tours.map(tour => 
        tour._id === tourId ? { ...tour, isActive: newStatus === 'published' } : tour
      ));
      showSuccess(`"${tourName}" has been ${newStatus === 'published' ? 'published' : 'moved to draft'}`);
    } catch (error) {
      setError('Error updating tour status: ' + error.message);
      showError('Failed to update tour status');
    }
  };

  const handleFeaturedToggle = async (tourId, currentFeatured, tourName) => {
    try {
      const formData = new FormData();
      formData.append('isFeatured', !currentFeatured);
      
      await adminAPI.tours.update(tourId, formData);
      setTours(tours.map(tour => 
        tour._id === tourId ? { ...tour, isFeatured: !currentFeatured } : tour
      ));
      showSuccess(`"${tourName}" has been ${!currentFeatured ? 'added to' : 'removed from'} featured tours`);
    } catch (error) {
      setError('Error updating featured status: ' + error.message);
      showError('Failed to update featured status');
    }
  };

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && tour.isActive) ||
      (statusFilter === 'draft' && !tour.isActive);
    const matchesCategory = categoryFilter === 'all' || tour.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(tours.map(tour => tour.category).filter(Boolean))];

  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);

  const StatusBadge = ({ isActive }) => (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
      isActive 
        ? 'bg-green-50 text-green-700 border-green-200' 
        : 'bg-amber-50 text-amber-700 border-amber-200'
    }`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-amber-500'}`}></span>
      {isActive ? 'Published' : 'Draft'}
    </span>
  );

  const FeaturedBadge = ({ isFeatured, onClick }) => (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
        isFeatured 
          ? 'bg-yellow-50 text-yellow-700 border-yellow-300 hover:bg-yellow-100' 
          : 'bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100'
      }`}
    >
      <Star size={12} className="mr-1" />
      {isFeatured ? 'Featured' : 'Make Featured'}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96" style={{ backgroundColor: colors.lightBg }}>
        <div className="flex flex-col items-center space-y-4">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: colors.primary }}
          ></div>
          <p className="font-medium" style={{ color: colors.darkBg }}>Loading your tours...</p>
          <p className="text-sm" style={{ color: colors.textDark }}>Preparing your tour management dashboard</p>
        </div>
      </div>
    );
  }

  if (error && tours.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96" style={{ backgroundColor: colors.lightBg }}>
        <div className="text-center max-w-md">
          <div 
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: colors.primary + '15' }}
          >
            <AlertCircle size={32} style={{ color: colors.primary }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: colors.darkBg }}>Unable to Load Data</h3>
          <p className="mb-6" style={{ color: colors.textDark }}>{error}</p>
          <div className="space-x-3">
            <button 
              onClick={fetchTours} 
              className="inline-flex items-center px-4 py-2 rounded-xl font-semibold transition-all transform hover:scale-105"
              style={{ 
                backgroundColor: colors.primary,
                color: colors.textLight
              }}
            >
              <RefreshCw size={16} className="mr-2" />
              Try Again
            </button>
            <Link 
              to="/admin/tours/new" 
              className="inline-flex items-center px-4 py-2 border rounded-xl font-semibold transition-all"
              style={{ 
                borderColor: colors.border,
                color: colors.textDark
              }}
            >
              <Plus size={16} className="mr-2" />
              Create First Tour
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: colors.lightBg }}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.darkBg }}>
            Tours Management
          </h1>
          <p className="text-lg" style={{ color: colors.textDark }}>
            Manage your tour packages with city-wise pricing and features
          </p>
        </div>
        <Link 
          to="/admin/tours/new" 
          className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg mt-4 lg:mt-0"
          style={{ 
            backgroundColor: colors.primary,
            color: colors.textLight
          }}
        >
          <Plus size={20} className="mr-2" />
          Create New Tour
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div 
          className="rounded-xl p-4 flex items-center border"
          style={{ 
            backgroundColor: '#F0F9FF',
            borderColor: colors.secondary
          }}
        >
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center mr-3"
            style={{ backgroundColor: colors.secondary + '20' }}
          >
            <CheckCircle size={16} style={{ color: colors.secondary }} />
          </div>
          <span className="font-medium" style={{ color: colors.darkBg }}>{successMessage}</span>
          <button 
            onClick={() => setSuccessMessage('')}
            className="ml-auto transition-colors"
            style={{ color: colors.textDark }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          className="rounded-xl p-4 shadow-lg border"
          style={{ 
            backgroundColor: colors.secondary + '08',
            borderColor: colors.secondary + '30'
          }}
        >
          <div className="text-2xl font-bold mb-1" style={{ color: colors.secondary }}>{stats.total}</div>
          <div className="text-sm font-medium" style={{ color: colors.textDark }}>Total Tours</div>
        </div>
        <div 
          className="rounded-xl p-4 shadow-lg border"
          style={{ 
            backgroundColor: '#ECFDF5',
            borderColor: '#10B981'
          }}
        >
          <div className="text-2xl font-bold mb-1" style={{ color: '#10B981' }}>{stats.published}</div>
          <div className="text-sm font-medium" style={{ color: colors.textDark }}>Published</div>
        </div>
        <div 
          className="rounded-xl p-4 shadow-lg border"
          style={{ 
            backgroundColor: '#FFFBEB',
            borderColor: '#F59E0B'
          }}
        >
          <div className="text-2xl font-bold mb-1" style={{ color: '#F59E0B' }}>{stats.draft}</div>
          <div className="text-sm font-medium" style={{ color: colors.textDark }}>Draft</div>
        </div>
        <div 
          className="rounded-xl p-4 shadow-lg border"
          style={{ 
            backgroundColor: '#FAF5FF',
            borderColor: '#8B5CF6'
          }}
        >
          <div className="text-2xl font-bold mb-1" style={{ color: '#8B5CF6' }}>{stats.featured}</div>
          <div className="text-sm font-medium" style={{ color: colors.textDark }}>Featured</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textDark }} />
            <input
              type="text"
              placeholder="Search tours by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border rounded-xl w-full transition-all"
              style={{ 
                borderColor: colors.border,
                focusBorderColor: colors.primary
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border rounded-xl transition-all"
            style={{ 
              borderColor: colors.border,
              focusBorderColor: colors.primary
            }}
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 border rounded-xl transition-all"
            style={{ 
              borderColor: colors.border,
              focusBorderColor: colors.primary
            }}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Tours Table */}
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: colors.border }}>
          <table className="min-w-full divide-y" style={{ divideColor: colors.border }}>
            <thead style={{ backgroundColor: colors.lightBg }}>
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDark }}>
                  Tour Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDark }}>
                  Pricing & Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDark }}>
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDark }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ divideColor: colors.border }}>
              {currentTours.map((tour) => (
                <tr key={tour._id} className="transition-all duration-200 group hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {tour.thumbnail ? (
                          <img 
                            className="h-16 w-16 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all" 
                            src={tour.thumbnail} 
                            alt={tour.name}
                          />
                        ) : (
                          <div 
                            className="h-16 w-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                            style={{ backgroundColor: colors.secondary }}
                          >
                            {tour.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-semibold truncate" style={{ color: colors.darkBg }}>{tour.name}</h3>
                          {tour.isFeatured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                              <Star size={12} className="mr-1" />
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-2 flex items-center" style={{ color: colors.textDark }}>
                          <MapPin size={14} className="mr-1" />
                          {tour.location}
                        </p>
                        <div className="flex items-center space-x-4 text-sm" style={{ color: colors.textDark }}>
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {tour.duration}
                          </span>
                          <span className="flex items-center">
                            <Users size={14} className="mr-1" />
                            Max {tour.maxGroupSize}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            tour.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border border-green-200' :
                            tour.difficulty === 'Moderate' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            'bg-red-50 text-red-700 border border-red-200'
                          }`}>
                            {tour.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium" style={{ color: colors.darkBg }}>{tour.category || 'Custom'}</span>
                        <span className="mx-2" style={{ color: colors.border }}>•</span>
                        <span style={{ color: colors.textDark }}>{tour.tourType}</span>
                      </div>
                      <div className="space-y-1">
                        {tour.cityPricing && tour.cityPricing.slice(0, 2).map((cityPrice, index) => {
                          // Calculate minimum price from all pricing options
                          const prices = cityPrice.pricingOptions?.map(opt => opt.price).filter(p => p > 0) || [];
                          const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                          
                          return (
                            <div 
                              key={index} 
                              className="rounded-lg px-3 py-2 space-y-1"
                              style={{ backgroundColor: colors.lightBg }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm" style={{ color: colors.darkBg }}>{cityPrice.city}</span>
                                {minPrice ? (
                                  <span className="font-semibold" style={{ color: colors.primary }}>
                                    ₹{minPrice.toLocaleString()}
                                    <span className="text-[10px] font-normal ml-1" style={{ color: colors.textDark }}>onwards</span>
                                  </span>
                                ) : (
                                  <span className="text-xs italic" style={{ color: colors.textDark }}>
                                    Not set
                                  </span>
                                )}
                              </div>
                              {cityPrice.pricingOptions && cityPrice.pricingOptions.length > 0 && (
                                <div className="text-[10px] space-y-1" style={{ color: colors.textDark }}>
                                  {cityPrice.pricingOptions.slice(0, 3).map((option, optIndex) => (
                                    option.categoryName && option.price > 0 && (
                                      <div key={optIndex} className="flex justify-between">
                                        <span className="font-medium">{option.categoryName}:</span>
                                        <span>₹{option.price.toLocaleString()}</span>
                                      </div>
                                    )
                                  ))}
                                  {cityPrice.pricingOptions.length > 3 && (
                                    <span className="italic" style={{ color: colors.secondary }}>
                                      +{cityPrice.pricingOptions.length - 3} more options
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {tour.cityPricing && tour.cityPricing.length > 2 && (
                          <div className="text-xs font-medium cursor-pointer hover:underline" style={{ color: colors.secondary }}>
                            +{tour.cityPricing.length - 2} more cities
                          </div>
                        )}
                        {(!tour.cityPricing || tour.cityPricing.length === 0) && (
                          <div className="text-sm italic rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                            No pricing configured
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-3">
                      <StatusBadge isActive={tour.isActive} />
                      <FeaturedBadge 
                        isFeatured={tour.isFeatured} 
                        onClick={() => handleFeaturedToggle(tour._id, tour.isFeatured, tour.name)}
                      />
                      <select
                        value={tour.isActive ? 'published' : 'draft'}
                        onChange={(e) => handleStatusChange(tour._id, e.target.value, tour.name)}
                        className="block w-full text-sm border rounded-lg transition-all"
                        style={{ 
                          borderColor: colors.border,
                          focusBorderColor: colors.primary
                        }}
                      >
                        <option value="published">Publish</option>
                        <option value="draft">Move to Draft</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/admin/bookings?type=tour&itemId=${tour._id}`}
                        className="inline-flex items-center p-2 rounded-lg transition-all transform hover:scale-110"
                        style={{ 
                          backgroundColor: colors.secondary + '15',
                          color: colors.secondary
                        }}
                        title="View Bookings"
                      >
                        <BookOpen size={18} />
                      </Link>
                      <Link
                        to={`/admin/tours/edit/${tour._id}`}
                        className="inline-flex items-center p-2 rounded-lg transition-all transform hover:scale-110"
                        style={{ 
                          backgroundColor: colors.primary + '15',
                          color: colors.primary
                        }}
                        title="Edit Tour"
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(tour._id, tour.name)}
                        className="inline-flex items-center p-2 rounded-lg transition-all transform hover:scale-110"
                        style={{ 
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626'
                        }}
                        title="Delete Tour"
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t bg-white px-4 py-4 mt-6 rounded-xl" style={{ borderColor: colors.border }}>
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                style={{ 
                  borderColor: colors.border,
                  color: colors.textDark
                }}
              >
                ← Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center px-4 py-2 border text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                style={{ 
                  borderColor: colors.border,
                  color: colors.textDark
                }}
              >
                Next →
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm" style={{ color: colors.textDark }}>
                  Showing <span className="font-semibold">{indexOfFirstTour + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(indexOfLastTour, filteredTours.length)}</span> of{' '}
                  <span className="font-semibold">{filteredTours.length}</span> tours
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all ${
                        currentPage === i + 1
                          ? 'text-white border'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                      style={currentPage === i + 1 ? {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary
                      } : {
                        backgroundColor: 'white',
                        color: colors.textDark
                      }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTours.length === 0 && !loading && (
          <div className="text-center py-16">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: colors.secondary + '15' }}
            >
              <BookOpen size={32} style={{ color: colors.secondary }} />
            </div>
            <h3 className="text-2xl font-bold mb-3" style={{ color: colors.darkBg }}>
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' ? 'No tours found' : 'No tours created'}
            </h3>
            <p className="mb-8 max-w-md mx-auto" style={{ color: colors.textDark }}>
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                ? "No tours match your current filters. Try adjusting your search criteria."
                : "You haven't created any tours yet. Start by creating your first tour package!"
              }
            </p>
            <div className="space-x-4">
              <Link 
                to="/admin/tours/new" 
                className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
                style={{ 
                  backgroundColor: colors.primary,
                  color: colors.textLight
                }}
              >
                <Plus size={20} className="mr-2" />
                Create Your First Tour
              </Link>
              {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="inline-flex items-center px-6 py-3 border rounded-xl font-semibold transition-all"
                  style={{ 
                    borderColor: colors.border,
                    color: colors.textDark
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToursManagement;