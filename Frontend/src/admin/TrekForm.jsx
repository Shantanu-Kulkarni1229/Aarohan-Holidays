import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../api/api';
import { showSuccess, showError } from '../utils/toast';
import RichTextEditor from '../components/RichTextEditor';
import {
  ArrowLeft, Info, Mountain, ImageIcon, Star, DollarSign,
  Calendar, HelpCircle, TrendingUp, Users, MapPin, Save,
  Upload, X, AlertCircle, CheckCircle, Plus
} from 'lucide-react';

const TrekForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('basic');

  // Form data state
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    location: '',
    duration: '',
    
    // Categories and Types
    category: 'Himalayan Trek',
    regionType: 'Domestic',
    specialType: 'None',
    difficulty: 'Moderate',
    fitnessLevel: 'Beginner',
    
    // Trek Specific
    altitude: 0,
    videoLink: '',
    
    // Arrays
    highlights: [''],
    availableDates: [''],
    faqs: [{ question: '', answer: '' }],
    cityPricing: [{ city: '', pricingOptions: [{ categoryName: '', price: '' }] }],
    
    // NEW: Itinerary with note and activities
    itinerary: [{ day: 1, title: '', description: '', meals: '', accommodation: '', note: '', activities: [] }],
    
    // NEW: Inclusions and Exclusions
    inclusions: [''],
    exclusions: [''],
    
    // Add-ons and Facilities
    addOns: [{ name: '', price: '', description: '' }],
    addonFacilities: [{ header: '', subPoints: [''] }],
    
    // Numbers
    maxGroupSize: 15,
    totalBookings: 0,
    rating: 0,
    
    // Booleans
    isActive: true,
    isFeatured: false,
    isFixedDeparture: false,
    isOnlyFixedDeparture: false // Only show as fixed departure
  });

  // File states
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [showcaseFiles, setShowcaseFiles] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [showcasePreviews, setShowcasePreviews] = useState([]);

  // Section navigation
  const sections = [
    { id: 'basic', name: 'Basic Info', icon: Info },
    { id: 'categories', name: 'Categories', icon: Mountain },
    { id: 'images', name: 'Media', icon: ImageIcon },
    { id: 'highlights', name: 'Highlights', icon: Star },
    { id: 'itinerary', name: 'Itinerary', icon: Calendar },
    { id: 'inclusions', name: 'Inclusions/Exclusions', icon: CheckCircle },
    { id: 'pricing', name: 'Pricing', icon: DollarSign },
    { id: 'addons', name: 'Add-ons', icon: Plus },
    { id: 'facilities', name: 'Facilities', icon: CheckCircle },
    { id: 'dates', name: 'Dates', icon: Calendar },
    { id: 'faqs', name: 'FAQs', icon: HelpCircle }
  ];

  // Load trek data for edit
  useEffect(() => {
    if (isEdit && id) {
      loadTrekData(id);
    }
  }, [isEdit, id]);

  // Cleanup object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      showcasePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [thumbnailPreview, showcasePreviews]);

  const loadTrekData = async (trekId) => {
    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.treks.getById(trekId);
      if (response.data.success) {
        const trek = response.data.data;
        setFormData({
          ...trek,
          availableDates: trek.availableDates?.map(date => new Date(date).toISOString().split('T')[0]) || [''],
          highlights: trek.highlights?.length > 0 ? trek.highlights : [''],
          faqs: trek.faqs?.length > 0 ? trek.faqs : [{ question: '', answer: '' }],
          cityPricing: trek.cityPricing?.length > 0 ? trek.cityPricing : [{ city: '', adultPrice: '', womenPrice: '', childrenPrice: '', infantPrice: '' }],
          // NEW: Load itinerary with note and activities support
          itinerary: trek.itinerary?.length > 0 ? trek.itinerary.map(item => ({
            ...item,
            note: item.note || '',
            activities: item.activities || []
          })) : [{ day: 1, title: '', description: '', meals: '', accommodation: '', note: '', activities: [] }],
          // NEW: Load inclusions and exclusions
          inclusions: trek.inclusions?.length > 0 ? trek.inclusions : [''],
          exclusions: trek.exclusions?.length > 0 ? trek.exclusions : ['']
        });
        
        // Set existing image previews
        if (trek.thumbnail) {
          setThumbnailPreview(trek.thumbnail);
        }
        if (trek.showcaseImages && trek.showcaseImages.length > 0) {
          setShowcasePreviews(trek.showcaseImages);
        }
      } else {
        setError('❌ Failed to load trek data: ' + response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      setError(`❌ Failed to load trek data: ${errorMessage}`);
      showError(`Failed to load trek data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle basic input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle array field changes
  const handleArrayChange = (fieldName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  // Handle object array changes (cityPricing, faqs)
  const handleObjectArrayChange = (fieldName, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }));
  };

  // Add array item
  const addArrayItem = (fieldName, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], defaultValue]
    }));
  };

  // Remove array item
  const removeArrayItem = (fieldName, index) => {
    if (formData[fieldName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    }
  };

  // Handle file uploads
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke previous URL
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleShowcaseChange = (e) => {
    const files = Array.from(e.target.files);
    const currentCount = showcaseFiles.length;
    
    if (currentCount + files.length > 5) {
      setError('Maximum 5 showcase images allowed');
      return;
    }

    setShowcaseFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setShowcasePreviews(prev => [...prev, ...newPreviews]);
  };

  // Clean and validate form data
  const cleanFormData = () => {
    return {
      ...formData,
      highlights: formData.highlights.filter(h => h.trim()),
      availableDates: formData.availableDates.filter(d => d.trim()),
      // Filter out empty city pricing entries (optional - can be empty array)
      cityPricing: formData.cityPricing
        .filter(cp => cp.city.trim() && cp.pricingOptions && cp.pricingOptions.length > 0)
        .map(cp => ({
          city: cp.city.trim(),
          pricingOptions: cp.pricingOptions.filter(opt => opt.categoryName.trim() && opt.price)
        }))
        .filter(cp => cp.pricingOptions.length > 0), // Remove cities with no valid pricing options
      // Filter out empty add-ons
      addOns: formData.addOns.filter(addon => addon.name.trim() && addon.price),
      // Filter out empty addon facilities
      addonFacilities: formData.addonFacilities
        .filter(facility => facility.header.trim() && facility.subPoints && facility.subPoints.length > 0)
        .map(facility => ({
          header: facility.header.trim(),
          subPoints: facility.subPoints.filter(sp => sp.trim())
        }))
        .filter(facility => facility.subPoints.length > 0),
      faqs: formData.faqs.filter(faq => faq.question.trim() && faq.answer.trim()),
      // Clean itinerary data
      itinerary: formData.itinerary.filter(day => 
        day.title.trim() && day.description.trim()
      ).map(day => ({
        ...day,
        activities: (day.activities || []).filter(a => a && a.trim())
      })),
      // Clean inclusions and exclusions
      inclusions: formData.inclusions.filter(i => i.trim()),
      exclusions: formData.exclusions.filter(e => e.trim()),
      maxGroupSize: Number(formData.maxGroupSize),
      altitude: Number(formData.altitude),
      videoLink: formData.videoLink.trim()
    };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Trek name is required');
      return;
    }
    // Strip HTML tags for description validation
    const descriptionText = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!descriptionText || descriptionText.length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!formData.duration.trim()) {
      setError('Duration is required');
      return;
    }
    
    if (!isEdit && !thumbnailFile) {
      setError('Thumbnail image is required for new treks');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const submitFormData = new FormData();
      const cleanedData = cleanFormData();

      // Add basic fields
      Object.keys(cleanedData).forEach(key => {
        if (Array.isArray(cleanedData[key])) {
          if (cleanedData[key].length > 0) {
            submitFormData.append(key, JSON.stringify(cleanedData[key]));
          }
        } else if (cleanedData[key] !== null && cleanedData[key] !== undefined) {
          submitFormData.append(key, cleanedData[key]);
        }
      });

      // Add files
      if (thumbnailFile) {
        submitFormData.append('thumbnail', thumbnailFile);
      }
      
      if (showcaseFiles.length > 0) {
        showcaseFiles.forEach((file) => {
          submitFormData.append('showcaseImages', file);
        });
      }

      let response;
      if (isEdit) {
        response = await adminAPI.treks.update(id, submitFormData);
        if (response.data?.success) {
          setSuccess('Trek updated successfully!');
          setTimeout(() => {
            navigate('/admin/treks');
          }, 2000);
        } else {
          throw new Error(response.data?.message || 'Failed to update trek');
        }
      } else {
        response = await adminAPI.treks.create(submitFormData);
        if (response.data?.success) {
          setSuccess('Trek created successfully!');
          setTimeout(() => {
            navigate('/admin/treks');
          }, 2000);
        } else {
          throw new Error(response.data?.message || 'Failed to create trek');
        }
      }
    } catch (error) {
      
      let errorMessage = 'Error saving trek: ';
      
      // Check for timeout error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Upload timeout. This can happen with large images. Try: 1) Reduce image sizes (compress before upload), 2) Upload fewer showcase images at once, or 3) Check your internet connection.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Trek Data</h2>
          <p className="text-gray-600">Please wait while we load the trek information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <button
              onClick={() => navigate('/admin/treks')}
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 transition-all transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Treks
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isEdit ? 'Edit Trek Package' : 'Create New Trek'}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {isEdit 
                  ? 'Update and refine your trek details to provide the best experience' 
                  : 'Craft an amazing trek experience for adventurers'
                }
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3">
            <div className="flex items-center space-x-4 text-sm">
              <div className={`flex items-center ${formData.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${formData.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                {formData.isActive ? 'Published' : 'Draft'}
              </div>
              <div className={`flex items-center ${formData.isFeatured ? 'text-yellow-600' : 'text-gray-400'}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${formData.isFeatured ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                {formData.isFeatured ? 'Featured' : 'Standard'}
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">QUICK NAVIGATION</h3>
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => {
                    setActiveSection(section.id);
                    document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {section.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Submission Error</h3>
                <div className="mt-1 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-bounce">
              <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <span className="font-semibold">
                {isEdit ? 'Trek updated successfully!' : 'Trek created successfully!'}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div id="basic" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Info className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                <p className="text-gray-600">Essential details that describe your trek</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Trek Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Everest Base Camp Trek"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., Himalayas, Nepal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="e.g., 14 Days / 13 Nights"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Mountain className="w-4 h-4 inline mr-1" />
                  Altitude (meters)
                </label>
                <input
                  type="number"
                  name="altitude"
                  value={formData.altitude}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter altitude in meters"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Max Group Size</label>
                <input
                  type="number"
                  name="maxGroupSize"
                  value={formData.maxGroupSize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="15"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Video Link</label>
                <input
                  type="url"
                  name="videoLink"
                  value={formData.videoLink}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Trek Description * <span className="text-gray-500 font-normal">(Use toolbar for formatting - min 20 characters)</span>
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Describe the trek experience, scenery, challenges, and highlights in detail. Use bold, italic, and bullet points to make it engaging."
                minHeight="250px"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.isActive ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {formData.isActive ? 'Published' : 'Draft'}
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    formData.isFeatured ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.isFeatured ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Featured Trek
                </span>
              </label>
              
              {/* NEW: Fixed Departure Toggle */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isFixedDeparture"
                    checked={formData.isFixedDeparture}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    formData.isFixedDeparture ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.isFixedDeparture ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  📅 Fixed Departure
                </span>
              </label>

              {/* Only Fixed Departure Toggle */}
              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isOnlyFixedDeparture"
                    checked={formData.isOnlyFixedDeparture}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    formData.isOnlyFixedDeparture ? 'bg-purple-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.isOnlyFixedDeparture ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  🔒 Only Fixed Departure
                </span>
              </label>
            </div>
          </div>

          {/* Categories */}
          <div id="categories" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <Mountain className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Categories & Classification</h2>
                <p className="text-gray-600">Categorize and classify your trek for better discovery</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                {
                  label: "Category *",
                  name: "category",
                  options: ["Himalayan Trek", "Sahyadri Trek"]
                },
                {
                  label: "Region Type *",
                  name: "regionType",
                  options: ["Domestic", "International"]
                },
                {
                  label: "Special Type",
                  name: "specialType",
                  options: ["None", "Monsoon Special", "Winter Special", "Summer Special", "Weekend Trek", "Weekend Special", "Festival Trek"]
                },
                {
                  label: "Difficulty Level",
                  name: "difficulty",
                  options: ["Easy", "Moderate", "Hard", "Extreme"]
                },
                {
                  label: "Fitness Level",
                  name: "fitnessLevel",
                  options: ["Beginner", "Intermediate", "Advanced"]
                }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">{field.label}</label>
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  >
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div id="images" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <ImageIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Media & Images</h2>
                <p className="text-gray-600">Visual content that showcases your trek</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Thumbnail Image {!isEdit && '*'}
                  <span className="text-gray-500 font-normal ml-2">(Main display image)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label htmlFor="thumbnail-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Click to upload thumbnail</p>
                    <p className="text-sm text-gray-500">Recommended: 800x600px, JPG/PNG</p>
                  </label>
                </div>
                
                {thumbnailPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="relative group">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-xl shadow-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (thumbnailPreview.startsWith('blob:')) {
                              URL.revokeObjectURL(thumbnailPreview);
                            }
                            setThumbnailPreview('');
                            setThumbnailFile(null);
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-4 py-2 rounded-lg transition-all"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Showcase Images
                  <span className="text-gray-500 font-normal ml-2">(Up to 5 additional images)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleShowcaseChange}
                    className="hidden"
                    id="showcase-upload"
                  />
                  <label htmlFor="showcase-upload" className="cursor-pointer">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Click to upload showcase images</p>
                    <p className="text-sm text-gray-500">Select multiple images to create a gallery</p>
                  </label>
                </div>
                
                {showcasePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Preview ({showcasePreviews.length}/5):
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {showcasePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Showcase ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-md"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (preview.startsWith('blob:')) {
                                  URL.revokeObjectURL(preview);
                                }
                                const newPreviews = showcasePreviews.filter((_, i) => i !== index);
                                const newFiles = showcaseFiles.filter((_, i) => i !== index);
                                setShowcasePreviews(newPreviews);
                                setShowcaseFiles(newFiles);
                              }}
                              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div id="highlights" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mr-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trek Highlights</h2>
                <p className="text-gray-600">Key features and attractions that make this trek special</p>
              </div>
            </div>
            
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mt-3">
                  <span className="text-yellow-500 text-sm font-bold">{index + 1}</span>
                </div>
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                  placeholder={`What makes this trek amazing? (Highlight ${index + 1})`}
                />
                {formData.highlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('highlights', index)}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayItem('highlights')}
              className="inline-flex items-center px-6 py-3 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition-colors transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Highlight
            </button>
          </div>

          {/* Itinerary Section - NEW */}
          <div id="itinerary" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trek Itinerary</h2>
                <p className="text-gray-600">Day-by-day breakdown of the trek journey</p>
              </div>
            </div>

            {formData.itinerary.map((day, index) => (
              <div key={index} className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-purple-900">Day {day.day}</h3>
                  {formData.itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('itinerary', index)}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Day Title *</label>
                    <input
                      type="text"
                      value={day.title}
                      onChange={(e) => handleObjectArrayChange('itinerary', index, 'title', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="e.g., Base Camp to Summit Push"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description * <span className="text-xs font-normal text-gray-500">(Use toolbar for formatting)</span>
                    </label>
                    <RichTextEditor
                      value={day.description}
                      onChange={(html) => handleObjectArrayChange('itinerary', index, 'description', html)}
                      placeholder="Describe the day's activities, terrain, and what trekkers will experience. Use bullet points, bold, italic for better formatting."
                      minHeight="180px"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meals Included</label>
                    <input
                      type="text"
                      value={day.meals}
                      onChange={(e) => handleObjectArrayChange('itinerary', index, 'meals', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="e.g., Breakfast, Lunch, Dinner"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Accommodation</label>
                    <input
                      type="text"
                      value={day.accommodation}
                      onChange={(e) => handleObjectArrayChange('itinerary', index, 'accommodation', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="e.g., Tents, Guest House, Hotel"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📝 Day Note <span className="text-xs font-normal text-gray-500">(Optional - Use toolbar for formatting)</span>
                    </label>
                    <RichTextEditor
                      value={day.note || ''}
                      onChange={(html) => handleObjectArrayChange('itinerary', index, 'note', html)}
                      placeholder="Add any special notes or important information for this day. Use formatting for emphasis."
                      minHeight="100px"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">🎯 Activities (Optional - Press Enter to add each activity)</label>
                    <div className="space-y-2">
                      {(day.activities || []).map((activity, actIndex) => (
                        <div key={actIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={activity}
                            onChange={(e) => {
                              const newActivities = [...(day.activities || [])];
                              newActivities[actIndex] = e.target.value;
                              handleObjectArrayChange('itinerary', index, 'activities', newActivities);
                            }}
                            className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            placeholder="Enter activity or thing to do"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newActivities = (day.activities || []).filter((_, i) => i !== actIndex);
                              handleObjectArrayChange('itinerary', index, 'activities', newActivities);
                            }}
                            className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newActivities = [...(day.activities || []), ''];
                          handleObjectArrayChange('itinerary', index, 'activities', newActivities);
                        }}
                        className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Activity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('itinerary', { 
                day: formData.itinerary.length + 1, 
                title: '', 
                description: '', 
                meals: '', 
                accommodation: '',
                note: '',
                activities: []
              })}
              className="inline-flex items-center px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Day
            </button>
          </div>

          {/* Inclusions & Exclusions Section - NEW */}
          <div id="inclusions" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Inclusions & Exclusions</h2>
                <p className="text-gray-600">What's included and what's not in the trek package</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inclusions */}
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  What's Included
                </h3>
                {formData.inclusions.map((inclusion, index) => (
                  <div key={index} className="mb-3 flex gap-2">
                    <input
                      type="text"
                      value={inclusion}
                      onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                      placeholder="e.g., All meals during trek"
                    />
                    {formData.inclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('inclusions', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('inclusions')}
                  className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Inclusion
                </button>
              </div>

              {/* Exclusions */}
              <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center">
                  <X className="w-5 h-5 mr-2" />
                  What's Not Included
                </h3>
                {formData.exclusions.map((exclusion, index) => (
                  <div key={index} className="mb-3 flex gap-2">
                    <input
                      type="text"
                      value={exclusion}
                      onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                      className="flex-1 px-4 py-2 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                      placeholder="e.g., Personal trekking gear"
                    />
                    {formData.exclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('exclusions', index)}
                        className="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('exclusions')}
                  className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exclusion
                </button>
              </div>
            </div>
          </div>

          {/* City-wise Pricing */}
          <div id="pricing" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">City-wise Pricing</h2>
                <p className="text-gray-600">Set different pricing based on departure cities</p>
              </div>
            </div>
            
            {formData.cityPricing.map((cityPrice, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City Name *</label>
                    <input
                      type="text"
                      value={cityPrice.city}
                      onChange={(e) => handleObjectArrayChange('cityPricing', index, 'city', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="Enter departure city"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Pricing Options (Add custom categories)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...formData.cityPricing];
                        updated[index].pricingOptions = [...(updated[index].pricingOptions || []), { categoryName: '', price: '' }];
                        setFormData({ ...formData, cityPricing: updated });
                      }}
                      className="inline-flex items-center px-3 py-1 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 transition-all"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Price Category
                    </button>
                  </div>
                  
                  {(cityPrice.pricingOptions || []).map((priceOpt, priceIndex) => (
                    <div key={priceIndex} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 p-3 bg-gray-100 rounded-lg">
                      <div>
                        <label className="block text-xs font-medium mb-1 text-gray-600">
                          Category Name (e.g., Adult, Women, Children)
                        </label>
                        <input
                          type="text"
                          value={priceOpt.categoryName}
                          onChange={(e) => {
                            const updated = [...formData.cityPricing];
                            updated[index].pricingOptions[priceIndex].categoryName = e.target.value;
                            setFormData({ ...formData, cityPricing: updated });
                          }}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                          placeholder="e.g., Adult, Student, Senior"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs font-medium mb-1 text-gray-600">
                            Price (₹)
                          </label>
                          <input
                            type="number"
                            value={priceOpt.price}
                            onChange={(e) => {
                              const updated = [...formData.cityPricing];
                              updated[index].pricingOptions[priceIndex].price = Number(e.target.value);
                              setFormData({ ...formData, cityPricing: updated });
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
                            placeholder="5000"
                            min="0"
                          />
                        </div>
                        {(cityPrice.pricingOptions || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.cityPricing];
                              updated[index].pricingOptions.splice(priceIndex, 1);
                              setFormData({ ...formData, cityPricing: updated });
                            }}
                            className="mt-6 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {formData.cityPricing.length > 1 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('cityPricing', index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove City
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('cityPricing', { city: '', pricingOptions: [{ categoryName: '', price: '' }] })}
              className="inline-flex items-center px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another City
            </button>
          </div>

          {/* Add-ons Section */}
          <div id="addons" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                <Plus className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add-on Options</h2>
                <p className="text-gray-600">Optional extras users can select during booking</p>
              </div>
            </div>

            {formData.addOns.map((addon, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Add-on Name *</label>
                    <input
                      type="text"
                      value={addon.name}
                      onChange={(e) => handleObjectArrayChange('addOns', index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                      placeholder="e.g., Camping Equipment, Guide Service"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      value={addon.price}
                      onChange={(e) => handleObjectArrayChange('addOns', index, 'price', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                      placeholder="500"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                  <textarea
                    value={addon.description}
                    onChange={(e) => handleObjectArrayChange('addOns', index, 'description', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    placeholder="Brief description of the add-on"
                    rows="2"
                  />
                </div>
                {formData.addOns.length > 1 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('addOns', index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove Add-on
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('addOns', { name: '', price: '', description: '' })}
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Add-on
            </button>
          </div>

          {/* Addon Facilities Section */}
          <div id="facilities" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Additional Facilities</h2>
                <p className="text-gray-600">Detailed facilities with categorized features</p>
              </div>
            </div>

            {formData.addonFacilities.map((facility, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Facility Header *</label>
                  <input
                    type="text"
                    value={facility.header}
                    onChange={(e) => handleObjectArrayChange('addonFacilities', index, 'header', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    placeholder="e.g., Safety Equipment, Medical Support"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-points</label>
                  {facility.subPoints.map((subPoint, subIndex) => (
                    <div key={subIndex} className="flex gap-3 mb-3">
                      <input
                        type="text"
                        value={subPoint}
                        onChange={(e) => {
                          const updated = [...formData.addonFacilities];
                          updated[index].subPoints[subIndex] = e.target.value;
                          setFormData({ ...formData, addonFacilities: updated });
                        }}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="e.g., First-aid kit, Oxygen cylinders"
                      />
                      {facility.subPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.addonFacilities];
                            updated[index].subPoints.splice(subIndex, 1);
                            setFormData({ ...formData, addonFacilities: updated });
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...formData.addonFacilities];
                      updated[index].subPoints.push('');
                      setFormData({ ...formData, addonFacilities: updated });
                    }}
                    className="inline-flex items-center px-4 py-2 border-2 border-green-500 text-green-600 rounded-lg text-sm hover:bg-green-50"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Sub-point
                  </button>
                </div>

                {formData.addonFacilities.length > 1 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('addonFacilities', index)}
                      className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove Facility
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('addonFacilities', { header: '', subPoints: [''] })}
              className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Another Facility
            </button>
          </div>

          {/* Available Dates */}
          <div id="dates" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Available Dates</h2>
                <p className="text-gray-600">Set when this trek is available for booking</p>
              </div>
            </div>
            
            {formData.availableDates.map((date, index) => (
              <div key={index} className="flex gap-3 mb-4">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleArrayChange('availableDates', index, e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
                {formData.availableDates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('availableDates', index)}
                    className="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('availableDates', '')}
              className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Date
            </button>
          </div>

          {/* FAQs */}
          <div id="faqs" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mr-4">
                <HelpCircle className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                <p className="text-gray-600">Anticipate and answer common trekker questions</p>
              </div>
            </div>
            
            {formData.faqs.map((faq, index) => (
              <div key={index} className="mb-6 p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Question</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleObjectArrayChange('faqs', index, 'question', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      placeholder="Enter a common question trekkers might have"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Answer</label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => handleObjectArrayChange('faqs', index, 'answer', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                      rows={3}
                      placeholder="Provide a clear and helpful answer"
                    />
                  </div>
                </div>

                {formData.faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('faqs', index)}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove FAQ
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('faqs', { question: '', answer: '' })}
              className="inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors transform hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New FAQ
            </button>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isEdit ? 'Ready to update your trek?' : 'Ready to launch your trek?'}
                </h3>
                <p className="text-gray-600 mt-1">
                  {isEdit 
                    ? 'Review all information and save changes to update your trek package'
                    : 'Double-check all details and create this amazing trek package'
                  }
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/treks')}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 transition-all transform hover:scale-105 font-semibold shadow-lg flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {isEdit ? 'Update Trek Package' : 'Create Trek Package'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrekForm;
