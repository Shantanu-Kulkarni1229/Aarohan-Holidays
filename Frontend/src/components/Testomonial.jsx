import React, { useState, useEffect, useRef } from 'react';
import { testimonialsAPI } from '../api/userAPI';
import gsap from 'gsap';
import { showSuccess, showApiError } from '../utils/toast';

const Testimonial = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    review: '',
    email: '',
    tourOrTrek: '',
    location: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Refs for animation
  const scrollContainerRef = useRef(null);
  const cardsRef = useRef([]);

  // Color palette
  const colors = {
    primary: "#E66926", // Orange
    secondary: "#1E9ABF", // Blue
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    textLight: "#FFFFFF",
    textDark: "#334155"
  };

  // Fetch testimonials and stats
  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await testimonialsAPI.getApproved({ limit: 50 });
      setTestimonials(response.data.data || []);
    } catch (error) {
      setTestimonials([]);
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await testimonialsAPI.getStats();
      const statsData = response?.data?.data || { averageRating: 0, totalReviews: 0 };
      setStats({
        averageRating: statsData.averageRating || 0,
        totalReviews: statsData.totalReviews || 0
      });
    } catch (error) {
      setStats({ averageRating: 0, totalReviews: 0 });
    }
  };

  // Infinite auto-scroll animation
  useEffect(() => {
    if (testimonials.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      
      // Kill any existing animations
      gsap.killTweensOf(container);
      
      // Calculate scroll distance for one complete set
      const firstCard = cardsRef.current[0];
      if (!firstCard) return;
      
      const cardWidth = firstCard.offsetWidth;
      const gap = 24; // 6 * 4 = 24px gap
      const scrollDistance = (cardWidth + gap) * testimonials.length;
      
      // Create infinite scroll animation
      const animation = gsap.to(container, {
        scrollLeft: `+=${scrollDistance}`,
        duration: testimonials.length * 5, // Adjust speed here (higher = slower)
        ease: 'none',
        repeat: -1,
        modifiers: {
          scrollLeft: (x) => {
            const maxScroll = container.scrollWidth - container.offsetWidth;
            return parseFloat(x) % maxScroll;
          }
        }
      });

      // Pause on hover
      container.addEventListener('mouseenter', () => animation.pause());
      container.addEventListener('mouseleave', () => animation.resume());

      return () => {
        animation.kill();
        container.removeEventListener('mouseenter', () => animation.pause());
        container.removeEventListener('mouseleave', () => animation.resume());
      };
    }
  }, [testimonials]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess(false);

    try {
      const response = await testimonialsAPI.create(formData);
      
      if (response.data.success) {
        showSuccess('Thank you for sharing your experience! Your review is now visible to others.');
        setFormSuccess(true);
        setFormData({
          name: '',
          rating: 5,
          review: '',
          email: '',
          tourOrTrek: '',
          location: ''
        });

        await fetchTestimonials();
        await fetchStats();

        setTimeout(() => {
          setShowForm(false);
          setFormSuccess(false);
          
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Unable to submit your review. Please try again later.';
      setFormError(errorMessage);
      showApiError(error);
    } finally {
      setFormLoading(false);
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-5 h-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
    );
  };

  // Render clickable stars for form
  const renderFormStars = (currentRating) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
            className="transition-transform hover:scale-125 focus:outline-none"
          >
            <svg
              className={`w-8 h-8 ${star <= currentRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div id='testimonial' className="bg-gray-50 py-16 px-4" style={{ backgroundColor: colors.lightBg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
               style={{ backgroundColor: `${colors.secondary}15` }}>
            <span className="text-2xl" style={{ color: colors.secondary }}>💬</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: colors.darkBg }}>
            Traveler Stories
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Discover what our adventurers have to say about their unforgettable journeys across India
          </p>
          
          {/* Stats */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-black" style={{ color: colors.primary }}>
                  {(stats?.averageRating || 0).toFixed(1)}
                </span>
                {renderStars(Math.round(stats?.averageRating || 0))}
              </div>
              <p className="text-sm font-medium text-gray-600 mt-2">Overall Rating</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-4xl font-black" style={{ color: colors.primary }}>{stats?.totalReviews || 0}</p>
              <p className="text-sm font-medium text-gray-600 mt-2">Traveler Reviews</p>
            </div>
          </div>

          {/* Write Review Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: colors.primary }}
          >
            {showForm ? 'Close Review Form' : 'Share Your Experience'}
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-12 bg-white rounded-2xl shadow-xl p-8 border"
               style={{ borderColor: `${colors.secondary}20` }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                   style={{ backgroundColor: `${colors.primary}15` }}>
                <span className="text-lg" style={{ color: colors.primary }}>✍️</span>
              </div>
              <h3 className="text-2xl font-black" style={{ color: colors.darkBg }}>Share Your Journey</h3>
            </div>

            {formSuccess && (
              <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3"
                   style={{ 
                     backgroundColor: '#F0F9FF', 
                     borderColor: '#10B981' 
                   }}>
                <span className="text-green-600 text-xl">✅</span>
                <div>
                  <p className="text-green-800 font-semibold">Thank you for sharing your experience!</p>
                  <p className="text-green-700 text-sm mt-1">Your review is now published and visible to other travelers.</p>
                </div>
              </div>
            )}

            {formError && (
              <div className="mb-6 p-4 rounded-lg border-l-4 flex items-start gap-3"
                   style={{ 
                     backgroundColor: '#FEF2F2', 
                     borderColor: '#EF4444' 
                   }}>
                <span className="text-red-600 text-xl">⚠️</span>
                <p className="text-red-700">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 transition-all duration-300"
                    style={{ 
                      focusRingColor: colors.primary,
                      borderColor: formData.name ? colors.primary : '#E5E7EB'
                    }}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 transition-all duration-300"
                    style={{ 
                      focusRingColor: colors.secondary,
                      borderColor: formData.email ? colors.secondary : '#E5E7EB'
                    }}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Your Rating <span className="text-red-500">*</span>
                </label>
                {renderFormStars(formData.rating)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Tour or Activity
                  </label>
                  <input
                    type="text"
                    name="tourOrTrek"
                    value={formData.tourOrTrek}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 transition-all duration-300"
                    style={{ focusRingColor: colors.primary }}
                    placeholder="Which tour did you experience?"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Your Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 transition-all duration-300"
                    style={{ focusRingColor: colors.secondary }}
                    placeholder="Where are you from?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Your Experience <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="review"
                  value={formData.review}
                  onChange={handleChange}
                  required
                  rows="4"
                  minLength="10"
                  maxLength="1000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 transition-all duration-300 resize-none"
                  style={{ focusRingColor: colors.primary }}
                  placeholder="Tell us about your adventure... What made your journey special?"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.review.length}/1000 characters (minimum 10 required)
                </p>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300 ${
                  formLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'hover:scale-105 shadow-lg hover:shadow-xl'
                }`}
                style={{ backgroundColor: formLoading ? '#9CA3AF' : colors.primary }}
              >
                {formLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Publishing Your Review...
                  </span>
                ) : (
                  'Publish Your Experience'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Testimonials Scroll Section */}
        <div className="relative">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2"
                   style={{ borderColor: colors.primary }}></div>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: `${colors.secondary}15` }}>
                <span className="text-2xl" style={{ color: colors.secondary }}>🌟</span>
              </div>
              <p className="text-gray-600 text-lg font-medium">Be the first to share your adventure story!</p>
              <p className="text-gray-500 mt-2">Your experience could inspire other travelers.</p>
            </div>
          ) : (
            <>
              {/* Scroll overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none"></div>

              {/* Scrolling Container */}
              <div
                ref={scrollContainerRef}
                className="overflow-x-scroll pb-4 scrollbar-hide"
                style={{ scrollBehavior: 'auto' }}
              >
                <div className="flex gap-6 px-4">
                  {/* First set of testimonials */}
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={`original-${testimonial._id}`}
                      ref={(el) => (cardsRef.current[index] = el)}
                      className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg" style={{ color: colors.darkBg }}>
                            {testimonial.name}
                          </h4>
                          {testimonial.location && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <span>📍</span> {testimonial.location}
                            </p>
                          )}
                        </div>
                        {renderStars(testimonial.rating)}
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-700 mb-4 leading-relaxed line-clamp-4">
                        {testimonial.review}
                      </p>

                      {/* Tour/Activity */}
                      {testimonial.tourOrTrek && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-semibold flex items-center gap-2"
                             style={{ color: colors.secondary }}>
                            <span>🎯</span> {testimonial.tourOrTrek}
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <p className="text-xs text-gray-400 mt-4">
                        Experienced on {new Date(testimonial.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                  
                  {/* Duplicate set for seamless infinite scroll */}
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={`duplicate-${testimonial._id}`}
                      className="flex-shrink-0 w-80 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg" style={{ color: colors.darkBg }}>
                            {testimonial.name}
                          </h4>
                          {testimonial.location && (
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <span>📍</span> {testimonial.location}
                            </p>
                          )}
                        </div>
                        {renderStars(testimonial.rating)}
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-700 mb-4 leading-relaxed line-clamp-4">
                        {testimonial.review}
                      </p>

                      {/* Tour/Activity */}
                      {testimonial.tourOrTrek && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-semibold flex items-center gap-2"
                             style={{ color: colors.secondary }}>
                            <span>🎯</span> {testimonial.tourOrTrek}
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <p className="text-xs text-gray-400 mt-4">
                        Experienced on {new Date(testimonial.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Custom CSS for hiding scrollbar */}
        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4 font-medium">Have an adventure story to share?</p>
          <button
            onClick={() => {
              setShowForm(true);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="px-8 py-3 rounded-xl font-semibold border-2 transition-all duration-300 hover:scale-105"
            style={{ 
              borderColor: colors.secondary,
              color: colors.secondary,
              backgroundColor: `${colors.secondary}08`
            }}
          >
            Share Your Travel Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;