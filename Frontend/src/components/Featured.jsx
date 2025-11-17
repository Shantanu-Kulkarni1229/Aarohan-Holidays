import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toursAPI, treksAPI } from '../api/userAPI';
import { gsap } from 'gsap';
import { Calendar, MapPin, Clock, Users, Star, Sparkles, Mountain, Compass, Shield, Award } from 'lucide-react';
import { showApiError } from '../utils/toast';

const Featured = () => {
  const navigate = useNavigate();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const cardsRef = useRef([]);

  // Professional color scheme
  const colors = {
    primary: "#1e40af",        // Royal Blue
    secondary: "#059669",      // Emerald Green
    accent: "#dc2626",         // Crimson Red
    background: "#f8fafc",     // Light Gray
    text: "#1f2937",           // Dark Gray
    lightText: "#6b7280",      // Medium Gray
    border: "#e5e7eb",         // Light Border
    cardBg: "#ffffff",         // White
    success: "#059669",        // Success Green
    warning: "#d97706",        // Warning Orange
  };

  // Enhanced special types with professional styling
  const specialTypes = {
    'Diwali Special': {
      label: '🪔 Diwali Special',
      color: 'from-orange-500 to-amber-500',
      bgColor: '#fb923c',
      textColor: '#ffffff'
    },
    'Weekend Special': {
      label: '🎉 Weekend Gateway',
      color: 'from-purple-500 to-pink-500',
      bgColor: '#8b5cf6',
      textColor: '#ffffff'
    },
    'Summer Special': {
      label: '☀️ Summer Escape',
      color: 'from-yellow-500 to-orange-500',
      bgColor: '#f59e0b',
      textColor: '#ffffff'
    },
    'Monsoon Special': {
      label: '🌧️ Monsoon Magic',
      color: 'from-blue-500 to-cyan-500',
      bgColor: '#3b82f6',
      textColor: '#ffffff'
    },
    'Winter Special': {
      label: '❄️ Winter Wonder',
      color: 'from-cyan-500 to-blue-500',
      bgColor: '#06b6d4',
      textColor: '#ffffff'
    },
    'Christmas Special': {
      label: '🎄 Christmas Joy',
      color: 'from-red-500 to-green-500',
      bgColor: '#dc2626',
      textColor: '#ffffff'
    },
    'New Year Special': {
      label: '🎊 New Year Start',
      color: 'from-purple-600 to-pink-600',
      bgColor: '#9333ea',
      textColor: '#ffffff'
    },
    'Holi Special': {
      label: '🎨 Holi Festival',
      color: 'from-pink-500 to-purple-500',
      bgColor: '#ec4899',
      textColor: '#ffffff'
    },
    'Independence Day Special': {
      label: '🇮🇳 Independence Day',
      color: 'from-orange-500 to-green-500',
      bgColor: '#ea580c',
      textColor: '#ffffff'
    },
    'Republic Day Special': {
      label: '🇮🇳 Republic Day',
      color: 'from-orange-600 to-green-600',
      bgColor: '#c2410c',
      textColor: '#ffffff'
    }
  };

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  // Enhanced GSAP Animations
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const masterTL = gsap.timeline();

      // Section entrance with parallax
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

      // Tabs animation
      if (tabsRef.current) {
        masterTL.fromTo(tabsRef.current.children,
          { 
            scale: 0.8,
            opacity: 0
          },
          { 
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
          },
          "-=0.3"
        );
      }

      // Floating background elements
      gsap.to('.floating-bg-1', {
        y: -20,
        x: 10,
        duration: 8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to('.floating-bg-2', {
        y: 15,
        x: -15,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Enhanced cards animation
  useEffect(() => {
    if (featuredItems.length > 0 && !loading) {
      const cards = cardsRef.current.filter(Boolean);
      
      gsap.fromTo(cards,
        { 
          y: 60,
          opacity: 0,
          scale: 0.95
        },
        { 
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.2
        }
      );
    }
  }, [featuredItems, loading, activeTab]);

  const fetchFeaturedItems = async () => {
    try {
      setLoading(true);
      
      const [toursResponse, treksResponse] = await Promise.all([
        toursAPI.getSpecial(6),
        treksAPI.getSpecial(6)
      ]);

      const tours = (toursResponse.data.data || []).map(tour => ({
        ...tour,
        type: 'tour',
        title: tour.name,
        thumbnail: tour.thumbnail || tour.showcaseImages?.[0]
      }));

      const treks = (treksResponse.data.data || []).map(trek => ({
        ...trek,
        type: 'trek',
        title: trek.name,
        thumbnail: trek.thumbnail || trek.images?.[0]
      }));

      // Fallback to featured items if no special items
      if (tours.length === 0 && treks.length === 0) {
        const [featuredToursResponse, featuredTreksResponse] = await Promise.all([
          toursAPI.getFeatured(6),
          treksAPI.getFeatured(6)
        ]);

        const featuredTours = (featuredToursResponse.data.data || []).map(tour => ({
          ...tour,
          type: 'tour',
          title: tour.name,
          thumbnail: tour.thumbnail || tour.showcaseImages?.[0]
        }));

        const featuredTreks = (featuredTreksResponse.data.data || []).map(trek => ({
          ...trek,
          type: 'trek',
          title: trek.name,
          thumbnail: trek.thumbnail || trek.images?.[0]
        }));

        const combined = [...featuredTours, ...featuredTreks].sort(() => Math.random() - 0.5);
        setFeaturedItems(combined);
      } else {
        const combined = [...tours, ...treks].sort(() => Math.random() - 0.5);
        setFeaturedItems(combined);
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredItems = () => {
    if (activeTab === 'all') return featuredItems;
    return featuredItems.filter(item => item.type === activeTab.replace('s', ''));
  };

  const formatPrice = (cityPricing) => {
    if (!cityPricing || cityPricing.length === 0) return 'Contact for Price';
    const minPrice = Math.min(...cityPricing.map(city => city.price));
    return `₹${minPrice.toLocaleString()}`;
  };

  const getSpecialType = (item) => {
    if (item.specialType && item.specialType !== 'None' && specialTypes[item.specialType]) {
      return specialTypes[item.specialType];
    }
    
    return {
      label: '⭐ Featured',
      color: 'from-amber-500 to-yellow-500',
      bgColor: '#f59e0b',
      textColor: '#ffffff'
    };
  };

  const handleCardHover = (itemId, isHovering) => {
    const cardIndex = featuredItems.findIndex(item => item._id === itemId);
    const card = cardsRef.current[cardIndex];
    
    if (!card) return;

    if (isHovering) {
      setHoveredCard(itemId);
      
      gsap.to(card, {
        y: -8,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
      });

    } else {
      setHoveredCard(null);
      
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      });
    }
  };

  const handleReadMore = (item) => {
    const route = item.type === 'tour' ? `/tour/${item._id}` : `/trek/${item._id}`;
    // Dispatch custom event to trigger loader
    const navigationEvent = new CustomEvent('navigationStart', {
      detail: { path: route }
    });
    window.dispatchEvent(navigationEvent);
  };

  const handleBookNow = (item, e) => {
    e.stopPropagation();
    const route = item.type === 'tour' ? `/book-tour/${item._id}` : `/book-trek/${item._id}`;
    // Dispatch custom event to trigger loader
    const navigationEvent = new CustomEvent('navigationStart', {
      detail: { path: route }
    });
    window.dispatchEvent(navigationEvent);
  };

  // Enhanced skeleton loader - Compact
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 animate-pulse">
      <div className="h-52 bg-gradient-to-br from-gray-200 to-gray-300"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section className="min-h-screen py-20" style={{ backgroundColor: colors.background }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <section 
      ref={sectionRef}
      className="min-h-screen py-20 relative overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {/* Professional Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-bg-1 absolute top-10 left-5% w-96 h-96 rounded-full opacity-5" 
             style={{ backgroundColor: colors.primary }}></div>
        <div className="floating-bg-2 absolute bottom-20 right-10% w-80 h-80 rounded-full opacity-5" 
             style={{ backgroundColor: colors.secondary }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Enhanced Header Section */}
        <div ref={headerRef} className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl border bg-white shadow-lg"
                 style={{ borderColor: colors.border }}>
              <Sparkles className="h-5 w-5" style={{ color: colors.primary }} />
              <span className="font-semibold tracking-wide" style={{ color: colors.primary }}>
                Curated Experiences
              </span>
              <Sparkles className="h-5 w-5" style={{ color: colors.primary }} />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colors.text }}>
            Featured Adventures
          </h1>
          
          <p className="text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: colors.lightText }}>
            Discover handpicked journeys with exclusive offers and unforgettable experiences
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {[
            { icon: Shield, text: 'Secure Booking' },
            { icon: Award, text: 'Award Winning' },
            { icon: Star, text: '5-Star Rated' },
            { icon: Compass, text: 'Expert Guides' }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3 text-sm font-medium" 
                 style={{ color: colors.lightText }}>
              <item.icon className="h-4 w-4" style={{ color: colors.secondary }} />
              {item.text}
            </div>
          ))}
        </div>

        {/* Enhanced Filter Tabs */}
        <div ref={tabsRef} className="flex justify-center gap-4 mb-12">
          {[
            { id: 'all', label: 'All Adventures', icon: Sparkles },
            { id: 'tours', label: 'Cultural Tours', icon: MapPin },
            { id: 'treks', label: 'Mountain Treks', icon: Mountain }
          ].map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm
                  transition-all duration-300 border
                  ${activeTab === tab.id
                    ? 'text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:shadow-md'
                  }
                `}
                style={
                  activeTab === tab.id
                    ? { 
                        backgroundColor: colors.primary,
                        borderColor: colors.primary
                      }
                    : { 
                        borderColor: colors.border
                      }
                }
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Featured Items Grid - Compact Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const special = getSpecialType(item);
            
            return (
              <div
                key={item._id}
                ref={el => cardsRef.current[index] = el}
                onClick={() => handleReadMore(item)}
                onMouseEnter={() => handleCardHover(item._id, true)}
                onMouseLeave={() => handleCardHover(item._id, false)}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border cursor-pointer"
                style={{ 
                  borderColor: colors.border,
                  transform: 'translateZ(0)'
                }}
              >
                {/* Image Container */}
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
                  
                  {/* Special Offer Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg"
                         style={{ backgroundColor: special.bgColor }}>
                      {special.label}
                    </div>
                  </div>

                  {/* Type Badge */}
                  <div className="absolute top-3 right-3">
                    <div className="px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-lg"
                         style={{ 
                           backgroundColor: item.type === 'tour' ? colors.primary : colors.secondary 
                         }}>
                      {item.type === 'tour' ? '🚌' : '🏔️'}
                    </div>
                  </div>

                  {/* Price Badge - Bottom Right */}
                  <div className="absolute bottom-3 right-3">
                    <div className="px-3 py-2 rounded-lg text-white font-bold shadow-lg backdrop-blur-sm"
                         style={{ backgroundColor: colors.primary }}>
                      {formatPrice(item.cityPricing)}
                    </div>
                  </div>

                  {/* Book Now Button - Hover Effect */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => handleBookNow(item, e)}
                      className="px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-xl transition-all duration-300 transform scale-90 group-hover:scale-100 flex items-center gap-2"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Star className="h-4 w-4 fill-current" />
                      Book Now
                    </button>
                  </div>
                </div>

                {/* Compact Content */}
                <div className="p-4">
                  <h3 className="text-base font-bold line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 min-h-[48px]"
                      style={{ color: colors.text }}>
                    {item.title}
                  </h3>

                  {/* Location */}
                  {item.location && (
                    <div className="flex items-center gap-2 mt-3">
                      <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: colors.secondary }} />
                      <span className="text-xs font-medium truncate" style={{ color: colors.lightText }}>
                        {item.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* No Items State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border"
               style={{ borderColor: colors.border }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                 style={{ backgroundColor: `${colors.primary}10` }}>
              <Sparkles className="h-10 w-10" style={{ color: colors.primary }} />
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: colors.text }}>
              No {activeTab === 'all' ? 'Featured Items' : activeTab} Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              We're constantly adding new adventures. Check back soon for amazing deals!
            </p>
            <button 
              onClick={() => setActiveTab('all')}
              className="px-6 py-3 rounded-xl font-semibold transition-colors"
              style={{ 
                backgroundColor: colors.primary,
                color: 'white'
              }}
            >
              View All Adventures
            </button>
          </div>
        )}

        {/* Call to Action */}
        {filteredItems.length > 0 && (
          <div className="text-center mt-16">
            <button
              onClick={() => navigate(activeTab === 'tours' ? '/tours' : activeTab === 'treks' ? '/treks' : '/adventures')}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg"
              style={{ 
                backgroundColor: colors.primary,
                color: 'white'
              }}
            >
              Explore All {activeTab === 'all' ? 'Adventures' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Featured;