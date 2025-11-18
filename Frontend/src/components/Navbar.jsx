import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiPhone, FiSearch, FiMapPin, FiMenu, FiX, FiChevronDown, FiHome, FiCamera, FiInfo, FiMail } from "react-icons/fi";
import { FaMountain, FaRoute, FaConciergeBell, FaWhatsapp } from "react-icons/fa";
import { gsap } from "gsap";
import { toursAPI, treksAPI } from "../api/userAPI";
import { showApiError } from "../utils/toast";
import EnquiryForm from "./EnquiryForm";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState(null);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiryFormOpen, setEnquiryFormOpen] = useState(false);
  const [placeholder, setPlaceholder] = useState("");
  const [tours, setTours] = useState([]);
  const [treks, setTreks] = useState([]);
  const [loadingTours, setLoadingTours] = useState(false);
  const [loadingTreks, setLoadingTreks] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const enquiryRef = useRef(null);
  const menuItemsRef = useRef([]);
  const mobileMenuRef = useRef(null);
  const chevronRefs = useRef({});
  const leftSectionRef = useRef(null);
  
  const placeholders = [
  "Search tours in Kerala backwaters...",
  "Find desert adventures in Rajasthan...",
  "Explore Himalayan treks like Kedarkantha & Hampta Pass...",
  "Discover the beauty of Kashmir & Ladakh...",
  "Plan your next getaway to Goa beaches...",
  "Explore the hills of Himachal & Uttarakhand...",
  "Find monsoon treks in Maharashtra like Rajmachi & Harishchandragad...",
  "Search for spiritual tours in Varanasi & Rishikesh...",
  "Discover tea valley escapes in Munnar & Ooty...",
  "Explore wildlife safaris in Jim Corbett & Ranthambore...",
];

  // New color palette
  const colors = {
    primary: "#1E9ABF",    // Blue
    secondary: "#E66926",  // Orange
    accent: "#2A6F97",
    background: "#FFFFFF",
    lightBg: "#F8FAFC",
    text: "#1E293B",
    textLight: "#64748B",
    hover: "#D45A1F",
    border: "#E2E8F0"
  };

  // Fetch tours data
  const fetchTours = async () => {
    try {
      setLoadingTours(true);
      const response = await toursAPI.getAll({ limit: 12 });
      if (response.data.success) {
        setTours(response.data.data);
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLoadingTours(false);
    }
  };

  // Fetch treks data
  const fetchTreks = async () => {
    try {
      setLoadingTreks(true);
      const response = await treksAPI.getAll({ limit: 12 });
      if (response.data.success) {
        setTreks(response.data.data);
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLoadingTreks(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchTours();
    fetchTreks();
  }, []);

  // Initial navbar animation
  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      navRef.current,
      { y: -150, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    tl.fromTo(
      leftSectionRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" },
      "-=0.5"
    );

    tl.fromTo(
      searchRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.3"
    );

    tl.fromTo(
      menuItemsRef.current,
      { y: -30, opacity: 0, rotateX: -90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "back.out(1.7)",
      },
      "-=0.2"
    );
  }, []);

  // Typing effect for search placeholder
  useEffect(() => {
    let index = 0;
    let charIndex = 0;
    let typing = true;

    const interval = setInterval(() => {
      if (typing) {
        setPlaceholder(placeholders[index].slice(0, ++charIndex));
        if (charIndex === placeholders[index].length) {
          typing = false;
          setTimeout(() => {}, 1500);
        }
      } else {
        setPlaceholder(placeholders[index].slice(0, --charIndex));
        if (charIndex === 0) {
          typing = true;
          index = (index + 1) % placeholders.length;
        }
      }
    }, 80);

    return () => clearInterval(interval);
  }, []);

  // Dropdown animation
  useEffect(() => {
    if (hoveredMenu && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -30, scale: 0.9, rotateX: -15 },
        { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.5, ease: "power3.out" }
      );

      const items = dropdownRef.current.querySelectorAll(".dropdown-item");
      gsap.fromTo(
        items,
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: "back.out(1.7)" }
      );
    }
  }, [hoveredMenu]);

  // Enquiry dropdown animation
  useEffect(() => {
    if (enquiryOpen && enquiryRef.current) {
      gsap.fromTo(
        enquiryRef.current,
        { opacity: 0, y: -10, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [enquiryOpen]);

  // Mobile menu animation
  useEffect(() => {
    if (menuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        mobileMenuRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [menuOpen]);

  // Services list from OtherServices component
  const otherServicesList = [
    "Taxi Booking Services",
    "Hotel Bookings and Accommodation",
    "Visa and Passport Assistance",
    "Season-Wise Segregated Tours",
    "Cruise Holidays",
    "Bus, Train, and Flight Booking",
    "Parcel and Courier Services",
    "Customized Tours",
    "Tour Packages",
    "Treks and Adventure Packages",
    "Tours and Travel Services",
    "Online Taxi Booking - Local & Outstation"
  ];

  // Group tours by region and state
  const groupedTours = tours.reduce((acc, tour) => {
    // Add to Fixed Departure category if applicable
    if (tour.isFixedDeparture) {
      if (!acc['📅 Fixed Departure']) {
        acc['📅 Fixed Departure'] = [];
      }
      acc['📅 Fixed Departure'].push(tour);
    }
    
    if (tour.regionType === 'Domestic') {
      const state = tour.state || 'Other Domestic';
      if (!acc[state]) {
        acc[state] = [];
      }
      acc[state].push(tour);
    } else if (tour.regionType === 'International') {
      const country = tour.country || 'International';
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(tour);
    }
    return acc;
  }, {});

  // Group treks by category (Himalayan/Sahyadri)
  const groupedTreks = treks.reduce((acc, trek) => {
    // Add to Fixed Departure category if applicable
    if (trek.isFixedDeparture) {
      if (!acc['📅 Fixed Departure']) {
        acc['📅 Fixed Departure'] = [];
      }
      acc['📅 Fixed Departure'].push(trek);
    }
    
    const category = trek.category || 'Other Treks';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(trek);
    return acc;
  }, {});

  const dropdownData = {
    Tours: groupedTours,
    Treks: groupedTreks,
    "Other Services": otherServicesList,
  };

  // Helper to get loading state
  const isLoading = (menuType) => {
    if (menuType === 'Tours') return loadingTours;
    if (menuType === 'Treks') return loadingTreks;
    return false;
  };

  const navIcons = {
    Home: FiHome,
    Tours: FaRoute,
    Treks: FaMountain,
    "Other Services": FaConciergeBell,
    Gallery: FiCamera,
    About: FiInfo,
  };

  const handleCall = () => {
    window.open("tel:+919011268465");
    setEnquiryOpen(false);
  };

  const handleWhatsApp = () => {
    window.open("https://wa.me/919011268465", "_blank");
    setEnquiryOpen(false);
  };

  // Search functionality
  const handleSearch = (value) => {
    setSearchQuery(value);
    
    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = value.toLowerCase().trim();
    
    // Search in tours
    const tourResults = tours
      .filter(tour => 
        tour.name.toLowerCase().includes(query) ||
        tour.destination?.toLowerCase().includes(query) ||
        tour.category?.toLowerCase().includes(query)
      )
      .map(tour => ({
        ...tour,
        type: 'tour'
      }));

    // Search in treks
    const trekResults = treks
      .filter(trek => 
        trek.name.toLowerCase().includes(query) ||
        trek.destination?.toLowerCase().includes(query) ||
        trek.difficulty?.toLowerCase().includes(query)
      )
      .map(trek => ({
        ...trek,
        type: 'trek'
      }));

    const combined = [...tourResults, ...trekResults];
    setSearchResults(combined);
    setShowSearchResults(combined.length > 0 || value.trim().length >= 2);
  };

  // Handle search result click
  const handleSearchResultClick = (result) => {
    const route = result.type === 'tour' 
      ? `/book-tour/${result._id}` 
      : `/book-trek/${result._id}`;
    
    // Dispatch custom event to trigger loader
    const navigationEvent = new CustomEvent('navigationStart', {
      detail: { path: route }
    });
    window.dispatchEvent(navigationEvent);
    
    // Clear search
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const scrollContainer = document.querySelector('[data-scroll-container]');
          if (scrollContainer && scrollContainer.locomotiveScroll) {
            const navHeight = navRef.current?.offsetHeight || 80;
            scrollContainer.locomotiveScroll.scrollTo(element, {
              offset: -(navHeight + 20),
              duration: 1000,
              easing: [0.25, 0.0, 0.35, 1.0]
            });
          } else {
            const navHeight = navRef.current?.offsetHeight || 80;
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - navHeight - 20;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      }, 500);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const scrollContainer = document.querySelector('[data-scroll-container]');
        if (scrollContainer && scrollContainer.locomotiveScroll) {
          const navHeight = navRef.current?.offsetHeight || 80;
          scrollContainer.locomotiveScroll.scrollTo(element, {
            offset: -(navHeight + 20),
            duration: 1000,
            easing: [0.25, 0.0, 0.35, 1.0]
          });
        } else {
          const navHeight = navRef.current?.offsetHeight || 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navHeight - 20;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  };

  // Check if a navigation link is active
  const isLinkActive = (link) => {
    const currentPath = location.pathname;
    
    if (link === 'Home') return currentPath === '/';
    if (link === 'Tours') return currentPath === '/tours' || currentPath.startsWith('/tour/') || currentPath.startsWith('/book-tour/');
    if (link === 'Treks') return currentPath === '/treks' || currentPath.startsWith('/trek/') || currentPath.startsWith('/book-trek/');
    if (link === 'Gallery') return currentPath === '/gallery';
    if (link === 'About') return currentPath === '/about';
    
    return false;
  };

  // Handle navigation link clicks
  const handleNavClick = (link) => {
    setMenuOpen(false);

    // Special handling for Gallery - navigate to /gallery page
    if (link === 'Gallery') {
      navigate('/gallery');
      return;
    }

    // Special handling for Tours - navigate to /tours page
    if (link === 'Tours') {
      navigate('/tours');
      return;
    }

    // Special handling for Treks - navigate to /treks page
    if (link === 'Treks') {
      navigate('/treks');
      return;
    }

    // Special handling for About - navigate to /about page
    if (link === 'About') {
      navigate('/about');
      return;
    }

    const sectionMap = {
      'Home': 'hero',
      'Other Services': 'other-services'
    };

    const sectionId = sectionMap[link];
    if (sectionId) {
      scrollToSection(sectionId);
    }
  };

  // Handle tour/trek/service item click
  const handleItemClick = (item, type) => {
    setHoveredMenu(null);
    setMenuOpen(false);

    if (type === 'Tours') {
      const tour = tours.find(t => t.name === item);
      if (tour) {
        const route = `/book-tour/${tour._id}`;
        // Dispatch custom event to trigger loader
        const navigationEvent = new CustomEvent('navigationStart', {
          detail: { path: route }
        });
        window.dispatchEvent(navigationEvent);
      }
    } else if (type === 'Treks') {
      const trek = treks.find(t => t.name === item);
      if (trek) {
        const route = `/book-trek/${trek._id}`;
        // Dispatch custom event to trigger loader
        const navigationEvent = new CustomEvent('navigationStart', {
          detail: { path: route }
        });
        window.dispatchEvent(navigationEvent);
      }
    } else if (type === 'Other Services') {
      // Open enquiry form with service type pre-filled
      setEnquiryFormOpen(true);
      // Store the service type to be used by EnquiryForm
      sessionStorage.setItem('selectedServiceType', item);
    }
  };

  const handleMouseEnter = (e, link) => {
    // Only open dropdown on hover, don't close on mouse leave anymore
    if (!hoveredMenu) {
      setHoveredMenu(link);
      
      const button = e.currentTarget.querySelector('button');
      gsap.to(button, {
        y: -3,
        duration: 0.4,
        ease: "power2.out",
      });

      if (chevronRefs.current[link]) {
        gsap.to(chevronRefs.current[link], {
          rotate: 180,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    }
  };

  const closeDropdown = () => {
    setHoveredMenu(null);
    Object.keys(chevronRefs.current).forEach(link => {
      if (chevronRefs.current[link]) {
        gsap.to(chevronRefs.current[link], {
          rotate: 0,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    });
  };

  const handleButtonHover = (e, isEnter) => {
    gsap.to(e.currentTarget, {
      scale: isEnter ? 1.05 : 1,
      y: isEnter ? -1 : 0,
      boxShadow: isEnter ? `0 4px 12px ${colors.primary}20` : "none",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleSearchFocus = () => {
    gsap.to(searchRef.current, {
      scale: 1.02,
      boxShadow: `0 0 0 2px ${colors.primary}20`,
      borderColor: colors.primary,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleSearchBlur = () => {
    gsap.to(searchRef.current, {
      scale: 1,
      boxShadow: "none",
      borderColor: colors.border,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleNavItemHover = (e, isEnter) => {
    const icon = e.currentTarget.querySelector('svg');
    if (icon) {
      gsap.to(icon, {
        scale: isEnter ? 1.2 : 1,
        color: isEnter ? colors.secondary : colors.text,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const toggleEnquiryDropdown = () => {
    setEnquiryOpen(!enquiryOpen);
  };

  const openEnquiryForm = () => {
    setEnquiryFormOpen(true);
    setEnquiryOpen(false);
  };

  return (
    <>
      <nav 
        ref={navRef} 
        className="fixed w-full z-50 shadow-lg border-b"
        style={{ 
          background: colors.background,
          borderColor: colors.border
        }}
      >
        <div className="max-w-8xl mx-auto flex items-center justify-between px-4 lg:px-8 py-3">
          {/* Left Section - Logo */}
          <div 
            ref={leftSectionRef}
            className="flex items-center space-x-4 min-w-0 flex-shrink-0"
          >
            <div 
              className="cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <img 
                src="/Logo/logo2.jpg" 
                alt="Aarohan Holidays Logo" 
                className="h-16 w-auto object-contain transition-all duration-300 group-hover:scale-105 group-hover:brightness-110"
                style={{ maxWidth: '200px' }}
              />
            </div>
          </div>

          {/* Center Section - Search Bar */}
          <div className="hidden lg:block mx-4 flex-shrink-0 flex-grow max-w-2xl">
            <div className="relative" style={{ width: "100%" }}>
              <div
                ref={searchRef}
                className="flex items-center rounded-full px-4 py-2.5 shadow-sm transition-all duration-300"
                style={{ 
                  background: colors.lightBg,
                  border: `1px solid ${colors.border}`
                }}
              >
                <FiSearch 
                  className="mr-3 flex-shrink-0" 
                  size={18}
                  style={{ color: colors.textLight }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={placeholder}
                  onFocus={() => {
                    handleSearchFocus();
                    if (searchQuery.trim().length >= 2) {
                      setShowSearchResults(true);
                    }
                  }}
                  onBlur={handleSearchBlur}
                  className="bg-transparent outline-none flex-grow placeholder-gray-500 text-sm font-medium w-full min-w-0"
                  style={{ color: colors.text }}
                />
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <FiMapPin 
                    size={12}
                    style={{ color: 'white' }}
                  />
                </div>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 shadow-xl rounded-2xl py-3 border z-50 max-h-96 overflow-y-auto"
                  style={{ 
                    background: colors.background,
                    borderColor: colors.primary,
                    boxShadow: `0 10px 40px ${colors.primary}15`
                  }}
                >
                  {searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result) => (
                        <div
                          key={`${result.type}-${result._id}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-all duration-200 border-b last:border-b-0 group"
                          style={{ borderColor: colors.border }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {result.type === 'tour' ? (
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${colors.primary}15` }}>
                                    <FaRoute size={14} style={{ color: colors.primary }} />
                                  </div>
                                ) : (
                                  <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${colors.secondary}15` }}>
                                    <FaMountain size={14} style={{ color: colors.secondary }} />
                                  </div>
                                )}
                                <span 
                                  className="text-xs font-bold uppercase px-2 py-1 rounded-full"
                                  style={{ 
                                    backgroundColor: result.type === 'tour' ? `${colors.primary}15` : `${colors.secondary}15`,
                                    color: result.type === 'tour' ? colors.primary : colors.secondary
                                  }}
                                >
                                  {result.type}
                                </span>
                              </div>
                              <p className="font-bold text-sm truncate group-hover:text-blue-600 transition-colors" style={{ color: colors.text }}>
                                {result.name}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                {result.destination && (
                                  <span className="text-xs flex items-center gap-1" style={{ color: colors.textLight }}>
                                    <FiMapPin size={10} />
                                    {result.destination}
                                  </span>
                                )}
                                {result.duration && (
                                  <span className="text-xs" style={{ color: colors.textLight }}>
                                    {result.duration}
                                  </span>
                                )}
                                {result.difficulty && (
                                  <span className="text-xs" style={{ color: colors.textLight }}>
                                    {result.difficulty}
                                  </span>
                                )}
                              </div>
                            </div>
                            {result.pricing?.base && (
                              <div className="text-right ml-3 flex-shrink-0">
                                <p className="text-xs" style={{ color: colors.textLight }}>From</p>
                                <p className="font-bold text-lg" style={{ color: colors.secondary }}>
                                  ₹{result.pricing.base.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
                        <FiSearch size={20} style={{ color: colors.primary }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: colors.text }}>
                        No results found for "{searchQuery}"
                      </p>
                      <p className="text-xs mt-1" style={{ color: colors.textLight }}>
                        Try searching with different keywords
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Navigation and Actions */}
          <div className="flex items-center space-x-4 min-w-0 flex-shrink-0">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {["Home", "Tours", "Treks", "Other Services", "Gallery", "About"].map((link, idx) => {
                const IconComponent = navIcons[link];
                return (
                  <div
                    key={link}
                    ref={(el) => (menuItemsRef.current[idx] = el)}
                    className="relative"
                    onMouseEnter={(e) => handleMouseEnter(e, link)}
                  >
                    <button 
                      className={`font-semibold text-sm transition-all duration-300 relative flex items-center space-x-2 group px-4 py-2 rounded-xl ${
                        isLinkActive(link) ? 'shadow-md' : ''
                      }`}
                      style={{ 
                        color: isLinkActive(link) ? colors.background : colors.text,
                        backgroundColor: isLinkActive(link) ? colors.primary : 'transparent'
                      }}
                      onMouseEnter={(e) => handleNavItemHover(e, true)}
                      onMouseLeave={(e) => handleNavItemHover(e, false)}
                      onClick={() => handleNavClick(link)}
                    >
                      {IconComponent && (
                        <IconComponent 
                          size={16} 
                          className="flex-shrink-0 transition-colors" 
                          style={{ color: isLinkActive(link) ? colors.background : 'inherit' }}
                        />
                      )}
                      <span className="whitespace-nowrap">{link}</span>
                      {dropdownData[link] && (
                        <FiChevronDown 
                          ref={(el) => (chevronRefs.current[link] = el)}
                          size={14} 
                          className="flex-shrink-0 transition-transform"
                          style={{ color: isLinkActive(link) ? colors.background : colors.text }}
                        />
                      )}
                    </button>

                    {/* Mega Dropdown */}
                    {dropdownData[link] && hoveredMenu === link && (
                      <div
                        ref={dropdownRef}
                        className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-80 shadow-2xl rounded-2xl py-4 px-4 border z-50"
                        style={{ 
                          background: colors.background,
                          borderColor: colors.primary,
                          boxShadow: `0 20px 60px ${colors.primary}20`
                        }}
                      >
                        <div className="flex items-center justify-between mb-3 px-2">
                          <h3 className="font-bold text-sm uppercase tracking-wide" style={{ color: colors.primary }}>
                            {link}
                          </h3>
                          <button
                            onClick={closeDropdown}
                            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            style={{ color: colors.text }}
                          >
                            <FiX size={16} />
                          </button>
                        </div>

                        {/* Loading State */}
                        {isLoading(link) ? (
                          <div className="flex justify-center items-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: colors.primary }}></div>
                            <span className="ml-2 text-sm" style={{ color: colors.text }}>Loading {link.toLowerCase()}...</span>
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {/* Handle grouped data for Tours and Treks */}
                            {(link === 'Tours' || link === 'Treks') ? (
                              Object.keys(dropdownData[link]).length > 0 ? (
                                Object.entries(dropdownData[link])
                                  .sort(([catA], [catB]) => {
                                    // Fixed Departure always first
                                    if (catA.includes('Fixed Departure')) return -1;
                                    if (catB.includes('Fixed Departure')) return 1;
                                    return catA.localeCompare(catB);
                                  })
                                  .map(([category, items]) => (
                                  <div key={category} className="mb-3">
                                    <div className="px-2 py-1 mb-1">
                                      <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.secondary }}>
                                        {category}
                                      </h4>
                                    </div>
                                    {items.map((item) => (
                                      <div
                                        key={item._id}
                                        className="dropdown-item p-2 cursor-pointer rounded-lg hover:translate-x-1 transition-all duration-300 group pl-4"
                                        onClick={() => handleItemClick(item, link)}
                                        style={{ 
                                          backgroundColor: 'transparent',
                                          border: '1px solid transparent'
                                        }}
                                      >
                                        <p className="text-sm font-medium transition-colors group-hover:font-semibold flex items-center"
                                           style={{ color: colors.text }}>
                                          <span 
                                            className="w-1.5 h-1.5 rounded-full mr-3 transition-all duration-300 group-hover:scale-125"
                                            style={{ backgroundColor: colors.secondary }}
                                          ></span>
                                          {item.name}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ))
                              ) : null
                            ) : (
                              /* Handle non-grouped data (Other Services) */
                              dropdownData[link].map((item) => (
                                <div
                                  key={item}
                                  className="dropdown-item p-2 cursor-pointer rounded-lg hover:translate-x-1 transition-all duration-300 group"
                                  onClick={() => handleItemClick(item, link)}
                                  style={{ 
                                    backgroundColor: 'transparent',
                                    border: '1px solid transparent'
                                  }}
                                >
                                  <p className="text-sm font-medium transition-colors group-hover:font-semibold flex items-center"
                                     style={{ color: colors.text }}>
                                    <span 
                                      className="w-1.5 h-1.5 rounded-full mr-3 transition-all duration-300 group-hover:scale-125"
                                      style={{ backgroundColor: colors.secondary }}
                                    ></span>
                                    {item}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                        
                        {/* Show message if no items */}
                        {!isLoading(link) && (
                          (link === 'Tours' && Object.keys(dropdownData[link]).length === 0) ||
                          (link === 'Treks' && Object.keys(dropdownData[link]).length === 0)
                        ) && (
                          <div className="text-center py-4">
                            <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${colors.primary}10` }}>
                              <FiInfo size={16} style={{ color: colors.primary }} />
                            </div>
                            <p className="text-sm" style={{ color: colors.text }}>
                              No {link.toLowerCase()} available at the moment.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Enquiry Button */}
            <div className="relative" ref={enquiryRef}>
              <button
                onClick={toggleEnquiryDropdown}
                onMouseEnter={(e) => handleButtonHover(e, true)}
                onMouseLeave={(e) => handleButtonHover(e, false)}
                className="px-5 py-2.5 rounded-full font-bold transition-all duration-300 flex items-center space-x-2 shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.hover} 100%)`,
                  color: "white"
                }}
              >
                <span>Enquiry</span>
                <FiChevronDown 
                  size={16} 
                  className={`transition-transform duration-300 ${enquiryOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Enquiry Dropdown */}
              {enquiryOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-56 shadow-2xl rounded-2xl py-3 border z-50"
                  style={{ 
                    background: colors.background,
                    borderColor: colors.secondary,
                    boxShadow: `0 15px 50px ${colors.secondary}20`
                  }}
                >
                  <div className="px-4 py-2 border-b" style={{ borderColor: colors.border }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.textLight }}>
                      Contact Options
                    </p>
                  </div>
                  
                  <div className="space-y-1 p-2">
                    <button
                      onClick={openEnquiryForm}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-3 font-medium text-sm group"
                      style={{ color: colors.text }}
                    >
                      <div className="p-2 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${colors.secondary}15` }}>
                        <FiMail size={16} style={{ color: colors.secondary }} />
                      </div>
                      <div>
                        <p className="font-semibold">Send Enquiry</p>
                        <p className="text-xs" style={{ color: colors.textLight }}>Fill enquiry form</p>
                      </div>
                    </button>

                    <button
                      onClick={handleCall}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-3 font-medium text-sm group"
                      style={{ color: colors.text }}
                    >
                      <div className="p-2 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: `${colors.primary}15` }}>
                        <FiPhone size={16} style={{ color: colors.primary }} />
                      </div>
                      <div>
                        <p className="font-semibold">Call Now</p>
                        <p className="text-xs" style={{ color: colors.textLight }}>+91 90112 68465</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleWhatsApp}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center space-x-3 font-medium text-sm group"
                      style={{ color: colors.text }}
                    >
                      <div className="p-2 rounded-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: '#25D36615' }}>
                        <FaWhatsapp size={16} style={{ color: "#25D366" }} />
                      </div>
                      <div>
                        <p className="font-semibold">WhatsApp</p>
                        <p className="text-xs" style={{ color: colors.textLight }}>Instant messaging</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{ color: colors.primary }}
                className="hover:opacity-70 transition-opacity p-2 rounded-lg"
              >
                {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div 
            ref={mobileMenuRef} 
            className="lg:hidden shadow-xl p-6 space-y-4 overflow-hidden border-t"
            style={{ 
              background: colors.background,
              borderColor: colors.border
            }}
          >
            {/* Mobile Search Bar */}
            <div className="mb-4 relative">
              <div
                className="flex items-center rounded-xl px-4 py-3 shadow-sm"
                style={{ 
                  background: colors.lightBg,
                  border: `1px solid ${colors.border}`
                }}
              >
                <FiSearch 
                  className="mr-3 flex-shrink-0" 
                  size={18}
                  style={{ color: colors.textLight }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search tours & treks..."
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) {
                      setShowSearchResults(true);
                    }
                  }}
                  className="bg-transparent outline-none flex-grow placeholder-gray-500 text-sm font-medium w-full"
                  style={{ color: colors.text }}
                />
              </div>

              {/* Mobile Search Results */}
              {showSearchResults && (
                <div 
                  className="absolute top-full left-0 right-0 mt-2 shadow-xl rounded-xl py-2 border z-50 max-h-80 overflow-y-auto"
                  style={{ 
                    background: colors.background,
                    borderColor: colors.primary
                  }}
                >
                  {searchResults.length > 0 ? (
                    <>
                      {searchResults.map((result) => (
                        <div
                          key={`mobile-${result.type}-${result._id}`}
                          onClick={() => handleSearchResultClick(result)}
                          className="px-3 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0"
                          style={{ borderColor: colors.border }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {result.type === 'tour' ? (
                                  <FaRoute size={12} style={{ color: colors.primary }} className="flex-shrink-0" />
                                ) : (
                                  <FaMountain size={12} style={{ color: colors.secondary }} className="flex-shrink-0" />
                                )}
                                <span 
                                  className="text-xs font-bold uppercase px-1.5 py-0.5 rounded-full"
                                  style={{ 
                                    backgroundColor: result.type === 'tour' ? `${colors.primary}15` : `${colors.secondary}15`,
                                    color: result.type === 'tour' ? colors.primary : colors.secondary
                                  }}
                                >
                                  {result.type}
                                </span>
                              </div>
                              <p className="font-bold text-sm line-clamp-1" style={{ color: colors.text }}>
                                {result.name}
                              </p>
                              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: colors.textLight }}>
                                <FiMapPin size={10} />
                                {result.destination || 'Unknown'}
                              </p>
                            </div>
                            {result.pricing?.base && (
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold" style={{ color: colors.secondary }}>
                                  ₹{result.pricing.base.toLocaleString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <FiSearch size={24} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-medium" style={{ color: colors.text }}>
                        No results found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {["Home", "Tours", "Treks", "Other Services", "Gallery", "About"].map((link) => {
              const IconComponent = navIcons[link];
              const isActive = isLinkActive(link);
              return (
                <div key={link}>
                  <button
                    onClick={() => {
                      if (dropdownData[link]) {
                        setHoveredMenu(hoveredMenu === link ? null : link);
                      } else {
                        handleNavClick(link);
                      }
                    }}
                    className={`w-full text-left font-semibold text-base transition-all duration-300 py-3 flex items-center justify-between px-4 rounded-xl ${
                      isActive ? 'shadow-md' : 'hover:bg-gray-50'
                    }`}
                    style={{ 
                      color: isActive ? colors.background : colors.text,
                      backgroundColor: isActive ? colors.primary : 'transparent'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {IconComponent && (
                        <IconComponent 
                          size={18} 
                          className="flex-shrink-0" 
                          style={{ color: isActive ? colors.background : 'inherit' }}
                        />
                      )}
                      <span>{link}</span>
                    </div>
                    {dropdownData[link] && (
                      <FiChevronDown 
                        size={18} 
                        className={`transition-transform duration-300 flex-shrink-0 ${hoveredMenu === link ? 'rotate-180' : ''}`}
                        style={{ color: isActive ? colors.background : colors.text }}
                      />
                    )}
                  </button>
                  {dropdownData[link] && hoveredMenu === link && (
                    <div className="mt-2 space-y-2 pl-11 border-l-2 max-h-48 overflow-y-auto" style={{ borderColor: colors.secondary }}>
                      {isLoading(link) ? (
                        <div className="flex items-center py-1 px-3">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 mr-2" style={{ borderColor: colors.primary }}></div>
                          <span className="text-xs" style={{ color: colors.text }}>Loading {link.toLowerCase()}...</span>
                        </div>
                      ) : (
                        <>
                          {/* Handle grouped data for Tours and Treks */}
                          {(link === 'Tours' || link === 'Treks') ? (
                            Object.keys(dropdownData[link]).length > 0 ? (
                              Object.entries(dropdownData[link])
                                .sort(([catA], [catB]) => {
                                  // Fixed Departure always first
                                  if (catA.includes('Fixed Departure')) return -1;
                                  if (catB.includes('Fixed Departure')) return 1;
                                  return catA.localeCompare(catB);
                                })
                                .map(([category, items]) => (
                                <div key={category} className="mb-2">
                                  <div className="px-2 py-1">
                                    <h5 className="text-xs font-bold uppercase tracking-wide" style={{ color: colors.secondary }}>
                                      {category}
                                    </h5>
                                  </div>
                                  {items.map((item) => (
                                    <p
                                      key={item._id}
                                      className="text-sm cursor-pointer py-2 font-medium transition-all duration-200 px-4 rounded-lg hover:bg-gray-50 hover:translate-x-1 ml-2"
                                      style={{ color: colors.text }}
                                      onClick={() => handleItemClick(item, link)}
                                    >
                                      • {item.name}
                                    </p>
                                  ))}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs py-2 px-4" style={{ color: colors.textLight }}>
                                No {link.toLowerCase()} available at the moment.
                              </p>
                            )
                          ) : (
                            /* Handle non-grouped data (Other Services) */
                            <>
                              {dropdownData[link].map((item) => (
                                <p
                                  key={item}
                                  className="text-sm cursor-pointer py-2 font-medium transition-all duration-200 px-4 rounded-lg hover:bg-gray-50 hover:translate-x-1"
                                  style={{ color: colors.text }}
                                  onClick={() => handleItemClick(item, link)}
                                >
                                  • {item}
                                </p>
                              ))}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </nav>

      {/* Enquiry Form - Positioned Below Navbar */}
      {enquiryFormOpen && (
        <div 
          className="fixed w-full z-40 shadow-xl"
          style={{ 
            top: navRef.current?.offsetHeight || '80px',
            background: 'white',
            maxHeight: 'calc(100vh - 80px)',
            overflowY: 'auto'
          }}
        >
          <EnquiryForm isOpen={enquiryFormOpen} onClose={() => setEnquiryFormOpen(false)} />
        </div>
      )}
    </>
  );
}