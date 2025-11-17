import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../api/api';
import { showSuccess, showError } from '../utils/toast';
import { 
  User, Mail, Phone, MapPin, Calendar, Users, DollarSign, 
  Package, Mountain, CheckCircle2, Send, AlertCircle,
  Plus, Trash2, ArrowLeft, Save
} from 'lucide-react';

const CustomBookingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form Data with category-based pricing
  const [formData, setFormData] = useState({
    // Customer Information
    customerName: '',
    customerEmail: '',
    customerPhone: '',

    // Package Type & Details
    packageType: 'Tour',
    packageName: '',
    description: '',
    location: '',
    duration: '',
    category: 'Custom',
    regionType: 'Domestic',
    state: '',
    country: '',

    // Images
    thumbnail: null, // File object for new upload
    thumbnailPreview: '', // Preview URL

    // Trek specific
    difficulty: 'Moderate',
    altitude: 0,
    fitnessLevel: 'Beginner',

    // Package Details
    highlights: [''],
    inclusions: [''],
    exclusions: [''],
    itinerary: [{ 
      day: 1, 
      title: '', 
      description: '', 
      meals: '', 
      accommodation: '', 
      note: '',          // NEW
      activities: ['']   // NEW: Changed to array
    }],

    // Travel Details
    startDate: '',
    endDate: '',
    pickupCity: '',
    pickupLocation: '',

    // Category-based Pricing (NEW)
    pricing: {
      adults: 0,
      women: 0,
      children: 0,
      infants: 0,
      selectedCategory: 'budget',  // NEW
      pricePerPerson: 0,           // NEW
      totalAmount: 0,              // NEW
      numberOfMembers: 0           // NEW
    },

    // Additional
    specialRequests: '',
    videoLink: '',
    adminNotes: ''
  });

  const colors = {
    primary: "#E66926",
    secondary: "#1E9ABF",
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    textDark: "#334155",
    border: "#E2E8F0"
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ 
        ...prev, 
        thumbnail: file,
        thumbnailPreview: previewUrl
      }));
    }
  };

  const removeImage = () => {
    if (formData.thumbnailPreview) {
      URL.revokeObjectURL(formData.thumbnailPreview);
    }
    setFormData(prev => ({ 
      ...prev, 
      thumbnail: null,
      thumbnailPreview: ''
    }));
  };

  const handleArrayChange = (field, index, value) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData(prev => ({ ...prev, [field]: updated }));
  };

  const handleItineraryChange = (index, key, value) => {
    const updated = [...formData.itinerary];
    updated[index] = { ...updated[index], [key]: value };
    setFormData(prev => ({ ...prev, itinerary: updated }));
  };

  const handleActivityChange = (dayIndex, activityIndex, value) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities[activityIndex] = value;
    setFormData(prev => ({ ...prev, itinerary: updated }));
  };

  const addActivity = (dayIndex) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities = [...updated[dayIndex].activities, ''];
    setFormData(prev => ({ ...prev, itinerary: updated }));
  };

  const removeActivity = (dayIndex, activityIndex) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== activityIndex);
    setFormData(prev => ({ ...prev, itinerary: updated }));
  };

  const handlePricingChange = (key, value) => {
    // Handle selectedCategory as string, others as numbers
    let processedValue;
    if (key === 'selectedCategory') {
      processedValue = String(value); // Ensure it's a string
    } else {
      processedValue = parseInt(value) || 0;
    }
    
    const pricing = { 
      ...formData.pricing, 
      [key]: processedValue
    };
    
    // Auto-calculate numberOfMembers from demographics
    if (['adults', 'women', 'children', 'infants'].includes(key)) {
      pricing.numberOfMembers = (pricing.adults || 0) + (pricing.women || 0) + 
                                 (pricing.children || 0) + (pricing.infants || 0);
    }
    
    // Auto-calculate totalAmount
    if (key === 'pricePerPerson' || ['adults', 'women', 'children', 'infants'].includes(key)) {
      pricing.totalAmount = (pricing.numberOfMembers || 0) * (pricing.pricePerPerson || 0);
    }
    
    setFormData(prev => ({ ...prev, pricing }));
  };

  const addArrayItem = (field, defaultValue = '') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const addItineraryDay = () => {
    const nextDay = formData.itinerary.length + 1;
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, {
        day: nextDay,
        title: '',
        description: '',
        meals: '',
        accommodation: '',
        note: '',
        activities: ['']
      }]
    }));
  };

  const removeItineraryDay = (index) => {
    if (formData.itinerary.length > 1) {
      setFormData(prev => ({
        ...prev,
        itinerary: prev.itinerary.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate pricing
      if (!formData.pricing.numberOfMembers || formData.pricing.numberOfMembers < 1) {
        setError('Please enter at least one traveler in demographics');
        setLoading(false);
        return;
      }

      if (!formData.pricing.pricePerPerson || formData.pricing.pricePerPerson <= 0) {
        setError('Please enter a valid price per person');
        setLoading(false);
        return;
      }

      // Ensure selectedCategory is a valid string
      const validCategories = ['budget', 'economy', 'deluxe', 'premium', 'luxury'];
      if (!validCategories.includes(formData.pricing.selectedCategory)) {
        setError('Please select a valid package category');
        setLoading(false);
        return;
      }

      // Prepare FormData for file upload
      const formDataToSend = new FormData();
      
      // Add all non-file fields
      const cleanedData = {
        ...formData,
        highlights: formData.highlights.filter(h => h.trim()),
        inclusions: formData.inclusions.filter(i => i.trim()),
        exclusions: formData.exclusions.filter(e => e.trim()),
        itinerary: formData.itinerary.map(day => ({
          ...day,
          activities: day.activities.filter(a => a.trim())
        })),
        thumbnail: undefined, // Remove file object
        thumbnailPreview: undefined // Remove preview URL
      };

      // Add JSON data
      formDataToSend.append('data', JSON.stringify(cleanedData));
      
      // Add thumbnail image if present
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }

      await axios.post(`${API_BASE_URL}/custom-bookings`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/custom-bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create custom booking');
      showError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: colors.lightBg }}>
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textDark }}>
              Create Custom Booking
            </h1>
            <p className="text-gray-600">Fill in the details to create a custom tour or trek package</p>
          </div>
          <button
            onClick={() => navigate('/custom-bookings')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 hover:bg-gray-50 transition-colors"
            style={{ borderColor: colors.border, color: colors.textDark }}
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 border-2 border-green-200 text-green-700 flex items-center gap-3">
            <CheckCircle2 size={20} />
            <span>Custom booking created successfully! Redirecting...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-red-200 text-red-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Vertical Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer Information Section */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
              <User size={24} />
              Customer Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </div>

          {/* Package Details Section */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
              <Package size={24} />
              Package Details
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Package Type *
                  </label>
                  <select
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  >
                    <option value="Tour">Tour</option>
                    <option value="Trek">Trek</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Package Name *
                  </label>
                  <input
                    type="text"
                    name="packageName"
                    value={formData.packageName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                    placeholder="Kashmir Paradise Tour"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                    placeholder="Kashmir, India"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                    placeholder="5 Days 4 Nights"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Region Type *
                  </label>
                  <select
                    name="regionType"
                    value={formData.regionType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  >
                    <option value="Domestic">Domestic</option>
                    <option value="International">International</option>
                  </select>
                </div>

                {formData.regionType === 'Domestic' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.border }}
                      placeholder="Maharashtra"
                    />
                  </div>
                )}

                {formData.regionType === 'International' && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.border }}
                      placeholder="Thailand"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                  >
                    <option value="Custom">Custom</option>
                    <option value="Honeymoon Package">Honeymoon Package</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Wildlife">Wildlife</option>
                    <option value="Spiritual">Spiritual</option>
                    <option value="Heritage">Heritage</option>
                    <option value="Beach">Beach</option>
                    <option value="Hill Station">Hill Station</option>
                    <option value="Desert">Desert</option>
                    <option value="Backwater">Backwater</option>
                    <option value="Photography">Photography</option>
                    <option value="Himalayan Trek">Himalayan Trek</option>
                    <option value="Sahyadri Trek">Sahyadri Trek</option>
                  </select>
                </div>
              </div>

              {formData.packageType === 'Trek' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.border }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Hard">Hard</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                      Altitude (meters)
                    </label>
                    <input
                      type="number"
                      name="altitude"
                      value={formData.altitude}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.border }}
                      placeholder="3000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                      Fitness Level
                    </label>
                    <select
                      name="fitnessLevel"
                      value={formData.fitnessLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                      style={{ borderColor: colors.border }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                  placeholder="Describe the package in detail..."
                />
              </div>

              {/* Package Thumbnail Image */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  📷 Package Thumbnail Image
                  <span className="text-xs text-gray-500 ml-2">(This will appear in PDF and Email)</span>
                </label>
                
                {!formData.thumbnailPreview ? (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: colors.border }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label 
                      htmlFor="thumbnail-upload" 
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Package size={48} style={{ color: colors.secondary }} />
                      <span className="text-sm font-medium" style={{ color: colors.textDark }}>
                        Click to upload package image
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border-2" style={{ borderColor: colors.border }}>
                    <img 
                      src={formData.thumbnailPreview} 
                      alt="Package thumbnail" 
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Travel Details Section */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
              <Calendar size={24} />
              Travel Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Pickup City *
                </label>
                <input
                  type="text"
                  name="pickupCity"
                  value={formData.pickupCity}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                  placeholder="Airport / Railway Station"
                />
              </div>
            </div>
          </div>

          {/* Highlights Section */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
              <CheckCircle2 size={24} />
              Highlights
            </h2>
            
            <div className="space-y-3">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                    placeholder={`Highlight ${index + 1}`}
                  />
                  {formData.highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('highlights', index)}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('highlights')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 hover:bg-gray-50"
                style={{ borderColor: colors.border }}
              >
                <Plus size={18} />
                Add Highlight
              </button>
            </div>
          </div>

          {/* Itinerary Section with Note and Activities */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
              <Calendar size={24} />
              Day-by-Day Itinerary
            </h2>
            
            <div className="space-y-4">
              {formData.itinerary.map((day, dayIndex) => (
                <div key={dayIndex} className="p-4 rounded-lg bg-purple-50 border-2" style={{ borderColor: '#8b5cf6' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg" style={{ color: colors.textDark }}>
                      Day {dayIndex + 1}
                    </h3>
                    {formData.itinerary.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItineraryDay(dayIndex)}
                        className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Title *</label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) => handleItineraryChange(dayIndex, 'title', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                        style={{ borderColor: colors.border }}
                        placeholder="Day title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Description *</label>
                      <textarea
                        value={day.description}
                        onChange={(e) => handleItineraryChange(dayIndex, 'description', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                        style={{ borderColor: colors.border }}
                        placeholder="Describe the day's activities"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Meals</label>
                        <input
                          type="text"
                          value={day.meals}
                          onChange={(e) => handleItineraryChange(dayIndex, 'meals', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                          style={{ borderColor: colors.border }}
                          placeholder="Breakfast, Lunch, Dinner"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Accommodation</label>
                        <input
                          type="text"
                          value={day.accommodation}
                          onChange={(e) => handleItineraryChange(dayIndex, 'accommodation', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                          style={{ borderColor: colors.border }}
                          placeholder="Hotel name or type"
                        />
                      </div>
                    </div>

                    {/* NEW: Day Note */}
                    <div>
                      <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                        📝 Day Note <span className="text-xs text-gray-500">(optional)</span>
                      </label>
                      <textarea
                        value={day.note}
                        onChange={(e) => handleItineraryChange(dayIndex, 'note', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 bg-yellow-50"
                        style={{ borderColor: '#fbbf24' }}
                        placeholder="Add special notes for this day..."
                      />
                    </div>

                    {/* NEW: Activities */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-1">
                        🎯 Activities
                      </label>
                      <div className="space-y-2">
                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex gap-2">
                            <input
                              type="text"
                              value={activity}
                              onChange={(e) => handleActivityChange(dayIndex, actIndex, e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                              style={{ borderColor: colors.border }}
                              placeholder={`Activity ${actIndex + 1}`}
                            />
                            {day.activities.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeActivity(dayIndex, actIndex)}
                                className="px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addActivity(dayIndex)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg border-2 hover:bg-gray-50 text-sm"
                          style={{ borderColor: colors.border }}
                        >
                          <Plus size={14} />
                          Add Activity
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addItineraryDay}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 hover:bg-gray-50"
                style={{ borderColor: colors.border }}
              >
                <Plus size={18} />
                Add Another Day
              </button>
            </div>
          </div>

          {/* Inclusions Section */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#10b981' }}>
              <CheckCircle2 size={24} />
              What's Included
            </h2>
            
            <div className="space-y-3">
              {formData.inclusions.map((inclusion, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={inclusion}
                    onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                    placeholder={`Inclusion ${index + 1}`}
                  />
                  {formData.inclusions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('inclusions', index)}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('inclusions')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 hover:bg-gray-50"
                style={{ borderColor: colors.border }}
              >
                <Plus size={18} />
                Add Inclusion
              </button>
            </div>
          </div>

          {/* Exclusions Section */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#ef4444' }}>
              <AlertCircle size={24} />
              What's Not Included
            </h2>
            
            <div className="space-y-3">
              {formData.exclusions.map((exclusion, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={exclusion}
                    onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                    style={{ borderColor: colors.border }}
                    placeholder={`Exclusion ${index + 1}`}
                  />
                  {formData.exclusions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('exclusions', index)}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('exclusions')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 hover:bg-gray-50"
                style={{ borderColor: colors.border }}
              >
                <Plus size={18} />
                Add Exclusion
              </button>
            </div>
          </div>

          {/* Category-Based Pricing Section */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
              <DollarSign size={24} />
              Pricing & Travelers
            </h2>
            
            <div className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Package Category *
                </label>
                <select
                  value={formData.pricing.selectedCategory}
                  onChange={(e) => handlePricingChange('selectedCategory', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 font-semibold"
                  style={{ borderColor: colors.border }}
                >
                  <option value="budget">💰 Budget</option>
                  <option value="economy">💵 Economy</option>
                  <option value="deluxe">🌟 Deluxe</option>
                  <option value="premium">⭐ Premium</option>
                  <option value="luxury">💎 Luxury</option>
                </select>
              </div>

              {/* Price Per Person */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Price Per Person *
                </label>
                <input
                  type="number"
                  value={formData.pricing.pricePerPerson}
                  onChange={(e) => handlePricingChange('pricePerPerson', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                  placeholder="15000"
                  min="0"
                />
              </div>

              {/* Travelers Demographics */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-3 text-sm" style={{ color: colors.textDark }}>
                  Travelers Demographics (Optional - for analytics)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Adults</label>
                    <input
                      type="number"
                      value={formData.pricing.adults}
                      onChange={(e) => handlePricingChange('adults', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 text-center"
                      style={{ borderColor: colors.border }}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Women</label>
                    <input
                      type="number"
                      value={formData.pricing.women}
                      onChange={(e) => handlePricingChange('women', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 text-center"
                      style={{ borderColor: colors.border }}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Children</label>
                    <input
                      type="number"
                      value={formData.pricing.children}
                      onChange={(e) => handlePricingChange('children', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 text-center"
                      style={{ borderColor: colors.border }}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Infants</label>
                    <input
                      type="number"
                      value={formData.pricing.infants}
                      onChange={(e) => handlePricingChange('infants', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border-2 text-center"
                      style={{ borderColor: colors.border }}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Values */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.textDark }}>
                    Total Travelers:
                  </span>
                  <span className="text-lg font-bold" style={{ color: colors.primary }}>
                    {formData.pricing.numberOfMembers}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t-2" style={{ borderColor: colors.border }}>
                  <span className="text-lg font-semibold" style={{ color: colors.textDark }}>
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                    ₹{formData.pricing.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-xl shadow-lg border p-6" style={{ borderColor: colors.border }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: colors.primary }}>
              <AlertCircle size={24} />
              Additional Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Special Requests
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                  placeholder="Any special requests or notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Video Link (YouTube, Vimeo, etc.)
                </label>
                <input
                  type="url"
                  name="videoLink"
                  value={formData.videoLink}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.border }}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.textDark }}>
                  Admin Notes (Internal Use Only)
                </label>
                <textarea
                  name="adminNotes"
                  value={formData.adminNotes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 bg-yellow-50"
                  style={{ borderColor: '#fbbf24' }}
                  placeholder="Internal notes for admin team..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/custom-bookings')}
              className="px-6 py-3 rounded-lg border-2 hover:bg-gray-50 transition-colors font-semibold"
              style={{ borderColor: colors.border, color: colors.textDark }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              style={{ backgroundColor: colors.primary }}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Create Custom Booking
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomBookingForm;
