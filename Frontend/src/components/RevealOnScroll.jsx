import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const RevealOnScroll = ({ 
  children, 
  direction = 'up', // up, down, left, right, fade, scale, rotate
  delay = 0,
  duration = 1,
  className = '' 
}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Make visible immediately as fallback (prevents invisible components)
    const fallbackTimer = setTimeout(() => {
      if (!isVisible) {
        gsap.set(element, { opacity: 1, y: 0, x: 0, scale: 1, rotation: 0 });
        setIsVisible(true);
      }
    }, 1000); // Reduced to 1 second for faster fallback

    // Wait for Locomotive Scroll to initialize
    const initAnimation = () => {
      const scrollContainer = document.querySelector('[data-scroll-container]');

      // Initial state based on direction
      const initialState = {
        up: { y: 50, opacity: 0 },
        down: { y: -50, opacity: 0 },
        left: { x: 50, opacity: 0 },
        right: { x: -50, opacity: 0 },
        fade: { opacity: 0 },
        scale: { scale: 0.8, opacity: 0 },
        rotate: { rotation: 10, opacity: 0, scale: 0.9 },
      };

      // Final state
      const finalState = {
        y: 0,
        x: 0,
        opacity: 1,
        scale: 1,
        rotation: 0,
      };

      // Set initial state immediately
      gsap.set(element, initialState[direction] || initialState.up);

      // Then animate on scroll
      gsap.to(element, {
        ...finalState,
        scrollTrigger: {
          trigger: element,
          scroller: scrollContainer || window,
          start: 'top 98%', // Start even earlier - almost as soon as it enters viewport
          end: 'top 60%',
          toggleActions: 'play none none reverse',
          markers: false, // Set to true for debugging
          once: false, // Allow re-triggering
          invalidateOnRefresh: true,
          onEnter: () => {
            setIsVisible(true);
            clearTimeout(fallbackTimer); // Clear fallback if animation triggers
          },
          onRefresh: () => {
            // Refresh handler
          }
        },
        duration: duration,
        delay: delay,
        ease: 'power2.out',
      });
    };

    // Reduced delay for faster initialization
    const timeoutId = setTimeout(initAnimation, 200);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimer);
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [direction, delay, duration, isVisible]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

export default RevealOnScroll;
