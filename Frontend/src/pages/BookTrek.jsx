import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { treksAPI } from '../api/userAPI';
import axios from 'axios';
import { showError, showApiError, showSuccess } from '../utils/toast';
import { gsap } from 'gsap';
import 'quill/dist/quill.snow.css';
import {
  MapPin, Clock, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle,
  Loader, Play, X, Mountain, TrendingUp, Users, Shield, Heart, Phone, Building,
  Minus, Plus, CalendarDays, Ticket, MessageCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../api/api';
import '../components/RichTextContent.css';
import { CONTACT, SITE } from '../utils/contact';
import Seo from '../components/Seo';
import { heroImage } from '../utils/image';


const colors = {
  primary: '#1E9ABF',
  primaryDark: '#1A87A9',
  secondary: '#E66926',
  background: '#F8FAFC',
  cardBg: '#FFFFFF',
  text: '#1F2937',
  lightText: '#6B7280',
  border: '#E5E7EB',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  accentLight: '#FEF6EE',
  accentBlue: '#EFF6FF',
};

const optionColors = [colors.success, colors.primary, colors.secondary, '#9333EA', '#DC2626'];

const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`;

const toDateKey = (d) => new Date(d).toISOString().split('T')[0];

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

// Strip tags to check whether rich text actually has content
const hasText = (html) => !!html && html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim() !== '';

const getYouTubeVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const initialForm = {
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
  selectedAddOns: [],
};

// ---------- Small presentational pieces (defined outside so they never remount) ----------

const Card = ({ id, title, icon: Icon, iconColor, children, className = '' }) => (
  <section
    id={id}
    className={`bg-white rounded-xl shadow-md border p-4 sm:p-6 scroll-mt-[calc(var(--header-h)+4rem)] ${className}`}
    style={{ borderColor: colors.border }}
  >
    {title && (
      <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center" style={{ color: colors.text }}>
        {Icon && <Icon className="w-5 h-5 mr-2" style={{ color: iconColor || colors.secondary }} />}
        {title}
      </h3>
    )}
    {children}
  </section>
);

const Field = ({ label, error, hint, children }) => (
  <div>
    <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>
      {label} {hint && <span className="font-normal" style={{ color: colors.lightText }}>{hint}</span>}
    </label>
    {children}
    {error && (
      <p className="error-message text-xs mt-1 flex items-center gap-1" role="alert" style={{ color: colors.error }}>
        <AlertCircle className="w-3 h-3 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const inputClass = (hasError) =>
  `w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E9ABF]/40 focus:border-[#1E9ABF] transition ${
    hasError ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-400'
  }`;

const Stepper = ({ label, hint, value, onChange, min = 0 }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-sm font-semibold" style={{ color: colors.text }}>{label}</p>
      {hint && <p className="text-xs" style={{ color: colors.lightText }}>{hint}</p>}
    </div>
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Decrease ${label}`}
        className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
        style={{ borderColor: colors.border }}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-6 text-center font-bold text-sm" aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`Increase ${label}`}
        className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
        style={{ borderColor: colors.border }}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const MetaTile = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: colors.accentBlue }}>
    <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4" style={{ color: colors.primary }} />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide" style={{ color: colors.lightText }}>{label}</p>
      <p className="text-sm font-semibold truncate" style={{ color: colors.text }} title={value}>{value}</p>
    </div>
  </div>
);

const InfoChip = ({ icon, label, value, bg, accent }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ backgroundColor: bg, borderColor: accent + '40' }}>
    <span className="text-lg" aria-hidden="true">{icon}</span>
    <div>
      <p className="font-semibold text-xs" style={{ color: colors.text }}>{label}</p>
      <p className="text-xs" style={{ color: accent }}>{value}</p>
    </div>
  </div>
);

