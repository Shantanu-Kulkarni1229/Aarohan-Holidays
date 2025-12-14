import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { treksAPI } from '../api/userAPI';
import { showApiError } from '../utils/toast';
import {
  Search,
  SlidersHorizontal,
  X,
  MapPin,
  Calendar,
  Star,
  Camera,
  Grid,
  List,
  ArrowUpDown,
  Loader2,
  Mountain
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TrekPage = () => {
  const navigate = useNavigate();
  
  // Color scheme matching your design
  const colors = {
    primary: '#1E9ABF',      // Blue
    secondary: '#E66926',    // Orange
    accent: '#2A6F97',
    lightBg: '#F8FAFC',
    darkBg: '#0F172A',
    text: '#1E293B',
    textLight: '#64748B',
    border: '#E2E8F0',
    success: '#10B981',
    warning: '#F59E0B',
  };

  // State Management
  const [allTreks, setAllTreks] = useState([]);
  const [filteredTreks, setFilteredTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-low', 'price-high', 'duration', 'name'
  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'himalayan', 'sahyadri'

  // Filter States
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    duration: [],
    categories: [],
    locations: [],
    difficulty: [],
    isFixedDeparture: false, // NEW: Fixed Departure filter
  });

  // Available filter options
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    locations: [],
    difficulties: ['Easy', 'Moderate', 'Challenging', 'Difficult'],
    durations: ['1-3 Days', '4-7 Days', '8-14 Days', '15+ Days'],
  });

  // Fetch all treks
  useEffect(() => {
    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 1000,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const response = await treksAPI.getAll(params);
      const treks = response.data.data || [];
      
      setAllTreks(treks);
      
      // Extract unique categories and locations for filters
      const categories = [...new Set(treks.map(trek => trek.category).filter(Boolean))];
      const locations = [...new Set(treks.map(trek => trek.location).filter(Boolean))];
      const difficulties = [...new Set(treks.map(trek => trek.difficulty).filter(Boolean))];
      
      setFilterOptions(prev => ({
        ...prev,
        categories,
        locations,
        difficulties: difficulties.length > 0 ? difficulties : prev.difficulties
      }));
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = useCallback(() => {
    let result = [...allTreks];

    // Apply quick filter (Himalayan/Sahyadri)
    if (quickFilter === 'himalayan') {
      result = result.filter(trek => 
        trek.category?.toLowerCase().includes('himalayan')
      );
    } else if (quickFilter === 'sahyadri') {
      result = result.filter(trek => 
        trek.category?.toLowerCase().includes('sahyadri')
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trek => 
        trek.name.toLowerCase().includes(query) ||
        trek.location?.toLowerCase().includes(query) ||
        trek.category?.toLowerCase().includes(query) ||
        trek.description?.toLowerCase().includes(query) ||
        trek.difficulty?.toLowerCase().includes(query)
      );
    }

    // Apply price filter
    result = result.filter(trek => {
      const price = getMinPrice(trek);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    // Apply duration filter
    if (filters.duration.length > 0) {
      result = result.filter(trek => {
        const days = getTrekDaysCount(trek);
        return filters.duration.some(range => {
          if (range === '1-3 Days') return days >= 1 && days <= 3;
          if (range === '4-7 Days') return days >= 4 && days <= 7;
          if (range === '8-14 Days') return days >= 8 && days <= 14;
          if (range === '15+ Days') return days >= 15;
          return false;
        });
      });
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      result = result.filter(trek => 
        trek.category && filters.categories.includes(trek.category)
      );
    }

    // Apply location filter
    if (filters.locations.length > 0) {
      result = result.filter(trek => 
        trek.location && filters.locations.includes(trek.location)
      );
    }

    // Apply difficulty filter
    if (filters.difficulty.length > 0) {
      result = result.filter(trek => 
        trek.difficulty && filters.difficulty.includes(trek.difficulty)
      );
    }

    // Apply Fixed Departure filter - NEW
    if (filters.isFixedDeparture) {
      result = result.filter(trek => trek.isFixedDeparture === true);
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        case 'price-low':
          return getMinPrice(a) - getMinPrice(b);
        case 'price-high':
          return getMinPrice(b) - getMinPrice(a);
        case 'duration':
          return getTrekDaysCount(a) - getTrekDaysCount(b);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredTreks(result);
  }, [allTreks, searchQuery, filters, sortBy, quickFilter]);

  // Apply filters and search whenever they change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const getMinPrice = (trek) => {
    if (!trek.cityPricing || trek.cityPricing.length === 0) return 0;
    
    // Treks use pricingOptions array with flexible categoryName and price
    const allPrices = [];
    trek.cityPricing.forEach(city => {
      if (city.pricingOptions && Array.isArray(city.pricingOptions)) {
        city.pricingOptions.forEach(option => {
          if (option.price) allPrices.push(option.price);
        });
      }
    });
    
    return allPrices.length > 0 ? Math.min(...allPrices) : 0;
  };

  const getTrekDaysCount = (trek) => {
    if (trek.duration) {
      const match = trek.duration.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    }
    return 0;
  };

  const formatPrice = (cityPricing) => {
    if (!cityPricing || cityPricing.length === 0) return 'Contact for Pricing';
    
    // Treks use pricingOptions array with flexible categoryName and price
    const allPrices = [];
    cityPricing.forEach(city => {
      if (city.pricingOptions && Array.isArray(city.pricingOptions)) {
        city.pricingOptions.forEach(option => {
          if (option.price) allPrices.push(option.price);
        });
      }
    });
    
    if (allPrices.length === 0) return 'Contact for Pricing';
    
    const minPrice = Math.min(...allPrices);
    return `₹${minPrice.toLocaleString()}`;
  };

  const getImageSrc = (trek) => {
    // Check for thumbnail first (primary image field in treks model)
    if (trek.thumbnail) return trek.thumbnail;
    // Fallback to showcaseImages if available
    if (trek.showcaseImages && trek.showcaseImages.length > 0) return trek.showcaseImages[0];
    // Fallback to legacy fields if they exist
    if (trek.coverImage) return trek.coverImage;
    if (trek.images && trek.images.length > 0) return trek.images[0];
    return null;
  };

  const getTrekDuration = (trek) => {
    return trek.duration || 'Custom Duration';
  };

  const handleCardClick = (trekId) => {
    navigate(`/book-trek/${trekId}`);
  };

  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 100000],
      duration: [],
      categories: [],
      locations: [],
      difficulty: [],
      isFixedDeparture: false, // NEW: Reset Fixed Departure filter
    });
    setSearchQuery('');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.duration.length > 0) count += filters.duration.length;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.locations.length > 0) count += filters.locations.length;
    if (filters.difficulty.length > 0) count += filters.difficulty.length;
    if (filters.isFixedDeparture) count += 1; // NEW: Count Fixed Departure filter
    return count;
  };

  // Show loader while loading
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightBg }}>
          <div className="text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6" style={{ color: colors.primary }} />
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              Loading Treks...
            </h3>
            <p className="text-lg" style={{ color: colors.textLight }}>
              Preparing your adventure experiences
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ backgroundColor: colors.lightBg }}>
        {/* Hero Section */}
      <div 
        className="relative py-20 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${colors.darkBg} 0%, ${colors.accent} 100%)`
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `${colors.primary}20`,
                color: colors.primary
              }}>
              <Mountain size={20} />
              <span className="text-sm font-semibold">Explore Treks</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
              Conquer The Mountains
              <span className="block mt-2" style={{ color: colors.primary }}>
                Trek Adventures
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Browse through our collection of {allTreks.length} thrilling trekking expeditions across the Himalayas
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <Search 
                className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400" 
                size={24} 
              />
              <input
                type="text"
                placeholder="Search treks by name, location, difficulty, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-6 text-lg rounded-2xl border-2 focus:outline-none focus:border-opacity-100 transition-all shadow-xl"
                style={{ 
                  borderColor: `${colors.primary}40`,
                  backgroundColor: 'white'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Left Section - Filters Button & Results Count */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ backgroundColor: colors.primary }}
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-white"
                      style={{ color: colors.primary }}>
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuickFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  quickFilter === 'all' ? 'text-white shadow-md' : 'text-gray-600 bg-white border-2'
                }`}
                style={quickFilter === 'all' ? 
                  { backgroundColor: colors.secondary } : 
                  { borderColor: colors.border }
                }
              >
                All Treks
              </button>
              <button
                onClick={() => setQuickFilter('himalayan')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  quickFilter === 'himalayan' ? 'text-white shadow-md' : 'text-gray-600 bg-white border-2'
                }`}
                style={quickFilter === 'himalayan' ? 
                  { backgroundColor: colors.secondary } : 
                  { borderColor: colors.border }
                }
              >
                Himalayan Treks
              </button>
              <button
                onClick={() => setQuickFilter('sahyadri')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  quickFilter === 'sahyadri' ? 'text-white shadow-md' : 'text-gray-600 bg-white border-2'
                }`}
                style={quickFilter === 'sahyadri' ? 
                  { backgroundColor: colors.secondary } : 
                  { borderColor: colors.border }
                }
              >
                Sahyadri Treks
              </button>
            </div>

            <div className="text-lg font-semibold" style={{ color: colors.text }}>
              {filteredTreks.length} {filteredTreks.length === 1 ? 'Trek' : 'Treks'} Found
            </div>
          </div>

          {/* Right Section - View Mode & Sort */}
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-6 py-3 pr-12 rounded-xl border-2 font-medium focus:outline-none cursor-pointer shadow-sm"
                style={{ 
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ArrowUpDown 
                size={18} 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none"
                style={{ color: colors.textLight }}
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-xl border-2 bg-white"
                 style={{ borderColor: colors.border }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'text-white' : 'text-gray-400'
                }`}
                style={viewMode === 'grid' ? { backgroundColor: colors.primary } : {}}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'text-white' : 'text-gray-400'
                }`}
                style={viewMode === 'list' ? { backgroundColor: colors.primary } : {}}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 rounded-2xl border-2 bg-white shadow-lg"
               style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                Filter Treks
              </h3>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm font-medium hover:underline"
                  style={{ color: colors.primary }}
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Duration Filter */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
                  Duration
                </h4>
                <div className="space-y-2">
                  {filterOptions.durations.map(duration => (
                    <label key={duration} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.duration.includes(duration)}
                        onChange={() => toggleFilter('duration', duration)}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: colors.primary }}
                      />
                      <span className="text-sm group-hover:text-gray-900 transition-colors"
                            style={{ color: colors.textLight }}>
                        {duration}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
                  Difficulty Level
                </h4>
                <div className="space-y-2">
                  {filterOptions.difficulties.map(difficulty => (
                    <label key={difficulty} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.difficulty.includes(difficulty)}
                        onChange={() => toggleFilter('difficulty', difficulty)}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: colors.primary }}
                      />
                      <span className="text-sm group-hover:text-gray-900 transition-colors"
                            style={{ color: colors.textLight }}>
                        {difficulty}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
                  Location
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filterOptions.locations.map(location => (
                    <label key={location} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.locations.includes(location)}
                        onChange={() => toggleFilter('locations', location)}
                        className="w-4 h-4 rounded cursor-pointer"
                        style={{ accentColor: colors.primary }}
                      />
                      <span className="text-sm group-hover:text-gray-900 transition-colors"
                            style={{ color: colors.textLight }}>
                        {location}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: colors.text }}>
                  Price Range
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm font-medium"
                       style={{ color: colors.textLight }}>
                    <span>₹ {filters.priceRange[0].toLocaleString('en-IN')}</span>
                    <span>₹ {filters.priceRange[1].toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="5000"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      priceRange: [0, parseInt(e.target.value)]
                    }))}
                    className="w-full"
                    style={{ accentColor: colors.primary }}
                  />
                </div>
              </div>
            </div>

            {/* Fixed Departure Filter - NEW */}
            <div className="mt-6 pt-6 border-t-2" style={{ borderColor: colors.border }}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.isFixedDeparture}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    isFixedDeparture: e.target.checked
                  }))}
                  className="w-5 h-5 rounded cursor-pointer"
                  style={{ accentColor: colors.primary }}
                />
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📅</span>
                  <span className="font-semibold group-hover:text-gray-900 transition-colors"
                        style={{ color: colors.text }}>
                    Fixed Departure Only
                  </span>
                </div>
              </label>
              <p className="ml-8 mt-2 text-sm" style={{ color: colors.textLight }}>
                Show treks with pre-scheduled departure dates
              </p>
            </div>
          </div>
        )}

        {/* Treks Grid/List */}
        {filteredTreks.length === 0 ? (
          <div className="text-center py-20">
            <Mountain className="h-20 w-20 mx-auto mb-4 opacity-30" style={{ color: colors.textLight }} />
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
              No Treks Found
            </h3>
            <p className="text-lg mb-6" style={{ color: colors.textLight }}>
              Try adjusting your filters or search query
            </p>
            {(getActiveFiltersCount() > 0 || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: colors.primary }}
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-6'
          }>
            {filteredTreks.map((trek) => (
              <div
                key={trek._id}
                onClick={() => handleCardClick(trek._id)}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border cursor-pointer ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
                style={{ 
                  borderColor: colors.border,
                  transform: 'translateZ(0)'
                }}
              >
                {/* Image Container */}
                <div className={`relative bg-gray-100 overflow-hidden ${
                  viewMode === 'list' ? 'w-80 flex-shrink-0' : 'h-60'
                }`}>
                  {getImageSrc(trek) ? (
                    <img
                      src={getImageSrc(trek)}
                      alt={trek.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="h-12 w-12 opacity-30" style={{ color: colors.textLight }} />
                    </div>
                  )}
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Price Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="px-4 py-2 rounded-xl text-white font-bold shadow-lg backdrop-blur-sm"
                         style={{ backgroundColor: `${colors.primary}` }}>
                      {formatPrice(trek.cityPricing)}
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {trek.featured && (
                    <div className="absolute top-4 left-4">
                      <div className="px-3 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5 backdrop-blur-sm"
                           style={{ backgroundColor: colors.secondary }}>
                        <Star className="h-3.5 w-3.5 fill-current" />
                        POPULAR
                      </div>
                    </div>
                  )}

                  {/* Difficulty Badge */}
                  {trek.difficulty && (
                    <div className={`absolute ${trek.featured ? 'top-16' : 'top-4'} left-4`}>
                      <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg bg-black/60 backdrop-blur-sm">
                        {trek.difficulty}
                      </div>
                    </div>
                  )}

                  {/* Book Now Button - Only in Grid View */}
                  {viewMode === 'grid' && (
                    <div className="book-now-button absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 translate-y-4">
                      <button 
                        className="px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        style={{ backgroundColor: colors.primary }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(trek._id);
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                        Book Trek
                      </button>
                    </div>
                  )}
                </div>

                {/* Trek Info */}
                <div className="p-6 flex-1">
                  <h3 className={`font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors ${
                    viewMode === 'list' ? 'text-2xl mb-3' : 'text-lg'
                  }`} style={{ color: colors.text }}>
                    {trek.name}
                  </h3>

                  <div className={`flex items-center gap-2 ${viewMode === 'list' ? 'mb-4' : 'mb-3'}`}>
                    <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: colors.secondary }} />
                    <span className="text-sm font-medium" style={{ color: colors.textLight }}>
                      {trek.location}
                    </span>
                  </div>

                  {viewMode === 'list' && trek.description && (
                    <p className="text-sm mb-4 line-clamp-2" style={{ color: colors.textLight }}>
                      {trek.description}
                    </p>
                  )}

                  <div className={`flex items-center ${viewMode === 'list' ? 'gap-6' : 'justify-between'} pt-4 border-t`}
                       style={{ borderColor: colors.border }}>
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.textLight }}>
                      <Calendar className="h-4 w-4" />
                      <span>{getTrekDuration(trek)}</span>
                    </div>
                    <div className="text-sm font-semibold px-3 py-1.5 rounded-full"
                         style={{ backgroundColor: `${colors.success}20`, color: colors.success }}>
                      Available
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      <Footer />
    </>
  );
};

export default TrekPage;