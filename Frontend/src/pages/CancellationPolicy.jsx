import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  FiAlertCircle, 
  FiClock, 
  FiCalendar, 
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiPhone,
  FiMail,
  FiArrowRight,
  FiShield
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CancellationPolicy = () => {
  const heroRef = useRef(null);
  const sectionsRef = useRef([]);

  const colors = {
    primary: "#E66926",
    secondary: "#1E9ABF",
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444"
  };

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);

    // Hero animation
    gsap.fromTo(
      heroRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    // Section animations
    gsap.fromTo(
      sectionsRef.current,
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8, 
        stagger: 0.15,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: sectionsRef.current[0],
          start: "top 80%"
        }
      }
    );
  }, []);

  const cancellationRules = [
    {
      icon: FiCalendar,
      title: "45+ Days Before Departure",
      refundPercentage: "100%",
      color: colors.success,
      details: "Full refund minus processing fee (₹500)",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      icon: FiCalendar,
      title: "30-44 Days Before Departure",
      refundPercentage: "75%",
      color: colors.success,
      details: "75% of total booking amount will be refunded",
      bgGradient: "from-green-50 to-teal-50"
    },
    {
      icon: FiClock,
      title: "15-29 Days Before Departure",
      refundPercentage: "50%",
      color: colors.warning,
      details: "50% of total booking amount will be refunded",
      bgGradient: "from-yellow-50 to-amber-50"
    },
    {
      icon: FiClock,
      title: "7-14 Days Before Departure",
      refundPercentage: "25%",
      color: colors.warning,
      details: "25% of total booking amount will be refunded",
      bgGradient: "from-orange-50 to-amber-50"
    },
    {
      icon: FiXCircle,
      title: "Less Than 7 Days",
      refundPercentage: "0%",
      color: colors.danger,
      details: "No refund will be processed",
      bgGradient: "from-red-50 to-rose-50"
    }
  ];

  const importantNotes = [
    {
      icon: FiShield,
      title: "Travel Insurance",
      description: "We strongly recommend purchasing comprehensive travel insurance to protect your investment against unforeseen circumstances.",
      color: colors.secondary
    },
    {
      icon: FiAlertCircle,
      title: "Force Majeure",
      description: "In case of natural disasters, political unrest, or government-imposed restrictions, special consideration will be given on a case-by-case basis.",
      color: colors.warning
    },
    {
      icon: FiDollarSign,
      title: "Refund Processing",
      description: "All approved refunds will be processed within 7-10 business days to the original payment method.",
      color: colors.success
    },
    {
      icon: FiCheckCircle,
      title: "Rescheduling Option",
      description: "You may reschedule your trip (subject to availability) with minimal charges instead of cancellation. Contact us for details.",
      color: colors.primary
    }
  ];

  const specialConditions = [
    "Peak season bookings (December-January, April-June) may have different cancellation terms",
    "Group bookings (10+ people) have customized cancellation policies",
    "Adventure trek bookings require minimum 30 days notice for cancellation",
    "Hotel bookings have separate cancellation policies as per hotel terms",
    "Flight/Train tickets follow airline/railway cancellation policies",
    "Customized tour packages have specific cancellation terms mentioned in the itinerary"
  ];

  return (
    <>
    <Navbar />

<div className="min-h-screen" style={{ backgroundColor: colors.lightBg }}>
      {/* Hero Section */}
      <div 
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ backgroundColor: colors.darkBg }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${colors.primary} 10px, ${colors.primary} 11px)`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
                 style={{ backgroundColor: colors.primary + '20' }}>
              <FiInfo size={40} style={{ color: colors.primary }} />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Cancellation & Refund Policy
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
              Transparency and flexibility in our cancellation terms
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center space-x-2 px-6 py-3 rounded-full"
                   style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <FiShield style={{ color: colors.success }} size={20} />
                <span className="text-white font-semibold">Customer Protection</span>
              </div>
              <div className="flex items-center space-x-2 px-6 py-3 rounded-full"
                   style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <FiCheckCircle style={{ color: colors.secondary }} size={20} />
                <span className="text-white font-semibold">Fair Terms</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        
        {/* Introduction */}
        <div ref={el => sectionsRef.current[0] = el} className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ backgroundColor: colors.primary + '20' }}>
              <FiAlertCircle size={24} style={{ color: colors.primary }} />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: colors.darkBg }}>
                Understanding Our Policy
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                At <span className="font-bold" style={{ color: colors.primary }}>Aarohan Holidays</span>, we understand that plans can change. 
                Our cancellation policy is designed to be fair and transparent, protecting both our customers and our business operations. 
                Please read the following terms carefully before making your booking.
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Timeline */}
        <div ref={el => sectionsRef.current[1] = el} className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.darkBg }}>
              Refund Structure Based on Cancellation Timeline
            </h2>
            <p className="text-xl text-gray-600">
              The earlier you cancel, the more you get back
            </p>
          </div>

          <div className="space-y-6">
            {cancellationRules.map((rule, index) => {
              const IconComponent = rule.icon;
              return (
                <div 
                  key={index}
                  className={`bg-gradient-to-r ${rule.bgGradient} rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105`}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-16 h-16 rounded-xl flex items-center justify-center"
                             style={{ backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                          <IconComponent size={28} style={{ color: rule.color }} />
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-bold mb-1" style={{ color: colors.darkBg }}>
                            {rule.title}
                          </h3>
                          <p className="text-gray-700">{rule.details}</p>
                        </div>
                      </div>
                      <div className="bg-white px-8 py-4 rounded-xl text-center shadow-md">
                        <div className="text-4xl font-black mb-1" style={{ color: rule.color }}>
                          {rule.refundPercentage}
                        </div>
                        <div className="text-sm font-semibold text-gray-600">Refund</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Notes */}
        <div ref={el => sectionsRef.current[2] = el} className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.darkBg }}>
              Important Considerations
            </h2>
            <p className="text-xl text-gray-600">
              Please keep these key points in mind
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {importantNotes.map((note, index) => {
              const IconComponent = note.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl shadow-lg p-8 border-2 border-transparent hover:border-opacity-100 transition-all duration-300"
                  style={{ borderColor: note.color + '40' }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: note.color + '20' }}>
                      <IconComponent size={24} style={{ color: note.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-3" style={{ color: colors.darkBg }}>
                        {note.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {note.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Conditions */}
        <div ref={el => sectionsRef.current[3] = el} className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: colors.secondary + '20' }}>
              <FiInfo size={28} style={{ color: colors.secondary }} />
            </div>
            <h2 className="text-3xl font-bold" style={{ color: colors.darkBg }}>
              Special Conditions & Exceptions
            </h2>
          </div>

          <div className="space-y-4">
            {specialConditions.map((condition, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 hover:translate-x-2"
                style={{ backgroundColor: colors.lightBg }}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                     style={{ backgroundColor: colors.secondary, color: 'white' }}>
                  {index + 1}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed flex-1">
                  {condition}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How to Cancel */}
        <div ref={el => sectionsRef.current[4] = el} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl p-8 md:p-12 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.darkBg }}>
              How to Request Cancellation?
            </h2>
            <p className="text-xl text-gray-700">
              Follow these simple steps to cancel your booking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                   style={{ backgroundColor: colors.primary }}>
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: colors.darkBg }}>
                Contact Us
              </h3>
              <p className="text-gray-700">
                Call us or send an email with your booking reference number
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                   style={{ backgroundColor: colors.secondary }}>
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: colors.darkBg }}>
                Submit Request
              </h3>
              <p className="text-gray-700">
                Fill out the cancellation form with required details
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-lg">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                   style={{ backgroundColor: colors.success }}>
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: colors.darkBg }}>
                Get Confirmation
              </h3>
              <p className="text-gray-700">
                Receive cancellation confirmation and refund timeline
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div ref={el => sectionsRef.current[5] = el} className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Need Help with Cancellation?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Our customer support team is here to assist you with any questions about cancellations or refunds
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a 
              href="tel:+919011268465"
              className="flex items-center space-x-3 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <FiPhone size={24} />
              <span>+91 90112 68465</span>
            </a>

            <a 
              href="mailto:info@aarohanholidays.com"
              className="flex items-center space-x-3 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg"
              style={{ backgroundColor: colors.secondary }}
            >
              <FiMail size={24} />
              <span>info@aarohanholidays.com</span>
            </a>
          </div>

          <div className="mt-8">
            <Link 
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 hover:translate-x-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <span>Back to Home</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 max-w-4xl mx-auto leading-relaxed">
            <strong>Disclaimer:</strong> This cancellation policy is subject to change without prior notice. 
            Aarohan Holidays reserves the right to modify these terms based on operational requirements, 
            government regulations, or extraordinary circumstances. The policy applicable at the time of booking 
            will be honored. For the most current policy, please contact our customer support team.
          </p>
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default CancellationPolicy;