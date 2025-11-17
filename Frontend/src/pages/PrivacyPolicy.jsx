import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiLock, FiEye, FiDatabase, FiAlertCircle, FiMail, FiArrowLeft } from 'react-icons/fi';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function PrivacyPolicy() {
  const headerRef = useRef(null);
  const sectionsRef = useRef([]);

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

    // Header animation
    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    // Section animations
    sectionsRef.current.forEach((section) => {
      gsap.fromTo(
        section,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, []);

  const sections = [
    {
      icon: FiDatabase,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          items: [
            "Name, email address, phone number, and postal address",
            "Date of birth and gender for travel bookings",
            "Payment information (processed securely through our payment partners)",
            "Passport details for international travel arrangements",
            "Emergency contact information for safety purposes"
          ]
        },
        {
          subtitle: "Travel Preferences",
          items: [
            "Accommodation preferences and special requirements",
            "Dietary restrictions and medical conditions (if relevant)",
            "Travel history and feedback on our services",
            "Photos and testimonials you choose to share"
          ]
        },
        {
          subtitle: "Technical Information",
          items: [
            "IP address, browser type, and device information",
            "Cookies and similar tracking technologies",
            "Website usage patterns and navigation history"
          ]
        }
      ]
    },
    {
      icon: FiEye,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          items: [
            "Processing and confirming your travel bookings",
            "Communicating important trip updates and itinerary changes",
            "Providing customer support and responding to inquiries",
            "Arranging accommodation, transportation, and activities"
          ]
        },
        {
          subtitle: "Improvement & Marketing",
          items: [
            "Personalizing your travel experience based on preferences",
            "Sending promotional offers and travel inspiration (with consent)",
            "Analyzing trends to improve our services",
            "Conducting customer satisfaction surveys"
          ]
        },
        {
          subtitle: "Legal Compliance",
          items: [
            "Meeting legal and regulatory requirements",
            "Preventing fraud and ensuring transaction security",
            "Protecting the rights and safety of our customers and staff"
          ]
        }
      ]
    },
    {
      icon: FiLock,
      title: "Data Security & Protection",
      content: [
        {
          subtitle: "Security Measures",
          items: [
            "Industry-standard SSL encryption for all data transmission",
            "Secure payment processing through PCI-DSS compliant partners (Razorpay)",
            "Regular security audits and vulnerability assessments",
            "Restricted access to personal information on a need-to-know basis",
            "Data backup and disaster recovery procedures"
          ]
        },
        {
          subtitle: "Data Retention",
          items: [
            "We retain your information only as long as necessary for service delivery",
            "Booking records maintained for 7 years for accounting purposes",
            "Marketing data retained until you withdraw consent",
            "You can request data deletion at any time (subject to legal obligations)"
          ]
        }
      ]
    },
    {
      icon: FiShield,
      title: "Your Rights & Choices",
      content: [
        {
          subtitle: "Access & Control",
          items: [
            "Access and review your personal information",
            "Request corrections to inaccurate data",
            "Delete your account and associated data",
            "Opt-out of marketing communications",
            "Restrict or object to certain data processing activities"
          ]
        },
        {
          subtitle: "Cookie Preferences",
          items: [
            "Manage cookie settings through your browser",
            "Essential cookies required for site functionality",
            "Analytics cookies to improve user experience (optional)",
            "Marketing cookies for personalized content (optional)"
          ]
        }
      ]
    },
    {
      icon: FiAlertCircle,
      title: "Third-Party Sharing",
      content: [
        {
          subtitle: "Service Partners",
          items: [
            "Hotels, airlines, and activity providers for booking fulfillment",
            "Payment processors (Razorpay) for secure transactions",
            "Email service providers for communications",
            "Analytics platforms (with anonymized data) for insights"
          ]
        },
        {
          subtitle: "No Sale of Data",
          items: [
            "We never sell your personal information to third parties",
            "Data shared only with trusted partners necessary for service delivery",
            "All partners bound by strict confidentiality agreements",
            "You can request a list of third parties who have accessed your data"
          ]
        }
      ]
    }
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
              <FiShield size={32} className="text-white" />
            </div>
            <h1
              className="text-5xl md:text-6xl font-black"
              style={{ color: colors.textLight }}
            >
              Privacy Policy
            </h1>
          </div>
          
          <p
            className="text-center text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: colors.secondary }}
          >
            Your privacy matters to us. Learn how Aarohan Holidays collects, uses, and protects your personal information.
          </p>
          
          <p className="text-center mt-4 text-sm" style={{ color: colors.textLight + '80' }}>
            Last Updated: October 21, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div
          ref={el => sectionsRef.current[0] = el}
          className="mb-16 p-8 rounded-2xl border-2"
          style={{ backgroundColor: 'white', borderColor: colors.primary }}
        >
          <p className="text-lg leading-relaxed mb-4" style={{ color: colors.textDark }}>
            At <strong>Aarohan Holidays</strong>, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and safeguard your data when you use our website and services.
          </p>
          <p className="text-lg leading-relaxed" style={{ color: colors.textDark }}>
            By using our services, you consent to the practices described in this policy. If you have any questions or concerns, please contact us at <a href="mailto:info@aarohanholidays.com" className="font-semibold hover:underline" style={{ color: colors.primary }}>info@aarohanholidays.com</a>.
          </p>
        </div>

        {/* Main Sections */}
        {sections.map((section, index) => {
          const IconComponent = section.icon;
          return (
            <div
              key={index}
              ref={el => sectionsRef.current[index + 1] = el}
              className="mb-12 p-8 rounded-2xl shadow-lg border"
              style={{ backgroundColor: 'white', borderColor: colors.lightBg }}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  <IconComponent size={24} style={{ color: colors.primary }} />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: colors.darkBg }}>
                  {section.title}
                </h2>
              </div>

              {section.content.map((subsection, subIndex) => (
                <div key={subIndex} className="mb-6 last:mb-0">
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.secondary }}
                  >
                    {subsection.subtitle}
                  </h3>
                  <ul className="space-y-2">
                    {subsection.items.map((item, itemIndex) => (
                      <li
                        key={itemIndex}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                          style={{ backgroundColor: colors.primary }}
                        />
                        <span className="text-lg" style={{ color: colors.textDark }}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        })}

        {/* Contact Section */}
        <div
          className="p-8 rounded-2xl border-2 text-center"
          style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
        >
          <FiMail size={48} className="mx-auto mb-4 text-white" />
          <h2 className="text-3xl font-bold mb-4 text-white">
            Questions About Your Privacy?
          </h2>
          <p className="text-lg mb-6 text-white">
            If you have any questions or concerns about our privacy practices, please don't hesitate to contact us.
          </p>
          <a
            href="mailto:info@aarohanholidays.com"
            className="inline-block px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
            style={{ backgroundColor: 'white', color: colors.primary }}
          >
            Contact Privacy Team
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
