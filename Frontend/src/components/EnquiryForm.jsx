import { useState, useEffect, useRef } from 'react';
import { FiX, FiSend, FiCheckCircle, FiAlertCircle, FiUser, FiMail, FiPhone, FiMapPin, FiUsers, FiCalendar, FiDollarSign, FiMessageSquare } from 'react-icons/fi';
import { gsap } from 'gsap';
import axios from 'axios';
import { showSuccess, showApiError } from '../utils/toast';
import { API_BASE_URL } from '../api/api';

export default function EnquiryForm({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Tour Package',
    destination: '',
    numberOfPeople: '',
    startDate: '',
    endDate: '',
    budget: 'Flexible',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  const [referenceNumber, setReferenceNumber] = useState('');

  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const formRef = useRef(null);

  const colors = {
    primary: "#1a365d",
    secondary: "#d4af37",
    accent: "#2d3748",
    success: "#16a34a",
    error: "#dc2626"
  };

  // Animation on open/close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Check for pre-selected service type from sessionStorage
      const selectedServiceType = sessionStorage.getItem('selectedServiceType');
      if (selectedServiceType) {
        setFormData(prev => ({
          ...prev,
          serviceType: selectedServiceType
        }));
        // Clear it after reading
        sessionStorage.removeItem('selectedServiceType');
      }
      
      if (overlayRef.current) {
        gsap.fromTo(overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3 }
        );
      }

      if (modalRef.current) {
        gsap.fromTo(modalRef.current,
          { scale: 0.95, opacity: 0, y: -30 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Prepare data for other-services endpoint (same as OtherServices component)
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        serviceType: formData.serviceType,
        specialRequests: formData.message.trim(),
        additionalDetails: formData.message.trim()
      };

      // Add optional fields only if they have values
      if (formData.destination && formData.destination.trim()) {
        submitData.destination = formData.destination.trim();
      }

      if (formData.numberOfPeople && formData.numberOfPeople !== '') {
        submitData.numberOfMembers = parseInt(formData.numberOfPeople);
        submitData.adults = parseInt(formData.numberOfPeople);
      }

      if (formData.startDate) {
        submitData.travelStartDate = formData.startDate;
      }

      if (formData.endDate) {
        submitData.travelEndDate = formData.endDate;
      }

      // Submit to other-services endpoint (unified with OtherServices component)
      const response = await axios.post(`${API_BASE_URL}/other-services/enquiry`, submitData);

      if (response.data.success) {
        setSubmitStatus('success');
        setReferenceNumber(response.data.enquiryReference);
        showSuccess(`Enquiry submitted successfully! Reference: ${response.data.enquiryReference}`);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          serviceType: 'Tour Package',
          destination: '',
          numberOfPeople: '',
          startDate: '',
          endDate: '',
          budget: 'Flexible',
          message: ''
        });

        // Success animation
        gsap.to(formRef.current, {
          scale: 0.95,
          duration: 0.2,
          yoyo: true,
          repeat: 1
        });

        // Auto close after 5 seconds
        setTimeout(() => {
          handleClose();
        }, 5000);
      }
    } catch (error) {
      setSubmitStatus('error');
      showApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close
  const handleClose = () => {
    gsap.to(modalRef.current, {
      scale: 0.95,
      opacity: 0,
      y: -30,
      duration: 0.3,
      onComplete: () => {
        setSubmitStatus(null);
        setErrors({});
        onClose();
      }
    });

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        style={{ display: 'block' }} // Force display
      />

      {/* Modal Container */}
      <div 
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto pointer-events-none" 
        style={{ paddingTop: '80px', display: 'flex' }} // Force display
      >
        {/* Modal */}
        <div
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6 mx-4 overflow-hidden pointer-events-auto"
          style={{ border: `3px solid ${colors.secondary}` }}
        >
        {/* Header */}
        <div
          className="relative px-6 py-5 text-white"
          style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)` }}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <FiX size={28} />
          </button>
          
          <h2 className="text-2xl font-black mb-1">Send Enquiry</h2>
          <p className="text-sm opacity-90">Fill in your details and we'll get back to you within 24 hours</p>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {submitStatus === 'success' ? (
            // Success Message
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                <FiCheckCircle size={48} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: colors.success }}>
                Enquiry Submitted Successfully! 🎉
              </h3>
              <p className="text-gray-600 mb-4">
                Thank you for choosing Aarohan Holidays. We have received your enquiry and sent a confirmation email to <strong>{formData.email}</strong>.
              </p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Your Reference Number:</p>
                <p className="text-2xl font-black" style={{ color: colors.primary }}>
                  {referenceNumber}
                </p>
                <p className="text-xs text-gray-500 mt-2">Please save this for future reference</p>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Our team will contact you shortly. This window will close automatically in 5 seconds.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-full font-bold text-white transition-all hover:scale-105"
                style={{ backgroundColor: colors.primary }}
              >
                Close
              </button>
            </div>
          ) : submitStatus === 'error' ? (
            // Error Message
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
                <FiAlertCircle size={48} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: colors.error }}>
                Oops! Something went wrong
              </h3>
              <p className="text-gray-600 mb-6">
                We couldn't submit your enquiry. Please try again or contact us directly.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setSubmitStatus(null)}
                  className="px-6 py-2 rounded-full font-bold text-white transition-all hover:scale-105"
                  style={{ backgroundColor: colors.primary }}
                >
                  Try Again
                </button>
                <a
                  href="tel:+918482813688"
                  className="px-6 py-2 rounded-full font-bold border-2 transition-all hover:scale-105"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  Call Us
                </a>
              </div>
            </div>
          ) : (
            // Form
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              {/* Name, Email, Phone */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                    <FiUser className="inline mr-1" /> Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                      errors.name ? 'border-red-500' : 'border-gray-300 focus:border-yellow-500'
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                    <FiMail className="inline mr-1" /> Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300 focus:border-yellow-500'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                    <FiPhone className="inline mr-1" /> Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-300 focus:border-yellow-500'
                    }`}
                    placeholder="9876543210"
                    maxLength="10"
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Service Type & Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                    Service Type *
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 outline-none focus:border-yellow-500 transition-all"
                  >
                    <option value="Tour Package">Tour Package</option>
                    <option value="Trek Package">Trek Package</option>
                    <option value="Taxi Booking Services">Taxi Booking Services</option>
                    <option value="Hotel Bookings and Accommodation">Hotel Bookings and Accommodation</option>
                    <option value="Visa and Passport Assistance">Visa and Passport Assistance</option>
                    <option value="Season-Wise Segregated Tours">Season-Wise Segregated Tours</option>
                    <option value="Cruise Holidays">Cruise Holidays</option>
                    <option value="Bus, Train, and Flight Booking">Bus, Train, and Flight Booking</option>
                    <option value="Parcel and Courier Services">Parcel and Courier Services</option>
                    <option value="Customized Tours">Customized Tours</option>
                    <option value="Tour Packages">Tour Packages</option>
                    <option value="Treks and Adventure Packages">Treks and Adventure Packages</option>
                    <option value="Tours and Travel Services">Tours and Travel Services</option>
                    <option value="Online Taxi Booking - Local & Outstation">Online Taxi Booking - Local & Outstation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                    <FiMapPin className="inline mr-1" /> Destination
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 outline-none focus:border-yellow-500 transition-all"
                    placeholder="e.g., Manali, Leh, Goa"
                  />
                </div>
              </div>

              {/* Number of People & Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                    <FiUsers className="inline mr-1" /> Number of People
                  </label>
                  <input
                    type="number"
                    name="numberOfPeople"
                    value={formData.numberOfPeople}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 outline-none focus:border-yellow-500 transition-all"
                    placeholder="e.g., 2"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                    <FiDollarSign className="inline mr-1" /> Budget
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 outline-none focus:border-yellow-500 transition-all"
                  >
                    <option value="Under 10k">Under ₹10,000</option>
                    <option value="10k-25k">₹10,000 - ₹25,000</option>
                    <option value="25k-50k">₹25,000 - ₹50,000</option>
                    <option value="50k-1L">₹50,000 - ₹1,00,000</option>
                    <option value="Above 1L">Above ₹1,00,000</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                    <FiCalendar className="inline mr-1" /> Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 outline-none focus:border-yellow-500 transition-all"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                    <FiCalendar className="inline mr-1" /> End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 outline-none focus:border-yellow-500 transition-all"
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: colors.accent }}>
                  <FiMessageSquare className="inline mr-1" /> Your Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border-2 outline-none transition-all resize-none ${
                    errors.message ? 'border-red-500' : 'border-gray-300 focus:border-yellow-500'
                  }`}
                  rows="4"
                  placeholder="Tell us about your requirements, preferences, or any specific questions..."
                />
                {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
                <p className="text-xs text-gray-500 mt-1">{formData.message.length}/1000 characters</p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 rounded-full font-bold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FiSend />
                      <span>Submit Enquiry</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 rounded-full font-bold border-2 transition-all hover:scale-105"
                  style={{ borderColor: colors.accent, color: colors.accent }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