const ItineraryDay = ({ day, expanded, onToggle }) => {
  const activities = Array.isArray(day.activities) ? day.activities.filter((a) => a && a.trim()) : [];
  return (
    <div
      className="bg-white rounded-lg border overflow-hidden"
      style={{ borderColor: colors.border, borderLeft: `4px solid ${colors.primary}` }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="w-full p-3 sm:p-4 text-left flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex-shrink-0 px-2.5 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs whitespace-nowrap"
            style={{ backgroundColor: colors.primary }}
          >
            DAY {day.day}
          </div>
          <h4 className="font-bold text-sm sm:text-base" style={{ color: colors.text }}>{day.title}</h4>
        </div>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          style={{ color: colors.primary }}
        />
      </button>

      {/* grid-rows trick animates to natural height, so long days are never clipped */}
      <div className={`grid transition-all duration-300 ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="p-4 border-t space-y-3" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
            {hasText(day.description) && (
              <div
                className="leading-relaxed text-sm rich-text-content"
                style={{ color: colors.text }}
                dangerouslySetInnerHTML={{ __html: day.description }}
              />
            )}

            {(day.meals || day.accommodation || day.cabType) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {day.meals && <InfoChip icon="🍽️" label="Meals Included" value={day.meals} bg={colors.accentLight} accent={colors.secondary} />}
                {day.accommodation && <InfoChip icon="⛺" label="Accommodation" value={day.accommodation} bg={colors.accentBlue} accent={colors.primary} />}
                {day.cabType && <InfoChip icon="🚗" label="Cab Type" value={day.cabType} bg="#E0F2FE" accent="#0EA5E9" />}
              </div>
            )}

            {hasText(day.note) && (
              <div className="p-3 rounded-lg border-l-4" style={{ backgroundColor: '#FEF9C3', borderLeftColor: colors.warning }}>
                <p className="font-bold text-xs mb-1" style={{ color: colors.text }}>📝 Important Note</p>
                <div
                  className="text-xs leading-relaxed rich-text-content"
                  style={{ color: colors.text }}
                  dangerouslySetInnerHTML={{ __html: day.note }}
                />
              </div>
            )}

            {activities.length > 0 && (
              <div className="p-3 rounded-lg border" style={{ backgroundColor: colors.accentLight, borderColor: colors.secondary + '40' }}>
                <p className="font-bold text-xs mb-2" style={{ color: colors.text }}>🎯 Trek Activities</p>
                <ul className="space-y-1.5">
                  {activities.map((activity, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: colors.secondary }} />
                      <span className="text-xs leading-relaxed" style={{ color: colors.text }}>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookTrek = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trek, setTrek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState('');

  // Lightbox: images + index kept together so hotel and showcase images both navigate correctly
  const [lightbox, setLightbox] = useState({ images: [], index: -1 });

  const [formData, setFormData] = useState(initialForm);
  const [expandedItinerary, setExpandedItinerary] = useState({});
  const [selectedCity, setSelectedCity] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const [couponApplied, setCouponApplied] = useState(false);
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const [availabilityData, setAvailabilityData] = useState({});

  const sectionRef = useRef(null);
  const successRef = useRef(null);
  const formRef = useRef(null);

  // ---------- Data loading ----------

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;

    const fetchTrek = async () => {
      try {
        setLoading(true);
        setError('');
        setTrek(null);
        setBookingSuccess(false);
        setBookingReference('');
        setShowSuccessAnimation(false);
        setSelectedCity('');
        setFormErrors({});
        setExpandedItinerary({});
        setLightbox({ images: [], index: -1 });
        setCouponApplied(false);
        setCouponData(null);
        setCouponError('');
        setAvailabilityData({});
        setFormData(initialForm);

        const response = await treksAPI.getById(id);
        if (cancelled) return;

        if (response.data.success) {
          const trekData = response.data.data;

          if (trekData.introSection && typeof trekData.introSection === 'string') {
            try {
              trekData.introSection = JSON.parse(trekData.introSection);
            } catch {
              trekData.introSection = { header: '', content: '' };
            }
          }

          setTrek(trekData);
          // Open the first day so users immediately see that days are expandable
          if (trekData.itinerary?.length > 0) setExpandedItinerary({ 0: true });

          const firstCity = trekData.cityPricing?.[0];
          if (firstCity) {
            const firstOption = firstCity.pricingOptions?.[0];
            setSelectedCity(firstCity.city);
            setFormData((prev) => ({
              ...prev,
              pickupCity: firstCity.city,
              selectedPricingOption: firstOption?.categoryName || '',
              pricePerPerson: firstOption?.price || 0,
            }));
          }
        } else {
          setError('Failed to load trek details. Please try again.');
        }
      } catch (err) {
        if (cancelled) return;
        setError('Failed to load trek details. Please try again.');
        showApiError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTrek();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Availability only exists for legacy global dates; failure is non-fatal so stay silent
  useEffect(() => {
    if (!trek?._id) return;
    let cancelled = false;
    treksAPI
      .getAvailability(trek._id)
      .then((response) => {
        if (cancelled || !response.data.success || !Array.isArray(response.data.data)) return;
        const map = {};
        response.data.data.forEach((item) => {
          map[item.date] = { availableSeats: item.availableSeats, isAvailable: item.isAvailable };
        });
        setAvailabilityData(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [trek?._id]);

  // Total members is derived from the four counters
  useEffect(() => {
    const total = formData.adults + formData.women + formData.children + formData.infants;
    setFormData((prev) => (prev.numberOfMembers === total ? prev : { ...prev, numberOfMembers: total }));
  }, [formData.adults, formData.women, formData.children, formData.infants]);

  useEffect(() => {
    if (!sectionRef.current || !trek) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
    }, sectionRef);
    return () => ctx.revert();
  }, [trek]);

  useEffect(() => {
    if (!showSuccessAnimation || !successRef.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(successRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' });
      gsap.to('.confetti', { y: -400, rotation: 360, opacity: 0, duration: 2, stagger: 0.03, ease: 'power2.out' });
    }, successRef.current.parentElement);
    return () => ctx.revert();
  }, [showSuccessAnimation]);

  // ---------- Derived data ----------

  const cityData = useMemo(
    () => trek?.cityPricing?.find((cp) => cp.city === selectedCity),
    [trek, selectedCity]
  );
  const selectedOption = cityData?.pricingOptions?.find((o) => o.categoryName === formData.selectedPricingOption);

  const startingPrice = useMemo(() => {
    const prices = (trek?.cityPricing || [])
      .flatMap((cp) => cp.pricingOptions || [])
      .map((o) => Number(o.price))
      .filter((p) => p > 0);
    return prices.length ? Math.min(...prices) : 0;
  }, [trek]);

  // Dates for the chosen city (new format) with fallback to legacy global dates
  const dateOptions = useMemo(() => {
    if (!trek || !selectedCity) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (cityData?.departureDates?.length > 0) {
      return cityData.departureDates
        .filter((d) => new Date(d.startDate) >= today && d.isAvailable !== false)
        .map((d) => ({
          value: toDateKey(d.startDate),
          label: `${formatDate(d.startDate)}${d.endDate ? ` → ${formatDate(d.endDate)}` : ''}`,
        }));
    }
    return (trek.availableDates || [])
      .filter((d) => new Date(d) >= today)
      .map((d) => ({ value: toDateKey(d), label: formatDate(d) }));
  }, [trek, selectedCity, cityData]);

  const seatsLeft = availabilityData[formData.bookingDate]?.availableSeats;

  const calculateTotalPrice = useCallback(() => {
    if (!selectedOption) return 0;
    let total = formData.numberOfMembers * (Number(selectedOption.price) || 0);
    formData.selectedAddOns.forEach((addonId) => {
      const addon = trek.addOns?.find((a) => a._id === addonId);
      if (addon) total += (Number(addon.price) || 0) * formData.numberOfMembers;
    });
    return total;
  }, [selectedOption, formData.numberOfMembers, formData.selectedAddOns, trek]);

  const totalPrice = calculateTotalPrice();
  const finalPrice = couponApplied && couponData ? couponData.finalAmount : totalPrice;

  // A coupon is computed against a specific amount; drop it when that amount changes
  const couponBaseRef = useRef(null);
  useEffect(() => {
    if (couponBaseRef.current !== null && couponBaseRef.current !== totalPrice && couponApplied) {
      setCouponApplied(false);
      setCouponData(null);
      setCouponError('Price changed — please re-apply your coupon.');
    }
    couponBaseRef.current = totalPrice;
  }, [totalPrice, couponApplied]);

  // ---------- Handlers ----------

  const clearFieldError = (name) => setFormErrors((prev) => (prev[name] ? { ...prev, [name]: '' } : prev));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleMobileChange = (e) => {
    setFormData((prev) => ({ ...prev, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }));
    clearFieldError('mobile');
  };

  const setCount = (name) => (value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearFieldError('numberOfMembers');
  };

  // Select a city and keep a valid category (same category if it exists there, else the first)
  const selectCity = (city, preferredCategory) => {
    const cp = trek.cityPricing.find((c) => c.city === city);
    const options = cp?.pricingOptions || [];
    const keep = options.find((o) => o.categoryName === (preferredCategory ?? formData.selectedPricingOption));
    const option = keep || options[0];
    setSelectedCity(city);
    setFormData((prev) => ({
      ...prev,
      pickupCity: city,
      pickupPoint: '',
      bookingDate: '',
      selectedPricingOption: option?.categoryName || '',
      pricePerPerson: option?.price || 0,
    }));
    setFormErrors((prev) => ({ ...prev, pickupCity: '', bookingDate: '', selectedPricingOption: '' }));
  };

  const selectOption = (categoryName) => {
    const option = cityData?.pricingOptions?.find((o) => o.categoryName === categoryName);
    setFormData((prev) => ({ ...prev, selectedPricingOption: categoryName, pricePerPerson: option?.price || 0 }));
    clearFieldError('selectedPricingOption');
  };

  const handleAddOnToggle = (addonId) => {
    setFormData((prev) => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.includes(addonId)
        ? prev.selectedAddOns.filter((a) => a !== addonId)
        : [...prev.selectedAddOns, addonId],
    }));
  };

  const toggleItineraryDay = (index) => setExpandedItinerary((prev) => ({ ...prev, [index]: !prev[index] }));

  const allExpanded = trek?.itinerary?.length > 0 && trek.itinerary.every((_, i) => expandedItinerary[i]);
  const toggleAllItinerary = () => {
    const next = {};
    trek.itinerary.forEach((_, i) => {
      next[i] = !allExpanded;
    });
    setExpandedItinerary(next);
  };

  const scrollToId = (target) => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Lightbox
  const closeLightbox = useCallback(() => {
    setLightbox({ images: [], index: -1 });
    document.body.style.overflow = '';
  }, []);

  const openLightbox = (images, index) => {
    setLightbox({ images, index });
    document.body.style.overflow = 'hidden';
  };

  const stepLightbox = useCallback((dir) => {
    setLightbox((prev) => {
      if (prev.images.length === 0) return prev;
      return { ...prev, index: (prev.index + dir + prev.images.length) % prev.images.length };
    });
  }, []);

  const lightboxOpen = lightbox.index >= 0;
  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') stepLightbox(-1);
      else if (e.key === 'ArrowRight') stepLightbox(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, closeLightbox, stepLightbox]);

  // Always restore body scroll on unmount
  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  // Coupon
  const handleApplyCoupon = async () => {
    if (!formData.couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    setApplyingCoupon(true);
    setCouponError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/coupons/validate`, {
        code: formData.couponCode.trim().toUpperCase(),
        bookingType: 'trek',
        itemId: trek._id,
        orderAmount: totalPrice,
      });
      if (response.data.success) {
        setCouponData(response.data.data);
        setCouponApplied(true);
        showSuccess(`Coupon applied! You saved ₹${response.data.data.discountAmount}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      setCouponData(null);
      setCouponApplied(false);
      showError(msg);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponData(null);
    setCouponError('');
    setFormData((prev) => ({ ...prev, couponCode: '' }));
  };

  // ---------- Validation & payment ----------

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) errors.email = 'Invalid email format';
    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(formData.mobile)) errors.mobile = 'Mobile must be 10 digits';

    if (formData.numberOfMembers < 1) errors.numberOfMembers = 'At least 1 member required';
    else if (trek.maxGroupSize && formData.numberOfMembers > trek.maxGroupSize) {
      errors.numberOfMembers = `Maximum group size is ${trek.maxGroupSize}`;
    } else if (seatsLeft !== undefined && formData.numberOfMembers > seatsLeft) {
      errors.numberOfMembers = `Only ${seatsLeft} seat${seatsLeft === 1 ? '' : 's'} left on this date`;
    }

    if (!formData.pickupCity) errors.pickupCity = 'Please select pickup city';
    if (!formData.selectedPricingOption) errors.selectedPricingOption = 'Please select a pricing category';
    else if (selectedOption && formData.numberOfMembers < (selectedOption.minMembers || 1)) {
      errors.selectedPricingOption = `This category needs at least ${selectedOption.minMembers} members (you have ${formData.numberOfMembers}).`;
    }

    if (!formData.bookingDate) errors.bookingDate = 'Please choose a trek date';
    else if (new Date(formData.bookingDate) <= new Date()) errors.bookingDate = 'Trek date must be in the future';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Bring the first problem into view
      requestAnimationFrame(() =>
        document.querySelector('.error-message')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      );
      return false;
    }
    return true;
  };

  const logPaymentFailure = async (orderId, errorText, bookingData) => {
    try {
      await axios.post(`${API_BASE_URL}/payment/failure`, { orderId, error: errorText, bookingData });
    } catch {
      // logging is best-effort
    }
  };

  const initiateRazorpayPayment = async (bookingData) => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error('Failed to load Razorpay. Please check your internet connection.');

      const orderResponse = await axios.post(`${API_BASE_URL}/payment/create-order`, {
        amount: finalPrice,
        bookingData,
      });
      if (!orderResponse.data.success) throw new Error('Failed to create payment order');
      const order = orderResponse.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_xxxxxxxxxx',
        amount: order.amount,
        currency: order.currency,
        name: 'Aarohan-holidays',
        description: `Booking for ${trek.name}`,
        order_id: order.id,
        prefill: { name: formData.name, email: formData.email, contact: formData.mobile },
        theme: { color: colors.primary },
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(`${API_BASE_URL}/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingData,
            });
            if (verifyResponse.data.success) {
              setBookingSuccess(true);
              setBookingReference(verifyResponse.data.data.bookingReference);
              setShowSuccessAnimation(true);
              window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            }
          } catch (verifyErr) {
            const msg = 'Payment successful but booking verification failed. Our team will contact you shortly.';
            setError(msg);
            showError(msg);
            logPaymentFailure(order.id, verifyErr.message, bookingData);
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false);
            setError('Payment cancelled. Please try again to confirm your booking.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        setSubmitting(false);
        setError(`Payment failed: ${response.error.description}`);
        logPaymentFailure(order.id, response.error.description, bookingData);
      });
      razorpay.open();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to initiate payment. Please try again.';
      setError(msg);
      showError(msg);
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || !validateForm()) return;

    setSubmitting(true);
    setError('');

    const bookingData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile,
      bookingType: 'trek',
      trekId: id,
      numberOfMembers: formData.numberOfMembers,
      adults: formData.adults,
      women: formData.women,
      children: formData.children,
      infants: formData.infants,
      selectedCategory: formData.selectedPricingOption,
      selectedAddOns: formData.selectedAddOns,
      pickupCity: formData.pickupCity,
      pickupPoint: formData.pickupPoint,
      bookingDate: formData.bookingDate,
      pricePerPerson: formData.pricePerPerson,
      totalPrice: finalPrice,
      originalPrice: totalPrice,
      specialRequests: formData.specialRequests,
      ...(couponApplied && couponData && {
        couponCode: couponData.code,
        discountPercentage: couponData.discountPercentage,
        discountAmount: couponData.discountAmount,
      }),
    };

    await initiateRazorpayPayment(bookingData);
  };

  // ---------- Early returns ----------

  if (loading) {
    return (
      <>
        <Seo title="Loading trek" noindex />
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-3" style={{ borderColor: colors.primary }} />
            <p className="text-sm" style={{ color: colors.lightText }}>Loading your trek adventure...</p>
          </div>
        </div>
      </>
    );
  }

  if (error && !trek) {
    return (
      <>
        <Seo title="Trek not found" noindex />
        <Navbar />
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center border" style={{ borderColor: colors.border }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: colors.accentLight }}>
              <XCircle className="h-7 w-7" style={{ color: colors.secondary }} />
            </div>
            <h2 className="text-lg font-bold mb-3" style={{ color: colors.text }}>Trek Not Found</h2>
            <p className="text-sm mb-4" style={{ color: colors.lightText }}>{error}</p>
            <button
              onClick={() => navigate('/treks')}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Explore Available Treks
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!trek) return null;

  if (bookingSuccess) {
    const confetti = Array.from({ length: 50 }, (_, i) => ({
      key: i,
      left: `${(i * 37) % 100}%`,
      size: 5 + ((i * 7) % 10),
      color: [colors.primary, colors.secondary, '#10b981', '#8b5cf6'][i % 4],
    }));
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: colors.background }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {confetti.map((c) => (
            <div
              key={c.key}
              className="confetti absolute rounded-full"
              style={{ left: c.left, top: '100%', width: c.size, height: c.size, backgroundColor: c.color }}
            />
          ))}
        </div>

        <div ref={successRef} className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative z-10 border" style={{ borderColor: colors.border }}>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.accentLight }}>
              <CheckCircle className="w-10 h-10" style={{ color: colors.secondary }} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: colors.text }}>Trek Booking Confirmed! 🏔️</h1>

            <div className="text-white rounded-lg p-4 mb-4" style={{ backgroundColor: colors.primary }}>
              <p className="text-xs uppercase tracking-wide mb-1 opacity-90">Your Booking Reference</p>
              <p className="text-2xl font-bold tracking-wider font-mono break-all">{bookingReference}</p>
              <p className="text-xs mt-1 opacity-90">Save this reference for future communication</p>
            </div>

            <div className="rounded-lg p-4 mb-4 text-left border" style={{ backgroundColor: colors.accentBlue, borderColor: colors.primary + '40' }}>
              <h3 className="font-semibold mb-3 flex items-center text-base" style={{ color: colors.text }}>
                <Mountain className="w-4 h-4 mr-2" style={{ color: colors.primary }} />
                What's Next?
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: colors.text }}>
                {[
                  'Check your email for detailed trek booking confirmation',
                  "You'll receive a WhatsApp message with trek details",
                  'Our team will contact you within 24 hours',
                  'Prepare your trek gear and fitness for the adventure!',
                ].map((t) => (
                  <li key={t} className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/treks')}
                className="flex-1 py-2.5 px-4 rounded-lg font-semibold border text-sm hover:bg-gray-50"
                style={{ color: colors.text, borderColor: colors.border }}
              >
                Browse More Treks
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-2.5 px-4 rounded-lg text-white font-semibold shadow-md text-sm hover:opacity-90"
                style={{ backgroundColor: colors.primary }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Page ----------

  const youtubeVideoId = getYouTubeVideoId(trek.videoLink);
  const showcaseImages = trek.showcaseImages || [];
  const hotelImages = trek.hotelImages || [];
  const hasIntro = hasText(trek.introSection?.content);
  const pickupPoints = cityData?.pickupPoints || [];
  const whatsappHref = CONTACT.whatsappWithText(
    `Hi, I'm interested in the trek: ${trek.name}. Please share the pricing details.`
  );
  const pricingUnavailable = trek.contactForPricing || !trek.cityPricing?.some((cp) => cp.pricingOptions?.length > 0);
  const canSubmit = !submitting && !!selectedOption && formData.pricePerPerson > 0;

  const navItems = [
    { id: 'overview', label: 'Overview', show: true },
    { id: 'pricing', label: 'Pricing', show: !pricingUnavailable },
    { id: 'itinerary', label: 'Itinerary', show: trek.itinerary?.length > 0 },
    { id: 'inclusions', label: 'Inclusions', show: trek.inclusions?.length > 0 || trek.exclusions?.length > 0 },
    { id: 'gallery', label: 'Gallery', show: showcaseImages.length > 0 || hotelImages.length > 0 || !!youtubeVideoId },
    { id: 'faqs', label: 'FAQs', show: trek.faqs?.length > 0 },
  ].filter((n) => n.show);

  const WhatsAppIcon = (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );

  const renderImageGrid = (images, aspect) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {images.map((image, index) => (
        <button
          type="button"
          key={index}
          className={`${aspect} rounded-lg overflow-hidden border group focus:outline-none focus:ring-2 focus:ring-[#1E9ABF]`}
          style={{ borderColor: colors.border }}
          onClick={() => openLightbox(images, index)}
          aria-label={`Open image ${index + 1}`}
        >
          <img
            src={image}
            alt={`${trek.name} ${index + 1}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </button>
      ))}
    </div>
  );

  const seoLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
          { '@type': 'ListItem', position: 2, name: 'Treks', item: `${SITE.url}/treks` },
          { '@type': 'ListItem', position: 3, name: trek.name, item: `${SITE.url}/trek/${id}` },
        ],
      },
      {
        '@type': 'Product',
        name: trek.name,
        image: [trek.thumbnail, ...showcaseImages.slice(0, 4)].filter(Boolean),
        description: (trek.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500) || trek.name,
        brand: { '@type': 'Brand', name: SITE.name },
        ...(!pricingUnavailable && startingPrice > 0 && {
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: startingPrice,
            availability: 'https://schema.org/InStock',
            url: `${SITE.url}/trek/${id}`,
          },
        }),
      },
    ],
  };

  return (
    <>
      <Seo
        title={trek.metaTitle || trek.name}
        description={trek.metaDescription || `${trek.name}${trek.duration ? ` – ${trek.duration}` : ''}${trek.location ? ` in ${trek.location}` : ''}. ${trek.description || ''}`}
        image={trek.thumbnail}
        path={`/trek/${id}`}
        jsonLd={seoLd}
      />
      <Navbar />
      <div ref={sectionRef} className="min-h-screen pt-[calc(var(--header-h)+1.5rem)] pb-28 lg:pb-10" style={{ backgroundColor: colors.background }}>
        {/* Lightbox */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white z-20 bg-black/50 rounded-full p-2 hover:bg-black/70"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
            {lightbox.images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); stepLightbox(-1); }}
                className="absolute left-4 text-white z-20 bg-black/50 rounded-full p-2 hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <img
              src={lightbox.images[lightbox.index]}
              alt={`${trek.name} enlarged view`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {lightbox.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); stepLightbox(1); }}
                  className="absolute right-4 text-white z-20 bg-black/50 rounded-full p-2 hover:bg-black/70"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {lightbox.index + 1} / {lightbox.images.length}
                </div>
              </>
            )}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 my-4 text-sm font-medium hover:underline"
            style={{ color: colors.primary }}
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Treks
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* ===== Left: details ===== */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              {/* Hero */}
              <div id="overview" className="bg-white rounded-xl shadow-md overflow-hidden border scroll-mt-[calc(var(--header-h)+4rem)]" style={{ borderColor: colors.border }}>
                <div className="relative h-60 sm:h-80">
                  {trek.thumbnail && <img src={heroImage(trek.thumbnail)} alt={trek.name} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
                    {trek.isFixedDeparture && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold mb-2" style={{ backgroundColor: colors.secondary }}>
                        <CalendarDays className="w-3 h-3" /> Fixed Departure
                      </span>
                    )}
                    <h1 className="text-2xl sm:text-3xl font-bold">{trek.name}</h1>
                    {trek.location && (
                      <p className="flex items-center gap-1 text-sm mt-1 opacity-90">
                        <MapPin className="w-4 h-4" /> {trek.location}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {trek.duration && <MetaTile icon={Clock} label="Duration" value={trek.duration} />}
                    {trek.difficulty && <MetaTile icon={Mountain} label="Difficulty" value={trek.difficulty} />}
                    {trek.altitude && <MetaTile icon={TrendingUp} label="Altitude" value={trek.altitude} />}
                    {trek.maxGroupSize > 0 && <MetaTile icon={Users} label="Group Size" value={`Up to ${trek.maxGroupSize}`} />}
                  </div>

                  {!pricingUnavailable && startingPrice > 0 && (
                    <p className="mt-4 text-sm" style={{ color: colors.lightText }}>
                      Starting from <span className="text-xl font-bold" style={{ color: colors.primary }}>{formatINR(startingPrice)}</span> per person
                    </p>
                  )}
                </div>
              </div>

              {/* Section navigation */}
              <nav
                aria-label="Page sections"
                className="lg:sticky lg:top-[calc(var(--header-h)+0.5rem)] z-30 -mx-4 px-4 sm:mx-0 sm:px-3 py-2 bg-white/95 backdrop-blur border-y sm:border sm:rounded-xl flex gap-1 overflow-x-auto"
                style={{ borderColor: colors.border }}
              >
                {navItems.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => scrollToId(n.id)}
                    className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap hover:bg-gray-100"
                    style={{ color: colors.primary }}
                  >
                    {n.label}
                  </button>
                ))}
              </nav>

              {/* Intro + About */}
              {hasIntro && (
                <Card title={trek.introSection.header || 'Introduction'}>
                  <div className="leading-relaxed rich-text-content" style={{ color: colors.text }} dangerouslySetInnerHTML={{ __html: trek.introSection.content }} />
                </Card>
              )}

              {hasText(trek.description) && (
                <Card title="About This Trek">
                  <div className="leading-relaxed rich-text-content" style={{ color: colors.text }} dangerouslySetInnerHTML={{ __html: trek.description }} />
                </Card>
              )}

              {/* Highlights */}
              {trek.highlights?.length > 0 && (
                <Card title="Trek Highlights" icon={Mountain}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trek.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.secondary }} />
                        <span className="text-sm" style={{ color: colors.text }}>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Pricing (click to choose) */}
              {!pricingUnavailable && (
                <Card id="pricing" title="Pricing by Pickup City" icon={Ticket}>
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-3" role="tablist">
                    {trek.cityPricing.filter((cp) => cp.pricingOptions?.length > 0).map((cp) => (
                      <button
                        key={cp.city}
                        type="button"
                        role="tab"
                        aria-selected={cp.city === selectedCity}
                        onClick={() => selectCity(cp.city)}
                        className="px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap transition-colors"
                        style={
                          cp.city === selectedCity
                            ? { backgroundColor: colors.primary, color: '#fff', borderColor: colors.primary }
                            : { backgroundColor: '#fff', color: colors.text, borderColor: colors.border }
                        }
                      >
                        <MapPin className="inline w-3 h-3 mr-1 -mt-0.5" />
                        {cp.city}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(cityData?.pricingOptions || []).map((option, index) => {
                      const color = optionColors[index % optionColors.length];
                      const active = formData.selectedPricingOption === option.categoryName;
                      const minMembers = option.minMembers || 1;
                      return (
                        <button
                          key={option.categoryName}
                          type="button"
                          onClick={() => selectOption(option.categoryName)}
                          aria-pressed={active}
                          className="text-left rounded-lg p-3 border-2 bg-white transition-shadow hover:shadow-md"
                          style={{ borderColor: active ? color : colors.border, boxShadow: active ? `0 0 0 2px ${color}33` : undefined }}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm" style={{ color: colors.text }}>{option.categoryName}</span>
                            {active && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color }} />}
                          </div>
                          <p className="text-xl font-bold mt-1" style={{ color }}>
                            {formatINR(option.price)} <span className="text-xs font-normal text-gray-500">/ person</span>
                          </p>
                          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.lightText }}>
                            <Users className="w-3 h-3" /> Min {minMembers} {minMembers === 1 ? 'member' : 'members'}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToId('booking-form')}
                    className="lg:hidden mt-4 w-full py-2.5 rounded-lg text-white font-semibold text-sm"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Continue to Booking
                  </button>
                </Card>
              )}

              {/* Itinerary */}
              {trek.itinerary?.length > 0 && (
                <Card id="itinerary" title="Trek Itinerary" icon={CalendarDays} iconColor={colors.primary}>
                  <div className="flex justify-end -mt-2 mb-3">
                    <button
                      type="button"
                      onClick={toggleAllItinerary}
                      className="text-xs font-semibold hover:underline"
                      style={{ color: colors.primary }}
                    >
                      {allExpanded ? 'Collapse all' : 'Expand all'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {trek.itinerary.map((day, index) => (
                      <ItineraryDay
                        key={index}
                        day={day}
                        expanded={!!expandedItinerary[index]}
                        onToggle={() => toggleItineraryDay(index)}
                      />
                    ))}
                  </div>
                </Card>
              )}

              {/* Inclusions / Exclusions */}
              {(trek.inclusions?.length > 0 || trek.exclusions?.length > 0) && (
                <div id="inclusions" className="grid grid-cols-1 md:grid-cols-2 gap-6 scroll-mt-[calc(var(--header-h)+4rem)]">
                  {trek.inclusions?.length > 0 && (
                    <div className="rounded-xl shadow-md p-4 sm:p-6 border" style={{ backgroundColor: '#ECFDF5', borderColor: '#10B981' }}>
                      <h3 className="text-lg font-bold mb-3 flex items-center" style={{ color: colors.text }}>
                        <CheckCircle className="w-5 h-5 mr-2" style={{ color: '#10B981' }} /> Cost Inclusion
                      </h3>
                      <ul className="space-y-2">
                        {trek.inclusions.map((item, index) => (
                          <li key={index} className="text-sm flex items-start" style={{ color: colors.text }}>
                            <span className="mr-2" style={{ color: '#10B981' }}>✓</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {trek.exclusions?.length > 0 && (
                    <div className="rounded-xl shadow-md p-4 sm:p-6 border" style={{ backgroundColor: '#FEF2F2', borderColor: colors.error }}>
                      <h3 className="text-lg font-bold mb-3 flex items-center" style={{ color: colors.text }}>
                        <XCircle className="w-5 h-5 mr-2" style={{ color: colors.error }} /> Cost Exclusion
                      </h3>
                      <ul className="space-y-2">
                        {trek.exclusions.map((item, index) => (
                          <li key={index} className="text-sm flex items-start" style={{ color: colors.text }}>
                            <span className="mr-2" style={{ color: colors.error }}>✗</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Add-on facilities */}
              {trek.addonFacilities?.map((facility, index) => (
                <Card key={index} title={facility.header} icon={CheckCircle} iconColor="#10B981">
                  <ul className="space-y-2">
                    {(facility.subPoints || []).map((point, pointIndex) => (
                      <li key={pointIndex} className="text-sm flex items-start" style={{ color: colors.text }}>
                        <span className="mr-3 mt-1 flex-shrink-0 text-[8px]" style={{ color: '#10B981' }}>●</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}

              {/* Media */}
              {(showcaseImages.length > 0 || hotelImages.length > 0 || youtubeVideoId) && (
                <div id="gallery" className="space-y-6 scroll-mt-[calc(var(--header-h)+4rem)]">
                  {youtubeVideoId && (
                    <Card title="Trek Video" icon={Play}>
                      <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                        <iframe
                          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                          title={`${trek.name} video`}
                          loading="lazy"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </Card>
                  )}
                  {showcaseImages.length > 0 && (
                    <Card title="Trek Gallery">
                      {renderImageGrid(showcaseImages, "aspect-square")}
                    </Card>
                  )}
                  {hotelImages.length > 0 && (
                    <Card title="Hotels & Accommodation" icon={Building}>
                      {renderImageGrid(hotelImages, "aspect-video")}
                    </Card>
                  )}
                </div>
              )}

              {/* Good to know */}
              <div className="rounded-xl shadow-md p-4 sm:p-6 border-l-4" style={{ backgroundColor: colors.accentLight, borderLeftColor: colors.secondary }}>
                <h3 className="text-base font-bold mb-3 flex items-center" style={{ color: colors.text }}>
                  <AlertCircle className="w-4 h-4 mr-2" style={{ color: colors.secondary }} />
                  Important Trek Information
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: colors.text }}>
                  {[
                    'Basic fitness level required - prepare with regular cardio exercises',
                    'Carry valid ID proof and medical fitness certificate',
                    'Weather conditions may cause itinerary changes',
                    'Trek insurance is highly recommended',
                  ].map((t) => (
                    <li key={t} className="flex items-start">
                      <span className="mr-2" style={{ color: colors.secondary }}>•</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQs */}
              {trek.faqs?.length > 0 && (
                <Card id="faqs" title="Frequently Asked Questions">
                  <div className="space-y-3">
                    {trek.faqs.map((faq, index) => (
                      <details key={index} className="group rounded-lg border p-3" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                        <summary className="font-semibold text-sm cursor-pointer list-none flex items-start justify-between gap-2" style={{ color: colors.text }}>
                          <span className="flex items-start">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" style={{ color: colors.primary }} />
                            {faq.question}
                          </span>
                          <ChevronDown className="w-4 h-4 flex-shrink-0 mt-0.5 transition-transform group-open:rotate-180" style={{ color: colors.primary }} />
                        </summary>
                        <p className="text-sm mt-2 ml-6 leading-relaxed" style={{ color: colors.text }}>{faq.answer}</p>
                      </details>
                    ))}
                  </div>
                </Card>
              )}

              {/* Why us */}
              <Card title="Why Choose Aarohan Holidays?" icon={Heart} iconColor={colors.secondary}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: CheckCircle, title: '5+ Years of Excellence', text: 'Trusted by 15,000+ travelers across 250+ destinations', c: colors.primary },
                    { icon: Shield, title: 'Safe & Secure Travel', text: '100% secure payments and verified partners', c: colors.secondary },
                    { icon: Users, title: 'Expert Trek Guides', text: 'Certified guides with deep local knowledge', c: colors.primary },
                    { icon: Phone, title: '24/7 Support', text: 'Help via phone, WhatsApp, and email', c: colors.secondary },
                  ].map(({ icon: Icon, title, text, c }) => (
                    <div key={title} className="flex items-start gap-3 p-3 rounded-lg border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c }}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: colors.text }}>{title}</h4>
                        <p className="text-xs mt-0.5" style={{ color: colors.lightText }}>{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* ===== Right: booking ===== */}
            <aside id="booking-form" ref={formRef} className="lg:col-span-1 lg:sticky lg:top-[calc(var(--header-h)+1rem)] scroll-mt-[calc(var(--header-h)+1rem)]">
              <div className="bg-white rounded-xl shadow-lg border lg:max-h-[calc(100vh-var(--header-h)-2rem)] lg:overflow-y-auto" style={{ borderColor: colors.border }}>
                <div className="text-white p-4 text-center rounded-t-xl" style={{ backgroundColor: colors.primary }}>
                  <h2 className="text-lg font-bold">Secure Your Trek Spot</h2>
                  <p className="text-xs opacity-90">{trek.name}</p>
                </div>

                <div className="p-4">
                  {error && (
                    <div className="px-3 py-2 rounded-lg mb-4 flex items-start gap-2" role="alert" style={{ backgroundColor: '#FEF2F2', border: `1px solid ${colors.error}40` }}>
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colors.error }} />
                      <p className="text-sm font-medium" style={{ color: colors.error }}>{error}</p>
                    </div>
                  )}

                  {pricingUnavailable ? (
                    <div className="text-center space-y-4 py-6">
                      <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary + '15' }}>
                        <Phone className="w-8 h-8" style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Contact for Pricing</h3>
                        <p className="text-sm" style={{ color: colors.lightText }}>
                          This trek has customized pricing. Contact us for the best quote!
                        </p>
                      </div>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg hover:opacity-90 text-sm"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        {WhatsAppIcon} Chat on WhatsApp
                      </a>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                      {/* 1. Trip */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-sm pb-2 border-b" style={{ color: colors.text, borderColor: colors.border }}>1. Choose your trip</h3>

                        <Field label="Pickup City *" error={formErrors.pickupCity}>
                          <select value={selectedCity} onChange={(e) => selectCity(e.target.value)} className={inputClass(formErrors.pickupCity)}>
                            {trek.cityPricing.filter((cp) => cp.pricingOptions?.length > 0).map((cp) => (
                              <option key={cp.city} value={cp.city}>{cp.city}</option>
                            ))}
                          </select>
                        </Field>

                        {pickupPoints.length > 0 && (
                          <Field label="Pickup Point" hint="(optional)">
                            <select name="pickupPoint" value={formData.pickupPoint} onChange={handleInputChange} className={inputClass(false)}>
                              <option value="">Choose pickup location</option>
                              {pickupPoints.map((point) => (
                                <option key={point} value={point}>{point}</option>
                              ))}
                            </select>
                          </Field>
                        )}

                        <Field label="Trek Date *" error={formErrors.bookingDate}>
                          {dateOptions.length > 0 ? (
                            <select name="bookingDate" value={formData.bookingDate} onChange={handleInputChange} className={inputClass(formErrors.bookingDate)}>
                              <option value="">Select departure date</option>
                              {dateOptions.map((d) => (
                                <option key={d.value} value={d.value} disabled={availabilityData[d.value]?.isAvailable === false}>
                                  {d.label}{availabilityData[d.value]?.isAvailable === false ? ' — Sold out' : ''}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="px-3 py-3 border rounded-lg text-xs" style={{ borderColor: colors.border, color: colors.lightText }}>
                              No upcoming departures for {selectedCity || 'this city'}.{' '}
                              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: colors.primary }}>
                                Ask us on WhatsApp
                              </a>
                            </div>
                          )}
                          {seatsLeft !== undefined && formData.bookingDate && (
                            <p className="text-xs mt-1 font-medium" style={{ color: seatsLeft <= 5 ? colors.warning : colors.success }}>
                              {seatsLeft} seat{seatsLeft === 1 ? '' : 's'} left on this date
                            </p>
                          )}
                        </Field>

                        <Field label="Pricing Category *" hint="(per person)" error={formErrors.selectedPricingOption}>
                          <select
                            value={formData.selectedPricingOption}
                            onChange={(e) => selectOption(e.target.value)}
                            className={inputClass(formErrors.selectedPricingOption)}
                          >
                            {(cityData?.pricingOptions || []).map((option) => {
                              const min = option.minMembers || 1;
                              return (
                                <option key={option.categoryName} value={option.categoryName}>
                                  {option.categoryName} — {formatINR(option.price)}{min > 1 ? ` (min ${min})` : ''}
                                </option>
                              );
                            })}
                          </select>
                          {selectedOption?.minMembers > 1 && formData.numberOfMembers < selectedOption.minMembers && !formErrors.selectedPricingOption && (
                            <p className="text-xs mt-1" style={{ color: colors.warning }}>
                              Needs at least {selectedOption.minMembers} members — add {selectedOption.minMembers - formData.numberOfMembers} more.
                            </p>
                          )}
                        </Field>
                      </div>

                      {/* 2. Group */}
                      <div>
                        <h3 className="font-bold text-sm pb-2 border-b flex items-center justify-between" style={{ color: colors.text, borderColor: colors.border }}>
                          <span>2. Who's going?</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.accentBlue, color: colors.primary }}>
                            {formData.numberOfMembers} total
                          </span>
                        </h3>
                        <div className="divide-y" style={{ borderColor: colors.border }}>
                          <Stepper label="Adults" value={formData.adults} onChange={setCount('adults')} />
                          <Stepper label="Women" value={formData.women} onChange={setCount('women')} />
                          <Stepper label="Children" hint="5-18 years" value={formData.children} onChange={setCount('children')} />
                          <Stepper label="Infants" hint="Below 5 years" value={formData.infants} onChange={setCount('infants')} />
                        </div>
                        {formErrors.numberOfMembers && (
                          <p className="error-message text-xs mt-1 flex items-center gap-1" role="alert" style={{ color: colors.error }}>
                            <AlertCircle className="w-3 h-3" /> {formErrors.numberOfMembers}
                          </p>
                        )}
                      </div>

                      {/* 3. Contact */}
                      <div className="space-y-3">
                        <h3 className="font-bold text-sm pb-2 border-b" style={{ color: colors.text, borderColor: colors.border }}>3. Your details</h3>
                        <Field label="Full Name *" error={formErrors.name}>
                          <input type="text" name="name" autoComplete="name" value={formData.name} onChange={handleInputChange} className={inputClass(formErrors.name)} placeholder="Enter your full name" />
                        </Field>
                        <Field label="Email Address *" error={formErrors.email}>
                          <input type="email" name="email" autoComplete="email" value={formData.email} onChange={handleInputChange} className={inputClass(formErrors.email)} placeholder="your@email.com" />
                        </Field>
                        <Field label="Mobile Number *" error={formErrors.mobile}>
                          <input type="tel" inputMode="numeric" name="mobile" autoComplete="tel-national" value={formData.mobile} onChange={handleMobileChange} className={inputClass(formErrors.mobile)} placeholder="10-digit mobile number" maxLength={10} />
                        </Field>
                      </div>

                      {/* Add-ons */}
                      {trek.addOns?.length > 0 && (
                        <div className="border rounded-lg p-3" style={{ borderColor: colors.border, backgroundColor: colors.accentLight }}>
                          <h3 className="font-semibold mb-1 text-sm" style={{ color: colors.text }}>Optional Add-ons</h3>
                          <p className="text-xs text-gray-600 mb-2">Price per person</p>
                          <div className="space-y-2">
                            {trek.addOns.map((addon) => {
                              const checked = formData.selectedAddOns.includes(addon._id);
                              return (
                                <label
                                  key={addon._id}
                                  className="flex items-start p-2 bg-white rounded-lg border cursor-pointer hover:shadow-sm"
                                  style={{ borderColor: checked ? colors.secondary : colors.border }}
                                >
                                  <input type="checkbox" checked={checked} onChange={() => handleAddOnToggle(addon._id)} className="mt-1 mr-2" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-xs" style={{ color: colors.text }}>{addon.name}</span>
                                      <span className="font-bold text-xs whitespace-nowrap" style={{ color: colors.secondary }}>+{formatINR(addon.price)}</span>
                                    </div>
                                    {addon.description && <p className="text-xs text-gray-600">{addon.description}</p>}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <Field label="Special Requests" hint="(optional)">
                        <textarea
                          name="specialRequests"
                          value={formData.specialRequests}
                          onChange={handleInputChange}
                          rows={2}
                          className={`${inputClass(false)} resize-none`}
                          placeholder="Medical conditions, dietary requirements, special gear needs..."
                        />
                      </Field>

                      {/* Coupon */}
                      <div>
                        <label className="block text-xs font-semibold mb-1" style={{ color: colors.text }}>Coupon Code (optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            name="couponCode"
                            value={formData.couponCode}
                            onChange={handleInputChange}
                            disabled={couponApplied}
                            className={`${inputClass(false)} flex-1 uppercase disabled:bg-gray-100`}
                            placeholder="Enter coupon code"
                          />
                          <button
                            type="button"
                            onClick={couponApplied ? handleRemoveCoupon : handleApplyCoupon}
                            disabled={applyingCoupon || (!couponApplied && totalPrice === 0)}
                            className="px-4 py-2 rounded-lg font-semibold text-xs text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ backgroundColor: couponApplied ? '#ef4444' : colors.secondary }}
                          >
                            {applyingCoupon ? 'Applying...' : couponApplied ? 'Remove' : 'Apply'}
                          </button>
                        </div>
                        {couponError && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{couponError}</p>}
                        {couponApplied && couponData && (
                          <p className="text-xs mt-1" style={{ color: '#10b981' }}>✓ Coupon applied! You save {couponData.discountPercentage}%</p>
                        )}
                      </div>

                      {/* Price summary */}
                      <div className="rounded-lg p-3 border" style={{ backgroundColor: colors.accentBlue, borderColor: colors.primary + '40' }}>
                        <h3 className="font-bold mb-2 text-sm" style={{ color: colors.text }}>Price Summary</h3>
                        <div className="space-y-1.5 text-xs">
                          {selectedOption ? (
                            <div className="flex justify-between gap-2" style={{ color: colors.text }}>
                              <span>{selectedOption.categoryName} × {formData.numberOfMembers}</span>
                              <span className="font-semibold">{formatINR(selectedOption.price * formData.numberOfMembers)}</span>
                            </div>
                          ) : (
                            <p style={{ color: colors.lightText }}>Select a pricing category to see the total.</p>
                          )}
                          {formData.selectedAddOns.map((addonId) => {
                            const addon = trek.addOns?.find((a) => a._id === addonId);
                            if (!addon) return null;
                            return (
                              <div key={addonId} className="flex justify-between gap-2" style={{ color: colors.lightText }}>
                                <span>{addon.name} × {formData.numberOfMembers}</span>
                                <span style={{ color: colors.secondary }}>+{formatINR(addon.price * formData.numberOfMembers)}</span>
                              </div>
                            );
                          })}
                          {couponApplied && couponData && (
                            <div className="flex justify-between" style={{ color: '#10b981' }}>
                              <span className="font-semibold">Discount ({couponData.discountPercentage}%)</span>
                              <span className="font-bold">-{formatINR(couponData.discountAmount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 mt-1 border-t" style={{ borderColor: colors.primary + '40' }}>
                            <span className="font-bold text-sm" style={{ color: colors.text }}>Total</span>
                            <span className="text-lg font-bold" style={{ color: colors.primary }}>{formatINR(finalPrice)}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 text-sm transition ${
                          canSubmit ? 'text-white shadow-md hover:shadow-lg hover:brightness-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        style={canSubmit ? { backgroundColor: colors.primary } : undefined}
                      >
                        {submitting ? (
                          <><Loader className="w-4 h-4 animate-spin" /> Processing Your Booking...</>
                        ) : (
                          <><Mountain className="w-4 h-4" /> Confirm &amp; Pay {formatINR(finalPrice)}</>
                        )}
                      </button>

                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 text-sm border hover:bg-green-50"
                        style={{ color: '#128C7E', borderColor: '#25D366' }}
                      >
                        <MessageCircle className="w-4 h-4" /> Have questions? Chat on WhatsApp
                      </a>

                      <p className="text-xs text-center" style={{ color: colors.lightText }}>
                        🔒 Secure payment · ✅ Best price guarantee · 🏔️ Instant confirmation
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile booking bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t shadow-[0_-4px_12px_rgba(0,0,0,0.08)] pl-4 pr-24 py-3 flex items-center justify-between gap-3" style={{ borderColor: colors.border }}>
          {pricingUnavailable ? (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2" style={{ backgroundColor: '#25D366' }}>
              {WhatsAppIcon} Get a Quote
            </a>
          ) : (
            <>
              <div>
                <p className="text-[11px]" style={{ color: colors.lightText }}>{selectedOption ? `Total for ${formData.numberOfMembers}` : 'Starting from'}</p>
                <p className="text-lg font-bold leading-tight" style={{ color: colors.primary }}>
                  {formatINR(selectedOption ? finalPrice : startingPrice)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => scrollToId('booking-form')}
                className="px-6 py-2.5 rounded-lg text-white font-bold text-sm"
                style={{ backgroundColor: colors.secondary }}
              >
                Book Now
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BookTrek;
