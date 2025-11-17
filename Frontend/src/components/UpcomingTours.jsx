import React, { useState, useEffect, useRef } from 'react';
import { toursAPI } from '../api/userAPI';
import { MapPin, Filter, Camera, Calendar, Users, ChevronLeft, ChevronRight, BookOpen, ArrowRight, Star, Clock, Shield, Award } from 'lucide-react';
import { gsap } from 'gsap';
import { showApiError } from '../utils/toast';

const UpcomingTours = () => {
  const [tours, setTours] = useState([]);
  const [allTours, setAllTours] = useState([]);
  const [groupedTours, setGroupedTours] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredTour, setHoveredTour] = useState(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Refs for animations
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const cardsRef = useRef([]);
  const paginationRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // New color palette without gradients
  const colors = {
    primary: "#1E9ABF",      // Blue
    secondary: "#E66926",    // Orange
    accent: "#2A6F97",
    background: "#FFFFFF",
    lightBg: "#F8FAFC",
    text: "#1E293B",
    textLight: "#64748B",
    hover: "#D45A1F",
    border: "#E2E8F0",
    success: "#10B981",
    warning: "#F59E0B",
    cardBg: "#FFFFFF"
  };

  // Get unique states from all tours for dynamic filter generation
  const [stateFilters, setStateFilters] = useState([]);

  // Main categories - Domestic and International only
  const categories = [
    { key: 'ALL', label: 'All Tours', group: null },
    { key: 'FIXED_DEPARTURE', label: '📅 Fixed Departure', group: 'FIXED_DEPARTURE' },
    { key: 'Domestic', label: 'Domestic', group: 'Domestic' },
    { key: 'International', label: 'International', group: 'International' }
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

    let isScrolling = false;
    let startX;
    let scrollLeft;

    const handleTouchStart = (e) => {
      isScrolling = true;
      startX = e.touches[0].pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    };

    const handleTouchMove = (e) => {
      if (!isScrolling) return;
      e.preventDefault();
      const x = e.touches[0].pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainer.scrollLeft = scrollLeft - walk;
    };

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

    scrollContainer.addEventListener('touchstart', handleTouchStart);
    scrollContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    scrollContainer.addEventListener('scroll', handleScrollUpdate);

    const resizeObserver = new ResizeObserver(() => {
      checkScrollPosition(scrollContainer);
    });
    resizeObserver.observe(scrollContainer);

    return () => {
      scrollContainer.removeEventListener('touchstart', handleTouchStart);
      scrollContainer.removeEventListener('touchmove', handleTouchMove);
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

      // Section entrance with parallax effect
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

      // Floating background elements
      gsap.to('.floating-element-1', {
        y: -20,
        rotation: 2,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to('.floating-element-2', {
        y: 15,
        rotation: -1,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Card animations when data loads
  useEffect(() => {
    if (tours.length > 0 && !loading) {
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
  }, [tours, loading]);

  const getImageSrc = (tour) => {
    return tour.thumbnail || (tour.images && tour.images[0]) || null;
  };

  const fetchTours = async (category = 'ALL', page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const response = await toursAPI.getAll(params);
      let fetchedTours = response.data.data || [];
      
      // Filter based on category selection
      if (category !== 'ALL') {
        if (category === 'FIXED_DEPARTURE') {
          fetchedTours = fetchedTours.filter(tour => tour.isFixedDeparture === true);
        } else if (category === 'Domestic') {
          fetchedTours = fetchedTours.filter(tour => tour.regionType === 'Domestic');
        } else if (category === 'International') {
          fetchedTours = fetchedTours.filter(tour => tour.regionType === 'International');
        } else {
          // It's a state filter
          fetchedTours = fetchedTours.filter(tour => 
            tour.regionType === 'Domestic' && tour.state === category
          );
        }
      }
      
      setAllTours(fetchedTours);
      
      // Extract unique states for domestic tours (for dynamic filter generation)
      const uniqueStates = [...new Set(
        fetchedTours
          .filter(tour => tour.regionType === 'Domestic' && tour.state)
          .map(tour => tour.state)
      )].sort();
      setStateFilters(uniqueStates);
      
      // Group tours by state for domestic, country for international
      const grouped = {};
      fetchedTours.forEach(tour => {
        const groupKey = tour.regionType === 'Domestic' 
          ? (tour.state || 'Other') 
          : (tour.country || 'International');
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(tour);
      });
      
      setGroupedTours(grouped);
      setTours(fetchedTours);
      setPagination(response.data.pagination || {});
    } catch (err) {
      setError('We encountered an issue loading our tours. Please refresh the page to try again.');
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours(selectedCategory, currentPage);
  }, [selectedCategory, currentPage]);

  const handleCategoryChange = (categoryKey) => {
    const currentCards = cardsRef.current.filter(Boolean);
    
    if (currentCards.length > 0) {
      gsap.to(currentCards, {
        opacity: 0,
        x: -50,
        duration: 0.3,
        stagger: 0.03,
        ease: "power2.in",
        onComplete: () => {
          setSelectedCategory(categoryKey);
          setCurrentPage(1);
          cardsRef.current = [];
          
          if (categoryKey !== 'ALL') {
            setTimeout(() => {
              const sectionElement = document.getElementById(`category-${categoryKey.replace(/\s+/g, '-')}`);
              if (sectionElement) {
                sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }
        }
      });
    } else {
      setSelectedCategory(categoryKey);
      setCurrentPage(1);
    }
  };

  const formatPrice = (cityPricing) => {
    if (!cityPricing || cityPricing.length === 0) return 'Contact for Pricing';
    
    // Extract all prices from all categories (budget, economy, deluxe, premium, luxury)
    const allPrices = [];
    cityPricing.forEach(city => {
      if (city.budget) allPrices.push(city.budget);
      if (city.economy) allPrices.push(city.economy);
      if (city.deluxe) allPrices.push(city.deluxe);
      if (city.premium) allPrices.push(city.premium);
      if (city.luxury) allPrices.push(city.luxury);
    });
    
    if (allPrices.length === 0) return 'Contact for Pricing';
    
    const minPrice = Math.min(...allPrices);
    return `₹${minPrice.toLocaleString()}`;
  };

  const getTourDuration = (tour) => {
    return tour.duration || '5 Days';
  };

  // Enhanced card hover animations
  const handleCardHover = (tourId, isHovering) => {
    if (isScrolling) return;
    
    const cardIndex = tours.findIndex(tour => tour._id === tourId);
    const card = cardsRef.current[cardIndex];
    
    if (!card) return;

    if (isHovering) {
      setHoveredTour(tourId);
      
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
      setHoveredTour(null);
      
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

  const handleCardClick = (tourId) => {
    const navigationEvent = new CustomEvent('navigationStart', {
      detail: { path: `/book-tour/${tourId}` }
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
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
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
              <Camera className="h-10 w-10" style={{ color: colors.secondary }} />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: colors.text }}>
              Unable to Load Tour Packages
            </h3>
            <p className="text-lg mb-8" style={{ color: colors.textLight }}>
              {error}
            </p>
            <button 
              onClick={() => fetchTours(selectedCategory, currentPage)}
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
      
      {/* Subtle Background Elements */}
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
            <div className="flex items-center gap-4 px-6 py-3 rounded-2xl border shadow-sm" 
                 style={{ backgroundColor: 'white', borderColor: colors.border }}>
              <Award className="h-5 w-5" style={{ color: colors.secondary }} />
              <span className="font-semibold" style={{ color: colors.primary }}>
                Curated Travel Experiences
              </span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colors.primary }}>
            Explore Our Tour Packages
          </h1>
          
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: colors.textLight }}>
            Handpicked journeys with expert guides, premium accommodations, and memorable adventures
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {[
            { icon: Shield, text: 'Secure Payments' },
            { icon: Star, text: 'Expert Guides' },
            { icon: Clock, text: 'Flexible Scheduling' }
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
                className="flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-colors shadow-sm"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: colors.border,
                  color: colors.text
                }}
              >
                <Filter className="h-4 w-4" />
                <span>Filter Tours</span>
              </button>
            </div>

            {/* Category Filters */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-auto`}>
              {/* Main Category Filters */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-3">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => handleCategoryChange(category.key)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border shadow-sm ${
                      selectedCategory === category.key
                        ? 'text-white transform -translate-y-0.5 shadow-lg'
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
              
              {/* State Filters - Show when Domestic tours exist */}
              {selectedCategory === 'Domestic' && stateFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <span className="text-xs font-semibold px-3 py-2 rounded-lg" 
                        style={{ color: colors.textLight }}>
                    Filter by State:
                  </span>
                  {stateFilters.map((state) => (
                    <button
                      key={state}
                      onClick={() => handleCategoryChange(state)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 border ${
                        selectedCategory === state
                          ? 'text-white shadow-md'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      style={
                        selectedCategory === state
                          ? { 
                              backgroundColor: colors.secondary,
                              borderColor: colors.secondary
                            }
                          : { 
                              color: colors.text,
                              borderColor: colors.border
                            }
                      }
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results Counter */}
            <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl border bg-white shadow-sm"
                 style={{ borderColor: colors.border, color: colors.textLight }}>
              <Users className="h-4 w-4" style={{ color: colors.primary }} />
              <span>{safePagination.totalItems} Tour Packages</span>
            </div>
          </div>
        </div>

        {/* Tours Grid - Grouped by Category */}
        {loading ? (
          <div className="mb-12">
            <div ref={scrollContainerRef} className="flex gap-6 pb-6 overflow-x-auto scrollbar-hide">
              {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </div>
        ) : tours.length > 0 ? (
          <div className="space-y-16 mb-12">
            {/* Show All Tours First */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                    All Tour Packages
                  </h2>
                  <p className="text-base" style={{ color: colors.textLight }}>
                    Browse our complete collection of {allTours.length} carefully crafted tours
                  </p>
                </div>
              </div>
              
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

                <div 
                  ref={scrollContainerRef}
                  className="flex gap-6 pb-8 overflow-x-auto custom-scrollbar snap-x snap-mandatory"
                >
                  {allTours.map((tour, index) => (
                    <div
                      key={tour._id}
                      ref={el => {
                        if (el) cardsRef.current[index] = el;
                      }}
                      onClick={() => handleCardClick(tour._id)}
                      onMouseEnter={() => handleCardHover(tour._id, true)}
                      onMouseLeave={() => handleCardHover(tour._id, false)}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border cursor-pointer flex-shrink-0 w-80 snap-start"
                      style={{ 
                        borderColor: colors.border,
                        transform: 'translateZ(0)'
                      }}
                    >
                      {/* Image Container */}
                      <div className="relative h-60 bg-gray-100 overflow-hidden">
                        {getImageSrc(tour) ? (
                          <img
                            src={getImageSrc(tour)}
                            alt={tour.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Camera className="h-12 w-12 opacity-30" style={{ color: colors.textLight }} />
                          </div>
                        )}
                        
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                        
                        {/* Price Badge */}
                        <div className="absolute top-4 right-4">
                          <div className="px-3 py-2 rounded-lg text-white font-bold shadow-lg"
                               style={{ backgroundColor: colors.primary }}>
                            {formatPrice(tour.cityPricing)}
                          </div>
                        </div>

                        {/* Featured Badge */}
                        {tour.featured && (
                          <div className="absolute top-4 left-4">
                            <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg flex items-center gap-1"
                                 style={{ backgroundColor: colors.secondary }}>
                              <Star className="h-3 w-3 fill-current" />
                              POPULAR
                            </div>
                          </div>
                        )}

                        {/* Fixed Departure Badge */}
                        {tour.isFixedDeparture && (
                          <div className={`absolute ${tour.featured ? 'top-14' : 'top-4'} left-4`}>
                            <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg flex items-center gap-1"
                                 style={{ backgroundColor: '#059669' }}>
                              📅 FIXED DEPARTURE
                            </div>
                          </div>
                        )}

                        {/* Tour Type Badge */}
                        {tour.category && (
                          <div className={`absolute ${(tour.featured || tour.isFixedDeparture) ? 'top-14' : 'top-4'} ${(tour.featured && tour.isFixedDeparture) ? 'top-24' : ''} left-4`}>
                            <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg bg-black/70 backdrop-blur-sm">
                              {tour.category}
                            </div>
                          </div>
                        )}

                        {/* Book Now Button */}
                        <div className="book-now-button absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 translate-y-4">
                          <button 
                            className="px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                            style={{ backgroundColor: colors.primary }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(tour._id);
                            }}
                          >
                            <BookOpen className="h-4 w-4" />
                            Book Tour
                          </button>
                        </div>
                      </div>

                      {/* Tour Info */}
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ color: colors.text }}>
                          {tour.name}
                        </h3>

                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: colors.secondary }} />
                          <span className="text-sm font-medium" style={{ color: colors.textLight }}>
                            {tour.location}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t" 
                             style={{ borderColor: colors.border }}>
                          <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
                            <Calendar className="h-4 w-4" />
                            <span>{getTourDuration(tour)}</span>
                          </div>
                          <div className="text-sm font-medium px-3 py-1 rounded-full"
                               style={{ backgroundColor: `${colors.success}15`, color: colors.success }}>
                            Available
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scroll Hint */}
                <div className="text-center mt-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white border shadow-sm"
                       style={{ borderColor: colors.border, color: colors.textLight }}>
                    <ArrowRight className="h-4 w-4" />
                    Scroll to discover more tours
                  </div>
                </div>
              </div>
            </div>

            {/* Grouped Tours by Category */}
            {Object.keys(groupedTours).sort().map((categoryName, categoryIndex) => (
              <div 
                key={categoryName}
                id={`category-${categoryName.replace(/\s+/g, '-')}`}
                className="scroll-mt-24"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                      {categoryName}
                    </h2>
                    <p className="text-base" style={{ color: colors.textLight }}>
                      {groupedTours[categoryName].length} unique {categoryName.toLowerCase()} experiences
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border bg-white shadow-sm"
                       style={{ borderColor: colors.border }}>
                    <MapPin className="h-4 w-4" style={{ color: colors.secondary }} />
                    <span className="text-sm font-medium" style={{ color: colors.text }}>
                      {groupedTours[categoryName].length} Packages
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-6 pb-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                  {groupedTours[categoryName].map((tour, index) => {
                    const globalIndex = allTours.findIndex(t => t._id === tour._id);
                    return (
                      <div
                        key={tour._id}
                        ref={el => {
                          if (el) cardsRef.current[globalIndex] = el;
                        }}
                        onClick={() => handleCardClick(tour._id)}
                        onMouseEnter={() => handleCardHover(tour._id, true)}
                        onMouseLeave={() => handleCardHover(tour._id, false)}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border cursor-pointer flex-shrink-0 w-80 snap-start"
                        style={{ 
                          borderColor: colors.border,
                          transform: 'translateZ(0)'
                        }}
                      >
                        {/* Image Container */}
                        <div className="relative h-60 bg-gray-100 overflow-hidden">
                          {getImageSrc(tour) ? (
                            <img
                              src={getImageSrc(tour)}
                              alt={tour.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Camera className="h-12 w-12 opacity-30" style={{ color: colors.textLight }} />
                            </div>
                          )}
                          
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                          
                          {/* Price Badge */}
                          <div className="absolute top-4 right-4">
                            <div className="px-3 py-2 rounded-lg text-white font-bold shadow-lg"
                                 style={{ backgroundColor: colors.primary }}>
                              {formatPrice(tour.cityPricing)}
                            </div>
                          </div>

                          {/* Featured Badge */}
                          {tour.featured && (
                            <div className="absolute top-4 left-4">
                              <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg flex items-center gap-1"
                                   style={{ backgroundColor: colors.secondary }}>
                                <Star className="h-3 w-3 fill-current" />
                                POPULAR
                              </div>
                            </div>
                          )}

                          {/* Book Now Button */}
                          <div className="book-now-button absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 translate-y-4">
                            <button 
                              className="px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                              style={{ backgroundColor: colors.primary }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCardClick(tour._id);
                              }}
                            >
                              <BookOpen className="h-4 w-4" />
                              Book Tour
                            </button>
                          </div>
                        </div>

                        {/* Tour Info */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors" style={{ color: colors.text }}>
                            {tour.name}
                          </h3>

                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: colors.secondary }} />
                            <span className="text-sm font-medium" style={{ color: colors.textLight }}>
                              {tour.location}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t" 
                               style={{ borderColor: colors.border }}>
                            <div className="flex items-center gap-2 text-sm" style={{ color: colors.textLight }}>
                              <Calendar className="h-4 w-4" />
                              <span>{getTourDuration(tour)}</span>
                            </div>
                            <div className="text-sm font-medium px-3 py-1 rounded-full"
                                 style={{ backgroundColor: `${colors.success}15`, color: colors.success }}>
                              Available
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Category Scroll Hint */}
                <div className="text-center mt-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white border shadow-sm"
                       style={{ borderColor: colors.border, color: colors.textLight }}>
                    <ArrowRight className="h-4 w-4" />
                    Discover more {categoryName.toLowerCase()} options
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border" 
               style={{ borderColor: colors.border }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                 style={{ backgroundColor: `${colors.primary}10` }}>
              <Camera className="h-10 w-10" style={{ color: colors.primary }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
              No Tour Packages Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {selectedCategory === 'ALL' 
                ? 'We are constantly updating our tour offerings. Check back soon for new adventures!' 
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
              Browse All Tours
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
        
        .scroll-mt-24 {
          scroll-margin-top: 6rem;
        }
      `}</style>
    </section>
  );
};

export default UpcomingTours;