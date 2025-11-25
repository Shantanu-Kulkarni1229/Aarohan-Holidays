import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treksAPI } from '../api/userAPI';
import axios from 'axios';
import { showError, showApiError, showSuccess } from '../utils/toast';
import { gsap } from 'gsap';
import { MapPin, Clock, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Loader, Play, X, Mountain, TrendingUp, Users, Shield, Heart, Phone } from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../api/api';
import '../components/RichTextContent.css';

const BookTrek = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    numberOfMembers: 1,
    adults: 1,
    women: 0,
    children: 0,
    infants: 0,
    pickupCity: '',
    pickupPoint: '',
    bookingDate: '',
    selectedPricingOption: '', // Selected pricing option (categoryName from pricingOptions)
    pricePerPerson: 0,
    specialRequests: '',
    couponCode: '',
    selectedAddOns: [] // Array of selected add-on IDs
  });
  
  const [expandedItinerary, setExpandedItinerary] = useState({});
  const [selectedCity, setSelectedCity] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Coupon state
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  
  // Availability state
  const [availabilityData, setAvailabilityData] = useState({});
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Refs for animations and scroll
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const itineraryRef = useRef([]);
  const successRef = useRef(null);
  const galleryRef = useRef(null);
  const leftContentRef = useRef(null);
  const formContainerRef = useRef(null);

  // Color palette
  const colors = {
    primary: "#1E9ABF",      // Main blue
    secondary: "#E66926",    // Orange accent
    background: "#F8FAFC",   // Light background
    cardBg: "#FFFFFF",       // White cards
    text: "#1F2937",         // Dark text
    lightText: "#6B7280",    // Light text
    border: "#E5E7EB",       // Borders
    success: "#059669",      // Success green
    warning: "#D97706",      // Warning amber
    error: "#DC2626",        // Error red
    accentLight: "#FEF6EE",  // Light orange background
    accentBlue: "#EFF6FF",   // Light blue background
  };

  // Scroll to top when component mounts or ID changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [id]);

  // Fetch trek details (unchanged)
  useEffect(() => {
    const fetchTrek = async () => {
      try {
        setLoading(true);
        setError('');
        setTrek(null);
        setBookingSuccess(false);
        setBookingReference('');
        setSelectedCity('');
        setFormErrors({});
        setExpandedItinerary({});
        setSelectedImage(null);
        
        // Reset coupon state
        setCouponApplied(false);
        setCouponData(null);
        setCouponError('');
        
        setFormData({
          name: '',
          email: '',
          mobile: '',
          numberOfMembers: 1,
          adults: 1,
          women: 0,
          children: 0,
          infants: 0,
          pickupCity: '',
          pickupPoint: '',
          bookingDate: '',
          selectedPricingOption: '',
          pricePerPerson: 0,
          specialRequests: '',
          couponCode: '',
          selectedAddOns: []
        });
        
        const response = await treksAPI.getById(id);
        if (response.data.success) {
          setTrek(response.data.data);
          if (response.data.data.cityPricing?.length > 0) {
            const firstCity = response.data.data.cityPricing[0];
            setSelectedCity(firstCity.city);
            // Set first pricing option as default
            const firstPricingOption = firstCity.pricingOptions?.[0];
            const basePrice = firstPricingOption?.price || 0;
            const categoryName = firstPricingOption?.categoryName || '';
            setFormData(prev => ({
              ...prev,
              pickupCity: firstCity.city,
              selectedPricingOption: categoryName,
              pricePerPerson: basePrice,
              selectedAddOns: []
            }));
          }
        }
      } catch (err) {
        const errorMsg = 'Failed to load trek details. Please try again.';
        setError(errorMsg);
        showApiError(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrek();
    }
  }, [id]);

  // Fetch availability when trek is loaded
  useEffect(() => {
    if (trek && trek._id) {
      fetchAvailability();
    }
  }, [trek]);

  // Auto-calculate numberOfMembers when individual counts change
  useEffect(() => {
    const total = formData.adults + formData.women + formData.children + formData.infants;
    if (total !== formData.numberOfMembers) {
      setFormData(prev => ({
        ...prev,
        numberOfMembers: total
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.adults, formData.women, formData.children, formData.infants]);

  // GSAP Animations (unchanged)
  useEffect(() => {
    if (!sectionRef.current || !trek) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current,
        { 
          opacity: 0,
          y: 50
        },
        { 
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out"
        }
      );

      if (headerRef.current) {
        gsap.fromTo(headerRef.current.children,
          { 
            y: 30,
            opacity: 0
          },
          { 
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.4)"
          }
        );
      }

      if (formContainerRef.current) {
        gsap.fromTo(formContainerRef.current,
          { 
            x: 50,
            opacity: 0,
            scale: 0.95
          },
          { 
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            delay: 0.3
          }
        );
      }

      if (galleryRef.current) {
        gsap.fromTo(galleryRef.current.children,
          { 
            y: 30,
            opacity: 0
          },
          { 
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            delay: 0.5
          }
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, [trek]);

  // Itinerary animations (unchanged)
  useEffect(() => {
    const cards = itineraryRef.current.filter(Boolean);
    if (cards.length > 0) {
      gsap.fromTo(cards,
        { 
          y: 30,
          opacity: 0
        },
        { 
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out"
        }
      );
    }
  }, [expandedItinerary]);

  // Success animation (unchanged)
  useEffect(() => {
    if (showSuccessAnimation && successRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(successRef.current,
          { 
            scale: 0.8,
            opacity: 0
          },
          { 
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "back.out(1.7)"
          }
        );

        gsap.to('.confetti', {
          y: -100,
          rotation: 360,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: "power2.out"
        });

      }, successRef.current);

      return () => ctx.revert();
    }
  }, [showSuccessAnimation]);

  // Handle independent scrolling (unchanged)
  useEffect(() => {
    const leftContent = leftContentRef.current;
    const formContainer = formContainerRef.current;
    
    if (leftContent && formContainer) {
      leftContent.style.overflowY = 'auto';
      leftContent.style.maxHeight = 'calc(100vh - 2rem)';
      leftContent.style.position = 'relative';
      
      formContainer.style.overflowY = 'auto';
      formContainer.style.maxHeight = 'calc(100vh - 2rem)';
      formContainer.style.position = 'sticky';
      formContainer.style.top = '1rem';
    }

    return () => {
      if (leftContent) {
        leftContent.style.overflowY = '';
        leftContent.style.maxHeight = '';
        leftContent.style.position = '';
      }
      if (formContainer) {
        formContainer.style.overflowY = '';
        formContainer.style.maxHeight = '';
        formContainer.style.position = '';
        formContainer.style.top = '';
      }
    };
  }, [trek]);

  // Image modal handlers with useCallback (unchanged)
  const closeImageModal = useCallback(() => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
    document.body.style.overflow = 'auto';
  }, []);

  const navigateImage = useCallback((direction) => {
    const images = trek?.showcaseImages || [];
    let newIndex = currentImageIndex + direction;
    
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    
    setCurrentImageIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [currentImageIndex, trek?.showcaseImages]);

  // Keyboard navigation for image modal (unchanged)
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowLeft') {
        navigateImage(-1);
      } else if (e.key === 'ArrowRight') {
        navigateImage(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, closeImageModal, navigateImage]);

  const openImageModal = (image) => {
    const images = trek.showcaseImages || [];
    const index = images.indexOf(image);
    setCurrentImageIndex(index);
    setSelectedImage(image);
    document.body.style.overflow = 'hidden';
  };

  // All handler functions remain unchanged
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    const cityPrice = trek.cityPricing.find(cp => cp.city === city);
    // Set first pricing option as default for new city
    const firstPricingOption = cityPrice?.pricingOptions?.[0];
    const basePrice = firstPricingOption?.price || 0;
    const categoryName = firstPricingOption?.categoryName || '';
    setFormData(prev => ({
      ...prev,
      pickupCity: city,
      pickupPoint: '', // Reset pickup point when city changes
      selectedPricingOption: categoryName,
      pricePerPerson: basePrice
    }));
  };

  const handlePricingOptionChange = (e) => {
    const categoryName = e.target.value;
    const cityPrice = trek.cityPricing.find(cp => cp.city === selectedCity);
    const selectedOption = cityPrice?.pricingOptions?.find(opt => opt.categoryName === categoryName);
    const price = selectedOption?.price || 0;
    setFormData(prev => ({
      ...prev,
      selectedPricingOption: categoryName,
      pricePerPerson: price
    }));
  };

  const handleAddOnToggle = (addonId) => {
    setFormData(prev => {
      const isSelected = prev.selectedAddOns.includes(addonId);
      return {
        ...prev,
        selectedAddOns: isSelected
          ? prev.selectedAddOns.filter(id => id !== addonId)
          : [...prev.selectedAddOns, addonId]
      };
    });
  };

  const toggleItineraryDay = (dayIndex) => {
    setExpandedItinerary(prev => ({
      ...prev,
      [dayIndex]: !prev[dayIndex]
    }));
  };

  const calculateTotalPrice = () => {
    // Get the selected city's pricing
    if (!trek || !selectedCity) return 0;
    
    const cityPrice = trek.cityPricing?.find(cp => cp.city === selectedCity);
    if (!cityPrice) return 0;
    
    // Find the selected pricing option
    const selectedOption = cityPrice.pricingOptions?.find(
      opt => opt.categoryName === formData.selectedPricingOption
    );
    const basePrice = selectedOption ? selectedOption.price : 0;
    
    // Calculate base price total
    let totalPrice = formData.numberOfMembers * basePrice;
    
    // Add selected add-ons (add-ons are typically per person)
    if (trek.addOns && formData.selectedAddOns.length > 0) {
      formData.selectedAddOns.forEach(addonId => {
        const addon = trek.addOns.find(a => a._id === addonId);
        if (addon) {
          totalPrice += addon.price * formData.numberOfMembers;
        }
      });
    }
    
    return totalPrice;
  };

  // Fetch availability data
  const fetchAvailability = async () => {
    if (!trek || !trek._id) return;
    
    setLoadingAvailability(true);
    try {
      // Call the new bulk availability endpoint
      const response = await treksAPI.getAvailability(trek._id);
      
      if (response.data.success && response.data.data) {
        // Convert array to map for easier lookup
        const availabilityMap = {};
        response.data.data.forEach(item => {
          availabilityMap[item.date] = {
            availableSeats: item.availableSeats,
            totalSeats: item.maxGroupSize,
            totalBooked: item.totalBooked,
            isAvailable: item.isAvailable
          };
        });
        setAvailabilityData(availabilityMap);
      }
    } catch (err) {
      showApiError(err);
      // Set default availability on error
      if (trek.availableDates && trek.availableDates.length > 0) {
        const defaultMap = {};
        trek.availableDates.forEach(date => {
          const dateString = new Date(date).toISOString().split('T')[0];
          defaultMap[dateString] = {
            availableSeats: trek.maxGroupSize || 0,
            totalSeats: trek.maxGroupSize || 0,
            totalBooked: 0,
            isAvailable: true
          };
        });
        setAvailabilityData(defaultMap);
      }
    } finally {
      setLoadingAvailability(false);
    }
  };

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!formData.couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setApplyingCoupon(true);
    setCouponError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/coupons/validate`, {
        code: formData.couponCode.toUpperCase(),
        bookingType: 'trek',
        itemId: trek._id,
        orderAmount: calculateTotalPrice()
      });

      if (response.data.success) {
        setCouponData(response.data.data);
        setCouponApplied(true);
        setCouponError('');
        showSuccess(`Coupon applied! You saved ₹${response.data.data.discountAmount}`);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(errorMsg);
      setCouponData(null);
      setCouponApplied(false);
      showError(errorMsg);
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponData(null);
    setCouponError('');
    setFormData(prev => ({ ...prev, couponCode: '' }));
  };

  // Calculate final price with coupon
  const calculateFinalPrice = () => {
    if (couponApplied && couponData) {
      return couponData.finalAmount;
    }
    return calculateTotalPrice();
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Invalid email format';
    
    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(formData.mobile)) errors.mobile = 'Mobile must be 10 digits';
    
    if (formData.numberOfMembers < 1) errors.numberOfMembers = 'At least 1 member required';
    if (!formData.pickupCity) errors.pickupCity = 'Please select pickup city';
    if (!formData.selectedPricingOption) errors.selectedPricingOption = 'Please select a pricing category';
    if (!formData.bookingDate) errors.bookingDate = 'Booking date is required';
    
    const selectedDate = new Date(formData.bookingDate);
    if (selectedDate <= new Date()) {
      errors.bookingDate = 'Booking date must be in the future';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      gsap.fromTo('.error-message',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, stagger: 0.05 }
      );
    } else {
      setFormErrors({});
    }
    
    return Object.keys(errors).length === 0;
  };

  // Load Razorpay script dynamically (unchanged)
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Initialize Razorpay payment (unchanged)
  const initiateRazorpayPayment = async (bookingData) => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection.');
      }

      const orderResponse = await axios.post(`${API_BASE_URL}/payment/create-order`, {
        amount: calculateFinalPrice(),
        bookingData: bookingData
      });

      if (!orderResponse.data.success) {
        throw new Error('Failed to create payment order');
      }

      const order = orderResponse.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxx',
        amount: order.amount,
        currency: order.currency,
        name: 'Aarohan-holidays',
        description: `Booking for ${trek.name}`,
        order_id: order.id,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.mobile
        },
        theme: {
          color: colors.primary
        },
        handler: async function (response) {
          try {
            const verifyResponse = await axios.post(`${API_BASE_URL}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: bookingData
            });

            if (verifyResponse.data.success) {
              setBookingSuccess(true);
              setBookingReference(verifyResponse.data.data.bookingReference);
              setShowSuccessAnimation(true);
              
              window.scrollTo({ 
                top: 0, 
                left: 0, 
                behavior: 'instant' 
              });
            }
          } catch (verifyErr) {
            const errorMsg = 'Payment successful but booking verification failed. Our team will contact you shortly.';
            setError(errorMsg);
            showError(errorMsg);
            
            try {
              await axios.post(`${API_BASE_URL}/payment/failure`, {
                orderId: order.id,
                error: verifyErr.message,
                bookingData: bookingData
              });
            } catch (logErr) {
              // Silently fail payment failure logging
            }
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function() {
            setSubmitting(false);
            setError('Payment cancelled. Please try again to confirm your booking.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', async function (response) {
        setSubmitting(false);
        setError(`Payment failed: ${response.error.description}`);
        
        try {
          await axios.post(`${API_BASE_URL}/payment/failure`, {
            orderId: order.id,
            error: response.error.description,
            bookingData: bookingData
          });
        } catch (logErr) {
          // Silently fail payment failure logging
        }
      });
      
      razorpay.open();

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to initiate payment. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const calculatedTotalPrice = calculateTotalPrice();
      const finalAmount = calculateFinalPrice();
      
      const bookingData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        bookingType: 'trek',
        trekId: id,
        numberOfMembers: formData.numberOfMembers,
        adults: formData.adults,
        women: formData.women,
        children: formData.children,
        infants: formData.infants,
        selectedCategory: formData.selectedPricingOption, // Selected pricing category name
        selectedAddOns: formData.selectedAddOns, // Selected add-on IDs
        pickupCity: formData.pickupCity,
        pickupPoint: formData.pickupPoint,
        bookingDate: formData.bookingDate,
        pricePerPerson: formData.pricePerPerson,
        totalPrice: finalAmount, // Send the final calculated price (after discount)
        originalPrice: calculatedTotalPrice, // Send the original price before discount
        specialRequests: formData.specialRequests,
        ...(couponApplied && couponData && {
          couponCode: couponData.code,
          discountPercentage: couponData.discountPercentage,
          discountAmount: couponData.discountAmount
        })
      };

      await initiateRazorpayPayment(bookingData);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to create booking. Please try again.';
      
      setError(errorMessage);
      showApiError(err);
      
      gsap.fromTo('.error-alert',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
      setSubmitting(false);
    }
  };

  // Enhanced Itinerary Component with new colors
  const ItineraryDay = ({ day, index }) => {
    const isExpanded = expandedItinerary[index];
    
    return (
      <div
        ref={el => itineraryRef.current[index] = el}
        className="bg-white rounded-lg shadow-md border overflow-hidden transition-all duration-300 hover:shadow-lg"
        style={{ borderColor: colors.border, borderLeftColor: colors.primary, borderLeftWidth: '3px' }}
      >
        <button
          onClick={() => toggleItineraryDay(index)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center gap-3">
            <div 
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: colors.primary }}
            >
              DAY {day.day}
            </div>
            <div>
              <h4 className="font-bold text-base" style={{ color: colors.text }}>{day.title}</h4>
            </div>
          </div>
          <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-4 w-4" style={{ color: colors.primary }} />
          </div>
        </button>
        
        <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 border-t overflow-y-auto max-h-[1800px]" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
            <div 
              className="leading-relaxed mb-3 text-sm rich-text-content" 
              style={{ color: colors.text }}
              dangerouslySetInnerHTML={{ __html: day.description }}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {day.meals && (
                <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: colors.accentLight, borderColor: colors.secondary + '40' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.secondary + '20' }}>
                    <span className="text-sm">🍽️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs" style={{ color: colors.text }}>Meals Included</p>
                    <p className="text-xs" style={{ color: colors.secondary }}>{day.meals}</p>
                  </div>
                </div>
              )}
              
              {day.accommodation && (
                <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: colors.accentBlue, borderColor: colors.primary + '40' }}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primary + '20' }}>
                    <span className="text-sm">⛺</span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs" style={{ color: colors.text }}>Accommodation</p>
                    <p className="text-xs" style={{ color: colors.primary }}>{day.accommodation}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* NEW: Day Note - Display if present */}
            {day.note && day.note.trim() && day.note.replace(/<[^>]*>/g, '').trim() && (
              <div 
                className="mt-3 p-3 rounded-lg border-l-4 transition-all duration-300 hover:shadow-md"
                style={{ 
                  backgroundColor: '#FEF9C3', 
                  borderLeftColor: colors.warning,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex items-start gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.warning + '25' }}
                  >
                    <span className="text-sm">📝</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs mb-1" style={{ color: colors.text }}>Important Note</p>
                    <div 
                      className="text-xs leading-relaxed rich-text-content" 
                      style={{ color: colors.text }}
                      dangerouslySetInnerHTML={{ __html: day.note }}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* NEW: Activities List - Display if present */}
            {day.activities && Array.isArray(day.activities) && day.activities.length > 0 && (
              <div 
                className="mt-3 p-3 rounded-lg border transition-all duration-300 hover:shadow-md"
                style={{ 
                  backgroundColor: colors.accentLight + '30', 
                  borderColor: colors.secondary + '40',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
                }}
              >
                <div className="flex items-start gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: colors.secondary + '20' }}
                  >
                    <span className="text-sm">🎯</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-xs mb-2" style={{ color: colors.text }}>Trek Activities</p>
                    <ul className="space-y-1.5">
                      {day.activities.filter(activity => activity && activity.trim()).map((activity, actIndex) => (
                        <li key={actIndex} className="flex items-start gap-2">
                          <span 
                            className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5"
                            style={{ backgroundColor: colors.secondary }}
                          ></span>
                          <span className="text-xs leading-relaxed flex-1" style={{ color: colors.text }}>{activity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Extract YouTube video ID from URL (unchanged)
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-3"
            style={{ borderColor: colors.primary }}
          ></div>
          <p className="text-sm" style={{ color: colors.lightText }}>Loading your trek adventure...</p>
        </div>
      </div>
    );
  }

  if (error && !trek) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center border" style={{ borderColor: colors.border }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: colors.accentLight }}>
            <XCircle className="h-7 w-7" style={{ color: colors.secondary }} />
          </div>
          <h2 className="text-lg font-bold mb-3" style={{ color: colors.text }}>Trek Not Found</h2>
          <p className="text-sm mb-4" style={{ color: colors.lightText }}>{error}</p>
          <button
            onClick={() => navigate('/treks')}
            className="w-full py-2.5 rounded-lg text-white font-semibold transition-colors text-sm"
            style={{ backgroundColor: colors.primary }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1A87A9'}
            onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
          >
            Explore Available Treks
          </button>
        </div>
      </div>
    );
  }

  if (!trek) return null;

  // Success Modal with new colors
  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: colors.background }}>
        {/* Confetti Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: '100%',
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                backgroundColor: [colors.primary, colors.secondary, '#10b981', '#8b5cf6'][Math.floor(Math.random() * 4)],
                borderRadius: '50%'
              }}
            />
          ))}
        </div>

        <div ref={successRef} className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 relative z-10 border" style={{ borderColor: colors.border }}>
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full animate-pulse" style={{ backgroundColor: colors.accentLight }}>
                <CheckCircle className="w-10 h-10" style={{ color: colors.secondary }} />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>
              Trek Booking Confirmed! 🏔️
            </h1>
            
            <div 
              className="text-white rounded-lg p-4 mb-4 transform hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: colors.primary }}
            >
              <p className="text-xs uppercase tracking-wide mb-1 opacity-90">Your Booking Reference</p>
              <p className="text-2xl font-bold tracking-wider font-mono">{bookingReference}</p>
              <p className="text-xs mt-1 opacity-90">Save this reference for future communication</p>
            </div>
            
            <div 
              className="rounded-lg p-4 mb-4 text-left border"
              style={{ backgroundColor: colors.accentBlue, borderColor: colors.primary + '40' }}
            >
              <h3 className="font-semibold mb-3 flex items-center text-base" style={{ color: colors.text }}>
                <Mountain className="w-4 h-4 mr-2" style={{ color: colors.primary }} />
                What's Next?
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: colors.text }}>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0" style={{ backgroundColor: colors.primary + '20' }}>
                    <CheckCircle className="w-3 h-3" style={{ color: colors.primary }} />
                  </div>
                  <span>Check your email for detailed trek booking confirmation</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0" style={{ backgroundColor: colors.primary + '20' }}>
                    <CheckCircle className="w-3 h-3" style={{ color: colors.primary }} />
                  </div>
                  <span>You'll receive a WhatsApp message with trek details</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0" style={{ backgroundColor: colors.primary + '20' }}>
                    <CheckCircle className="w-3 h-3" style={{ color: colors.primary }} />
                  </div>
                  <span>Our team will contact you within 24 hours</span>
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0" style={{ backgroundColor: colors.primary + '20' }}>
                    <CheckCircle className="w-3 h-3" style={{ color: colors.primary }} />
                  </div>
                  <span>Prepare your trek gear and fitness for the adventure!</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/treks')}
                className="flex-1 py-2.5 px-4 rounded-lg transition-all duration-300 font-semibold hover:scale-105 transform border text-sm"
                style={{ backgroundColor: colors.cardBg, color: colors.text, borderColor: colors.border }}
              >
                Browse More Treks
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-2.5 px-4 rounded-lg text-white transition-all duration-300 font-semibold hover:scale-105 transform shadow-md text-sm"
                style={{ backgroundColor: colors.primary }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1A87A9'}
                onMouseOut={(e) => e.target.style.backgroundColor = colors.primary}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const youtubeVideoId = getYouTubeVideoId(trek.videoLink);

  return (
    <>
      <Navbar />
      <div ref={sectionRef} className="min-h-screen py-6 pt-20" style={{ backgroundColor: colors.background }}>
        {/* Image Modal with Navigation */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
              <button
                onClick={closeImageModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-20 bg-black/50 rounded-full p-2 hover:bg-black/70"
                aria-label="Close"
              >
                <X className="w-6 h-6" />
              </button>

              {trek.showcaseImages && trek.showcaseImages.length > 1 && (
                <button
                  onClick={() => navigateImage(-1)}
                  className="absolute left-4 text-white hover:text-gray-300 transition-colors z-20 bg-black/50 rounded-full p-2 hover:bg-black/70"
                  aria-label="Previous image"
                >
                  <ChevronDown className="w-6 h-6 transform rotate-90" />
                </button>
              )}

              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Enlarged trek view"
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
                {trek.showcaseImages && trek.showcaseImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {trek.showcaseImages.length}
                  </div>
                )}
              </div>

              {trek.showcaseImages && trek.showcaseImages.length > 1 && (
                <button
                  onClick={() => navigateImage(1)}
                  className="absolute right-4 text-white hover:text-gray-300 transition-colors z-20 bg-black/50 rounded-full p-2 hover:bg-black/70"
                  aria-label="Next image"
                >
                  <ChevronDown className="w-6 h-6 transform -rotate-90" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Enhanced Header with new colors */}
          <div ref={headerRef} className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 transition-colors mb-3 group"
              style={{ color: colors.primary }}
            >
              <div className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform border" style={{ borderColor: colors.border }}>
                <ChevronDown className="w-3 h-3 transform rotate-90" style={{ color: colors.primary }} />
              </div>
              <span className="font-medium text-sm">Back to Treks</span>
            </button>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: colors.text }}>
                Book Your Trek Adventure
              </h1>
              {/* NEW: Fixed Departure Badge */}
              {trek.isFixedDeparture && (
                <span 
                  className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse shadow-md"
                  style={{ backgroundColor: colors.primary + '20', color: colors.primary, border: '2px solid ' + colors.primary }}
                >
                  📅 Fixed Departure
                </span>
              )}
            </div>
            <p className="text-base" style={{ color: colors.lightText }}>
              Complete your booking for <span className="font-semibold" style={{ color: colors.primary }}>{trek.name}</span>
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Side - Scrollable Content */}
            <div ref={leftContentRef} className="lg:col-span-2 space-y-6">
              
              {/* Trek Overview Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 border" style={{ borderColor: colors.border }}>
                <div className="relative h-56 sm:h-64">
                  <img
                    src={trek.thumbnail}
                    alt={trek.name}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/50"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h2 className="text-xl font-bold mb-2">{trek.name}</h2>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                        <MapPin className="w-3 h-3" />
                        {trek.location}
                      </span>
                      <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                        <Clock className="w-3 h-3" />
                        {trek.duration}
                      </span>
                      <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                        <Mountain className="w-3 h-3" />
                        {trek.difficulty}
                      </span>
                      {trek.altitude && (
                        <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                          <TrendingUp className="w-3 h-3" />
                          {trek.altitude}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Pricing Information */}
                <div className="p-4 border-b bg-gradient-to-br from-blue-50 to-orange-50" style={{ borderColor: colors.border }}>
                  <h3 className="text-base font-bold mb-3 flex items-center" style={{ color: colors.text }}>
                    <span className="mr-2">💰</span>
                    Pricing Details
                  </h3>
                  {selectedCity && trek.cityPricing?.find(cp => cp.city === selectedCity) ? (
                    <>
                      {(() => {
                        const cityPrice = trek.cityPricing.find(cp => cp.city === selectedCity);
                        if (!cityPrice || !cityPrice.pricingOptions || cityPrice.pricingOptions.length === 0) {
                          return (
                            <div className="text-center py-4 text-sm" style={{ color: colors.error }}>
                              Pricing not available for selected city
                            </div>
                          );
                        }
                        
                        const pricingOptions = cityPrice.pricingOptions || [];
                        
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {pricingOptions.map((option, index) => {
                              const isSelected = formData.selectedPricingOption === option.categoryName;
                              const colorIndex = index % 5;
                              const optionColors = [
                                colors.success,
                                colors.primary, 
                                colors.secondary,
                                '#9333EA',
                                '#DC2626'
                              ];
                              const optionColor = optionColors[colorIndex];
                              
                              return (
                                <div 
                                  key={index}
                                  className={`bg-white rounded-lg p-3 border-2 transition-all duration-300 hover:shadow-md ${
                                    isSelected ? 'ring-2' : ''
                                  }`}
                                  style={{ 
                                    borderColor: isSelected ? optionColor : colors.border,
                                    ringColor: optionColor
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🎫</span>
                                    <span className="font-semibold text-xs" style={{ color: colors.text }}>
                                      {option.categoryName}
                                    </span>
                                  </div>
                                  <p className="text-xl font-bold" style={{ color: optionColor }}>
                                    ₹{option.price.toLocaleString('en-IN')}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">Per person</p>
                                  {isSelected && (
                                    <div className="mt-2 text-xs font-semibold flex items-center gap-1" style={{ color: optionColor }}>
                                      <CheckCircle className="w-3 h-3" />
                                      Selected
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                      
                      <p className="text-xs text-gray-600 mt-3 italic">
                        💡 Select your preferred category in the booking form. Prices are per person and vary by city.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-600">Select a city to view pricing options</p>
                  )}
                </div>
                
                {/* Trek Description */}
                <div className="p-4 border-b" style={{ borderColor: colors.border }}>
                  <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>About This Trek</h3>
                  <div 
                    className="leading-relaxed text-sm rich-text-content" 
                    style={{ color: colors.text }}
                    dangerouslySetInnerHTML={{ __html: trek.description }}
                  />
                </div>

                {/* YouTube Video */}
                {youtubeVideoId && (
                  <div className="p-4 border-b" style={{ borderColor: colors.border }}>
                    <h3 className="text-lg font-bold mb-3 flex items-center" style={{ color: colors.text }}>
                      <Play className="w-4 h-4 mr-2" style={{ color: colors.secondary }} />
                      Trek Video
                    </h3>
                    <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                        title="Trek Video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Gallery Images */}
                {trek.showcaseImages && trek.showcaseImages.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-3" style={{ color: colors.text }}>Trek Gallery</h3>
                    <div ref={galleryRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {trek.showcaseImages.map((image, index) => (
                        <div 
                          key={index} 
                          className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer shadow-sm border" 
                          style={{ borderColor: colors.border }}
                          onClick={() => openImageModal(image)}
                        >
                          <img
                            src={image}
                            alt={`${trek.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hotel Images Gallery */}
              {trek.hotelImages && trek.hotelImages.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-5 transition-all duration-300 border" style={{ borderColor: colors.border }}>
                  <h3 className="text-xl font-bold mb-5 flex items-center" style={{ color: colors.text }}>
                    <Building className="w-5 h-5 mr-3" style={{ color: colors.secondary }} />
                    Hotels & Accommodation
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {trek.hotelImages.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden cursor-pointer group relative border-2 transition-all duration-300 hover:border-orange-500"
                        style={{ borderColor: colors.border }}
                        onClick={() => openImageModal(image)}
                      >
                        <img
                          src={image}
                          alt={`Hotel ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trek Highlights */}
              {trek.highlights && trek.highlights.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-4 transition-all duration-300 border" style={{ borderColor: colors.border }}>
                  <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: colors.text }}>
                    <Mountain className="w-5 h-5 mr-2" style={{ color: colors.secondary }} />
                    Trek Highlights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trek.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start group hover:transform hover:scale-105 transition-all duration-300">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5" style={{ backgroundColor: colors.accentLight }}>
                          <CheckCircle className="w-3 h-3" style={{ color: colors.secondary }} />
                        </div>
                        <span className="text-sm pt-0.5" style={{ color: colors.text }}>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addon Facilities Section */}
              {trek.addonFacilities && trek.addonFacilities.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-4 transition-all duration-300 border" style={{ borderColor: colors.border }}>
                  <h3 className="text-lg font-bold mb-4 flex items-center" style={{ color: colors.text }}>
                    <CheckCircle className="w-5 h-5 mr-2" style={{ color: '#10B981' }} />
                    Additional Facilities
                  </h3>
                  <div className="space-y-3">
                    {trek.addonFacilities.map((facility, index) => (
                      <div key={index} className="border-l-4 pl-3 py-2" style={{ borderLeftColor: '#10B981' }}>
                        <h4 className="font-bold text-sm mb-1" style={{ color: colors.text }}>
                          {facility.header}
                        </h4>
                        <ul className="space-y-1">
                          {facility.subPoints.map((point, pointIndex) => (
                            <li key={pointIndex} className="text-xs text-gray-700 flex items-start">
                              <span className="mr-2 text-xs" style={{ color: '#10B981' }}>●</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary Section */}
              {trek.itinerary && trek.itinerary.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-4 transition-all duration-300 border" style={{ borderColor: colors.border }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>Your Trek Journey</h3>
                  <div className="space-y-3">
                    {trek.itinerary.map((day, index) => (
                      <ItineraryDay key={index} day={day} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs Section */}
              {trek.faqs && trek.faqs.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-4 transition-all duration-300 border" style={{ borderColor: colors.border }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: colors.text }}>Frequently Asked Questions</h3>
                  <div className="space-y-3">
                    {trek.faqs.map((faq, index) => (
                      <div key={index} className="rounded-lg p-3 hover:shadow-md transition-all duration-300 border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                        <h4 className="font-semibold mb-2 flex items-start text-sm" style={{ color: colors.text }}>
                          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" style={{ color: colors.primary }} />
                          {faq.question}
                        </h4>
                        <p className="text-sm ml-6 leading-relaxed" style={{ color: colors.text }}>{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inclusions & Exclusions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trek.inclusions && trek.inclusions.length > 0 && (
                  <div className="rounded-lg shadow-md p-4 border transition-all duration-300" style={{ backgroundColor: colors.accentLight, borderColor: colors.secondary + '40' }}>
                    <h3 className="text-base font-bold mb-3 flex items-center" style={{ color: colors.text }}>
                      <CheckCircle className="w-4 h-4 mr-2" style={{ color: colors.secondary }} />
                      What's Included
                    </h3>
                    <ul className="space-y-2">
                      {trek.inclusions.map((item, index) => (
                        <li key={index} className="text-sm flex items-start" style={{ color: colors.text }}>
                          <span className="mr-2 text-sm" style={{ color: colors.secondary }}>✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trek.exclusions && trek.exclusions.length > 0 && (
                  <div className="rounded-lg shadow-md p-4 border transition-all duration-300" style={{ backgroundColor: '#FEF2F2', borderColor: colors.error + '40' }}>
                    <h3 className="text-base font-bold mb-3 flex items-center" style={{ color: colors.text }}>
                      <XCircle className="w-4 h-4 mr-2" style={{ color: colors.error }} />
                      What's Not Included
                    </h3>
                    <ul className="space-y-2">
                      {trek.exclusions.map((item, index) => (
                        <li key={index} className="text-sm flex items-start" style={{ color: colors.text }}>
                          <span className="mr-2 text-sm" style={{ color: colors.error }}>✗</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Important Trek Information */}
              <div className="rounded-lg shadow-lg p-4 border-l-4 transition-all duration-300" style={{ backgroundColor: colors.accentLight, borderLeftColor: colors.secondary }}>
                <h3 className="text-base font-bold mb-3 flex items-center" style={{ color: colors.text }}>
                  <AlertCircle className="w-4 h-4 mr-2" style={{ color: colors.secondary }} />
                  Important Trek Information
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: colors.text }}>
                  <li className="flex items-start">
                    <span className="mr-2 text-sm" style={{ color: colors.secondary }}>•</span>
                    <span>Basic fitness level required - prepare with regular cardio exercises</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-sm" style={{ color: colors.secondary }}>•</span>
                    <span>Carry valid ID proof and medical fitness certificate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-sm" style={{ color: colors.secondary }}>•</span>
                    <span>Weather conditions may cause itinerary changes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-sm" style={{ color: colors.secondary }}>•</span>
                    <span>Trek insurance is highly recommended</span>
                  </li>
                </ul>
              </div>

              {/* Why Choose Aarohan Holidays Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 border transition-all duration-300" style={{ borderColor: colors.border }}>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2" style={{ color: colors.primary }}>Why Choose Aarohan Holidays?</h3>
                  <div className="h-1 w-20 rounded" style={{ backgroundColor: colors.secondary }}></div>
                </div>
                <div className="space-y-4">
                  {/* Card 1 */}
                  <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primary }}>
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1" style={{ color: colors.text }}>5+ Years of Excellence</h4>
                      <p className="text-sm" style={{ color: colors.lightText }}>Trusted by 15,000+ travelers with expert-curated experiences across 250+ destinations</p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.secondary }}>
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1" style={{ color: colors.text }}>Safe & Secure Travel</h4>
                      <p className="text-sm" style={{ color: colors.lightText }}>100% secure payments, verified partners, and comprehensive travel insurance options</p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primary }}>
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1" style={{ color: colors.text }}>Expert Travel Guides</h4>
                      <p className="text-sm" style={{ color: colors.lightText }}>Professional, certified guides with local knowledge to make your journey memorable</p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.secondary }}>
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1" style={{ color: colors.text }}>Personalized Experiences</h4>
                      <p className="text-sm" style={{ color: colors.lightText }}>Customizable itineraries tailored to your preferences, budget, and travel style</p>
                    </div>
                  </div>

                  {/* Card 5 */}
                  <div className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.primary }}>
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1" style={{ color: colors.text }}>24/7 Travel Support</h4>
                      <p className="text-sm" style={{ color: colors.lightText }}>Round-the-clock assistance via phone, WhatsApp, and email for a worry-free journey</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Sticky Booking Form */}
            <div className="lg:col-span-1">
              <div ref={formContainerRef} className="bg-white rounded-lg shadow-lg p-4 sticky top-6 transition-all duration-300 border" style={{ borderColor: colors.border }}>
                <div 
                  className="text-white rounded-lg p-3 mb-4 text-center transition-all duration-300"
                  style={{ backgroundColor: colors.primary }}
                >
                  <h3 className="text-lg font-bold mb-1">Secure Your Trek Spot</h3>
                  <p className="text-xs opacity-90">Limited seats available!</p>
                </div>

                {error && (
                  <div className="error-alert px-3 py-2 rounded-lg mb-4 flex items-start gap-2" style={{ backgroundColor: '#FEF2F2', border: '1px solid ' + colors.error + '40' }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colors.error }} />
                    <p className="text-sm font-medium" style={{ color: colors.error }}>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Personal Information */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm pb-2 border-b" style={{ color: colors.text, borderColor: colors.border }}>Personal Information</h4>
                    
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm ${
                          formErrors.name ? 'bg-red-50' : 'hover:border-gray-400'
                        }`}
                        style={{ 
                          borderColor: formErrors.name ? colors.error : colors.border,
                          focusBorderColor: colors.primary,
                          focusRingColor: colors.primary
                        }}
                        placeholder="Enter your full name"
                      />
                      {formErrors.name && (
                        <p className="error-message text-xs mt-1 flex items-center gap-1" style={{ color: colors.error }}>
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm ${
                          formErrors.email ? 'bg-red-50' : 'hover:border-gray-400'
                        }`}
                        style={{ 
                          borderColor: formErrors.email ? colors.error : colors.border,
                          focusBorderColor: colors.primary,
                          focusRingColor: colors.primary
                        }}
                        placeholder="your@email.com"
                      />
                      {formErrors.email && (
                        <p className="error-message text-xs mt-1 flex items-center gap-1" style={{ color: colors.error }}>
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm ${
                          formErrors.mobile ? 'bg-red-50' : 'hover:border-gray-400'
                        }`}
                        style={{ 
                          borderColor: formErrors.mobile ? colors.error : colors.border,
                          focusBorderColor: colors.primary,
                          focusRingColor: colors.primary
                        }}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                      />
                      {formErrors.mobile && (
                        <p className="error-message text-xs mt-1 flex items-center gap-1" style={{ color: colors.error }}>
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.mobile}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Group Details */}
                  <div className="border-t pt-4" style={{ borderColor: colors.border }}>
                    <h4 className="font-bold text-sm mb-3" style={{ color: colors.text }}>Group Details</h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                          Total Members *
                        </label>
                        <input
                          type="number"
                          name="numberOfMembers"
                          value={formData.numberOfMembers}
                          readOnly
                          min="1"
                          max={trek.maxGroupSize}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm bg-gray-50 cursor-not-allowed"
                          style={{ borderColor: colors.border, backgroundColor: '#F9FAFB', color: colors.lightText }}
                          title="Auto-calculated from Adults + Women + Children + Infants"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                          Adults
                        </label>
                        <input
                          type="number"
                          name="adults"
                          value={formData.adults}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm hover:border-gray-400"
                          style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                          Women
                        </label>
                        <input
                          type="number"
                          name="women"
                          value={formData.women}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm hover:border-gray-400"
                          style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                          Children
                          <span className="text-xs font-bold ml-1" style={{ color: colors.error }}>
                            (5-18 years)
                          </span>
                        </label>
                        <input
                          type="number"
                          name="children"
                          value={formData.children}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm hover:border-gray-400"
                          style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                          Infants
                          <span className="text-xs font-bold ml-1" style={{ color: colors.error }}>
                            (Below 5 years)
                          </span>
                        </label>
                        <input
                          type="number"
                          name="infants"
                          value={formData.infants}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm hover:border-gray-400"
                          style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pickup & Date */}
                  <div className="border-t pt-4" style={{ borderColor: colors.border }}>
                    <div className="mb-3">
                      <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                        Pickup City *
                      </label>
                      <select
                        value={selectedCity}
                        onChange={handleCityChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm ${
                          formErrors.pickupCity ? 'bg-red-50' : 'hover:border-gray-400'
                        }`}
                        style={{ 
                          borderColor: formErrors.pickupCity ? colors.error : colors.border,
                          focusBorderColor: colors.primary,
                          focusRingColor: colors.primary,
                          color: colors.text,
                          backgroundColor: '#FFFFFF'
                        }}
                      >
                        <option value="" style={{ color: colors.lightText }}>Select pickup city</option>
                        {trek.cityPricing?.map((cityPrice, index) => {
                          const displayPrice = cityPrice.adultPrice || cityPrice.price || 0;
                          return (
                            <option key={index} value={cityPrice.city} style={{ color: colors.text }}>
                              {cityPrice.city} - ₹{displayPrice.toLocaleString('en-IN')}
                            </option>
                          );
                        })}
                      </select>
                      {formErrors.pickupCity && (
                        <p className="error-message text-xs mt-1 flex items-center gap-1" style={{ color: colors.error }}>
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.pickupCity}
                        </p>
                      )}
                    </div>

                    {/* Pickup Point Selection */}
                    {selectedCity && trek.cityPricing?.find(cp => cp.city === selectedCity)?.pickupPoints?.length > 0 && (
                      <div className="mb-3">
                        <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                          Select Pickup Point <span className="text-xs font-normal" style={{ color: colors.lightText }}>(optional)</span>
                        </label>
                        <select
                          name="pickupPoint"
                          value={formData.pickupPoint}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm hover:border-gray-400"
                          style={{ 
                            borderColor: colors.border,
                            focusBorderColor: colors.primary,
                            focusRingColor: colors.primary,
                            color: colors.text,
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          <option value="" style={{ color: colors.lightText }}>Choose pickup location</option>
                          {trek.cityPricing.find(cp => cp.city === selectedCity)?.pickupPoints?.map((point, index) => (
                            <option key={index} value={point} style={{ color: colors.text }}>
                              {point}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                        Trek Date *
                      </label>
                      {trek.availableDates && trek.availableDates.length > 0 ? (
                        <select
                          name="bookingDate"
                          value={formData.bookingDate}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm ${
                            formErrors.bookingDate ? 'bg-red-50' : 'hover:border-gray-400'
                          }`}
                          style={{ 
                            borderColor: formErrors.bookingDate ? colors.error : colors.border,
                            focusBorderColor: colors.primary,
                            focusRingColor: colors.primary,
                            color: colors.text,
                            backgroundColor: '#FFFFFF'
                          }}
                        >
                          <option value="" style={{ color: colors.lightText }}>Select available date</option>
                          {trek.availableDates
                            .filter(date => {
                              // Filter out past dates - only show today and future dates
                              const dateObj = new Date(date);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0); // Reset time to start of day
                              return dateObj >= today;
                            })
                            .map((date, index) => {
                              const dateObj = new Date(date);
                              const formattedDate = dateObj.toLocaleDateString('en-IN', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                              const dateString = dateObj.toISOString().split('T')[0];
                              const availability = availabilityData[dateString];
                              const remainingSeats = availability ? availability.availableSeats : '...';
                              return (
                                <option key={index} value={dateString} style={{ color: colors.text }}>
                                  {formattedDate} - {remainingSeats} seats left
                                </option>
                              );
                            })}
                        </select>
                      ) : (
                        <input
                          type="date"
                          name="bookingDate"
                          value={formData.bookingDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm ${
                            formErrors.bookingDate ? 'bg-red-50' : 'hover:border-gray-400'
                          }`}
                          style={{ 
                            borderColor: formErrors.bookingDate ? colors.error : colors.border,
                            focusBorderColor: colors.primary,
                            focusRingColor: colors.primary,
                            color: colors.text
                          }}
                        />
                      )}
                      {formErrors.bookingDate && (
                        <p className="error-message text-xs mt-1 flex items-center gap-1" style={{ color: colors.error }}>
                          <AlertCircle className="w-3 h-3" />
                          {formErrors.bookingDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Pricing Option Selection */}
                  <div className="border-t pt-3" style={{ borderColor: colors.border }}>
                    <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                      Select Pricing Category * <span className="text-xs font-normal" style={{ color: colors.lightText }}>(per person)</span>
                    </label>
                    <select
                      value={formData.selectedPricingOption}
                      onChange={handlePricingOptionChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 text-sm ${
                        formErrors.selectedPricingOption ? 'bg-red-50' : 'hover:border-gray-400'
                      }`}
                      style={{ 
                        borderColor: formErrors.selectedPricingOption ? colors.error : colors.border,
                        focusBorderColor: colors.primary,
                        focusRingColor: colors.primary,
                        color: colors.text,
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      {selectedCity && trek.cityPricing?.find(cp => cp.city === selectedCity)?.pricingOptions && (
                        <>
                          {trek.cityPricing
                            .find(cp => cp.city === selectedCity)
                            .pricingOptions.map((option, index) => (
                              <option key={index} value={option.categoryName} style={{ color: colors.text }}>
                                🎫 {option.categoryName} - ₹{option.price.toLocaleString('en-IN')}/person
                              </option>
                            ))}
                        </>
                      )}
                    </select>
                    {formErrors.selectedPricingOption && (
                      <p className="error-message text-xs mt-1 flex items-center gap-1" style={{ color: colors.error }}>
                        <AlertCircle className="w-3 h-3" />
                        {formErrors.selectedPricingOption}
                      </p>
                    )}
                  </div>

                  {/* Add-ons Selection */}
                  {trek.addOns && trek.addOns.length > 0 && (
                    <div className="border rounded-lg p-3" style={{ borderColor: colors.border, backgroundColor: colors.accentLight }}>
                      <h4 className="font-semibold mb-2 flex items-center text-sm" style={{ color: colors.text }}>
                        <CheckCircle className="w-3 h-3 mr-1" style={{ color: colors.secondary }} />
                        Optional Add-ons
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">Select additional services (price per person)</p>
                      <div className="space-y-2">
                        {trek.addOns.map((addon) => (
                          <label 
                            key={addon._id}
                            className="flex items-start p-2 bg-white rounded-lg border cursor-pointer hover:shadow-sm transition-all text-sm"
                            style={{ 
                              borderColor: formData.selectedAddOns.includes(addon._id) ? colors.secondary : colors.border 
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={formData.selectedAddOns.includes(addon._id)}
                              onChange={() => handleAddOnToggle(addon._id)}
                              className="mt-1 mr-2"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="font-semibold text-xs" style={{ color: colors.text }}>
                                  {addon.name}
                                </span>
                                <span className="font-bold text-xs" style={{ color: colors.secondary }}>
                                  +₹{addon.price.toLocaleString('en-IN')}/person
                                </span>
                              </div>
                              {addon.description && (
                                <p className="text-xs text-gray-600">{addon.description}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Requests */}
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                      Special Requests (Optional)
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:border-blue-500 transition-all duration-300 hover:border-gray-400 resize-none text-sm"
                      style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
                      placeholder="Medical conditions, dietary requirements, special gear needs..."
                    />
                  </div>

                  {/* Coupon Code */}
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
                      Coupon Code (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="couponCode"
                        value={formData.couponCode}
                        onChange={handleInputChange}
                        disabled={couponApplied}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-1 transition-all duration-300 hover:border-gray-400 text-sm uppercase disabled:bg-gray-100 disabled:cursor-not-allowed"
                        style={{ borderColor: colors.border, focusBorderColor: colors.primary, focusRingColor: colors.primary }}
                        placeholder="Enter coupon code"
                      />
                      <button
                        type="button"
                        onClick={couponApplied ? handleRemoveCoupon : handleApplyCoupon}
                        disabled={applyingCoupon}
                        className="px-4 py-2 rounded-lg font-semibold text-xs transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: couponApplied ? '#ef4444' : colors.secondary, color: 'white' }}
                      >
                        {applyingCoupon ? 'Applying...' : couponApplied ? 'Remove' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{couponError}</p>
                    )}
                    {couponApplied && couponData && (
                      <p className="text-xs mt-1" style={{ color: '#10b981' }}>
                        ✓ Coupon applied! You save {couponData.discountPercentage}%
                      </p>
                    )}
                  </div>

                  {/* Price Summary */}
                  <div 
                    className="rounded-lg p-3 border transition-all duration-300"
                    style={{ backgroundColor: colors.accentBlue, borderColor: colors.primary + '40' }}
                  >
                    <h4 className="font-bold mb-3 text-sm" style={{ color: colors.text }}>Price Summary</h4>
                    
                    {/* Show selected city */}
                    {selectedCity && (
                      <div className="mb-3 pb-2 border-b" style={{ borderColor: colors.primary + '40' }}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" style={{ color: colors.primary }} />
                          <span className="text-xs font-semibold" style={{ color: colors.text }}>
                            Pickup from: {selectedCity}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {/* Show price breakdown */}
                      {trek && selectedCity && trek.cityPricing ? (() => {
                        const cityPrice = trek.cityPricing.find(cp => cp.city === selectedCity);
                        if (!cityPrice) {
                          return (
                            <div className="text-xs p-2 rounded" style={{ color: colors.error, backgroundColor: '#FEF2F2' }}>
                              ⚠️ Please select a pickup city to see pricing
                            </div>
                          );
                        }
                        
                        const selectedOption = cityPrice.pricingOptions?.find(
                          opt => opt.categoryName === formData.selectedPricingOption
                        );
                        const categoryPrice = selectedOption?.price || 0;
                        const baseTotal = categoryPrice * formData.numberOfMembers;
                        
                        return (
                          <>
                            <div className="flex justify-between items-center text-xs p-2 rounded" style={{ backgroundColor: colors.accentLight }}>
                              <span style={{ color: colors.text }}>
                                🎫 {formData.selectedPricingOption}
                              </span>
                              <span className="font-semibold" style={{ color: colors.secondary }}>
                                ₹{categoryPrice.toLocaleString('en-IN')}/person
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span style={{ color: colors.lightText }}>
                                Total Members: {formData.numberOfMembers}
                              </span>
                              <span className="font-semibold text-sm" style={{ color: colors.text }}>
                                ₹{baseTotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                            {/* Show demographics breakdown for reference */}
                            <div className="text-xs pt-2 border-t" style={{ borderColor: colors.border, color: colors.lightText }}>
                              <div className="flex justify-between mb-1">
                                <span>Adults: {formData.adults}</span>
                                <span>Women: {formData.women}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Children: {formData.children}</span>
                                <span>Infants: {formData.infants}</span>
                              </div>
                            </div>
                            {/* Show selected add-ons */}
                            {formData.selectedAddOns.length > 0 && (
                              <div className="text-xs pt-2 border-t" style={{ borderColor: colors.border }}>
                                <div className="font-semibold mb-2" style={{ color: colors.text }}>Selected Add-ons:</div>
                                {formData.selectedAddOns.map(addonId => {
                                  const addon = trek.addOns?.find(a => a._id === addonId);
                                  if (!addon) return null;
                                  const addonTotal = addon.price * formData.numberOfMembers;
                                  return (
                                    <div key={addonId} className="flex justify-between mb-1" style={{ color: colors.lightText }}>
                                      <span>{addon.name}</span>
                                      <span style={{ color: colors.secondary }}>+₹{addonTotal.toLocaleString('en-IN')}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </>
                        );
                      })() : (
                        <div className="text-xs" style={{ color: colors.lightText }}>
                          Loading pricing information...
                        </div>
                      )}
                      
                      <div className="border-t pt-2 mt-2" style={{ borderColor: colors.primary + '40' }}>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm" style={{ color: colors.text }}>Subtotal:</span>
                          <span className="text-sm font-bold" style={{ color: colors.text }}>
                            ₹{(calculateTotalPrice() || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        {couponApplied && couponData && (
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-semibold text-xs" style={{ color: '#10b981' }}>
                              Discount ({couponData.discountPercentage}%):
                            </span>
                            <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                              -₹{(couponData.discountAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t" style={{ borderColor: colors.primary + '40' }}>
                          <span className="font-bold text-sm" style={{ color: colors.text }}>Final Amount:</span>
                          <span className="text-lg font-bold" style={{ color: colors.primary }}>
                            ₹{(calculateFinalPrice() || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting || !formData.pricePerPerson}
                    className={`w-full py-2.5 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                      submitting || !formData.pricePerPerson
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'text-white shadow-md hover:shadow-lg'
                    }`}
                    style={!submitting && formData.pricePerPerson ? { backgroundColor: colors.primary } : {}}
                    onMouseOver={(e) => {
                      if (!submitting && formData.pricePerPerson) {
                        e.target.style.backgroundColor = '#1A87A9';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!submitting && formData.pricePerPerson) {
                        e.target.style.backgroundColor = colors.primary;
                      }
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Processing Your Booking...
                      </>
                    ) : (
                      <>
                        <Mountain className="w-4 h-4" />
                        Confirm Trek Booking
                      </>
                    )}
                  </button>

                  <p className="text-xs text-center" style={{ color: colors.lightText }}>
                    🔒 Secure booking · ✅ Best price guarantee · 🏔️ Instant confirmation
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookTrek;