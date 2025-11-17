import { useEffect, useRef, useState, useMemo } from 'react';
import { FaPlane, FaMountain, FaMapMarkerAlt, FaCompass } from 'react-icons/fa';
import { GiCommercialAirplane, GiMountainRoad } from 'react-icons/gi';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorDotRef = useRef(null);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Travel-themed icons for cursor (memoized to prevent recreation)
  const travelIcons = useMemo(() => [
    { Icon: FaPlane, color: '#3B82F6', name: 'plane' },
    { Icon: GiCommercialAirplane, color: '#10B981', name: 'jet' },
    { Icon: FaMountain, color: '#8B5CF6', name: 'mountain' },
    { Icon: GiMountainRoad, color: '#F59E0B', name: 'trek' },
    { Icon: FaMapMarkerAlt, color: '#EF4444', name: 'location' },
    { Icon: FaCompass, color: '#EC4899', name: 'compass' },
  ], []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const cursorDot = cursorDotRef.current;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Update mouse position
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Update dot position immediately
      if (cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
      }

      // Create trail effect
      createTrail(mouseX, mouseY);
    };

    // Smooth cursor follow
    const animateCursor = () => {
      const speed = 0.15;
      
      cursorX += (mouseX - cursorX) * speed;
      cursorY += (mouseY - cursorY) * speed;

      if (cursor) {
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
      }

      requestAnimationFrame(animateCursor);
    };

    // Create trail particles
    const createTrail = (x, y) => {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      trail.style.left = `${x}px`;
      trail.style.top = `${y}px`;
      trail.style.backgroundColor = travelIcons[currentIcon].color;
      document.body.appendChild(trail);

      setTimeout(() => {
        trail.remove();
      }, 500);
    };

    // Detect hoverable elements
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    // Add hover detection to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, select, [role="button"], .hover-effect'
    );

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    // Change icon periodically
    const iconInterval = setInterval(() => {
      setCurrentIcon(prev => (prev + 1) % travelIcons.length);
    }, 3000);

    // Start animations
    window.addEventListener('mousemove', handleMouseMove);
    animateCursor();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(iconInterval);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [currentIcon, travelIcons]);

  const CurrentIcon = travelIcons[currentIcon].Icon;
  const iconColor = travelIcons[currentIcon].color;

  return (
    <>
      {/* Custom Cursor Styles */}
      <style>{`
        body, body * {
          cursor: none !important;
        }

        .custom-cursor {
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          mix-blend-mode: difference;
          transition: transform 0.2s ease;
        }

        .custom-cursor.hovering {
          transform: scale(1.5);
        }

        .cursor-dot {
          position: fixed;
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          mix-blend-mode: difference;
        }

        .cursor-trail {
          position: fixed;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9998;
          transform: translate(-50%, -50%);
          opacity: 0.6;
          animation: trailFade 0.5s ease-out forwards;
        }

        @keyframes trailFade {
          0% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
        }

        /* Pulse animation */
        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        .cursor-icon {
          animation: pulse 2s ease-in-out infinite;
        }

        /* Hide default cursor */
        body, body * {
          cursor: none !important;
        }

        /* Glow effect */
        .cursor-glow {
          position: fixed;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9997;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }
      `}</style>

      {/* Main Cursor with Icon */}
      <div
        ref={cursorRef}
        className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className="cursor-icon"
          style={{
            color: iconColor,
            fontSize: isHovering ? '32px' : '24px',
            filter: `drop-shadow(0 0 8px ${iconColor})`,
            transition: 'all 0.3s ease',
          }}
        >
          <CurrentIcon />
        </div>
      </div>

      {/* Center Dot */}
      <div ref={cursorDotRef} className="cursor-dot" />

      {/* Glow Effect */}
      <div
        className="cursor-glow"
        style={{
          left: '0px',
          top: '0px',
          background: `radial-gradient(circle, ${iconColor}40 0%, transparent 70%)`,
        }}
      />
    </>
  );
};

export default CustomCursor;
