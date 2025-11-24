import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiLinkedin,
  FiYoutube,
  FiArrowUp,
  FiHeart,
  FiCompass,
  FiUsers,
  FiAward
} from "react-icons/fi";
import { FaWhatsapp, FaMountain, FaRoute, FaConciergeBell } from "react-icons/fa";
import { gsap } from "gsap";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const footerRef = useRef(null);
  const sectionsRef = useRef([]);
  const scrollToTopRef = useRef(null);

  // Updated color palette using your colors
  const colors = {
    primary: "#E66926",        // Orange
    secondary: "#1E9ABF",      // Blue
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    textLight: "#FFFFFF",
    textDark: "#334155",
    border: "#E2E8F0"
  };

  // Animation on component mount
  useEffect(() => {
    const tl = gsap.timeline({
      delay: 0.5
    });

    // Main footer animation
    tl.fromTo(
      footerRef.current,
      { 
        y: 100,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out"
      }
    );

    // Section animations
    tl.fromTo(
      sectionsRef.current,
      {
        y: 50,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.7)"
      },
      "-=0.5"
    );

    // Scroll to top button animation
    tl.fromTo(
      scrollToTopRef.current,
      {
        scale: 0,
        rotation: -180
      },
      {
        scale: 1,
        rotation: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
      },
      "-=0.3"
    );

    // Continuous subtle animation for scroll to top button
    gsap.to(scrollToTopRef.current, {
      y: -5,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      // Simulate subscription
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail("");
      
      // Animation for success
      gsap.fromTo(".success-message",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Button click animation
    gsap.to(scrollToTopRef.current, {
      scale: 0.8,
      rotation: 360,
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
  };

  const quickLinks = [
    { name: "Home", path: "/", scroll: "hero" },
    { name: "Tours", path: "/", scroll: "tours" },
    { name: "Treks", path: "/", scroll: "treks" },
    { name: "Destinations", path: "/", scroll: "featured" },
    { name: "Services", path: "/", scroll: "other-services" },
    { name: "Reviews", path: "/", scroll: "testimonials" }
  ];

  const services = [
    { name: "Tour Packages", scroll: "tours" },
    { name: "Adventure Treks", scroll: "treks" },
    { name: "Travel Services", scroll: "other-services" },
    { name: "Custom Itineraries", scroll: "other-services" },
    { name: "Get in Touch", scroll: "footer" }
  ];

  const socialLinks = [
    { 
      icon: FiFacebook, 
      url: "https://facebook.com/aarohanholidays", 
      color: "#1877F2",
      label: "Facebook" 
    },
    { 
      icon: FiInstagram, 
      url: "https://www.instagram.com/aarohan_holidays?igsh=NWljeDV5b3c5a2Jk&utm_source=qr", 
      color: "#E4405F",
      label: "Instagram" 
    },
    { 
      icon: FiTwitter, 
      url: "https://twitter.com/aarohanholidays", 
      color: "#1DA1F2",
      label: "Twitter" 
    },
    { 
      icon: FaWhatsapp, 
      url: "https://wa.me/+917276644221", 
      color: "#25D366",
      label: "WhatsApp" 
    },
    { 
      icon: FiYoutube, 
      url: "https://youtube.com/", 
      color: "#FF0000",
      label: "YouTube" 
    },
    { 
      icon: FiLinkedin, 
      url: "https://linkedin.com/company/aarohanholidays", 
      color: "#0A66C2",
      label: "LinkedIn" 
    }
  ];

  const founders = [
    {
      name: "Shantanu Kulkarni",
      linkedin: "https://www.linkedin.com/in/shantanu-kulkarni1229/",
      instagram: "https://www.instagram.com/_shantanu_kulkarni_/?hl=en",
      whatsapp: "https://wa.me/918482813688",
      email: "shantanukulkarni1229@gmail.com",
      role: "Co-Founder"
    },
    {
      name: "Vaishnavi Kothawade",
      linkedin: "https://www.linkedin.com/in/vaishnavi-kothawade-030627310/",
      instagram: "https://www.instagram.com/_vaishnavi_kothawade_/?hl=en",
      whatsapp: "https://wa.me/919423709155",
      email: "vaishnavikothawade99@gmailcom",
      role: "Co-Founder"
    }
  ];

  return (
    <footer 
      ref={footerRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: colors.darkBg }}
    >
      {/* Main Footer Content */}
      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Company Info */}
          <div 
            ref={el => sectionsRef.current[0] = el}
            className="lg:col-span-1"
          >
            <div className="mb-6">
              <div className="inline-block p-3 rounded-xl" style={{ backgroundColor: 'white' }}>
                <img 
                  src="https://res.cloudinary.com/dvlsgka21/image/upload/v1763733101/logo2_pdwnoo.jpg" 
                  alt="Aarohan Holidays Logo" 
                  className="h-16 w-auto object-contain transition-all duration-300 hover:scale-105"
                  style={{ maxWidth: '220px' }}
                />
              </div>
              <p className="text-sm mt-3" style={{ color: colors.secondary }}>
                Feel Free to Fly
              </p>
            </div>
            
            <p 
              className="mb-6 leading-relaxed text-lg"
              style={{ color: colors.textLight }}
            >
              Crafting unforgettable journeys across India. Your trusted partner for authentic travel experiences that create lasting memories.
            </p>
            
            <div className="space-y-4">
              <a 
                href="tel:+919011268465"
                className="flex items-center space-x-3 group transition-all duration-300 hover:translate-x-2 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                     style={{ backgroundColor: colors.primary }}>
                  <FiPhone className="text-white" size={18} />
                </div>
                <div>
                  <span 
                    className="font-semibold block"
                    style={{ color: colors.textLight }}
                  >
                    +91 72766 44221
                  </span>
                  <span className="text-sm" style={{ color: colors.secondary }}>
                    Call us anytime
                  </span>
                </div>
              </a>

              <a 
                href="mailto:info@aarohanholidays.com"
                className="flex items-center space-x-3 group transition-all duration-300 hover:translate-x-2 p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                     style={{ backgroundColor: colors.secondary }}>
                  <FiMail className="text-white" size={18} />
                </div>
                <div>
                  <span 
                    className="font-semibold block"
                    style={{ color: colors.textLight }}
                  >
                    info@aarohanholidays.com
                  </span>
                  <span className="text-sm" style={{ color: colors.secondary }}>
                    Send us an email
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div 
            ref={el => sectionsRef.current[1] = el}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-6">
              <FiUsers size={24} style={{ color: colors.primary }} />
              <h4 
                className="text-xl font-bold"
                style={{ color: colors.textLight }}
              >
                Quick Navigation
              </h4>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => {
                    if (link.scroll) {
                      setTimeout(() => {
                        const element = document.getElementById(link.scroll);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }
                  }}
                  className="group flex items-center space-x-3 py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105 border"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: colors.border + '20'
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full transition-all duration-300"
                    style={{ backgroundColor: colors.primary }}
                  />
                  <span 
                    className="font-medium group-hover:translate-x-1 transition-transform duration-300"
                    style={{ color: colors.textLight }}
                  >
                    {link.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div 
            ref={el => sectionsRef.current[2] = el}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-6">
              <FiAward size={24} style={{ color: colors.secondary }} />
              <h4 
                className="text-xl font-bold"
                style={{ color: colors.textLight }}
              >
                Our Services
              </h4>
            </div>
            <div className="space-y-3">
              {services.map((service, index) => (
                <Link
                  key={service.name}
                  to="/"
                  onClick={() => {
                    setTimeout(() => {
                      const element = document.getElementById(service.scroll);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg group cursor-pointer transition-all duration-300 hover:translate-x-2 border"
                  style={{ 
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderColor: colors.border + '20'
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: index % 2 === 0 ? colors.primary + '20' : colors.secondary + '20' }}
                  >
                    <span style={{ color: index % 2 === 0 ? colors.primary : colors.secondary }}>
                      {index + 1}
                    </span>
                  </div>
                  <span 
                    className="font-medium transition-all duration-300"
                    style={{ color: colors.textLight }}
                  >
                    {service.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter & Social */}
          <div 
            ref={el => sectionsRef.current[3] = el}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-3 mb-6">
              <FiMail size={24} style={{ color: colors.primary }} />
              <h4 
                className="text-xl font-bold"
                style={{ color: colors.textLight }}
              >
                Stay Connected
              </h4>
            </div>
            
            <p 
              className="mb-6 leading-relaxed"
              style={{ color: colors.textLight }}
            >
              Get exclusive travel deals, destination guides, and adventure tips delivered to your inbox.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-4 mb-6">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:outline-none focus:scale-105"
                  style={{ 
                    backgroundColor: colors.textLight,
                    borderColor: colors.border,
                    color: colors.darkBg
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2"
                style={{ 
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                  color: colors.textLight
                }}
              >
                Subscribe to Updates
              </button>
            </form>

            {subscribed && (
              <div 
                className="p-4 rounded-xl text-center mb-6 border-2"
                style={{ 
                  backgroundColor: colors.secondary + '20',
                  borderColor: colors.secondary,
                  color: colors.textLight
                }}
              >
                <span className="font-semibold">✅ Thank you for subscribing!</span>
                <p className="text-sm mt-1">We'll send you the best travel content.</p>
              </div>
            )}

            {/* Social Links */}
            <div>
              <p 
                className="font-semibold mb-4"
                style={{ color: colors.textLight }}
              >
                Follow Our Journey:
              </p>
              <div className="grid grid-cols-3 gap-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center p-3 rounded-xl transition-all duration-300 transform hover:scale-105 border"
                      style={{ 
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderColor: colors.border + '20',
                        color: social.color
                      }}
                      aria-label={social.label}
                    >
                      <IconComponent size={20} />
                      <span className="text-xs mt-1" style={{ color: colors.textLight }}>
                        {social.label}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div 
        className="relative border-t py-8"
        style={{ borderColor: colors.primary + '40' }}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
            
            {/* Copyright */}
            <div className="text-center lg:text-left">
              <p 
                className="text-lg font-semibold"
                style={{ color: colors.textLight }}
              >
                © {new Date().getFullYear()} Aarohan Holidays. All Rights Reserved.
              </p>
              <p className="text-sm mt-1" style={{ color: colors.secondary }}>
                Creating memorable journeys across India
              </p>
            </div>

            {/* Developed By Section */}
            <div className="text-center">
              <div className="flex items-center space-x-2 justify-center">
                <span 
                  className="text-sm"
                  style={{ color: colors.textLight }}
                >
                  Developed with
                </span>
                <FiHeart 
                  size={16}
                  style={{ color: colors.primary }}
                  className="animate-pulse"
                />
                <span 
                  className="text-sm font-bold"
                  style={{ color: colors.textLight }}
                >
                  by Pravartak
                </span>
              </div>
              
              {/* Founders */}
              <div className="flex flex-col md:flex-row items-center md:space-x-6 space-y-4 md:space-y-0 mt-4 justify-center">
                {founders.map((founder) => (
                  <div
                    key={founder.name}
                    className="flex flex-col items-center space-y-2 px-4 py-3 rounded-lg"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <span 
                      className="font-semibold text-sm"
                      style={{ color: colors.textLight }}
                    >
                      {founder.name}
                    </span>
                    <span 
                      className="text-xs"
                      style={{ color: colors.secondary }}
                    >
                      (Founder)
                    </span>
                    <div className="flex items-center space-x-3">
                      <a
                        href={founder.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-all duration-300 hover:scale-125"
                        title="LinkedIn"
                      >
                        <FiLinkedin 
                          size={16}
                          style={{ color: colors.secondary }}
                        />
                      </a>
                      <a
                        href={founder.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-all duration-300 hover:scale-125"
                        title="Instagram"
                      >
                        <FiInstagram 
                          size={16}
                          style={{ color: '#E4405F' }}
                        />
                      </a>
                      <a
                        href={founder.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-all duration-300 hover:scale-125"
                        title="WhatsApp"
                      >
                        <FaWhatsapp 
                          size={16}
                          style={{ color: '#25D366' }}
                        />
                      </a>
                      <a
                        href={`mailto:${founder.email}`}
                        className="transition-all duration-300 hover:scale-125"
                        title="Email"
                      >
                        <FiMail 
                          size={16}
                          style={{ color: colors.primary }}
                        />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Links */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link 
                to="/privacy"
                className="transition-all duration-300 hover:underline hover:scale-105 font-medium px-3 py-1 rounded-lg"
                style={{ 
                  color: colors.textLight,
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }}
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms"
                className="transition-all duration-300 hover:underline hover:scale-105 font-medium px-3 py-1 rounded-lg"
                style={{ 
                  color: colors.textLight,
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }}
              >
                Terms of Service
              </Link>
              <Link 
                to="/cancellation-policy"
                className="transition-all duration-300 hover:underline hover:scale-105 font-medium px-3 py-1 rounded-lg"
                style={{ 
                  color: colors.textLight,
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }}
              >
                Cancellation Policy
              </Link>
              <Link 
                to="/contact"
                className="transition-all duration-300 hover:underline hover:scale-105 font-medium px-3 py-1 rounded-lg"
                style={{ 
                  color: colors.textLight,
                  backgroundColor: 'rgba(255,255,255,0.05)'
                }}
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        ref={scrollToTopRef}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl border-2 transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
        style={{
          backgroundColor: colors.primary,
          borderColor: colors.textLight,
          color: colors.textLight
        }}
        aria-label="Scroll to top"
      >
        <FiArrowUp size={24} />
      </button>
    </footer>
  );
}