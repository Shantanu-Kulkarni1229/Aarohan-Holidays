import React, { useState, useEffect, useRef } from 'react';
import { treksAPI } from '../api/userAPI';
import { MapPin, Filter, Camera, Mountain, Clock, Users, ChevronLeft, ChevronRight, BookOpen, ArrowRight, Shield, Star, Compass, Thermometer } from 'lucide-react';
import { gsap } from 'gsap';
import { showApiError } from '../utils/toast';

const UpcomingTreks = () => {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredTrek, setHoveredTrek] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Refs for animations
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const cardsRef = useRef([]);
  const paginationRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // New color palette
  const colors = {
    primary: "#1E9ABF",        // Blue
    secondary: "#E66926",      // Orange
    accent: "#DC2626",         // Red for featured
    background: "#FFFFFF",
    lightBg: "#F8FAFC",
    text: "#1F2937",
    textLight: "#64748B",
    border: "#E2E8F0",
    warning: "#EA580C",
    success: "#059669",
    cardBg: "#FFFFFF"
  };

  const categories = [
    { key: 'ALL', label: 'All Treks', group: null },
    { key: 'FIXED_DEPARTURE', label: '📅 Fixed Departure', group: 'FIXED_DEPARTURE' },
    { key: 'Himalayan Trek', label: 'Himalayan', group: 'Himalayan' },
    { key: 'Sahyadri Trek', label: 'Sahyadri', group: 'Sahyadri' }
  ];

  // Check scroll position to show/hide navigation buttons
  const checkScrollPosition = (container) => {
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Smooth scroll function
  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  // Enhanced horizontal scroll with momentum
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    checkScrollPosition(scrollContainer);

    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      e.preventDefault();
      scrollContainer.scrollBy({
        left: e.deltaY * 2,
        behavior: 'smooth'
      });
    };

    const handleScrollUpdate = () => {
      checkScrollPosition(scrollContainer);
    };

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('scroll', handleScrollUpdate);

    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition(scrollContainer);
    });
    resizeObserver.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener('wheel', handleWheel);
      scrollContainer.removeEventListener('scroll', handleScrollUpdate);
      resizeObserver.disconnect();
    };
  }, []);

  // Premium GSAP animations
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const masterTL = gsap.timeline();

      // Section entrance
      masterTL.fromTo(sectionRef.current,
        { 
          opacity: 0,
          y: 60
        },
        { 
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out"
        }
      );

      // Staggered header animation
      if (headerRef.current) {
        masterTL.fromTo(headerRef.current.children,
          { 
            y: 40,
            opacity: 0
          },
          { 
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.4)"
          },
          "-=0.6"
        );
      }

      // Filters slide-in
      if (filtersRef.current) {
        masterTL.fromTo(filtersRef.current,
          { 
            y: 30,
            opacity: 0
          },
          { 
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out"
          },
          "-=0.3"
        );
      }

      // Floating animations
      gsap.to('.floating-element-1', {
        y: -25,
        rotation: 3,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to('.floating-element-2', {
        y: 20,
        rotation: -2,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Card animations when data loads
  useEffect(() => {
    if (treks.length > 0 && !loading) {
      const cards = cardsRef.current.filter(Boolean);
      
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { 
            x: 80,
            opacity: 0,
            scale: 0.9
          },
          { 
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.2
          }
        );
      }
    }
  }, [treks, loading]);

  const getImageSrc = (trek) => {
    return trek.thumbnail || (trek.images && trek.images[0]) || null;
  };

  const fetchTreks = async (category = 'ALL', page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (category !== 'ALL' && category !== 'FIXED_DEPARTURE') {
        params.category = category;
      }

      const response = await treksAPI.getAll(params);
      let fetchedTreks = response.data.data || [];
      
      // Filter for Fixed Departure if selected
      if (category === 'FIXED_DEPARTURE') {
        fetchedTreks = fetchedTreks.filter(trek => trek.isFixedDeparture === true);
      }
      
      setTreks(fetchedTreks);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError('We encountered an issue loading our trekking packages. Please refresh to try again.');
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTreks(selectedCategory, currentPage);
  }, [selectedCategory, currentPage]);

  const handleCategoryChange = (category) => {
    const currentCards = cardsRef.current.filter(Boolean);
    
    if (currentCards.length > 0) {
      gsap.to(currentCards, {
        opacity: 0,
        x: -50,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.in",
        onComplete: () => {
          setSelectedCategory(category);
          setCurrentPage(1);
          cardsRef.current = [];
        }
      });
    } else {
      setSelectedCategory(category);
      setCurrentPage(1);
    }
  };

  const formatPrice = (cityPricing) => {
    if (!cityPricing || cityPricing.length === 0) return 'Contact for Pricing';
    
    // Extract all prices from flexible pricingOptions array
    const allPrices = [];
    cityPricing.forEach(city => {
      if (city.pricingOptions && Array.isArray(city.pricingOptions)) {
        city.pricingOptions.forEach(option => {
          if (option.price && option.price > 0) {
            allPrices.push(option.price);
          }
        });
      }
    });
    
    if (allPrices.length === 0) return 'Contact for Pricing';
    
    const minPrice = Math.min(...allPrices);
    return `₹${minPrice.toLocaleString()}`;
  };

  const getDifficultyColor = (difficulty) => {
    const difficulties = {
      'easy': { bg: '#DCFCE7', text: '#166534', border: '#22C55E' },
      'moderate': { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' },
      'hard': { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' },
      'extreme': { bg: '#F3E8FF', text: '#6B21A8', border: '#A855F7' },
      'default': { bg: '#F3F4F6', text: '#374151', border: '#9CA3AF' }
    };
    
    return difficulties[difficulty?.toLowerCase()] || difficulties.default;
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      'easy': '🥾',
      'moderate': '⛰️',
      'hard': '🧗',
      'extreme': '🚨'
    };
    
    return icons[difficulty?.toLowerCase()] || '🥾';
  };

  // Enhanced card hover animations
  const handleCardHover = (trekId, isHovering) => {
    const cardIndex = treks.findIndex(trek => trek._id === trekId);
    const card = cardsRef.current[cardIndex];
    
    if (!card) return;

    if (isHovering) {
      setHoveredTrek(trekId);
      
      gsap.to(card, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
        boxShadow: `0 20px 40px ${colors.primary}15`
      });

      const bookButton = card.querySelector('.book-now-button');
      if (bookButton) {
        gsap.to(bookButton, {
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }

    } else {
      setHoveredTrek(null);
      
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      });

      const bookButton = card.querySelector('.book-now-button');
      if (bookButton) {
        gsap.to(bookButton, {
          opacity: 0,
          y: 10,
          duration: 0.2,
          ease: "power2.in"
        });
      }
    }
  };

  const handlePageChange = (newPage) => {
    const currentCards = cardsRef.current.filter(Boolean);
    
    if (currentCards.length > 0) {
      gsap.to(currentCards, {
        opacity: 0,
        x: -30,
        duration: 0.2,
        stagger: 0.02,
        ease: "power2.in",
        onComplete: () => {
          setCurrentPage(newPage);
          cardsRef.current = [];
        }
      });
    } else {
      setCurrentPage(newPage);
    }
  };

  const handleCardClick = (trekId) => {
    const navigationEvent = new CustomEvent('navigationStart', {
      detail: { path: `/book-trek/${trekId}` }
    });
    window.dispatchEvent(navigationEvent);
  };

  // Enhanced skeleton loader
  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
      <div className="h-60 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse"></div>
      <div className="p-6">
        <div className="h-5 bg-gray-200 rounded mb-3 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  const safePagination = {
    totalItems: pagination?.totalItems || 0,
    currentPage: pagination?.currentPage || 1,
    totalPages: pagination?.totalPages || 1,
    hasPrev: pagination?.hasPrev || false,
    hasNext: pagination?.hasNext || false
  };

  if (error) {
    return (
      <section ref={sectionRef} className="min-h-screen py-20" style={{ backgroundColor: colors.background }}>
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12 border" style={{ borderColor: colors.border }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" 
                 style={{ backgroundColor: `${colors.secondary}15` }}>
              <Mountain className="h-10 w-10" style={{ color: colors.secondary }} />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
              Unable to Load Trekking Packages
            </h3>
            <p className="text-lg mb-8" style={{ color: colors.textLight }}>
              {error}
            </p>
            <button 
              onClick={() => fetchTreks(selectedCategory, currentPage)}
              className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
              style={{ 
                backgroundColor: colors.primary,
                color: 'white'
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="min-h-screen py-16 relative overflow-hidden" style={{ backgroundColor: colors.lightBg }}>
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-element-1 absolute top-1/4 left-5% w-72 h-72 rounded-full opacity-5" 
             style={{ backgroundColor: colors.primary }}></div>
        <div className="floating-element-2 absolute bottom-1/3 right-8% w-64 h-64 rounded-full opacity-5" 
             style={{ backgroundColor: colors.secondary }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Enhanced Header Section */}
        <div ref={headerRef} className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border bg-white shadow-sm" 
                 style={{ borderColor: colors.border }}>
              <Mountain className="h-5 w-5" style={{ color: colors.secondary }} />
              <span className="font-semibold" style={{ color: colors.primary }}>
                Professional Trekking Adventures
              </span>
              <Mountain className="h-5 w-5" style={{ color: colors.secondary }} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colors.primary }}>
            Trekking Expeditions
          </h1>
          
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: colors.textLight }}>
            Conquer majestic peaks and explore breathtaking mountain trails with certified trekking guides
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {[
            { icon: Shield, text: 'Safety Certified' },
            { icon: Star, text: 'Expert Guides' },
            { icon: Compass, text: 'Route Planning' },
            { icon: Thermometer, text: 'All Seasons' }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 text-sm font-medium" 
                 style={{ color: colors.textLight }}>
              <item.icon className="h-4 w-4" style={{ color: colors.secondary }} />
              {item.text}
            </div>
          ))}
        </div>

        {/* Enhanced Filters */}
        <div ref={filtersRef} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-colors shadow-sm bg-white"
                style={{ 
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <Filter className="h-4 w-4" />
                <span>Filter Treks</span>
              </button>
            </div>

            {/* Category Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-auto`}>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryChange(category.key)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border shadow-sm ${
                      selectedCategory === category.key
                        ? 'text-white shadow-lg transform -translate-y-0.5'
                        : 'bg-white hover:bg-gray-50 hover:shadow-md'
                    }`}
                    style={
                      selectedCategory === category.key
                        ? { 
                            backgroundColor: colors.primary,
                            borderColor: colors.primary
                          }
                        : { 
                            color: colors.text,
                            borderColor: colors.border
                          }
                    }
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border bg-white shadow-sm"
                 style={{ borderColor: colors.border, color: colors.textLight }}>
              <Users className="h-4 w-4" style={{ color: colors.primary }} />
              <span>{safePagination.totalItems} Trekking Packages</span>
            </div>
          </div>
        </div>

        {/* Treks Grid */}
        {loading ? (
          <div className="mb-12">
            <div ref={scrollContainerRef} className="flex gap-6 pb-6 overflow-x-auto scrollbar-hide">
              {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </div>
        ) : treks.length > 0 ? (
          <div className="mb-12">
            {/* Scroll Container with Navigation */}
            <div className="relative group/scroll">
              {/* Left Scroll Button */}
              {canScrollLeft && (
                <button
                  onClick={() => handleScroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover/scroll:opacity-100"
                  style={{ 
                    backgroundColor: colors.primary,
                    color: 'white'
                  }}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}

              {/* Right Scroll Button */}
              {canScrollRight && (
                <button
                  onClick={() => handleScroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 opacity-0 group-hover/scroll:opacity-100"
                  style={{ 
                    backgroundColor: colors.primary,
                    color: 'white'
                  }}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}

              {/* Horizontal Scroll Container */}
              <div 
                ref={scrollContainerRef}
                className="flex gap-6 pb-8 overflow-x-auto custom-scrollbar snap-x snap-mandatory"
              >
              {treks.map((trek, index) => {
                const difficultyColors = getDifficultyColor(trek.difficulty);
                const difficultyIcon = getDifficultyIcon(trek.difficulty);
                
                return (
                  <div
                    key={trek._id}
                    ref={el => {
                      if (el) cardsRef.current[index] = el;
                    }}
                    onClick={() => handleCardClick(trek._id)}
                    onMouseEnter={() => handleCardHover(trek._id, true)}
                    onMouseLeave={() => handleCardHover(trek._id, false)}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border cursor-pointer flex-shrink-0 w-80 snap-start"
                    style={{ 
                      borderColor: colors.border,
                      transform: 'translateZ(0)'
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative h-60 bg-gray-100 overflow-hidden">
                      {getImageSrc(trek) ? (
                        <img
                          src={getImageSrc(trek)}
                          alt={trek.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Mountain className="h-12 w-12 opacity-30" style={{ color: colors.textLight }} />
                        </div>
                      )}
                      
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                      
                      {/* Difficulty Badge */}
                      <div className="absolute top-4 left-4">
                        <div className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg border flex items-center gap-1.5"
                             style={{ 
                               backgroundColor: difficultyColors.bg,
                               color: difficultyColors.text,
                               borderColor: difficultyColors.border
                             }}>
                          <span>{difficultyIcon}</span>
                          {trek.difficulty || 'Moderate'}
                        </div>
                      </div>

                      {/* Price Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="px-3 py-2 rounded-lg text-white font-bold shadow-lg"
                             style={{ backgroundColor: colors.primary }}>
                          {formatPrice(trek.cityPricing)}
                        </div>
                      </div>

                      {/* Featured Badge */}
                      {trek.isFeatured && (
                        <div className="absolute top-16 left-4">
                          <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                               style={{ backgroundColor: colors.secondary }}>
                            <Star className="h-3 w-3 fill-current" />
                            POPULAR
                          </div>
                        </div>
                      )}

                      {/* Fixed Departure Badge */}
                      {trek.isFixedDeparture && (
                        <div className={`absolute ${trek.isFeatured ? 'top-28' : 'top-16'} left-4`}>
                          <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                               style={{ backgroundColor: '#059669' }}>
                            📅 FIXED DEPARTURE
                          </div>
                        </div>
                      )}

                      {/* Trek Type Badge - Show category */}
                      {trek.category && (
                        <div className={`absolute ${(trek.isFeatured || trek.isFixedDeparture) ? 'top-28' : 'top-16'} ${(trek.isFeatured && trek.isFixedDeparture) ? 'top-40' : ''} left-4`}>
                          <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg bg-black/70 backdrop-blur-sm">
                            {trek.category}
                          </div>
                        </div>
                      )}

                      {/* Altitude Badge */}
                      {trek.altitude && (
                        <div className="absolute bottom-4 left-4">
                          <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
                            <Mountain className="h-3 w-3" />
                            {trek.altitude}m
                          </div>
                        </div>
                      )}

                      {/* Book Now Button */}
                      <div className="book-now-button absolute bottom-4 right-4 opacity-0 translate-y-4">
                        <button 
                          className="px-5 py-2.5 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                          style={{ backgroundColor: colors.primary }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(trek._id);
                          }}
                        >
                          <BookOpen className="h-4 w-4" />
                          Book Trek
                        </button>
                      </div>
                    </div>

                    {/* Trek Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ color: colors.text }}>
                        {trek.name}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: colors.secondary }} />
                        <span className="text-sm font-medium" style={{ color: colors.textLight }}>
                          {trek.location}
                        </span>
                      </div>

                      {/* Duration & Season */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
                          <Clock className="h-4 w-4" />
                          <span>{trek.duration || '5 Days'}</span>
                        </div>
                        {trek.bestSeason && (
                          <div className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.warning}15`, color: colors.warning }}>
                            {trek.bestSeason}
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      <div className="flex items-center justify-between pt-4 border-t" 
                           style={{ borderColor: colors.border }}>
                        <div className="text-sm font-medium px-3 py-1 rounded-full"
                             style={{ backgroundColor: `${colors.success}15`, color: colors.success }}>
                          Guided Trek
                        </div>
                        <div className="text-sm font-medium" style={{ color: colors.primary }}>
                          All Inclusive
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>

              {/* Scroll Hint */}
              <div className="text-center mt-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white border shadow-sm"
                     style={{ borderColor: colors.border, color: colors.textLight }}>
                  <ArrowRight className="h-4 w-4" />
                  Scroll to explore more trekking options
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border" 
               style={{ borderColor: colors.border }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                 style={{ backgroundColor: `${colors.primary}10` }}>
              <Mountain className="h-10 w-10" style={{ color: colors.primary }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
              No Trekking Packages Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {selectedCategory === 'ALL' 
                ? 'We are constantly updating our trekking expeditions. Check back soon for new mountain adventures!' 
                : `We don't have any ${selectedCategory.toLowerCase()} packages available at the moment.`}
            </p>
            <button 
              onClick={() => handleCategoryChange('ALL')}
              className="px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
              style={{ 
                backgroundColor: colors.primary,
                color: 'white'
              }}
            >
              Browse All Treks
            </button>
          </div>
        )}

        {/* Enhanced Pagination */}
        {safePagination.totalPages > 1 && (
          <div ref={paginationRef} className="flex justify-center items-center gap-4 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!safePagination.hasPrev}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white shadow-sm"
              style={{ 
                borderColor: colors.border,
                color: colors.text
              }}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white font-medium shadow-sm"
                 style={{ borderColor: colors.border, color: colors.text }}>
              <span>Page</span>
              <span style={{ color: colors.primary }}>{safePagination.currentPage}</span>
              <span>of</span>
              <span style={{ color: colors.primary }}>{safePagination.totalPages}</span>
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!safePagination.hasNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white shadow-sm"
              style={{ 
                borderColor: colors.border,
                color: colors.text
              }}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${colors.secondary} ${colors.border};
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.border};
          border-radius: 10px;
          margin: 0 20px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.primary};
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.secondary};
          transform: scaleY(1.2);
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .snap-x {
          scroll-snap-type: x mandatory;
        }
        
        .snap-start {
          scroll-snap-align: start;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default UpcomingTreks;