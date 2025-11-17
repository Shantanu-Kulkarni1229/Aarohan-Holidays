import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { adminAPI } from '../api/api';
import { showError } from '../utils/toast';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [stats, setStats] = useState([
    { label: 'Total Tours', value: '0', change: '0%', trend: 'up' },
    { label: 'Active Bookings', value: '0', change: '0%', trend: 'up' },
    { label: 'Pending Enquiries', value: '0', change: '0%', trend: 'down' },
    { label: 'Total Items', value: '0', change: '0%', trend: 'up' },
  ]);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊', description: 'Overview & Analytics' },
    { name: 'Tours', href: '/admin/tours', icon: '🏖️', description: 'Manage Tour Packages' },
    { name: 'Treks', href: '/admin/treks', icon: '⛰️', description: 'Adventure Treks' },
    { name: 'Custom Bookings', href: '/admin/custom-bookings', icon: '✨', description: 'Personalized Packages' },
    { name: 'Bookings', href: '/admin/bookings', icon: '📋', description: 'Customer Reservations' },
    { name: 'Testimonials', href: '/admin/testimonials', icon: '⭐', description: 'Customer Reviews' },
    { name: 'Enquiries', href: '/admin/enquiries', icon: '📧', description: 'Customer Queries' },
    { name: 'Extras', href: '/admin/extras', icon: '🎟️', description: 'Coupons & Promotions' },
  ];

  // Color constants
  const colors = {
    primary: '#1E9ABF',
    secondary: '#E66926',
    background: '#F8FAFC',
    text: '#1F2937',
    textLight: '#6B7280',
    border: '#E5E7EB',
    success: '#059669',
    warning: '#D97706'
  };

  // Fetch stats from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [toursResponse, treksResponse] = await Promise.all([
          adminAPI.tours.getAll(),
          adminAPI.treks.getAll()
        ]);

        const tours = toursResponse.data.data || [];
        const treks = treksResponse.data.data || [];
        
        const totalTours = tours.length + treks.length;
        const totalBookings = tours.reduce((sum, tour) => sum + (tour.totalBookings || 0), 0) + 
                             treks.reduce((sum, trek) => sum + (trek.totalBookings || 0), 0);
        const activeTours = tours.filter(t => t.isActive).length + treks.filter(t => t.isActive).length;

        setStats([
          { label: 'Tour Packages', value: tours.length.toString(), change: '+0%', trend: 'up' },
          { label: 'Total Bookings', value: totalBookings.toString(), change: '+0%', trend: 'up' },
          { label: 'Active Items', value: activeTours.toString(), change: '+0%', trend: 'up' },
          { label: 'All Packages', value: totalTours.toString(), change: '+0%', trend: 'up' },
        ]);
      } catch (error) {
        // Stats are optional, silently fail
      }
    };

    fetchStats();
  }, []);

  const currentTime = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper function to check if a nav item is active
  const isNavActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b" style={{ borderColor: colors.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Section */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg transition-all hover:bg-gray-100"
                style={{ color: colors.primary }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm" 
                     style={{ backgroundColor: colors.primary }}>
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold" style={{ color: colors.primary }}>
                    Aarohan Holidays
                  </h1>
                  <p className="text-xs" style={{ color: colors.textLight }}>Administration Panel</p>
                </div>
              </div>
            </div>

            {/* Center Section - Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: colors.text }}>{stats[0]?.value || '0'}</div>
                <div className="text-xs" style={{ color: colors.textLight }}>{stats[0]?.label || 'Tour Packages'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: colors.success }}>{stats[1]?.value || '0'}</div>
                <div className="text-xs" style={{ color: colors.textLight }}>{stats[1]?.label || 'Total Bookings'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: colors.primary }}>{stats[2]?.value || '0'}</div>
                <div className="text-xs" style={{ color: colors.textLight }}>{stats[2]?.label || 'Active Items'}</div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Date Display */}
              <div className="hidden md:block text-sm px-3 py-1 rounded-lg" 
                   style={{ color: colors.textLight, backgroundColor: '#F1F5F9' }}>
                📅 {currentTime}
              </div>

              {/* Notification Bell */}
              <button className="relative p-2 transition-colors hover:bg-gray-100 rounded-lg"
                      style={{ color: colors.textLight }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 0-6 6v2.25l-2.47 2.47a.75.75 0 0 0 .53 1.28h15.88a.75.75 0 0 0 .53-1.28L16.5 12V9.75a6 6 0 0 0-6-6z" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Back to Website */}
              <NavLink
                to="/"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all hover:shadow-sm text-white"
                style={{ backgroundColor: colors.primary }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                View Website
              </NavLink>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg transition-colors hover:bg-gray-100"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                       style={{ backgroundColor: colors.secondary }}>
                    <span className="text-sm font-bold">A</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium" style={{ color: colors.text }}>Admin User</div>
                    <div className="text-xs" style={{ color: colors.textLight }}>Administrator</div>
                  </div>
                  <svg className="w-4 h-4" style={{ color: colors.textLight }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50"
                       style={{ borderColor: colors.border }}>
                    <div className="px-4 py-2 border-b" style={{ borderColor: colors.border }}>
                      <div className="text-sm font-medium" style={{ color: colors.text }}>Admin User</div>
                      <div className="text-xs" style={{ color: colors.textLight }}>Aarohan Holidays</div>
                    </div>
                    <button className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                            style={{ color: colors.text }}>
                      👤 My Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                            style={{ color: colors.text }}>
                      ⚙️ Settings
                    </button>
                    <div className="border-t mt-2 pt-2" style={{ borderColor: colors.border }}>
                      <button className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-red-50"
                              style={{ color: '#DC2626' }}>
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`bg-white shadow-sm border-r transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} h-[calc(100vh-64px)] sticky top-16 overflow-y-auto`}
             style={{ borderColor: colors.border }}>
          <div className="p-4">
            {/* Welcome Message */}
            {isSidebarOpen && (
              <div className="mb-6 p-4 rounded-lg border" 
                   style={{ backgroundColor: '#F8FAFE', borderColor: colors.border }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                       style={{ backgroundColor: colors.primary }}>
                    <span className="text-sm">👋</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Welcome back!</h3>
                    <p className="text-xs" style={{ color: colors.textLight }}>Ready to manage your packages?</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = isNavActive(item.href);
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      className={({ isActive: navIsActive }) =>
                        `flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all group ${
                          navIsActive || isActive
                            ? 'text-white shadow-sm transform scale-105'
                            : 'hover:bg-gray-50 hover:shadow-sm'
                        }`
                      }
                      style={
                        (isActive || isActive)
                          ? { backgroundColor: colors.primary }
                          : { color: colors.text }
                      }
                    >
                      <span className={`text-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                        {item.icon}
                      </span>
                      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-3 opacity-100' : 'w-0 opacity-0'}`}>
                        <div className="font-medium">{item.name}</div>
                        {isSidebarOpen && (
                          <div className={`text-xs mt-1 ${isActive ? 'text-blue-100' : ''}`}
                               style={isActive ? {} : { color: colors.textLight }}>
                            {item.description}
                          </div>
                        )}
                      </div>
                    </NavLink>
                  </li>
                );
              })}
            </ul>

            {/* Quick Actions */}
          
          </div>

          {/* Sidebar Toggle Hint */}
          {!isSidebarOpen && (
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="transition-colors hover:bg-gray-100 rounded-lg p-1"
                style={{ color: colors.textLight }}
                title="Expand sidebar"
              >
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </nav>

        {/* Main content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
          <div className="p-6">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center space-x-2 text-sm"
                 style={{ color: colors.textLight }}>
              <span>🏠</span>
              <span>/</span>
              <span>Admin</span>
              <span>/</span>
              <span className="font-medium" style={{ color: colors.primary }}>Dashboard</span>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-6 transition-all hover:shadow-md"
                     style={{ borderColor: colors.border }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.textLight }}>{stat.label}</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: colors.text }}>{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                    style={stat.trend === 'up' ? { color: colors.success } : { color: '#DC2626' }}>
                      {stat.trend === 'up' ? '📈' : '📉'}
                    </div>
                  </div>
                  <div className={`text-xs font-medium mt-2 ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last week
                  </div>
                </div>
              ))}
            </div>

            {/* Page Content */}
            <div className="bg-white rounded-lg shadow-sm border min-h-[500px]"
                 style={{ borderColor: colors.border }}>
              <Outlet />
            </div>

            {/* Footer */}
            <footer className="mt-8 text-center text-sm">
              <div className="flex items-center justify-center space-x-4" style={{ color: colors.textLight }}>
                <span>© 2025 Aarohan Holidays</span>
                <span>•</span>
                <span>Admin Panel v2.0</span>
                <span>•</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.success }}></span>
                  System Status: Operational
                </span>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Back to Website Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <NavLink
          to="/"
          className="inline-flex items-center p-3 rounded-full shadow-lg text-white transition-all hover:shadow-xl"
          style={{ backgroundColor: colors.primary }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </NavLink>
      </div>

      {/* Overlay for mobile menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setUserMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;