import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaPlane } from 'react-icons/fa';

gsap.registerPlugin(ScrollTrigger);

const ScrollProgress = () => {
  const progressBarRef = useRef(null);
  const planeRef = useRef(null);

  useEffect(() => {
    // Wait for Locomotive Scroll
    const initProgress = () => {
      const scrollContainer = document.querySelector('[data-scroll-container]');
      
      if (!scrollContainer) {
        // Using window for scroll tracking
        return;
      }

      // Update progress on scroll
      const updateProgress = () => {
        const scrollTop = scrollContainer.scrollTop || 0;
        const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;

        // Animate progress bar
        if (progressBarRef.current) {
          gsap.to(progressBarRef.current, {
            scaleX: progress / 100,
            duration: 0.1,
            ease: 'none',
          });
        }

        // Animate plane
        if (planeRef.current) {
          gsap.to(planeRef.current, {
            x: (progress / 100) * (window.innerWidth - 60),
            rotation: progress < 50 ? 0 : 10,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      };

      scrollContainer.addEventListener('scroll', updateProgress);

      return () => {
        scrollContainer.removeEventListener('scroll', updateProgress);
      };
    };

    const timeoutId = setTimeout(initProgress, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div
          ref={progressBarRef}
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 origin-left"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Flying Plane Progress Indicator */}
      <div
        ref={planeRef}
        className="fixed top-4 left-0 text-blue-600 z-50 transition-all duration-300"
        style={{
          fontSize: '24px',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
      >
        <FaPlane />
      </div>
    </>
  );
};

export default ScrollProgress;
