import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * StaggerCards - Animates cards with stagger effect on scroll
 * Wraps children and applies scroll-triggered stagger animations
 */
const StaggerCards = ({ 
  children, 
  stagger = 0.1,
  direction = 'up', // up, down, left, right, scale, rotate
  className = '' 
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cards = container.querySelectorAll('.stagger-card');
    
    if (cards.length === 0) return;

    const animations = {
      up: { y: 80, opacity: 0 },
      down: { y: -80, opacity: 0 },
      left: { x: -80, opacity: 0 },
      right: { x: 80, opacity: 0 },
      scale: { scale: 0.8, opacity: 0 },
      rotate: { rotation: -15, scale: 0.9, opacity: 0 },
    };

    gsap.fromTo(
      cards,
      animations[direction] || animations.up,
      {
        y: 0,
        x: 0,
        scale: 1,
        rotation: 0,
        opacity: 1,
        stagger: stagger,
        scrollTrigger: {
          trigger: container,
          scroller: '[data-scroll-container]',
          start: 'top 80%',
          end: 'top 30%',
          toggleActions: 'play none none reverse',
        },
        duration: 0.8,
        ease: 'power3.out',
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === container) {
          trigger.kill();
        }
      });
    };
  }, [stagger, direction, children]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default StaggerCards;
