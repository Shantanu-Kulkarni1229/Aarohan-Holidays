// src/components/SimpleSmoothScroll.jsx
import { useEffect } from "react";

export default function SimpleSmoothScroll({ children }) {
  useEffect(() => {
    // Simple CSS-based smooth scroll
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Optional: Add slight momentum scrolling effect
    let isScrolling = false;
    let scrollTimeout;

    const handleScroll = () => {
      if (!isScrolling) {
        isScrolling = true;
        document.body.style.pointerEvents = 'none';
      }

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.body.style.pointerEvents = 'auto';
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.pointerEvents = 'auto';
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return <>{children}</>;
}
