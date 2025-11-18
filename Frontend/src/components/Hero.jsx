import { useState, useEffect, useRef, useMemo } from "react";
import { gsap } from "gsap";
import { FiArrowRight, FiMapPin, FiTrendingUp, FiStar, FiPlay, FiAward, FiUsers, FiChevronRight } from "react-icons/fi";
import { FaMountain, FaUmbrellaBeach, FaCompass } from "react-icons/fa";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [statValues, setStatValues] = useState({ 0: 0, 1: 0, 2: 0, 3: 0 });

  const heroRef = useRef(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const floatingElementsRef = useRef([]);
  const statsRef = useRef([]);
  const textRef = useRef(null);
  const subtextRef = useRef(null);
  const buttonsRef = useRef([]);
  const statsContainerRef = useRef(null);
  const badgeRef = useRef(null);

  // Updated color palette
  const colors = {
    primary: "#E66926", // Orange
    secondary: "#1E9ABF", // Blue
    accent: "#2C2C2C",
    lightBg: "#FAF9F6",
    darkBg: "#0F172A",
    textLight: "#FFFFFF",
    textDark: "#1E293B"
  };

  // Memoize slides to prevent re-creation on every render
  const slides = useMemo(
  () => [
    {
      image:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Aarohan Holidays",
      subtext:
        "Crafting Journeys, Creating Memories — Explore India with Heart & Soul",
      badge: "Discover India",
    },
    {
      image:
        "https://images.unsplash.com/photo-1584395631446-e41b0fc3f68d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Himalayan Heights",
      subtext:
        "Whispers of snow-clad peaks and serene monasteries — find peace above the clouds.",
      badge: "Himalayan Escape",
    },
    {
      image:
        "https://images.unsplash.com/photo-1668007598394-292ee944e83b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Northern Majesty",
      subtext:
        "Where history meets grandeur — from Delhi’s charm to Kashmir’s calm.",
      badge: "Royal North",
    },
    {
      image:
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Southern Serenity",
      subtext:
        "Coconut breezes, temple bells, and backwater tales — dive into the soul of the South.",
      badge: "Divine South",
    },
    {
      image:
        "https://images.unsplash.com/photo-1663745430674-180c6858f46c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Western Wonders",
      subtext:
        "Golden sands, royal forts, and coastal sunsets — a symphony of color and culture.",
      badge: "Vibrant West",
    },
    {
      image:
        "https://images.unsplash.com/photo-1593813738953-fb3c93e0769d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=2154",
      text: "Eastern Essence",
      subtext:
        "Mystical mountains, tea-scented trails, and soulful rhythms of life.",
      badge: "Enchanting East",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Central Chronicles",
      subtext:
        "Untamed wilderness and timeless heritage — discover the beating heart of India.",
      badge: "Heart of India",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1661962428918-6a57ab674e23?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Desert Dreams",
      subtext:
        "Ride through golden dunes under starlit skies — Rajasthan’s timeless whispers await.",
      badge: "Desert Trails",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1661903221734-11c7d6fc11e7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Island Escapes",
      subtext:
        "Turquoise waters, coral gardens, and tranquil tides — lose yourself to island bliss.",
      badge: "Coastal Bliss",
    },
    {
      image:
        "https://images.unsplash.com/photo-1635337136044-83e78752bc4a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Cultural Odyssey",
      subtext:
        "Walk through centuries of tradition — where every festival tells a story.",
      badge: "Cultural Trails",
    },
    {
      image:
        "https://images.unsplash.com/photo-1575550959106-5a7defe28b56?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Wildlife Trails",
      subtext:
        "Encounter nature’s raw beauty — from tiger roars to tranquil forests.",
      badge: "Wild Adventures",
    },
    {
      image:
        "https://images.unsplash.com/photo-1701430662597-ff86c1cba95a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Heritage Horizons",
      subtext:
        "Explore ancient forts, palaces, and timeless architecture that echo India’s glory.",
      badge: "Historic Journey",
    },
    {
      image:
        "https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Coastal Charms",
      subtext:
        "Sun, sand, and serenity — from Goa’s glow to Andaman’s allure.",
      badge: "Beach Escape",
    },
    {
      image:
        "https://images.unsplash.com/photo-1666264474857-d09401e9eb4f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Festive India",
      subtext:
        "Colors, lights, and melodies — celebrate India’s spirit in full bloom.",
      badge: "Joyful Journeys",
    },
    {
      image:
        "https://plus.unsplash.com/premium_photo-1663047386229-637af57cecfe?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=100&w=1980",
      text: "Adventure Beyond",
      subtext:
        "Trek, dive, or soar — unleash your wanderlust with thrilling experiences.",
      badge: "Adventure Awaits",
    },
  ],
  []
);


  const stats = useMemo(() => [
    { icon: FiMapPin, value: 250, label: "Destinations", suffix: "+" },
    { icon: FiUsers, value: 15000, label: "Happy Travelers", suffix: "+" },
    { icon: FiTrendingUp, value: 5, label: "Years Experience", suffix: "+" },
    { icon: FiAward, value: 99, label: "Satisfaction Rate", suffix: "%" }
  ], []);

  const features = [
    { icon: FaMountain, text: "Mountain Treks", color: colors.secondary },
    { icon: FaUmbrellaBeach, text: "Beach Getaways", color: colors.primary },
    { icon: FaCompass, text: "Adventure Tours", color: colors.secondary },
    { icon: FiStar, text: "Luxury Stays", color: colors.primary }
  ];

  // Enhanced initial animation sequence
  useEffect(() => {
    const tl = gsap.timeline();

    tl.fromTo(
      heroRef.current,
      {
        scale: 1.1,
        opacity: 0,
        filter: "blur(10px)"
      },
      {
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 1.5,
        ease: "power3.out"
      }
    );

    tl.fromTo(
      imageRef.current,
      {
        scale: 1.2,
        opacity: 0
      },
      {
        scale: 1,
        opacity: 1,
        duration: 2,
        ease: "power2.out"
      },
      "-=1"
    );

    tl.fromTo(
      overlayRef.current,
      {
        opacity: 0,
        backgroundPosition: "100% 100%"
      },
      {
        opacity: 1,
        backgroundPosition: "0% 0%",
        duration: 1.5,
        ease: "power2.inOut"
      },
      "-=1.5"
    );

    // Floating elements animation
    floatingElementsRef.current.forEach((element, index) => {
      if (element) {
        const duration = gsap.utils.random(6, 12);
        const delay = index * 0.2;

        gsap.to(element, {
          y: `random(-80, 80)`,
          x: `random(-30, 30)`,
          rotation: `random(-30, 30)`,
          duration: duration,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: delay
        });
      }
    });

    // Content animation
    tl.fromTo(
      contentRef.current?.children || [],
      {
        y: 60,
        opacity: 0,
        filter: "blur(8px)",
        scale: 0.95
      },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        scale: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: "power2.out"
      },
      "-=0.8"
    );

    // Badge animation
    if (badgeRef.current) {
      tl.fromTo(
        badgeRef.current,
        {
          scale: 0,
          rotation: -90,
          opacity: 0
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        },
        "-=0.3"
      );
    }

    // Continuous overlay animation
    gsap.to(overlayRef.current, {
      backgroundPosition: "100% 100%",
      duration: 15,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

  }, []);

  // Stats animation on mount
  useEffect(() => {
    if (statsContainerRef.current) {
      const statElements = statsContainerRef.current.children;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            gsap.fromTo(statElements,
              {
                y: 60,
                opacity: 0,
                scale: 0.9
              },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1,
                stagger: 0.1,
                ease: "power2.out"
              }
            );

            setTimeout(() => {
              stats.forEach((stat, index) => {
                const obj = { value: 0 };
                gsap.to(obj, {
                  value: stat.value,
                  duration: 2.5,
                  ease: "power2.out",
                  onUpdate: () => {
                    setStatValues(prev => ({
                      ...prev,
                      [index]: obj.value
                    }));
                  }
                });
              });
            }, 300);

            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });

      if (statsContainerRef.current) {
        observer.observe(statsContainerRef.current);
      }

      return () => observer.disconnect();
    }
  }, [stats]);

  // Typing effect
  useEffect(() => {
    const currentText = slides[currentSlide].text;
    let index = 0;
    setTypedText("");
    setIsTyping(true);

    const typingInterval = setInterval(() => {
      if (index <= currentText.length) {
        setTypedText(currentText.slice(0, index));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 50);

    return () => clearInterval(typingInterval);
  }, [currentSlide, slides]);

  // Auto slide
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(slideInterval);
  }, [slides.length]);

  // Slide transition
  useEffect(() => {
    const tl = gsap.timeline();

    tl.to(imageRef.current, {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)",
      scale: 1.1,
      duration: 0.5,
      ease: "power2.in"
    })
      .to(overlayRef.current, {
        opacity: 0.4,
        duration: 0.5,
        ease: "power2.in"
      }, "-=0.5")
      .set(imageRef.current, {
        backgroundImage: `url(${slides[currentSlide].image})`
      })
      .to(imageRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        scale: 1,
        duration: 1.2,
        ease: "power3.out"
      })
      .to(overlayRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      }, "-=1")

      // Content animation
      .fromTo([textRef.current, subtextRef.current, badgeRef.current],
        {
          opacity: 0,
          y: 40,
          filter: "blur(10px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power2.out",
          stagger: 0.1
        },
        "-=0.6"
      );

    // Button animations
    buttonsRef.current.forEach((button, index) => {
      if (button) {
        gsap.fromTo(button,
          {
            opacity: 0,
            scale: 0.8,
            y: 20,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            delay: 0.4 + (index * 0.1),
            ease: "power2.out"
          }
        );
      }
    });

  }, [currentSlide, slides]);

  const handleExplore = () => {
    gsap.to(buttonsRef.current[0], {
      scale: 0.95,
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });

    setTimeout(() => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }, 200);
  };

  const handlePlayVideo = () => {
    gsap.to(buttonsRef.current[2], {
      scale: 0.9,
      rotation: 180,
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
  };

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const formatStatValue = (value, stat) => {
    if (stat.value >= 1000) {
      return Math.floor(value / 1000) + 'K' + stat.suffix;
    }
    return Math.floor(value) + stat.suffix;
  };

  return (
    <div className="relative w-full">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative w-full h-screen overflow-hidden"
        style={{ background: colors.darkBg }}
      >
        {/* Background Image */}
        <div
          ref={imageRef}
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url(${slides[0].image})`,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
          }}
        />

        {/* Gradient Overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              135deg,
              ${colors.primary}20 0%,
              ${colors.darkBg}90 40%,
              ${colors.secondary}25 70%,
              ${colors.primary}15 100%
            )`,
            backgroundSize: "200% 200%"
          }}
        />

        {/* Floating Elements */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            ref={(el) => (floatingElementsRef.current[i] = el)}
            className="absolute rounded-full opacity-30"
            style={{
              width: gsap.utils.random(6, 12),
              height: gsap.utils.random(6, 12),
              left: `${gsap.utils.random(0, 100)}%`,
              top: `${gsap.utils.random(0, 100)}%`,
              backgroundColor: i % 2 === 0 ? colors.primary : colors.secondary,
              filter: "blur(2px)"
            }}
          />
        ))}

        {/* Main Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8 lg:px-16">
          <div ref={contentRef} className="space-y-8 max-w-4xl w-full">

            {/* Badge */}
            <div ref={badgeRef} className="inline-flex items-center space-x-3 px-6 py-3 rounded-full backdrop-blur-md border-2 shadow-lg"
              style={{
                background: "rgba(255,255,255,0.15)",
                borderColor: colors.primary,
                boxShadow: `0 8px 32px ${colors.primary}30`
              }}>
              <FiStar className="text-yellow-400" size={18} />
              <span className="text-white text-sm font-bold tracking-wide">{slides[currentSlide].badge}</span>
            </div>

            {/* Main Heading */}
            <div ref={textRef} className="space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                <span
                  className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${colors.textLight}, #CBD5E1)`
                  }}
                >
                  {typedText}
                </span>
                <span
                  className="cursor ml-1"
                  style={{
                    color: colors.primary,
                    opacity: isTyping ? 1 : 0,
                    textShadow: `0 0 20px ${colors.primary}`
                  }}
                >|</span>
              </h1>
            </div>

            {/* Subtext */}
            <div ref={subtextRef} className="max-w-2xl">
              <p className="text-xl md:text-2xl text-gray-100 font-light leading-relaxed tracking-wide">
                {slides[currentSlide].subtext}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-2xl">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl backdrop-blur-md border border-white/20 hover:border-white/40 transition-all duration-300 group cursor-pointer hover:scale-105"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
                    }}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, {
                        y: -4,
                        duration: 0.3,
                        ease: "power2.out"
                      });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, {
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out"
                      });
                    }}
                  >
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <Icon size={20} style={{ color: feature.color }} />
                    </div>
                    <span className="text-white text-sm font-semibold">{feature.text}</span>
                  </div>
                );
              })}
            </div>

         
            
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20 backdrop-blur-md rounded-full p-2 bg-black/20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleSlideChange(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 ease-out ${currentSlide === index
                  ? "scale-125 shadow-lg"
                  : "bg-white/50 hover:bg-white/80"
                }`}
              style={{
                backgroundColor: currentSlide === index ? colors.primary : undefined
              }}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div
              className="w-1 h-3 rounded-full mt-2 animate-bounce"
              style={{ backgroundColor: colors.primary }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        className="relative py-16 px-6 sm:px-8 lg:px-16"
        style={{
          background: `linear-gradient(135deg, ${colors.lightBg} 0%, #F8FAFC 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-6"
              style={{
                background: `${colors.secondary}15`,
                color: colors.secondary
              }}>
              <FiAward size={18} />
              <span className="text-sm font-semibold">Trusted Experience</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${colors.darkBg}, ${colors.secondary})`
              }}>
              Why Travel With Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience India like never before with our carefully crafted journeys and personalized service
            </p>
          </div>

          <div
            ref={statsContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  ref={(el) => (statsRef.current[index] = el)}
                  className="text-center p-8 rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-100"
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      y: -8,
                      duration: 0.4,
                      ease: "power2.out"
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      y: 0,
                      duration: 0.4,
                      ease: "power2.out"
                    });
                  }}
                >
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500 group-hover:scale-110"
                    style={{
                      backgroundColor: `${colors.primary}10`,
                      border: `2px solid ${colors.primary}20`
                    }}
                  >
                    <Icon size={32} style={{ color: colors.primary }} />
                  </div>

                  <h3 className="text-5xl font-black mb-4" style={{ color: colors.darkBg }}>
                    {formatStatValue(statValues[index], stat)}
                  </h3>

                  <p className="text-lg font-semibold uppercase tracking-wider"
                    style={{ color: colors.secondary }}>
                    {stat.label}
                  </p>

                  <div
                    className="w-0 group-hover:w-16 h-1 rounded-full mx-auto mt-4 transition-all duration-500"
                    style={{ backgroundColor: colors.primary }}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* Authorized Travel Partner Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: `${colors.primary}15`,
                  color: colors.primary
                }}>
                <FiAward size={18} />
                <span className="text-sm font-semibold">Trusted & Authorized</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: colors.darkBg }}>
                Authorized Travel Partners
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Partnered with India's leading travel platforms for your convenience
              </p>
            </div>

            {/* Infinite Scrolling Logos */}
            <div className="relative overflow-hidden py-8">
              {/* Gradient Overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                style={{
                  background: `linear-gradient(to right, ${colors.lightBg}, transparent)`
                }}></div>
              <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none"
                style={{
                  background: `linear-gradient(to left, ${colors.lightBg}, transparent)`
                }}></div>

              {/* Scrolling Container */}
              <div className="flex animate-infinite-scroll">
                {/* First set of logos */}
                <div className="flex items-center space-x-12 px-6">
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/makemytrip-logo.webp" alt="MakeMyTrip" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/cleartrip.jpg" alt="Cleartrip" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/IRCTC_Logo.svg.png" alt="IRCTC" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/redbus-logo-png_seeklogo-347983.png" alt="RedBus" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/akbartravels-com-logo-png_seeklogo-314198.png" alt="Akbar Travels" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/emt-logo1.svg" alt="EMT" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/images (1).png" alt="Partner" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>

                {/* Duplicate set for seamless loop */}
                <div className="flex items-center space-x-12 px-6">
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/makemytrip-logo.webp" alt="MakeMyTrip" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/cleartrip.jpg" alt="Cleartrip" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/IRCTC_Logo.svg.png" alt="IRCTC" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/redbus-logo-png_seeklogo-347983.png" alt="RedBus" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/akbartravels-com-logo-png_seeklogo-314198.png" alt="Akbar Travels" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/emt-logo1.svg" alt="EMT" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="flex-shrink-0 w-56 h-32 flex items-center justify-center bg-white rounded-xl shadow-lg p-5">
                    <img src="/PartnersLogos/images (1).png" alt="Partner" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          
        </div>
      </div>
    </div>
  );
};

export default Hero;