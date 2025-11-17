import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * MagneticElement - Creates a magnetic hover effect
 * Element follows mouse cursor with smooth animation
 */
const MagneticElement = ({ 
  children, 
  strength = 0.3,
  className = '' 
}) => {
  const elementRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseMove = (e) => {
      if (!isHovering) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.5,
        ease: 'power3.out',
      });
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
      gsap.to(element, {
        scale: 1.05,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      gsap.to(element, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovering, strength]);

  return (
    <div 
      ref={elementRef} 
      className={`magnetic-element ${className}`}
      style={{ cursor: 'pointer' }}
    >
      {children}
    </div>
  );
};

export default MagneticElement;
