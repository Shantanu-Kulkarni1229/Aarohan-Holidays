import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ArrowRight, Eye, Play, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { showApiError } from '../utils/toast';

const History = () => {
  const navigate = useNavigate();
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchFeaturedHistories();
  }, []);

  // Infinite scroll animation
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || histories.length === 0) return;

    let animationFrameId;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Adjust speed (lower = slower)

    const animate = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition += scrollSpeed;
        
        // Reset scroll position when reaching the end of first set
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [histories, isPaused]);

  const fetchFeaturedHistories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/history/featured?limit=6');
      if (response.data.success) {
        setHistories(response.data.data);
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const HistoryCard = ({ history }) => (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      {/* Featured Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-600">
        {history.images && history.images.length > 0 ? (
          <img
            src={history.images[0]}
            alt={history.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={64} className="text-gray-400" />
          </div>
        )}
        
        {/* Overlay with badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div className="absolute top-4 left-4">
            <span 
              className="px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
              style={{ backgroundColor: '#1E9ABF' }}
            >
              <MapPin size={14} />
              {history.location}
            </span>
          </div>
          {history.featured && (
            <div className="absolute top-4 right-4">
              <span 
                className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: '#E66926' }}
              >
                Featured
              </span>
            </div>
          )}
          
          {/* Media indicators */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            {history.images && history.images.length > 1 && (
              <span className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-black/50 flex items-center gap-1">
                <ImageIcon size={12} />
                {history.images.length} photos
              </span>
            )}
            {history.videoLink && (
              <span className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-black/50 flex items-center gap-1">
                <Play size={12} />
                Video
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#1E9ABF] transition-colors">
          {history.title}
        </h3>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">
          {truncateText(history.description, 150)}
        </p>

        {/* Stats and Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Eye size={16} />
            <span>{history.views || 0} views</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/history/${history.slug || history._id}`);
            }}
            className="flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#E66926' }}
          >
            Explore
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="py-20 bg-gradient-to-br from-orange-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Historical Wonders</h2>
            <p className="text-gray-600">Loading amazing stories from the past...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gradient-to-br from-orange-50 via-white to-blue-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Historical Wonders
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover the rich history and cultural heritage of breathtaking destinations
          </p>
        </div>

        {/* Infinite Horizontal Scroll */}
        {histories.length > 0 ? (
          <>
            <div 
              ref={scrollContainerRef}
              className="flex gap-8 mb-12 overflow-x-hidden"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Duplicate histories for seamless infinite scroll */}
              {[...histories, ...histories].map((history, index) => (
                <div key={`${history._id}-${index}`} className="flex-shrink-0 w-[400px]">
                  <HistoryCard history={history} />
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button
                onClick={() => navigate('/history')}
                className="px-8 py-4 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #E66926 0%, #1E9ABF 100%)'
                }}
              >
                Explore All Historical Sites
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No historical content available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;