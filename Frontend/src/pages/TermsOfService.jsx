import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiCheckCircle, FiAlertTriangle, FiDollarSign, FiRefreshCw, FiUsers, FiArrowLeft } from 'react-icons/fi';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function TermsOfService() {
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

    gsap.fromTo(
      headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    sectionsRef.current.forEach((section) => {
      if (section) {
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
      }
    });
  }, []);

  const sections = [
    {
      icon: FiCheckCircle,
      title: "Booking Terms & Conditions",
      content: [
        {
          subtitle: "Making a Booking",
          items: [
            "All bookings must be made through our website, email, or phone with authorized representatives",
            "You must be at least 18 years old to make a booking",
            "Accurate personal information is required for all travelers",
            "Bookings are confirmed only upon receipt of full or partial payment as specified",
            "Confirmation emails serve as proof of booking"
          ]
        },
        {
          subtitle: "Booking Modifications",
          items: [
            "Changes to bookings are subject to availability and may incur fees",
            "Requests must be made at least 7 days before departure",
            "Name changes are not permitted; cancellation and rebooking required",
            "Date changes may result in price differences",
            "Contact us at info@aarohanholidays.com for modification requests"
          ]
        }
      ]
    },
    {
      icon: FiDollarSign,
      title: "Payment Terms",
      content: [
        {
          subtitle: "Payment Schedule",
          items: [
            "Advance payment of 30-50% required at time of booking",
            "Full payment due 15 days before departure date",
            "Payments accepted via credit/debit card, UPI, bank transfer",
            "All transactions processed securely through Razorpay",
            "Payment receipts sent via email upon successful transaction"
          ]
        },
        {
          subtitle: "Pricing & Fees",
          items: [
            "Prices displayed in INR (Indian Rupees) unless stated otherwise",
            "Prices include GST and service charges as applicable",
            "External fees (visas, airport taxes, travel insurance) not included",
            "We reserve the right to adjust prices due to currency fluctuations or tax changes",
            "Price changes do not affect confirmed bookings"
          ]
        }
      ]
    },
    {
      icon: FiRefreshCw,
      title: "Cancellation & Refund Policy",
      content: [
        {
          subtitle: "Cancellation by Customer",
          items: [
            "30+ days before departure: 85% refund (15% cancellation fee)",
            "15-29 days before departure: 60% refund (40% cancellation fee)",
            "7-14 days before departure: 40% refund (60% cancellation fee)",
            "Less than 7 days: No refund",
            "Cancellation requests must be made in writing via email"
          ]
        },
        {
          subtitle: "Cancellation by Aarohan Holidays",
          items: [
            "Full refund provided if we cancel due to insufficient bookings",
            "Force majeure events (natural disasters, political unrest) may result in cancellation",
            "Alternative dates or packages offered before refund processing",
            "Refunds processed within 10-15 business days",
            "We are not liable for expenses incurred due to cancellation"
          ]
        },
        {
          subtitle: "Refund Processing",
          items: [
            "Refunds issued to original payment method",
            "Processing time: 7-15 business days after approval",
            "Bank processing times may vary",
            "Refund status updates sent via email"
          ]
        }
      ]
    },
    {
      icon: FiUsers,
      title: "Traveler Responsibilities",
      content: [
        {
          subtitle: "Documentation",
          items: [
            "Valid passport (min. 6 months validity for international travel)",
            "Appropriate visas and permits for destinations",
            "Travel insurance highly recommended",
            "Medical certificates if required by activities or destinations",
            "Aarohan Holidays is not responsible for denied entry due to improper documentation"
          ]
        },
        {
          subtitle: "Health & Safety",
          items: [
            "Inform us of medical conditions, allergies, or dietary restrictions",
            "Travelers are responsible for their own health and fitness",
            "Follow all safety instructions provided by guides and staff",
            "Travel insurance covering medical emergencies strongly recommended",
            "We reserve the right to deny participation if safety is compromised"
          ]
        },
        {
          subtitle: "Conduct & Behavior",
          items: [
            "Respectful behavior towards guides, staff, and fellow travelers expected",
            "Compliance with local laws, customs, and regulations required",
            "Damage to property or equipment will be charged to the traveler",
            "Disruptive behavior may result in removal from tour without refund",
            "Alcohol and substance abuse not permitted during activities"
          ]
        }
      ]
    },
    {
      icon: FiAlertTriangle,
      title: "Liability & Disclaimers",
      content: [
        {
          subtitle: "Limitation of Liability",
          items: [
            "Aarohan Holidays acts as an intermediary between customers and service providers",
            "We are not liable for actions, omissions, or defaults of third-party providers",
            "Personal injury, illness, or loss of property is the traveler's responsibility",
            "Force majeure events beyond our control exempt us from liability",
            "Maximum liability limited to the cost of the booked package"
          ]
        },
        {
          subtitle: "Travel Insurance",
          items: [
            "We strongly recommend comprehensive travel insurance",
            "Insurance should cover trip cancellation, medical emergencies, and lost baggage",
            "We are not liable for incidents that would be covered by insurance",
            "Insurance claims must be made directly with your provider"
          ]
        },
        {
          subtitle: "Itinerary Changes",
          items: [
            "Itineraries are subject to change due to weather, road conditions, or unforeseen circumstances",
            "We will provide alternative activities of equal or greater value",
            "No refunds for itinerary modifications due to external factors",
            "Safety of travelers is our top priority in all decisions"
          ]
        }
      ]
    },
    {
      icon: FiFileText,
      title: "Intellectual Property & Usage",
      content: [
        {
          subtitle: "Website Content",
          items: [
            "All content on our website is owned by Aarohan Holidays or licensed partners",
            "Reproduction, distribution, or commercial use requires written permission",
            "Photos, videos, and testimonials may be used for marketing purposes",
            "You can opt-out of marketing use by contacting us"
          ]
        },
        {
          subtitle: "Photography & Media",
          items: [
            "Photos/videos taken during tours may be used for promotional purposes",
            "Your participation grants permission unless you opt-out in writing",
            "We respect your privacy and will not use identifying information without consent",
            "Professional photography services may be available for purchase"
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
            backgroundImage: `radial-gradient(circle at 2px 2px, ${colors.secondary} 1px, transparent 0)`,
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
              style={{ backgroundColor: colors.secondary }}
            >
              <FiFileText size={32} className="text-white" />
            </div>
            <h1
              className="text-5xl md:text-6xl font-black"
              style={{ color: colors.textLight }}
            >
              Terms of Service
            </h1>
          </div>
          
          <p
            className="text-center text-xl max-w-3xl mx-auto leading-relaxed"
            style={{ color: colors.primary }}
          >
            Please read these terms carefully before booking with Aarohan Holidays. Your booking confirms acceptance of these terms.
          </p>
          
          <p className="text-center mt-4 text-sm" style={{ color: colors.textLight + '80' }}>
            Effective Date: October 21, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div
          ref={el => sectionsRef.current[0] = el}
          className="mb-16 p-8 rounded-2xl border-2"
          style={{ backgroundColor: 'white', borderColor: colors.secondary }}
        >
          <p className="text-lg leading-relaxed mb-4" style={{ color: colors.textDark }}>
            Welcome to <strong>Aarohan Holidays</strong>! These Terms of Service ("Terms") govern your use of our website and services. By making a booking or using our platform, you agree to be bound by these Terms.
          </p>
          <p className="text-lg leading-relaxed" style={{ color: colors.textDark }}>
            We reserve the right to update these Terms at any time. Continued use of our services after changes constitutes acceptance of the revised Terms. For questions, contact us at <a href="mailto:info@aarohanholidays.com" className="font-semibold hover:underline" style={{ color: colors.secondary }}>info@aarohanholidays.com</a>.
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
                  style={{ backgroundColor: colors.secondary + '20' }}
                >
                  <IconComponent size={24} style={{ color: colors.secondary }} />
                </div>
                <h2 className="text-3xl font-bold" style={{ color: colors.darkBg }}>
                  {section.title}
                </h2>
              </div>

              {section.content.map((subsection, subIndex) => (
                <div key={subIndex} className="mb-6 last:mb-0">
                  <h3
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
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
                          style={{ backgroundColor: colors.secondary }}
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

        {/* Acceptance */}
        <div
          className="p-8 rounded-2xl border-2 text-center"
          style={{ backgroundColor: colors.secondary, borderColor: colors.secondary }}
        >
          <FiCheckCircle size={48} className="mx-auto mb-4 text-white" />
          <h2 className="text-3xl font-bold mb-4 text-white">
            Agreement & Acceptance
          </h2>
          <p className="text-lg mb-6 text-white">
            By booking with Aarohan Holidays, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-block px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
              style={{ backgroundColor: 'white', color: colors.secondary }}
            >
              Start Booking
            </Link>
            <a
              href="mailto:info@aarohanholidays.com"
              className="inline-block px-8 py-4 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg border-2"
              style={{ backgroundColor: 'transparent', color: 'white', borderColor: 'white' }}
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
