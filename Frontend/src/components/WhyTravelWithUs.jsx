import React, { useRef, useEffect, useState } from 'react';
import { FiAward, FiMapPin, FiUsers, FiTrendingUp, FiTag, FiClock, FiPercent, FiCopy, FiCheck, FiStar } from 'react-icons/fi';
import gsap from 'gsap';
import API_BASE_URL from '../api/api';

const WhyTravelWithUs = () => {
  const [statValues, setStatValues] = useState({ 0: 0, 1: 0, 2: 0, 3: 0 });
  const [coupons, setCoupons] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  const statsRef = useRef([]);
  const statsContainerRef = useRef(null);
  const couponsRef = useRef(null);
  const couponCardsRef = useRef([]);

  // Updated color palette
  const colors = {
    primary: "#E66926",
    secondary: "#1E9ABF",
    accent: "#2C2C2C",
    lightBg: "#FAF9F6",
    darkBg: "#0F172A",
    textLight: "#FFFFFF",
    textDark: "#1E293B"
  };

  const stats = [
    { icon: FiMapPin, value: 250, label: "Destinations", suffix: "+" },
    { icon: FiUsers, value: 15000, label: "Happy Travelers", suffix: "+" },
    { icon: FiTrendingUp, value: 10, label: "Years Experience", suffix: "+" },
    { icon: FiAward, value: 99, label: "Satisfaction Rate", suffix: "%" }
  ];

  // Stats animation on mount
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger animation for each stat
            stats.forEach((stat, index) => {
              gsap.to(
                { val: 0 },
                {
                  val: stat.value,
                  duration: 2.5,
                  ease: "power2.out",
                  delay: index * 0.2,
                  onUpdate: function () {
                    setStatValues((prev) => ({
                      ...prev,
                      [index]: Math.floor(this.targets()[0].val)
                    }));
                  }
                }
              );

              // Card entrance animation
              if (statsRef.current[index]) {
                gsap.fromTo(
                  statsRef.current[index],
                  { y: 50, opacity: 0 },
                  {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    delay: index * 0.15,
                    ease: "power3.out"
                  }
                );
              }
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    if (statsContainerRef.current) {
      observer.observe(statsContainerRef.current);
    }

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch active coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/coupons/active`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn('Coupons API returned non-JSON response, skipping coupons');
          setCoupons([]);
          return;
        }
        const data = await response.json();
        setCoupons(data.filter(c => c.isActive).slice(0, 6)); // Show max 6 coupons
      } catch (error) {
        console.error('Error fetching coupons:', error);
        setCoupons([]); // Set empty array on error
      }
    };
    fetchCoupons();
  }, []);

  const formatStatValue = (value, stat) => {
    if (stat.suffix === "%") return value;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value;
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div
      className="relative py-16 px-6 sm:px-8 lg:px-16"
      style={{
        background: `linear-gradient(135deg, ${colors.lightBg} 0%, #F8FAFC 100%)`
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: `${colors.secondary}15`,
              color: colors.secondary
            }}>
            <FiAward size={18} />
            <span className="text-sm font-semibold">Trusted Experience</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${colors.darkBg}, ${colors.secondary})`
            }}>
            Why Travel With Us
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience India like never before with our carefully crafted journeys and personalized service
          </p>
        </div>

        <div
          ref={statsContainerRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                ref={(el) => (statsRef.current[index] = el)}
                className="text-center p-8 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-100"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    y: -8,
                    duration: 0.4,
                    ease: "power2.out"
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                  });
                }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110"
                  style={{
                    backgroundColor: `${colors.primary}10`,
                    border: `2px solid ${colors.primary}20`
                  }}
                >
                  <Icon size={32} style={{ color: colors.primary }} />
                </div>

                <h3 className="text-5xl font-black mb-4" style={{ color: colors.darkBg }}>
                  {formatStatValue(statValues[index], stat)}
                </h3>

                <p className="text-lg font-semibold uppercase tracking-wider"
                  style={{ color: colors.secondary }}>
                  {stat.label}
                </p>

                <div
                  className="w-0 group-hover:w-16 h-1 rounded-full mx-auto mt-4 transition-all duration-500"
                  style={{ backgroundColor: colors.primary }}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Authorized Travel Partner Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4"
              style={{
                background: `${colors.primary}15`,
                color: colors.primary
              }}>
              <FiAward size={18} />
              <span className="text-sm font-semibold">Trusted & Authorized</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: colors.darkBg }}>
              Authorized Travel Partners
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Partnered with India's leading travel platforms for your convenience
            </p>
          </div>

          {/* Infinite Scrolling Logos */}
          <div className="relative overflow-hidden py-8">
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to right, ${colors.lightBg}, transparent)`
              }}></div>
            <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
              style={{
                background: `linear-gradient(to left, ${colors.lightBg}, transparent)`
              }}></div>

            {/* Scrolling Container */}
            <div className="flex animate-infinite-scroll">
              {/* First set of logos */}
              <div className="flex items-center space-x-12 px-6">
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/makemytrip-logo.webp" alt="MakeMyTrip" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/cleartrip.jpg" alt="Cleartrip" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/IRCTC_Logo.svg.png" alt="IRCTC" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/redbus-logo-png_seeklogo-347983.png" alt="RedBus" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/akbartravels-com-logo-png_seeklogo-314198.png" alt="Akbar Travels" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/emt-logo1.svg" alt="EMT" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/images (1).png" alt="Partner" className="max-w-full max-h-full object-contain" />
                </div>
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex items-center space-x-12 px-6">
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/makemytrip-logo.webp" alt="MakeMyTrip" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/cleartrip.jpg" alt="Cleartrip" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/IRCTC_Logo.svg.png" alt="IRCTC" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/redbus-logo-png_seeklogo-347983.png" alt="RedBus" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/akbartravels-com-logo-png_seeklogo-314198.png" alt="Akbar Travels" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/emt-logo1.svg" alt="EMT" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                  <img src="/PartnersLogos/images (1).png" alt="Partner" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exclusive Coupons Section */}
        {coupons.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-16">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: `${colors.primary}15`,
                  color: colors.primary
                }}>
                <FiTag size={18} />
                <span className="text-sm font-semibold">Limited Time Offers</span>
              </div>
              <h3 className="text-4xl sm:text-5xl font-black mb-4 bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${colors.darkBg}, ${colors.primary})`
                }}>
                Exclusive Coupon Deals
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Save big on your next adventure! Grab these amazing offers before they expire
              </p>
            </div>

            {/* Coupons Grid */}
            <div ref={couponsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coupons.map((coupon, index) => {
                const isExpiring = new Date(coupon.validTo) - new Date() < 7 * 24 * 60 * 60 * 1000; // Less than 7 days
                const daysLeft = Math.ceil((new Date(coupon.validTo) - new Date()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div
                    key={coupon._id}
                    ref={(el) => (couponCardsRef.current[index] = el)}
                    className="relative overflow-hidden rounded-2xl border-2 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer"
                    style={{
                      borderColor: index % 2 === 0 ? colors.primary : colors.secondary,
                      backgroundColor: colors.lightBg
                    }}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        y: -8,
                        scale: 1.02,
                        duration: 0.4,
                        ease: "power2.out"
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        y: 0,
                        scale: 1,
                        duration: 0.4,
                        ease: "power2.out"
                      });
                    }}
                  >
                    {/* Decorative Corner Elements */}
                    <div
                      className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10"
                      style={{
                        backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-full opacity-10"
                      style={{
                        backgroundColor: index % 2 === 0 ? colors.secondary : colors.primary
                      }}
                    />

                    {/* Expiring Soon Badge */}
                    {isExpiring && (
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse"
                        style={{ backgroundColor: '#DC2626' }}>
                        <FiClock className="inline mr-1" size={12} />
                        {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Left!
                      </div>
                    )}

                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="relative">
                        <div
                          className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                          style={{
                            backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary
                          }}
                        >
                          <div className="text-center">
                            <div className="text-3xl font-black text-white leading-none">
                              {coupon.discountPercentage}
                            </div>
                            <div className="text-xs font-bold text-white">% OFF</div>
                          </div>
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#10B981' }}>
                          <FiPercent size={12} className="text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-24">
                      {/* Description */}
                      <div className="mb-6">
                        <h4 className="text-xl font-bold mb-2" style={{ color: colors.darkBg }}>
                          {coupon.description || `${coupon.discountPercentage}% Off on Your Booking`}
                        </h4>
                        
                        {/* Details */}
                        <div className="space-y-2 text-sm text-gray-600">
                          {coupon.minOrderAmount > 0 && (
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.secondary }} />
                              <span>Min. booking: ₹{coupon.minOrderAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {coupon.maxDiscountAmount && (
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                              <span>Max. discount: ₹{coupon.maxDiscountAmount.toLocaleString()}</span>
                            </div>
                          )}
                          {coupon.applicableToType !== 'all' && (
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.secondary }} />
                              <span className="capitalize">Valid for: {coupon.applicableToType}s only</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                            <span>Valid till: {formatDate(coupon.validTo)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Coupon Code */}
                      <div className="border-t-2 border-dashed pt-4"
                        style={{ borderColor: `${colors.darkBg}20` }}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                              Coupon Code
                            </div>
                            <div
                              className="text-2xl font-black tracking-wider"
                              style={{ color: index % 2 === 0 ? colors.primary : colors.secondary }}
                            >
                              {coupon.code}
                            </div>
                          </div>
                          
                          {/* Copy Button */}
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            className="flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                            style={{
                              backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary
                            }}
                          >
                            {copiedCode === coupon.code ? (
                              <>
                                <FiCheck size={18} />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <FiCopy size={18} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Usage Info */}
                        {coupon.usageLimit && (
                          <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {coupon.usageLimit - coupon.usedCount} uses left
                            </span>
                            <div className="flex-1 mx-3 h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: `${colors.darkBg}10` }}>
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${((coupon.usageLimit - coupon.usedCount) / coupon.usageLimit) * 100}%`,
                                  backgroundColor: index % 2 === 0 ? colors.primary : colors.secondary
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Terms Note */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl border-2"
                style={{
                  borderColor: `${colors.secondary}30`,
                  backgroundColor: `${colors.secondary}05`
                }}>
                <FiStar size={16} style={{ color: colors.secondary }} />
                <span className="text-sm text-gray-700">
                  <strong>Pro Tip:</strong> Coupon codes are automatically applied at checkout for maximum savings!
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhyTravelWithUs;