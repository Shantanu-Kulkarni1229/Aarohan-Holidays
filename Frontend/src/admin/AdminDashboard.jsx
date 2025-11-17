import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/api';
import { showError } from '../utils/toast';
import { 
  TrendingUp, 
  MapPin, 
  Mountain, 
  Eye, 
  Calendar,
  Star,
  Edit,
  Plus,
  RefreshCw,
  Settings,
  BarChart3,
  Users,
  DollarSign,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package,
  Activity,
  Target
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    tours: {
      totalTours: 0,
      publishedTours: 0,
      draftTours: 0,
      featuredTours: 0,
      totalViews: 0,
      totalBookings: 0,
      revenue: 0
    },
    treks: {
      totalTreks: 0,
      publishedTreks: 0,
      draftTreks: 0,
      featuredTreks: 0,
      totalViews: 0,
      totalBookings: 0,
      revenue: 0
    },
    recent: {
      tours: [],
      treks: []
    },
    overview: {
      totalItems: 0,
      totalBookings: 0,
      totalRevenue: 0,
      activeItems: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('today');

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
    fetchDashboardStats();
  }, [timeRange]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [toursResponse, treksResponse] = await Promise.all([
        adminAPI.tours.getAll(),
        adminAPI.treks.getAll()
      ]);

      const tours = toursResponse.data.data || [];
      const treks = treksResponse.data.data || [];

      const toursStats = {
        totalTours: tours.length,
        publishedTours: tours.filter(tour => tour.isActive).length,
        draftTours: tours.filter(tour => !tour.isActive).length,
        featuredTours: tours.filter(tour => tour.isFeatured).length,
        totalViews: tours.reduce((sum, tour) => sum + (tour.totalViews || 0), 0),
        totalBookings: tours.reduce((sum, tour) => sum + (tour.totalBookings || 0), 0),
        revenue: tours.reduce((sum, tour) => sum + ((tour.totalBookings || 0) * (tour.startingPrice || 0)), 0)
      };

      const treksStats = {
        totalTreks: treks.length,
        publishedTreks: treks.filter(trek => trek.isActive).length,
        draftTreks: treks.filter(trek => !trek.isActive).length,
        featuredTreks: treks.filter(trek => trek.isFeatured).length,
        totalViews: treks.reduce((sum, trek) => sum + (trek.totalViews || 0), 0),
        totalBookings: treks.reduce((sum, trek) => sum + (trek.totalBookings || 0), 0),
        revenue: treks.reduce((sum, trek) => {
          const avgPrice = trek.cityPricing?.[0]?.price || 0;
          return sum + ((trek.totalBookings || 0) * avgPrice);
        }, 0)
      };

      const overviewStats = {
        totalItems: tours.length + treks.length,
        totalBookings: toursStats.totalBookings + treksStats.totalBookings,
        totalRevenue: toursStats.revenue + treksStats.revenue,
        activeItems: toursStats.publishedTours + treksStats.publishedTreks
      };

      setStats({
        tours: toursStats,
        treks: treksStats,
        recent: {
          tours: tours.slice(0, 5).map(tour => ({
            ...tour,
            type: 'tour',
            status: tour.isActive ? 'published' : 'draft'
          })),
          treks: treks.slice(0, 5).map(trek => ({
            ...trek,
            type: 'trek',
            status: trek.isActive ? 'published' : 'draft'
          }))
        },
        overview: overviewStats
      });
    } catch (error) {
      setError('Unable to load dashboard data. Please check your connection and try again.');
      showError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div 
      className="bg-white rounded-xl shadow-lg border p-6 transform hover:scale-105 transition-all duration-300 group"
      style={{ borderColor: colors.border }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: colors.textDark }}>{title}</p>
          <p className="text-3xl font-bold mb-2" style={{ color: color }}>{value}</p>
          {subtitle && <p className="text-sm" style={{ color: colors.textDark }}>{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend.value < 0 ? 'rotate-180' : ''}`} />
              {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
            </div>
          )}
        </div>
        <div 
          className="p-3 rounded-xl transition-all group-hover:scale-110"
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

  const QuickActionCard = ({ title, description, icon, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`bg-white rounded-xl shadow-lg border p-6 text-left hover:shadow-xl transform hover:scale-105 transition-all duration-200 group ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-300'
      }`}
      style={{ borderColor: colors.border }}
    >
      <div 
        className="p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
        style={{ backgroundColor: colors.primary + '15' }}
      >
        {React.cloneElement(icon, { 
          size: 24, 
          style: { color: colors.primary } 
        })}
      </div>
      <h3 className="font-semibold mb-2" style={{ color: colors.darkBg }}>{title}</h3>
      <p className="text-sm" style={{ color: colors.textDark }}>{description}</p>
    </button>
  );

  const RecentItemCard = ({ item, type }) => (
    <div 
      className="flex items-center justify-between p-4 rounded-lg hover:bg-white border transition-all duration-200"
      style={{ 
        backgroundColor: colors.lightBg,
        borderColor: colors.border
      }}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ 
            backgroundColor: type === 'tour' ? colors.secondary + '15' : colors.primary + '15'
          }}
        >
          {type === 'tour' ? 
            <MapPin size={20} style={{ color: colors.secondary }} /> : 
            <Mountain size={20} style={{ color: colors.primary }} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate" style={{ color: colors.darkBg }}>{item.name}</h4>
          <div className="flex items-center space-x-2 text-sm mt-1">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
              item.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {item.status === 'published' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
              {item.status}
            </span>
            {item.isFeatured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="text-right text-sm" style={{ color: colors.textDark }}>
          <div className="flex items-center space-x-1">
            <Eye size={16} />
            <span>{item.totalViews || 0}</span>
          </div>
          <div className="flex items-center space-x-1 mt-1">
            <Users size={16} />
            <span>{item.totalBookings || 0}</span>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/admin/${type}s/edit/${item._id}`)}
          className="p-2 rounded-lg transition-colors hover:bg-blue-50"
          style={{ color: colors.textDark }}
        >
          <Edit size={16} />
        </button>
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
          <h3 className="text-xl font-semibold mb-2" style={{ color: colors.darkBg }}>Loading Dashboard</h3>
          <p style={{ color: colors.textDark }}>We're gathering your latest statistics...</p>
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
              Dashboard Overview
            </h1>
            <p className="text-lg" style={{ color: colors.textDark }}>
              Welcome back! Here's what's happening with your travel offerings.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:border-transparent"
              style={{ 
                borderColor: colors.border,
                focusRingColor: colors.primary
              }}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>

            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-white border rounded-lg transition-colors font-medium disabled:opacity-50"
              style={{ 
                borderColor: colors.border,
                color: colors.textDark
              }}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg p-4 animate-fade-in border-l-4" style={{ 
            backgroundColor: '#FEF2F2',
            borderColor: '#EF4444'
          }}>
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 mr-3" style={{ color: '#EF4444' }} />
              <div>
                <h4 className="font-semibold" style={{ color: '#991B1B' }}>Unable to Load Data</h4>
                <p className="mt-1" style={{ color: '#DC2626' }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Experiences" 
            value={stats.overview.totalItems} 
            icon={<Package />}
            color={colors.primary}
          />
          <StatCard 
            title="Active Listings" 
            value={stats.overview.activeItems} 
            icon={<Activity />}
            color={colors.secondary}
          />
          <StatCard 
            title="Total Bookings" 
            value={stats.overview.totalBookings} 
            icon={<Target />}
            color={colors.primary}
          />
          <StatCard 
            title="Total Revenue" 
            value={`₹${stats.overview.totalRevenue.toLocaleString()}`} 
            icon={<DollarSign />}
            color={colors.secondary}
          />
        </div>

        {/* Tours & Treks Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tours Statistics */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center space-x-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.secondary + '15' }}
              >
                <MapPin size={24} style={{ color: colors.secondary }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: colors.darkBg }}>Tours Performance</h2>
                <p style={{ color: colors.textDark }}>Detailed statistics for your tours</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Total Tours" value={stats.tours.totalTours} icon={<MapPin />} color={colors.secondary} />
              <StatCard title="Published" value={stats.tours.publishedTours} icon={<CheckCircle2 />} color="#10B981" />
              <StatCard title="Drafts" value={stats.tours.draftTours} icon={<Clock />} color="#F59E0B" />
              <StatCard title="Featured" value={stats.tours.featuredTours} icon={<Star />} color="#8B5CF6" />
              <StatCard title="Total Views" value={stats.tours.totalViews} icon={<Eye />} color={colors.primary} />
              <StatCard title="Total Bookings" value={stats.tours.totalBookings} icon={<Users />} color={colors.secondary} />
            </div>
          </div>

          {/* Treks Statistics */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <div className="flex items-center space-x-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.primary + '15' }}
              >
                <Mountain size={24} style={{ color: colors.primary }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: colors.darkBg }}>Treks Performance</h2>
                <p style={{ color: colors.textDark }}>Detailed statistics for your treks</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Total Treks" value={stats.treks.totalTreks} icon={<Mountain />} color={colors.primary} />
              <StatCard title="Published" value={stats.treks.publishedTreks} icon={<CheckCircle2 />} color="#10B981" />
              <StatCard title="Drafts" value={stats.treks.draftTreks} icon={<Clock />} color="#F59E0B" />
              <StatCard title="Featured" value={stats.treks.featuredTreks} icon={<Star />} color="#8B5CF6" />
              <StatCard title="Total Views" value={stats.treks.totalViews} icon={<Eye />} color={colors.secondary} />
              <StatCard title="Total Bookings" value={stats.treks.totalBookings} icon={<Users />} color={colors.primary} />
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
         

          {/* Recent Items */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold mb-6" style={{ color: colors.darkBg }}>Recent Activities</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 text-lg" style={{ color: colors.secondary }}>Recent Tours</h4>
                <div className="space-y-3">
                  {stats.recent.tours.map((tour) => (
                    <RecentItemCard key={tour._id} item={tour} type="tour" />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-lg" style={{ color: colors.primary }}>Recent Treks</h4>
                <div className="space-y-3">
                  {stats.recent.treks.map((trek) => (
                    <RecentItemCard key={trek._id} item={trek} type="trek" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Tips */}
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
                Featured experiences get 3x more views! Consider featuring your most popular tours and treks to increase visibility.
              </p>
            </div>
            <Star size={32} style={{ color: colors.secondary, opacity: 0.3 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;