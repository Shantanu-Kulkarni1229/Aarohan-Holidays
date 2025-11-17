import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, ArrowLeft, Eye, Play, Image as ImageIcon,
  Search, Filter, ChevronRight, X, ChevronLeft
} from 'lucide-react';
import axios from 'axios';
import { showApiError } from '../utils/toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HistoryPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  
  // States
  const [view, setView] = useState(identifier ? 'detail' : 'list');
  const [histories, setHistories] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const colors = {
    primary: '#1E9ABF',
    secondary: '#E66926',
    background: '#F8FAFC',
  };

  useEffect(() => {
    if (identifier) {
      fetchHistoryDetail(identifier);
      setView('detail');
    } else {
      setView('list');
    }
  }, [identifier]);

  useEffect(() => {
    if (view === 'list') {
      fetchHistories();
    }
  }, [currentPage, selectedLocation, searchTerm]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchHistories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 9,
        ...(selectedLocation !== 'all' && { location: selectedLocation }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await axios.get(`http://localhost:5000/api/history?${params}`);
      if (response.data.success) {
        setHistories(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      showApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryDetail = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/history/${id}`);
      if (response.data.success) {
        setSelectedHistory(response.data.data);
      }
    } catch (error) {
      showApiError(error);
      navigate('/history');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/history/locations');
      if (response.data.success) {
        setLocations(response.data.data);
      }
    } catch (error) {
      showApiError(error);
    }
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    if (selectedHistory && selectedHistory.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedHistory.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedHistory && selectedHistory.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedHistory.images.length - 1 : prev - 1
      );
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // History List View
  const HistoryListView = () => (
    <>
    <Navbar />
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-[#E66926] text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Historical Wonders</h1>
            <p className="text-xl opacity-90">
              Explore the rich history and cultural heritage of amazing destinations
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search historical sites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E66926] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E66926] focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* History Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : histories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {histories.map((history) => (
                <div
                  key={history._id}
                  onClick={() => navigate(`/history/${history.slug || history._id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-2"
                >
                  <div className="relative h-64 overflow-hidden bg-gray-700">
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
                    
                    <div className="absolute inset-0 bg-black/30">
                      <div className="absolute top-4 left-4">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-semibold text-white flex items-center gap-1"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <MapPin size={14} />
                          {history.location}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 flex gap-2">
                        {history.images && history.images.length > 1 && (
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-black/50 flex items-center gap-1">
                            <ImageIcon size={12} />
                            {history.images.length}
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
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#E66926] transition-colors">
                      {history.title}
                    </h3>
                    
                    <p className="text-gray-700 mb-4 line-clamp-3">
                      {truncateText(history.description, 120)}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye size={16} />
                        <span>{history.views || 0} views</span>
                      </div>
                      <ChevronRight size={20} className="text-[#E66926] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-[#E66926] text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <MapPin size={64} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No historical sites found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
    <Footer />
    </>
  );

  // History Detail View
  const HistoryDetailView = () => {
    if (!selectedHistory) return null;

    const embedUrl = getYouTubeEmbedUrl(selectedHistory.videoLink);

    return (
      <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          {selectedHistory.images && selectedHistory.images.length > 0 ? (
            <img
              src={selectedHistory.images[0]}
              alt={selectedHistory.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <ImageIcon size={128} className="text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50"></div>
          
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-4 pb-12">
              <button
                onClick={() => navigate('/history')}
                className="mb-6 flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to History
              </button>
              
              <div className="max-w-4xl">
                <div className="flex items-center gap-3 mb-4">
                  <span 
                    className="px-3 py-1 rounded-full text-sm font-semibold text-white flex items-center gap-1"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <MapPin size={16} />
                    {selectedHistory.location}
                  </span>
                  {selectedHistory.featured && (
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: colors.secondary }}
                    >
                      Featured
                    </span>
                  )}
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  {selectedHistory.title}
                </h1>
                
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-2">
                    <Eye size={18} />
                    <span>{selectedHistory.views || 0} views</span>
                  </div>
                  {selectedHistory.images && selectedHistory.images.length > 0 && (
                    <div className="flex items-center gap-2">
                      <ImageIcon size={18} />
                      <span>{selectedHistory.images.length} photos</span>
                    </div>
                  )}
                  {selectedHistory.videoLink && (
                    <div className="flex items-center gap-2">
                      <Play size={18} />
                      <span>Video available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {selectedHistory.description}
              </p>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">History & Details</h2>
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: selectedHistory.content.replace(/\n/g, '<br/>') }}
                />
              </div>
            </div>

            {/* Video Section */}
            {embedUrl && (
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Video Tour</h2>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src={embedUrl}
                    title="YouTube video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {selectedHistory.images && selectedHistory.images.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Photo Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedHistory.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => openLightbox(index)}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={image}
                        alt={`${selectedHistory.title} - ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && selectedHistory.images && (
          <div 
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLightbox();
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X size={32} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronLeft size={48} />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronRight size={48} />
            </button>
            
            <img
              src={selectedHistory.images[currentImageIndex]}
              alt={`${selectedHistory.title} - ${currentImageIndex + 1}`}
              className="max-w-[90%] max-h-[90%] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-lg">
              {currentImageIndex + 1} / {selectedHistory.images.length}
            </div>
          </div>
        )}
      </div>
      <Footer />
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E66926]"></div>
      </div>
    );
  }

  return view === 'detail' ? <HistoryDetailView /> : <HistoryListView />;
};

export default HistoryPage;