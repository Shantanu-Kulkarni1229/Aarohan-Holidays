import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  FiTarget, 
  FiEye, 
  FiHeart,
  FiAward,
  FiUsers,
  FiGlobe,
  FiTrendingUp,
  FiShield,
  FiStar,
  FiMapPin,
  FiPhone,
  FiMail,
  FiLinkedin,
  FiInstagram,
  FiCheckCircle
} from 'react-icons/fi';
import { FaWhatsapp, FaMountain, FaRoute, FaPassport } from 'react-icons/fa';

const About = () => {
  const heroRef = useRef(null);
  const statsRef = useRef([]);

  const colors = {
    primary: "#E66926",
    secondary: "#1E9ABF",
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    success: "#10B981"
  };

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Simple fade-in animation for hero only (no ScrollTrigger)
    const timer = setTimeout(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
        );
      }

      // Stats counter animation without ScrollTrigger
      statsRef.current.forEach((stat) => {
        if (stat) {
          const target = parseInt(stat.getAttribute('data-target'));
          let current = 0;
          const increment = target / 50;
          const counter = setInterval(() => {
            current += increment;
            if (current >= target) {
              stat.innerText = target;
              clearInterval(counter);
            } else {
              stat.innerText = Math.ceil(current);
            }
          }, 30);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const coreValues = [
    {
      icon: FiHeart,
      title: "Passion for Travel",
      description: "We live and breathe travel, bringing authentic experiences to every journey we curate.",
      color: colors.primary
    },
    {
      icon: FiShield,
      title: "Trust & Transparency",
      description: "Building lasting relationships through honest communication and reliable service.",
      color: colors.secondary
    },
    {
      icon: FiUsers,
      title: "Customer First",
      description: "Your satisfaction and safety are at the heart of everything we do.",
      color: colors.success
    },
    {
      icon: FiAward,
      title: "Excellence",
      description: "Committed to delivering exceptional quality in every aspect of our service.",
      color: colors.primary
    },
    {
      icon: FiGlobe,
      title: "Sustainability",
      description: "Promoting responsible tourism that respects local cultures and environments.",
      color: colors.secondary
    },
    {
      icon: FiTrendingUp,
      title: "Innovation",
      description: "Continuously evolving to bring you the best travel experiences and technologies.",
      color: colors.success
    }
  ];

  const achievements = [
    {
      icon: FiUsers,
      number: 5000,
      suffix: "+",
      label: "Happy Travelers"
    },
    {
      icon: FaRoute,
      number: 150,
      suffix: "+",
      label: "Tour Packages"
    },
    {
      icon: FiMapPin,
      number: 50,
      suffix: "+",
      label: "Destinations"
    },
    {
      icon: FiAward,
      number: 15,
      suffix: "+",
      label: "Years Experience"
    }
  ];

  const services = [
    {
      icon: FaMountain,
      title: "Adventure Tours",
      description: "Thrilling treks and expeditions across India's most stunning landscapes"
    },
    {
      icon: FaPassport,
      title: "Travel Services",
      description: "Complete travel solutions including visa, hotel bookings, and transport"
    },
    {
      icon: FaRoute,
      title: "Custom Itineraries",
      description: "Personalized travel plans tailored to your preferences and budget"
    },
    {
      icon: FiGlobe,
      title: "Group Tours",
      description: "Specially curated packages for families, friends, and corporate groups"
    }
  ];

  const whyChooseUs = [
    "Expert local guides with in-depth destination knowledge",
    "24/7 customer support throughout your journey",
    "Competitive pricing with transparent no-hidden-cost policy",
    "Customizable packages to suit every budget and preference",
    "Strong network with hotels, transport, and local partners",
    "Comprehensive travel insurance options available",
    "Easy booking process with flexible payment options",
    "Sustainable and responsible tourism practices"
  ];

  return (
   <div className="min-h-screen" style={{ backgroundColor: colors.lightBg }}>
      <Navbar />
       {/* Hero Section */}
      <div 
        ref={heroRef}
        className="relative overflow-hidden"
        style={{ backgroundColor: colors.darkBg }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.primary} 1px, transparent 0)`
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8 animate-pulse"
                 style={{ backgroundColor: colors.primary + '20' }}>
              <FiGlobe size={48} style={{ color: colors.primary }} />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              About <span style={{ color: colors.primary }}>Aarohan Holidays</span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-bold mb-4" style={{ color: colors.secondary }}>
              Feel Free to Fly
            </p>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your trusted partner in creating unforgettable travel experiences across India and beyond
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 md:p-12 lg:p-16">
              <div className="inline-block px-4 py-2 rounded-full mb-6"
                   style={{ backgroundColor: colors.primary + '20', color: colors.primary }}>
                <span className="font-bold">Our Story</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: colors.darkBg }}>
                Crafting Dreams Into Journeys
              </h2>
              
              <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                <p>
                  Founded with a vision to make travel accessible, memorable, and hassle-free, 
                  <span className="font-bold" style={{ color: colors.primary }}> Aarohan Holidays</span> has been 
                  at the forefront of the travel industry, connecting thousands of travelers with their dream destinations.
                </p>
                
                <p>
                  We believe that travel is not just about visiting new places—it's about creating memories, 
                  discovering cultures, and experiencing the world in its full glory. Our team of passionate travel 
                  enthusiasts works tirelessly to ensure every journey is seamless and extraordinary.
                </p>
                
                <p>
                  From the snow-capped peaks of the Himalayas to the serene beaches of Goa, from spiritual 
                  journeys to adventure expeditions, we curate experiences that resonate with every kind of traveler.
                </p>
              </div>
            </div>

            <div className="relative min-h-[400px] md:min-h-full" style={{ backgroundColor: colors.secondary }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-8">
                  <FiGlobe size={120} className="mx-auto mb-6 opacity-80" />
                  <h3 className="text-3xl font-bold mb-4">15+ Years</h3>
                  <p className="text-xl">Of Excellence in Travel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {achievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-xl p-8 text-center transform transition-all duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center"
                     style={{ backgroundColor: colors.primary + '20' }}>
                  <IconComponent size={32} style={{ color: colors.primary }} />
                </div>
                <div className="text-4xl md:text-5xl font-black mb-2" style={{ color: colors.darkBg }}>
                  <span ref={el => statsRef.current[index] = el} data-target={achievement.number}>
                    0
                  </span>
                  {achievement.suffix}
                </div>
                <div className="text-gray-600 font-semibold">{achievement.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vision & Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-blue-50 rounded-3xl shadow-xl p-8 md:p-12">
            <div className="w-16 h-16 rounded-xl mb-6 flex items-center justify-center"
                 style={{ backgroundColor: colors.secondary }}>
              <FiEye size={32} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: colors.darkBg }}>
              Our Vision
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              To be India's most trusted and innovative travel company, inspiring people to explore the world 
              with confidence and joy.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We envision a future where every traveler experiences seamless, sustainable, and transformative 
              journeys that broaden horizons and create lasting memories.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-orange-50 rounded-3xl shadow-xl p-8 md:p-12">
            <div className="w-16 h-16 rounded-xl mb-6 flex items-center justify-center"
                 style={{ backgroundColor: colors.primary }}>
              <FiTarget size={32} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: colors.darkBg }}>
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              To deliver exceptional travel experiences through personalized service, expert guidance, and 
              unwavering commitment to customer satisfaction.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We strive to make travel accessible, affordable, and memorable for everyone while promoting 
              responsible tourism and supporting local communities.
            </p>
          </div>
        </div>
      </div>

      {/* Core Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.darkBg }}>
            Our Core Values
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The principles that guide every decision we make and every journey we create
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreValues.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
                     style={{ backgroundColor: value.color + '20' }}>
                  <IconComponent size={28} style={{ color: value.color }} />
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: colors.darkBg }}>
                  {value.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Founder Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl shadow-2xl overflow-hidden" style={{ backgroundColor: colors.darkBg }}>
          <div className="grid md:grid-cols-2 gap-0">
            {/* Photo/Visual Side */}
            <div className="relative min-h-[400px] md:min-h-full p-12 flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
              <div className="text-center">
                <div className="w-48 h-48 rounded-full mx-auto mb-8 flex items-center justify-center border-8 border-white/30"
                     style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <FiUsers size={80} className="text-white" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-center space-x-4">
                    <a 
                      href="https://linkedin.com/in/kiranjadhav" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <FiLinkedin size={24} className="text-white" />
                    </a>
                    <a 
                      href="https://wa.me/919011268465" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <FaWhatsapp size={24} className="text-white" />
                    </a>
                    <a 
                      href="mailto:kiran@aarohanholidays.com"
                      className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-all"
                    >
                      <FiMail size={24} className="text-white" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="p-8 md:p-12 lg:p-16 text-white">
              <div className="inline-block px-4 py-2 rounded-full mb-6"
                   style={{ backgroundColor: colors.primary }}>
                <span className="font-bold">Leadership</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Kiran Jadhav
              </h2>
              
              <p className="text-2xl mb-8" style={{ color: colors.secondary }}>
                Founder & Managing Director
              </p>

              <div className="space-y-4 text-lg text-gray-300 leading-relaxed">
                <p>
                  With over <span className="font-bold text-white">15 years of experience</span> in the travel and tourism industry, 
                  Kiran Jadhav founded Aarohan Holidays with a simple yet powerful vision: to make exceptional travel 
                  experiences accessible to everyone.
                </p>
                
                <p>
                  His deep passion for travel, combined with an entrepreneurial spirit and unwavering commitment to 
                  customer satisfaction, has transformed Aarohan Holidays into one of the most trusted names in 
                  the industry.
                </p>
                
                <p>
                  Under his leadership, the company has successfully organized thousands of tours, built strong 
                  relationships with clients and partners, and continuously innovated to meet the evolving needs 
                  of modern travelers.
                </p>

                <p className="text-white font-semibold italic pt-4 border-t border-white/20">
                  "Travel is not just a business for us—it's our passion. Every journey we curate is a testament 
                  to our commitment to excellence and our love for exploration."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.darkBg }}>
            What We Offer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive travel solutions tailored to your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 flex items-start space-x-6 transform transition-all duration-300 hover:scale-105"
              >
                <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: index % 2 === 0 ? colors.primary + '20' : colors.secondary + '20' }}>
                  <IconComponent size={32} style={{ color: index % 2 === 0 ? colors.primary : colors.secondary }} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3" style={{ color: colors.darkBg }}>
                    {service.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-blue-50 rounded-3xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.darkBg }}>
              Why Choose Aarohan Holidays?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the difference that sets us apart
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {whyChooseUs.map((reason, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 bg-white rounded-xl p-6 shadow-md transform transition-all duration-300 hover:translate-x-2"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: colors.success }}>
                  <FiCheckCircle size={20} className="text-white" />
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl shadow-2xl p-8 md:p-16 text-center text-white" style={{ backgroundColor: colors.secondary }}>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Let us help you create memories that will last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/"
              className="px-10 py-4 bg-white rounded-xl font-bold text-lg transform transition-all duration-300 hover:scale-105 shadow-lg"
              style={{ color: colors.primary }}
            >
              Explore Our Packages
            </Link>
            <a 
              href="tel:+919011268465"
              className="px-10 py-4 bg-transparent border-2 border-white rounded-xl font-bold text-lg text-white transform transition-all duration-300 hover:scale-105 hover:bg-white/10"
            >
              Contact Us Today
            </a>
          </div>
        </div>
      </div>

      <Footer />
   </div>
  );
};

export default About;