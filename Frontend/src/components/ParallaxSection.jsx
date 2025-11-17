import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ParallaxSection = ({ children, speed = 1, className = '' }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Parallax scroll effect
    gsap.to(element, {
      y: -100 * speed,
      scrollTrigger: {
        trigger: element,
        scroller: '[data-scroll-container]',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
      ease: 'none',
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [speed]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default ParallaxSection;
