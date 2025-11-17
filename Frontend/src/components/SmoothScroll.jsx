// src/components/SmoothScroll.jsx - Optimized for performance
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LocomotiveScroll from "locomotive-scroll";
import "locomotive-scroll/dist/locomotive-scroll.css";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }) {
  const scrollRef = useRef(null);
  const locoScrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      locoScrollRef.current = new LocomotiveScroll({
        el,
        smooth: true,
        smartphone: { smooth: false }, // Disable on mobile - critical for performance
        tablet: { smooth: false }, // Disable on tablet - critical for performance
        lerp: 0.08, // Optimized for smoother performance (was 0.1)
        multiplier: 1,
        class: 'is-revealed',
        reloadOnContextChange: false, // Changed to false for better performance
        resetNativeScroll: true,
      });

      const locoScroll = locoScrollRef.current;

      // Throttle scroll updates for better performance
      let ticking = false;
      locoScroll.on("scroll", () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            ScrollTrigger.update();
            ticking = false;
          });
          ticking = true;
        }
      });

      // Tell ScrollTrigger to use Locomotive Scroll
      ScrollTrigger.scrollerProxy(el, {
        scrollTop(value) {
          return arguments.length
            ? locoScroll.scrollTo(value, { duration: 0, disableLerp: true })
            : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
          return {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          };
        },
        pinType: el.style.transform ? "transform" : "fixed",
      });

      // Debounced resize handler for performance
      let resizeTimeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          locoScroll.update();
          ScrollTrigger.refresh();
        }, 150); // Debounce resize events
      };

      window.addEventListener('resize', handleResize, { passive: true });
      
      ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
      
      // Initial update with minimal delay
      setTimeout(() => {
        locoScroll.update();
        ScrollTrigger.refresh();
      }, 100);

      // Add additional updates to catch lazy-loaded content
      const additionalUpdates = [500, 1000, 2000, 3000];
      const updateTimers = additionalUpdates.map(delay => 
        setTimeout(() => {
          if (locoScrollRef.current) {
            locoScrollRef.current.update();
            ScrollTrigger.refresh();
          }
        }, delay)
      );

      // Cleanup
      return () => {
        updateTimers.forEach(timer => clearTimeout(timer));
        clearTimeout(resizeTimeout);
        window.removeEventListener('resize', handleResize);
        if (locoScrollRef.current) {
          locoScrollRef.current.destroy();
          locoScrollRef.current = null;
        }
        ScrollTrigger.getAll().forEach(t => t.kill());
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div 
      ref={scrollRef} 
      data-scroll-container
      style={{ 
        position: 'relative',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
}
