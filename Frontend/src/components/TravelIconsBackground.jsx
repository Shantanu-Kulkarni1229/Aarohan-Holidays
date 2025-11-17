import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  FaPlane, 
  FaMapMarkerAlt, 
  FaCompass, 
  FaSuitcaseRolling,
  FaCamera,
  FaPassport,
  FaTicketAlt,
  FaHotel
} from 'react-icons/fa';
import { 
  GiMountainRoad, 
  GiForestCamp, 
  GiCommercialAirplane,
  GiIsland,
  GiCampfire
} from 'react-icons/gi';

gsap.registerPlugin(ScrollTrigger);

const TravelIconsBackground = () => {
  const iconsRef = useRef([]);
  const containerRef = useRef(null);

  const travelIcons = [
    { Icon: FaPlane, color: '#3B82F6', delay: 0 },
    { Icon: GiCommercialAirplane, color: '#8B5CF6', delay: 0.5 },
    { Icon: FaMapMarkerAlt, color: '#EF4444', delay: 1 },
    { Icon: FaCompass, color: '#10B981', delay: 1.5 },
    { Icon: FaSuitcaseRolling, color: '#F59E0B', delay: 2 },
    { Icon: FaCamera, color: '#EC4899', delay: 2.5 },
    { Icon: GiMountainRoad, color: '#6366F1', delay: 3 },
    { Icon: GiForestCamp, color: '#14B8A6', delay: 3.5 },
    { Icon: FaPassport, color: '#A855F7', delay: 4 },
    { Icon: FaTicketAlt, color: '#22C55E', delay: 4.5 },
    { Icon: GiIsland, color: '#06B6D4', delay: 5 },
    { Icon: FaHotel, color: '#F97316', delay: 5.5 },
    { Icon: GiCampfire, color: '#DC2626', delay: 6 },
  ];

  useEffect(() => {
    iconsRef.current.forEach((icon, index) => {
      if (!icon) return;

      // Floating animation
      gsap.to(icon, {
        y: `+=${15 + Math.random() * 10}`,
        x: `+=${10 + Math.random() * 5}`,
        rotation: `+=${5 + Math.random() * 10}`,
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: travelIcons[index].delay * 0.2,
      });

      // Scroll-triggered parallax
      gsap.to(icon, {
        y: -150 - (index * 15),
        scrollTrigger: {
          trigger: icon,
          scroller: '[data-scroll-container]',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
        ease: 'none',
      });

      // Scale pulse animation
      gsap.to(icon, {
        scale: 1.1,
        duration: 2 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: index * 0.3,
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const getPosition = (index) => {
    const positions = [
      { top: '5%', left: '5%' },
      { top: '8%', right: '10%' },
      { top: '20%', left: '15%' },
      { top: '25%', right: '5%' },
      { top: '40%', left: '8%' },
      { top: '45%', right: '12%' },
      { top: '60%', left: '10%' },
      { top: '65%', right: '8%' },
      { top: '75%', left: '6%' },
      { top: '80%', right: '15%' },
      { top: '90%', left: '12%' },
      { top: '92%', right: '6%' },
      { top: '95%', left: '20%' },
    ];
    return positions[index % positions.length];
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      {travelIcons.map((item, index) => {
        const position = getPosition(index);
        const Icon = item.Icon;
        
        return (
          <div
            key={index}
            ref={el => iconsRef.current[index] = el}
            className="absolute transition-all duration-300"
            style={{
              ...position,
              color: item.color,
              fontSize: `${35 + Math.random() * 15}px`,
              opacity: 0.08,
              filter: 'blur(0.3px)',
            }}
          >
            <Icon />
          </div>
        );
      })}
    </div>
  );
};

export default TravelIconsBackground;
