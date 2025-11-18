import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock, 
  FiSend, 
  FiUser, 
  FiMessageSquare,
  FiArrowLeft,
  FiCheckCircle
} from 'react-icons/fi';
import { FaWhatsapp, FaLinkedin, FaInstagram, FaFacebook } from 'react-icons/fa';
import { gsap } from 'gsap';
import axios from 'axios';
import { showSuccess, showApiError } from '../utils/toast';
import Footer from '../components/Footer';
import { API_BASE_URL } from '../api/api';

export default function ContactSupport() {
  const headerRef = useRef(null);
  const formRef = useRef(null);
  const cardsRef = useRef([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const colors = {
    primary: "#E66926",
    secondary: "#1E9ABF",
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    textLight: "#FFFFFF",
    textDark: "#334155"
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    gsap.fromTo(
      formRef.current,
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, delay: 0.3, ease: "power2.out" }
    );

    cardsRef.current.forEach((card, index) => {
      if (card) {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.4 + index * 0.1, ease: "back.out(1.7)" }
        );
      }
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Replace with your actual API endpoint
      await axios.post(`${API_BASE_URL}/contact`, formData);
      
      setSubmitted(true);
      showSuccess('Your message has been sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Failed to send message. Please try again or contact us directly via email.');
      showApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: FiPhone,
      title: "Call Us",
      info: "+91 90112 68465",
      link: "tel:+919011268465",
      description: "Available 24/7 for urgent queries",
      color: colors.primary
    },
    {
      icon: FiMail,
      title: "Email Support",
      info: "info@aarohanholidays.com",
      link: "mailto:info@aarohanholidays.com",
      description: "Get response within 24 hours",
      color: colors.secondary
    },
    {
      icon: FaWhatsapp,
      title: "WhatsApp",
      info: "+91 90112 68465",
      link: "https://wa.me/919011268465",
      description: "Quick responses on WhatsApp",
      color: "#25D366"
    },
    {
      icon: FiMapPin,
      title: "Office Location",
      info: "Pune, Maharashtra, India",
      link: "https://maps.google.com",
      description: "Visit us for in-person consultation",
      color: "#DC2626"
    }
  ];

  const socialLinks = [
    { icon: FaFacebook, url: "https://facebook.com/aarohanholidays", color: "#1877F2", label: "Facebook" },
    { icon: FaInstagram, url: "https://instagram.com/aarohanholidays", color: "#E4405F", label: "Instagram" },
    { icon: FaLinkedin, url: "https://linkedin.com/company/aarohanholidays", color: "#0A66C2", label: "LinkedIn" },
    { icon: FaWhatsapp, url: "https://wa.me/919011268465", color: "#25D366", label: "WhatsApp" }
  ];

  const officeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 8:00 PM" },
    { day: "Saturday", hours: "10:00 AM - 6:00 PM" },
    { day: "Sunday", hours: "11:00 AM - 5:00 PM" }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.lightBg }}>
      {/* Hero Header */}
      <div 
        ref={headerRef}
        className="relative py-20 overflow-hidden"
        style={{ backgroundColor: colors.darkBg }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary} 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 mb-8 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: colors.textLight }}
          >
            <FiArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center justify-center space-x-4 mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <FiMessageSquare size={32} className="text-white" />
            </div>
            <h1
              className="text-5xl md:text-6xl font-black"
              style={{ color: colors.textLight }}
            >
              Contact Support
            </h1>
          </div>
          
          <p
            className="text-center text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: colors.secondary }}
          >
            Have questions? We're here to help! Reach out to our friendly support team.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div ref={formRef}>
            <div className="bg-white p-8 rounded-2xl shadow-lg border" style={{ borderColor: colors.lightBg }}>
              <h2 className="text-3xl font-bold mb-6" style={{ color: colors.darkBg }}>
                Send Us a Message
              </h2>

              {submitted && (
                <div
                  className="mb-6 p-4 rounded-xl flex items-center space-x-3"
                  style={{ backgroundColor: '#10B981' + '20', color: '#10B981' }}
                >
                  <FiCheckCircle size={24} />
                  <p className="font-semibold">Thank you! We'll get back to you within 24 hours.</p>
                </div>
              )}

              {error && (
                <div
                  className="mb-6 p-4 rounded-xl"
                  style={{ backgroundColor: '#EF4444' + '20', color: '#EF4444' }}
                >
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.textDark }}>
                    Your Name *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-4 top-4" size={20} style={{ color: colors.secondary }} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-primary transition-all"
                      style={{ borderColor: colors.lightBg }}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.textDark }}>
                    Email Address *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-4 top-4" size={20} style={{ color: colors.secondary }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-primary transition-all"
                      style={{ borderColor: colors.lightBg }}
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.textDark }}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-4" size={20} style={{ color: colors.secondary }} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 focus:outline-none focus:border-primary transition-all"
                      style={{ borderColor: colors.lightBg }}
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.textDark }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-primary transition-all"
                    style={{ borderColor: colors.lightBg }}
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.textDark }}>
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none focus:border-primary transition-all resize-none"
                    style={{ borderColor: colors.lightBg }}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: colors.primary, color: 'white' }}
                >
                  {submitting ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <FiSend size={20} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Contact Methods */}
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon;
              return (
                <div
                  key={index}
                  ref={el => cardsRef.current[index] = el}
                  className="bg-white p-6 rounded-2xl shadow-lg border hover:scale-105 transition-all duration-300"
                  style={{ borderColor: colors.lightBg }}
                >
                  <a href={method.link} target="_blank" rel="noopener noreferrer" className="flex items-start space-x-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: method.color + '20' }}
                    >
                      <IconComponent size={24} style={{ color: method.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1" style={{ color: colors.darkBg }}>
                        {method.title}
                      </h3>
                      <p className="text-lg font-semibold mb-1" style={{ color: method.color }}>
                        {method.info}
                      </p>
                      <p className="text-sm" style={{ color: colors.textDark + '80' }}>
                        {method.description}
                      </p>
                    </div>
                  </a>
                </div>
              );
            })}

            {/* Office Hours */}
            <div
              ref={el => cardsRef.current[4] = el}
              className="bg-white p-6 rounded-2xl shadow-lg border"
              style={{ borderColor: colors.lightBg }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: colors.secondary + '20' }}
                >
                  <FiClock size={24} style={{ color: colors.secondary }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: colors.darkBg }}>
                  Office Hours
                </h3>
              </div>
              <div className="space-y-2">
                {officeHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between py-2 border-b last:border-b-0" style={{ borderColor: colors.lightBg }}>
                    <span className="font-semibold" style={{ color: colors.textDark }}>
                      {schedule.day}
                    </span>
                    <span style={{ color: colors.secondary }}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div
              ref={el => cardsRef.current[5] = el}
              className="bg-white p-6 rounded-2xl shadow-lg border"
              style={{ borderColor: colors.lightBg }}
            >
              <h3 className="text-xl font-bold mb-4" style={{ color: colors.darkBg }}>
                Follow Us on Social Media
              </h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: social.color + '20', color: social.color }}
                      title={social.label}
                    >
                      <IconComponent size={24} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
