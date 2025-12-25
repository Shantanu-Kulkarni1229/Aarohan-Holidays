import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/api';
import { showSuccess, showError } from '../utils/toast';
import {
  Search,
  Filter,
  Plus,
  Mountain,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Users,
  Star,
  MapPin,
  TrendingUp,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Download,
  Shield,
  Package,
  Activity,
  Target,
  BookOpen
} from 'lucide-react';

const TreksManagement = () => {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    featured: 0,
    totalBookings: 0
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
    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.treks.getAll();
      
      if (response.data.success) {
        const treksData = response.data.data;
        setTreks(treksData);
        
        // Calculate stats
        setStats({
          total: treksData.length,
          published: treksData.filter(trek => trek.isActive).length,
          draft: treksData.filter(trek => !trek.isActive).length,
          featured: treksData.filter(trek => trek.isFeatured).length,
          totalBookings: treksData.reduce((sum, trek) => sum + (trek.totalBookings || 0), 0)
        });
      } else {
        setError('Unable to load treks data');
      }
    } catch (error) {
      setError('Error loading treks. Please check your connection and try again.');
      showError('Failed to load treks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (trekId) => {
    if (!window.confirm('Are you sure you want to delete this trek? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.treks.delete(trekId);
      setTreks(treks.filter(trek => trek._id !== trekId));
      showSuccess('Trek deleted successfully');
    } catch (error) {
      setError('Failed to delete trek. Please try again.');
      setTimeout(() => setError(''), 5000);
      showError('Failed to delete trek');
    }
  };

  const handleStatusChange = async (trekId, newStatus) => {
    try {
      const formData = new FormData();
      formData.append('isActive', newStatus === 'published');
      
      await adminAPI.treks.update(trekId, formData);
      setTreks(treks.map(trek => 
        trek._id === trekId ? { ...trek, isActive: newStatus === 'published' } : trek
      ));
      showSuccess(`Trek ${newStatus === 'published' ? 'published' : 'moved to draft'}`);
    } catch (error) {
      setError('Failed to update trek status. Please try again.');
      setTimeout(() => setError(''), 5000);
      showError('Failed to update trek status');
    }
  };

  const handleFeatureToggle = async (trekId, currentStatus) => {
    try {
      const formData = new FormData();
      formData.append('isFeatured', !currentStatus);
      
      await adminAPI.treks.update(trekId, formData);
      setTreks(treks.map(trek => 
        trek._id === trekId ? { ...trek, isFeatured: !currentStatus } : trek
      ));
      showSuccess(`Trek ${!currentStatus ? 'featured' : 'unfeatured'}`);
    } catch (error) {
      setError('Failed to update feature status. Please try again.');
      setTimeout(() => setError(''), 5000);
      showError('Failed to update feature status');
    }
  };

  const filteredTreks = treks.filter(trek => {
    const matchesSearch = trek.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trek.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && trek.isActive) ||
      (statusFilter === 'draft' && !trek.isActive);
    const matchesDifficulty = difficultyFilter === 'all' || trek.difficulty.toLowerCase() === difficultyFilter;
    const matchesCategory = categoryFilter === 'all' || trek.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesDifficulty && matchesCategory;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-50 text-green-700 border-green-200';
      case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'hard': return 'bg-red-50 text-red-700 border-red-200';
      case 'extreme': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div 
      className="bg-white rounded-xl shadow-lg border p-6 transform hover:scale-105 transition-all duration-300"
      style={{ borderColor: colors.border }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: colors.textDark }}>{title}</p>
          <p className="text-3xl font-bold mb-2" style={{ color: color }}>{value}</p>
          {subtitle && <p className="text-sm" style={{ color: colors.textDark }}>{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              {trend > 0 ? '+' : ''}{trend}% from last month
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-xl transition-all hover:scale-110"
          style={{ backgroundColor: color + '15' }}
        >
          {React.cloneElement(icon, { 
            size: 24, 
            style: { color: color } 
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightBg }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4"
            style={{ borderColor: colors.primary }}
          ></div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: colors.darkBg }}>Loading Treks</h3>
          <p style={{ color: colors.textDark }}>We're gathering your trekking adventures...</p>
        </div>
      </div>
    );
  }

  if (error && treks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightBg }}>
        <div className="text-center max-w-md mx-auto">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: colors.primary + '15' }}
          >
            <AlertCircle size={32} style={{ color: colors.primary }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: colors.darkBg }}>Error Loading Treks</h3>
          <p className="mb-6" style={{ color: colors.textDark }}>{error}</p>
          <button 
            onClick={fetchTreks} 
            className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
            style={{ 
              backgroundColor: colors.primary,
              color: colors.textLight
            }}
          >
            <RefreshCw size={20} className="mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.lightBg }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2" style={{ color: colors.darkBg }}>
              Treks Management
            </h1>
            <p className="text-lg" style={{ color: colors.textDark }}>
              Manage your trekking adventures with city-wise departure pricing
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchTreks}
              className="inline-flex items-center px-4 py-2 bg-white border rounded-xl transition-colors font-medium"
              style={{ 
                borderColor: colors.border,
                color: colors.textDark
              }}
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh Data
            </button>
            <Link 
              to="/admin/treks/new" 
              className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
              style={{ 
                backgroundColor: colors.primary,
                color: colors.textLight
              }}
            >
              <Plus size={20} className="mr-2" />
              Add New Trek
            </Link>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div 
            className="rounded-lg p-4 border-l-4 animate-fade-in"
            style={{ 
              backgroundColor: '#F0F9FF',
              borderColor: colors.secondary
            }}
          >
            <div className="flex items-center">
              <CheckCircle2 size={24} className="mr-3" style={{ color: colors.secondary }} />
              <div>
                <h4 className="font-semibold" style={{ color: colors.darkBg }}>Success</h4>
                <p className="mt-1" style={{ color: colors.textDark }}>{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div 
            className="rounded-lg p-4 border-l-4 animate-fade-in"
            style={{ 
              backgroundColor: '#FEF2F2',
              borderColor: '#EF4444'
            }}
          >
            <div className="flex items-center">
              <AlertCircle size={24} className="mr-3" style={{ color: '#EF4444' }} />
              <div>
                <h4 className="font-semibold" style={{ color: '#991B1B' }}>Attention Required</h4>
                <p className="mt-1" style={{ color: '#DC2626' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard 
            title="Total Treks" 
            value={stats.total}
            subtitle="All treks"
            icon={<Package />}
            color={colors.secondary}
          />
          <StatCard 
            title="Published" 
            value={stats.published}
            subtitle="Active treks"
            icon={<CheckCircle2 />}
            color="#10B981"
          />
          <StatCard 
            title="Drafts" 
            value={stats.draft}
            subtitle="In progress"
            icon={<Clock />}
            color="#F59E0B"
          />
          <StatCard 
            title="Featured" 
            value={stats.featured}
            subtitle="Highlighted"
            icon={<Star />}
            color="#8B5CF6"
          />
          <StatCard 
            title="Total Bookings" 
            value={stats.totalBookings}
            subtitle="All time"
            icon={<Users />}
            color={colors.primary}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                <Search size={16} className="inline mr-1" />
                Search Treks
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: colors.textDark }} />
                <input
                  type="text"
                  placeholder="Search by name, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl transition-all"
                  style={{ 
                    borderColor: colors.border,
                    focusBorderColor: colors.primary
                  }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                <Filter size={16} className="inline mr-1" />
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl transition-all"
                style={{ 
                  borderColor: colors.border,
                  focusBorderColor: colors.primary
                }}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                <Shield size={16} className="inline mr-1" />
                Difficulty
              </label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl transition-all"
                style={{ 
                  borderColor: colors.border,
                  focusBorderColor: colors.primary
                }}
              >
                <option value="all">All Difficulty</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                <MapPin size={16} className="inline mr-1" />
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl transition-all"
                style={{ 
                  borderColor: colors.border,
                  focusBorderColor: colors.primary
                }}
              >
                <option value="all">All Categories</option>
                <option value="Himalayan Trek">Himalayan</option>
                <option value="Sahyadri Trek">Sahyadri</option>
                <option value="Western Ghats Trek">Western Ghats</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Treks Table */}
        <div className="bg-white rounded-xl shadow-lg border overflow-hidden" style={{ borderColor: colors.border }}>
          {/* Table Header */}
          <div className="px-6 py-4 border-b" style={{ backgroundColor: colors.lightBg, borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.darkBg }}>Trekking Adventures</h3>
                <p className="text-sm" style={{ color: colors.textDark }}>
                  {filteredTreks.length} treks found
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm" style={{ color: colors.textDark }}>
                <BarChart3 size={16} />
                <span>Showing all treks</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ divideColor: colors.border }}>
              <thead style={{ backgroundColor: colors.lightBg }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDark }}>
                    Trek Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textDark }}>
                    Info & Pricing
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
                {filteredTreks.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Mountain size={64} style={{ color: colors.textDark, opacity: 0.3 }} className="mb-4" />
                        <h4 className="text-lg font-semibold mb-2" style={{ color: colors.textDark }}>No treks found</h4>
                        <p className="mb-4" style={{ color: colors.textDark }}>Try adjusting your search criteria or filters</p>
                        <Link 
                          to="/admin/treks/new" 
                          className="inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105"
                          style={{ 
                            backgroundColor: colors.primary,
                            color: colors.textLight
                          }}
                        >
                          <Plus size={20} className="mr-2" />
                          Create Your First Trek
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTreks.map((trek) => (
                    <tr key={trek._id} className="transition-colors group hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {trek.thumbnail ? (
                              <img 
                                className="h-16 w-16 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-all" 
                                src={trek.thumbnail} 
                                alt={trek.name}
                              />
                            ) : (
                              <div 
                                className="h-16 w-16 rounded-xl flex items-center justify-center text-white shadow-md"
                                style={{ backgroundColor: colors.secondary }}
                              >
                                <Mountain size={24} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-lg font-semibold truncate" style={{ color: colors.darkBg }}>{trek.name}</h4>
                              {trek.isFeatured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                                  <Star size={12} className="mr-1" />
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm" style={{ color: colors.textDark }}>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {trek.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {trek.location}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(trek.difficulty)}`}>
                                {trek.difficulty}
                              </span>
                            </div>
                            <div className="text-xs mt-1" style={{ color: colors.textDark, opacity: 0.7 }}>
                              {trek.category || 'Custom Trek'} • Altitude: {trek.altitude || 0}m • Max: {trek.maxGroupSize} people
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {/* Performance Stats */}
                          <div className="flex items-center space-x-3 mb-2 text-xs" style={{ color: colors.textDark }}>
                            <span className="flex items-center gap-1">
                              <Users size={12} style={{ color: colors.secondary }} />
                              {trek.totalBookings || 0} bookings
                            </span>
                            <span className="flex items-center gap-1">
                              <Star size={12} style={{ color: '#F59E0B' }} />
                              {trek.rating || 0}/5
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={12} style={{ color: colors.primary }} />
                              {trek.totalViews || 0} views
                            </span>
                          </div>
                          
                          {/* Pricing */}
                          {trek.cityPricing && trek.cityPricing.length > 0 ? (
                            <>
                              {trek.cityPricing.slice(0, 2).map((cityPrice, index) => {
                                const prices = cityPrice.pricingOptions?.map(opt => opt.price).filter(p => p > 0) || [];
                                const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                                
                                return (
                                  <div 
                                    key={index} 
                                    className="rounded-lg px-3 py-1.5 space-y-1"
                                    style={{ 
                                      backgroundColor: colors.lightBg
                                    }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium" style={{ color: colors.darkBg }}>{cityPrice.city}</span>
                                      {minPrice ? (
                                        <span className="font-semibold text-sm" style={{ color: colors.primary }}>
                                          ₹{minPrice.toLocaleString()}
                                          <span className="text-[10px] font-normal ml-1" style={{ color: colors.textDark }}>onwards</span>
                                        </span>
                                      ) : (
                                        <span className="text-xs italic" style={{ color: colors.textDark }}>
                                          Not set
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              {trek.cityPricing.length > 2 && (
                                <div className="text-xs cursor-pointer hover:underline" style={{ color: colors.secondary }}>
                                  +{trek.cityPricing.length - 2} more cities
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm italic rounded-lg px-3 py-2" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                              No pricing configured
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <select
                            value={trek.isActive ? 'published' : 'draft'}
                            onChange={(e) => handleStatusChange(trek._id, e.target.value)}
                            className={`w-full inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                              trek.isActive 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                          </select>
                          <button
                            onClick={() => handleFeatureToggle(trek._id, trek.isFeatured)}
                            className={`w-full inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                              trek.isFeatured 
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' 
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            <Star size={12} className={`mr-1 ${trek.isFeatured ? 'fill-yellow-400' : ''}`} />
                            {trek.isFeatured ? 'Featured' : 'Feature'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/admin/bookings?type=trek&itemId=${trek._id}`}
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
                            to={`/admin/treks/edit/${trek._id}`}
                            className="inline-flex items-center p-2 rounded-lg transition-all transform hover:scale-110"
                            style={{ 
                              backgroundColor: colors.primary + '15',
                              color: colors.primary
                            }}
                            title="Edit Trek"
                          >
                            <Edit3 size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(trek._id)}
                            className="inline-flex items-center p-2 rounded-lg transition-all transform hover:scale-110"
                            style={{ 
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626'
                            }}
                            title="Delete Trek"
                          >
                            <Trash2 size={18} />
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

        {/* Quick Tips */}
        <div 
          className="rounded-xl shadow-lg p-6 border"
          style={{ 
            backgroundColor: colors.secondary + '08',
            borderColor: colors.secondary + '30'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.darkBg }}>Pro Tip</h3>
              <p style={{ color: colors.textDark }}>
                Featured treks get 3x more views and bookings! Make sure to feature your most popular adventures.
              </p>
            </div>
            <Star size={32} style={{ color: colors.secondary, opacity: 0.3 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TreksManagement;