import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * TextReveal - Reveals text with creative animations
 * Supports word-by-word, char-by-char, and line-by-line reveals
 */
const TextReveal = ({ 
  children, 
  type = 'words', // words, chars, lines
  stagger = 0.05,
  duration = 0.8,
  className = '',
  delay = 0
}) => {
  const textRef = useRef(null);

  useEffect(() => {
    const element = textRef.current;
    if (!element) return;

    // Simple split by spaces for words (avoiding SplitText plugin issues)
    const text = element.textContent;
    element.innerHTML = '';

    if (type === 'words') {
      const words = text.split(' ');
      words.forEach((word, index) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.className = 'reveal-word';
        element.appendChild(span);
        
        if (index < words.length - 1) {
          element.appendChild(document.createTextNode(' '));
        }
      });
    } else if (type === 'chars') {
      const chars = text.split('');
      chars.forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.className = 'reveal-char';
        element.appendChild(span);
      });
    }

    const revealElements = element.querySelectorAll('.reveal-word, .reveal-char');

    gsap.fromTo(
      revealElements,
      {
        y: 50,
        opacity: 0,
        rotationX: -90,
      },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        stagger: stagger,
        duration: duration,
        delay: delay,
        scrollTrigger: {
          trigger: element,
          scroller: '[data-scroll-container]',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        ease: 'power3.out',
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === element) {
          trigger.kill();
        }
      });
    };
  }, [type, stagger, duration, delay]);

  return (
    <div 
      ref={textRef} 
      className={className}
      style={{ 
        perspective: '1000px',
        display: 'inline-block'
      }}
    >
      {children}
    </div>
  );
};

export default TextReveal;
