import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FaPlane, 
  FaMountain, 
  FaUmbrellaBeach, 
  FaCompass, 
  FaCamera, 
  FaHiking, 
  FaMapMarkedAlt, 
  FaSuitcase 
} from 'react-icons/fa';
import { GiCommercialAirplane, GiMountainRoad, GiPalmTree, GiCampfire } from 'react-icons/gi';

gsap.registerPlugin(ScrollTrigger);

const ScrollEffects = () => {
  const floatingElementsRef = useRef([]);
  const containerRef = useRef(null);

  // Creative floating elements that appear on scroll
  const floatingElements = [
    { Icon: FaPlane, color: '#3B82F6', size: 40, path: 'plane' },
    { Icon: GiCommercialAirplane, color: '#10B981', size: 45, path: 'plane2' },
    { Icon: FaMountain, color: '#8B5CF6', size: 38, path: 'mountain' },
    { Icon: FaUmbrellaBeach, color: '#F59E0B', size: 42, path: 'beach' },
    { Icon: FaCompass, color: '#EF4444', size: 36, path: 'compass' },
    { Icon: FaCamera, color: '#EC4899', size: 35, path: 'camera' },
    { Icon: FaHiking, color: '#14B8A6', size: 40, path: 'hiking' },
    { Icon: GiMountainRoad, color: '#6366F1', size: 44, path: 'road' },
    { Icon: GiPalmTree, color: '#22C55E', size: 38, path: 'palm' },
    { Icon: GiCampfire, color: '#F97316', size: 36, path: 'campfire' },
    { Icon: FaMapMarkedAlt, color: '#06B6D4', size: 37, path: 'map' },
    { Icon: FaSuitcase, color: '#A855F7', size: 34, path: 'suitcase' },
  ];

  useEffect(() => {
    // Wait for Locomotive Scroll to initialize
    const initAnimations = () => {
      const scrollContainer = document.querySelector('[data-scroll-container]');
      
      // Create floating travel elements with scroll-triggered animations
      floatingElementsRef.current.forEach((el, index) => {
        if (!el) return;

        const delay = index * 0.1;
        const duration = 2 + Math.random() * 2;

        // Parallax effect - works with or without Locomotive
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            scroller: scrollContainer || window,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
          y: -100 - (index * 20),
          rotation: 360,
          ease: 'none',
        });

        // Floating animation
        gsap.to(el, {
          y: '+=20',
          duration: duration,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: delay,
        });

        // Fade in on scroll
        gsap.fromTo(el,
          {
            opacity: 0,
            scale: 0,
          },
          {
            opacity: 0.2,
            scale: 1,
            scrollTrigger: {
              trigger: el,
              scroller: scrollContainer || window,
              start: 'top 80%',
              end: 'top 30%',
              toggleActions: 'play none none reverse',
            },
            duration: 1,
            ease: 'back.out(1.7)',
          }
        );

        // Horizontal movement based on scroll
        gsap.to(el, {
          x: Math.sin(index) * 50,
          scrollTrigger: {
            trigger: el,
            scroller: scrollContainer || window,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 2,
          },
          ease: 'none',
        });
      });
    };

    // Initialize after a delay to ensure Locomotive Scroll is ready
    const timeoutId = setTimeout(initAnimations, 1000);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Generate random positions for floating elements
  const getRandomPosition = (index) => {
    const positions = [
      { top: '10%', left: '5%' },
      { top: '15%', right: '8%' },
      { top: '25%', left: '12%' },
      { top: '35%', right: '6%' },
      { top: '45%', left: '8%' },
      { top: '55%', right: '10%' },
      { top: '65%', left: '6%' },
      { top: '75%', right: '12%' },
      { top: '20%', left: '90%' },
      { top: '40%', left: '3%' },
      { top: '60%', right: '4%' },
      { top: '80%', left: '15%' },
    ];
    return positions[index] || positions[0];
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ mixBlendMode: 'multiply' }}
    >
      {floatingElements.map((item, index) => {
        const position = getRandomPosition(index);
        const Icon = item.Icon;
        
        return (
          <div
            key={index}
            ref={el => floatingElementsRef.current[index] = el}
            className="absolute transition-opacity duration-500"
            style={{
              ...position,
              color: item.color,
              fontSize: `${item.size}px`,
              filter: 'blur(0.5px)',
              opacity: 0,
            }}
          >
            <Icon />
          </div>
        );
      })}
    </div>
  );
};

export default ScrollEffects;
