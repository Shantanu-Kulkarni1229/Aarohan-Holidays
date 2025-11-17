import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, Heart, Share2 } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Register GSAP plugin
gsap.registerPlugin(ScrollToPlugin);

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [columns, setColumns] = useState(4);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [showBackToTop, setShowBackToTop] = useState(false);
  const galleryRef = useRef(null);
  const modalRef = useRef(null);
  const headerRef = useRef(null);
  const backToTopRef = useRef(null);

  // Generate array of all images from public folder (16-118)
  const allImages = Array.from({ length: 103 }, (_, i) => {
    const num = i + 16;
    return `/IMG-20251020-WA0${num.toString().padStart(3, '0')}.jpg`;
  });

  // Filter out images that failed to load
  const images = allImages.filter(img => !imageLoadErrors.has(img));

  // Handle image load errors
  const handleImageError = useCallback((imagePath) => {
    setImageLoadErrors(prev => new Set([...prev, imagePath]));
  }, []);

  // Responsive columns based on screen size
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) setColumns(1);
      else if (window.innerWidth < 768) setColumns(2);
      else if (window.innerWidth < 1024) setColumns(3);
      else if (window.innerWidth < 1280) setColumns(4);
      else setColumns(5);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Entrance animation
  useEffect(() => {
    if (galleryRef.current && !isLoading) {
      const items = galleryRef.current.querySelectorAll('.gallery-item');
      
      gsap.fromTo(
        items,
        { 
          opacity: 0, 
          y: 60,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: {
            amount: 0.6,
            from: "random"
          },
          ease: "power3.out",
          clearProps: "all"
        }
      );
    }
  }, [isLoading, columns]);

  // Header animation
  useEffect(() => {
    if (headerRef.current && !isLoading) {
      const timeline = gsap.timeline();
      
      timeline.fromTo(
        headerRef.current.querySelector('h1'),
        { opacity: 0, y: -50, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: "back.out(1.7)" }
      );
      
      timeline.fromTo(
        headerRef.current.querySelector('p'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      );
    }
  }, [isLoading]);

  // Modal animation
  useEffect(() => {
    if (selectedImage && modalRef.current) {
      const timeline = gsap.timeline();
      
      // Animate backdrop
      timeline.fromTo(
        '.modal-backdrop',
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      
      // Animate image container
      timeline.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.8, y: 50 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.2"
      );
      
      // Animate controls
      timeline.fromTo(
        '.modal-control',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.7)" },
        "-=0.3"
      );
    }
  }, [selectedImage]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 400;
      
      if (shouldShow !== showBackToTop) {
        setShowBackToTop(shouldShow);
        
        if (backToTopRef.current) {
          if (shouldShow) {
            gsap.to(backToTopRef.current, {
              scale: 1,
              opacity: 1,
              duration: 0.4,
              ease: "back.out(1.7)"
            });
          } else {
            gsap.to(backToTopRef.current, {
              scale: 0,
              opacity: 0,
              duration: 0.3,
              ease: "power2.in"
            });
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showBackToTop]);

  // Open image modal
  const openImage = useCallback((image, index) => {
    // Scroll to top IMMEDIATELY (before setting state)
    window.scrollTo({ top: 0, behavior: 'auto' }); // Changed to 'auto' for instant scroll
    
    setSelectedImage(image);
    setCurrentIndex(index);
    document.body.style.overflow = 'hidden';
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    // Animate out before closing
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          setSelectedImage(null);
          setCurrentIndex(0);
          document.body.style.overflow = 'auto';
        }
      });
    } else {
      setSelectedImage(null);
      setCurrentIndex(0);
      document.body.style.overflow = 'auto';
    }
  }, []);

  // Navigate images
  const navigateImage = useCallback((direction) => {
    let newIndex = currentIndex + direction;
    
    // Loop around
    if (newIndex < 0) newIndex = images.length - 1;
    if (newIndex >= images.length) newIndex = 0;
    
    setCurrentIndex(newIndex);
    setSelectedImage(images[newIndex]);
  }, [currentIndex, images]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowLeft') navigateImage(-1);
      else if (e.key === 'ArrowRight') navigateImage(1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, closeModal, navigateImage]);

  // Random height generator for Pinterest layout - more variation
  const getRandomHeight = (index) => {
    const heights = ['280px', '320px', '380px', '260px', '340px', '300px', '360px', '290px'];
    return heights[index % heights.length];
  };

  // Add hover animation to gallery items
  const handleItemHover = (e, isEntering) => {
    const item = e.currentTarget;
    
    if (isEntering) {
      gsap.to(item, {
        y: -8,
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
        duration: 0.4,
        ease: "power2.out"
      });
    } else {
      gsap.to(item, {
        y: 0,
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        duration: 0.4,
        ease: "power2.out"
      });
    }
  };

  // Distribute images into columns for masonry layout
  const distributeImages = () => {
    const cols = Array.from({ length: columns }, () => []);
    images.forEach((image, index) => {
      const shortestCol = cols.reduce((acc, col, i) => 
        col.length < cols[acc].length ? i : acc, 0
      );
      cols[shortestCol].push({ image, index });
    });
    return cols;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading Gallery...</p>
        </div>
      </div>
    );
  }

  const columnData = distributeImages();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Header - Cleaner design */}
        <div ref={headerRef} className="max-w-7xl mx-auto mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Visual Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Immerse yourself in a curated collection of breathtaking moments and stunning visuals
          </p>
        </div>

        {/* Masonry Gallery - Improved spacing and design */}
        <div 
          ref={galleryRef}
          className="max-w-7xl mx-auto"
        >
          <div className="flex gap-6">
            {columnData.map((column, colIndex) => (
              <div key={colIndex} className="flex-1 flex flex-col gap-6">
                {column.map(({ image, index }) => (
                  <div
                    key={`${image}-${index}`}
                    className="gallery-item group relative overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white"
                    style={{ height: getRandomHeight(index) }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openImage(image, index);
                    }}
                    onMouseEnter={(e) => handleItemHover(e, true)}
                    onMouseLeave={(e) => handleItemHover(e, false)}
                  >
                    <img
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      loading="lazy"
                      onError={(e) => {
                        handleImageError(image);
                        e.target.style.display = 'none';
                      }}
                    />
                    
                    {/* Enhanced overlay with better styling */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button className="p-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-110">
                              <Heart className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-110">
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-lg px-4 py-2 rounded-xl">
                            <ZoomIn className="w-5 h-5" />
                            <span className="text-sm font-medium">Explore</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Image Modal - Always at top with better layout */}
        {selectedImage && (
          <div 
            className="modal-backdrop fixed inset-0 bg-black/95 z-50 flex flex-col"
            onClick={(e) => {
              e.stopPropagation();
              closeModal();
            }}
          >
            {/* Top Controls Bar */}
            <div className="w-full p-6 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent z-20">
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeModal();
                  }}
                  className="modal-control p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 group"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                </button>
                
                <div className="text-white text-lg font-medium">
                  {currentIndex + 1} of {images.length}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = selectedImage;
                    link.download = `gallery-image-${currentIndex + 1}.jpg`;
                    link.click();
                  }}
                  className="modal-control p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 group"
                  aria-label="Download"
                >
                  <Download className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" />
                </button>
                
                <button className="modal-control p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300">
                  <Heart className="w-6 h-6 text-white" />
                </button>
                
                <button className="modal-control p-3 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300">
                  <Share2 className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Main Image Container - Centered and large */}
            <div 
              ref={modalRef}
              className="flex-1 flex items-center justify-center p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
                {/* Previous Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage(-1);
                  }}
                  className="modal-control absolute left-4 z-20 p-5 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 group"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-8 h-8 text-white group-hover:-translate-x-1 transition-transform duration-300" />
                </button>

                {/* Image */}
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt={`Gallery ${currentIndex + 1}`}
                    className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>

                {/* Next Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateImage(1);
                  }}
                  className="modal-control absolute right-4 z-20 p-5 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition-all duration-300 group"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-8 h-8 text-white group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Bottom Navigation Preview */}
            <div className="w-full p-6 bg-gradient-to-t from-black/50 to-transparent">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-3 overflow-x-auto py-2">
                  {images.slice(Math.max(0, currentIndex - 3), Math.min(images.length, currentIndex + 4)).map((image, index) => {
                    const actualIndex = Math.max(0, currentIndex - 3) + index;
                    return (
                      <img
                        key={actualIndex}
                        src={image}
                        alt={`Thumbnail ${actualIndex + 1}`}
                        className={`w-16 h-16 object-cover rounded-lg cursor-pointer transition-all duration-300 ${
                          actualIndex === currentIndex 
                            ? 'ring-4 ring-blue-500 scale-110' 
                            : 'opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentIndex(actualIndex);
                          setSelectedImage(image);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back to Top Button */}
        <button
          ref={backToTopRef}
          onClick={() => {
            gsap.to(window, {
              scrollTo: { y: 0 },
              duration: 1,
              ease: "power3.inOut"
            });
          }}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl shadow-2xl hover:scale-110 transition-transform duration-300 z-40 backdrop-blur-md"
          style={{ transform: 'scale(0)', opacity: 0 }}
          aria-label="Back to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
      <Footer />
    </>
  );
};

export default Gallery;