import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../api/api';
import { showSuccess, showError } from '../utils/toast';
import RichTextEditor from '../components/RichTextEditor';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  Calendar,
  MapPin,
  Users,
  Star,
  CheckCircle2,
  AlertCircle,
  Image,
  Upload,
  Clock,
  DollarSign,
  FileText,
  HelpCircle
} from 'lucide-react';

const TourForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const hasFetchedRef = useRef(false);

  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    description: '',
    location: '',
    duration: '',
    
    // Categorization (matching exact enums from model)
    category: 'Custom',
    regionType: 'Domestic',
    state: '',  // NEW: For Domestic tours
    country: '',  // NEW: For International tours
    specialType: 'None',
    tourType: 'Adventure',
    difficulty: 'Moderate',
    
    // Arrays
    highlights: [''],
    inclusions: [''],
    exclusions: [''],
    cityPricing: [{ 
      city: '', 
      pickupPoints: [],
      departureDates: [{ startDate: '', endDate: '', isAvailable: true }],
      pricingOptions: [{ categoryName: '', price: '', minMembers: 1 }] 
    }],  // FLEXIBLE PRICING
    itinerary: [{ day: 1, title: '', description: '', meals: '', accommodation: '', cabType: '', note: '', activities: [] }],
    faqs: [{ question: '', answer: '' }],
    addOns: [{ name: '', price: '', description: '' }],  // ADD-ON OPTIONS
    addonFacilities: [{ header: '', subPoints: [''] }],  // ADDITIONAL FACILITIES
    
    // Optional fields
    videoLink: '',
    maxGroupSize: 20,
    contactForPricing: false, // NEW: If true, hide pricing and show "Contact for Pricing"
    isActive: true,
    isFeatured: false,
    isFixedDeparture: false,
    isOnlyFixedDeparture: false, // Only show as fixed departure
    isGroupTour: false, // Group tour flag
  });

  const [files, setFiles] = useState({
    thumbnail: null,
    showcaseImages: [],
    hotelImages: []
  });

  // Image preview states
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [showcasePreviews, setShowcasePreviews] = useState([]);
  const [hotelImagePreviews, setHotelImagePreviews] = useState([]);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('basic');
  const [showSuccess, setShowSuccess] = useState(false);

  // Color palette
  const colors = {
    primary: "#E66926", // Orange
    secondary: "#1E9ABF", // Blue
    lightBg: "#FAF9F6",
    darkBg: "#1E293B",
    textLight: "#FFFFFF",
    textDark: "#334155",
    border: "#E2E8F0"
  };

  const sections = [
    { id: 'basic', name: 'Basic Info', icon: '📋' },
    { id: 'images', name: 'Media', icon: '🖼️' },
    { id: 'pricing', name: 'Pricing', icon: '💰' },
    { id: 'addons', name: 'Add-ons', icon: '➕' },
    { id: 'facilities', name: 'Facilities', icon: '🏨' },
    { id: 'highlights', name: 'Highlights', icon: '⭐' },
    { id: 'inclusions', name: 'Inclusions/Exclusions', icon: '✅' },
    { id: 'itinerary', name: 'Itinerary', icon: '🗓️' },
    { id: 'faqs', name: 'FAQs', icon: '❓' }
  ];

  const fetchTourData = async () => {
    try {
      setLoading(true);
      setErrors({}); // Clear previous errors
      const response = await adminAPI.tours.getById(id);
      if (response.data.success) {
        const tour = response.data.data;
        
        console.log('🎯 TOUR DATA LOADED:', {
          tourName: tour.name,
          hasDescription: !!tour.description,
          descriptionLength: tour.description?.length,
          descriptionPreview: tour.description?.substring(0, 100),
          itineraryCount: tour.itinerary?.length,
          firstItinerary: tour.itinerary?.[0] ? {
            day: tour.itinerary[0].day,
            hasDescription: !!tour.itinerary[0].description,
            descriptionLength: tour.itinerary[0].description?.length,
            descriptionPreview: tour.itinerary[0].description?.substring(0, 100)
          } : null
        });
        
        setFormData({
          ...tour,
          highlights: tour.highlights?.length > 0 ? tour.highlights : [''],
          inclusions: tour.inclusions?.length > 0 ? tour.inclusions : [''],
          exclusions: tour.exclusions?.length > 0 ? tour.exclusions : [''],
          cityPricing: tour.cityPricing?.length > 0 ? tour.cityPricing.map(city => ({
            ...city,
            pickupPoints: city.pickupPoints || [],
            departureDates: city.departureDates?.length > 0 ? city.departureDates.map(dep => ({
              startDate: dep.startDate ? new Date(dep.startDate).toISOString().split('T')[0] : '',
              endDate: dep.endDate ? new Date(dep.endDate).toISOString().split('T')[0] : '',
              isAvailable: dep.isAvailable !== false
            })) : [{ startDate: '', endDate: '', isAvailable: true }],
            pricingOptions: city.pricingOptions?.length > 0 ? city.pricingOptions : [{ categoryName: '', price: '', minMembers: 1 }]
          })) : [{ 
            city: '', 
            pickupPoints: [],
            departureDates: [{ startDate: '', endDate: '', isAvailable: true }],
            pricingOptions: [{ categoryName: '', price: '', minMembers: 1 }] 
          }],
          itinerary: tour.itinerary?.length > 0 ? tour.itinerary.map(item => ({
            ...item,
            description: item.description || '',
            cabType: item.cabType || '',
            note: item.note || '',
            activities: item.activities || []
          })) : [{ day: 1, title: '', description: '', meals: '', accommodation: '', cabType: '', note: '', activities: [] }],
          faqs: tour.faqs?.length > 0 ? tour.faqs : [{ question: '', answer: '' }],
          // eslint-disable-next-line no-unused-vars
          addOns: tour.addOns?.length > 0 ? tour.addOns.map(({ _id, __v, ...addon }) => addon) : [{ name: '', price: '', description: '' }],
          // eslint-disable-next-line no-unused-vars
          addonFacilities: tour.addonFacilities?.length > 0 ? tour.addonFacilities.map(({ _id, __v, ...facility }) => ({
            ...facility,
            subPoints: facility.subPoints || []
          })) : [{ header: '', subPoints: [''] }]
        });
        
        // Set existing image previews
        if (tour.thumbnail) {
          setThumbnailPreview(tour.thumbnail);
        }
        if (tour.showcaseImages && tour.showcaseImages.length > 0) {
          setShowcasePreviews(tour.showcaseImages);
        }
        if (tour.hotelImages && tour.hotelImages.length > 0) {
          setHotelImagePreviews(tour.hotelImages);
        }
      } else {
        setErrors({ submit: 'Failed to load tour data: ' + response.data.message });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      setErrors({ submit: `Failed to load tour data: ${errorMessage}` });
      showError(`Failed to load tour data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchTourData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditing]);

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
      hotelImagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [thumbnailPreview, showcasePreviews, hotelImagePreviews]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    
    if (name === 'thumbnail' && selectedFiles[0]) {
      const file = selectedFiles[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, thumbnail: 'Thumbnail image must be less than 5MB' }));
        return;
      }
      
      // Clear previous thumbnail preview URL to prevent memory leaks
      if (thumbnailPreview && thumbnailPreview.startsWith('blob:')) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      
      setFiles(prev => ({ ...prev, thumbnail: file }));
      
      // Create preview using URL.createObjectURL
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      setErrors(prev => ({ ...prev, thumbnail: '' }));
      
    } else if (name === 'showcaseImages' && selectedFiles.length > 0) {
      const filesArray = Array.from(selectedFiles);
      
      // Combine existing and new files
      const existingFiles = files.showcaseImages || [];
      const combinedFiles = [...existingFiles, ...filesArray];
      
      // Validate max 5 images total
      if (combinedFiles.length > 5) {
        setErrors(prev => ({ 
          ...prev, 
          showcaseImages: `You can upload maximum 5 showcase images. Currently ${combinedFiles.length} selected.` 
        }));
        return;
      }
      
      // Validate file sizes
      const oversizedFiles = filesArray.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setErrors(prev => ({ ...prev, showcaseImages: 'Each showcase image must be less than 5MB' }));
        return;
      }
      
      setFiles(prev => ({ ...prev, showcaseImages: combinedFiles }));
      
      // Create previews using URL.createObjectURL
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      const combinedPreviews = [...showcasePreviews, ...newPreviews];
      setShowcasePreviews(combinedPreviews);
      setErrors(prev => ({ ...prev, showcaseImages: '' }));
      
    } else if (name === 'hotelImages' && selectedFiles.length > 0) {
      const filesArray = Array.from(selectedFiles);
      
      // Combine existing and new files
      const existingFiles = files.hotelImages || [];
      const combinedFiles = [...existingFiles, ...filesArray];
      
      // Validate max 5 images total
      if (combinedFiles.length > 5) {
        setErrors(prev => ({ 
          ...prev, 
          hotelImages: `You can upload maximum 5 hotel images. Currently ${combinedFiles.length} selected.` 
        }));
        return;
      }
      
      // Validate file sizes
      const oversizedFiles = filesArray.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        setErrors(prev => ({ ...prev, hotelImages: 'Each hotel image must be less than 5MB' }));
        return;
      }
      
      setFiles(prev => ({ ...prev, hotelImages: combinedFiles }));
      
      // Create previews using URL.createObjectURL
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      const combinedPreviews = [...hotelImagePreviews, ...newPreviews];
      setHotelImagePreviews(combinedPreviews);
      setErrors(prev => ({ ...prev, hotelImages: '' }));
    }
  };

  // Handle dynamic array fields (simple strings)
  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  // Handle object arrays (cityPricing, itinerary, faqs)
  const handleObjectArrayChange = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }));
  };

  const addArrayItem = (field, defaultValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }));
  };

  const removeArrayItem = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  // Remove hotel image
  const removeHotelImage = (index) => {
    const previewToRemove = hotelImagePreviews[index];
    if (previewToRemove && previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
    }
    
    setFiles(prev => ({
      ...prev,
      hotelImages: prev.hotelImages.filter((_, i) => i !== index)
    }));
    setHotelImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Tour name is required';
    // Strip HTML tags for description validation
    const descriptionText = formData.description.replace(/<[^>]*>/g, '').trim();
    if (!descriptionText) newErrors.description = 'Description is required';
    if (descriptionText.length < 20) newErrors.description = 'Description must be at least 20 characters';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    
    if (!isEditing && !files.thumbnail) {
      newErrors.thumbnail = 'Thumbnail image is required for new tours';
    }

    if (files.showcaseImages.length > 5) {
      newErrors.showcaseImages = 'Maximum 5 showcase images allowed';
    }

    // Validate city pricing - optional, but if provided, validate structure
    formData.cityPricing.forEach((cityPrice, index) => {
      const hasCity = cityPrice.city && cityPrice.city.trim() !== '';
      const hasPricingOptions = cityPrice.pricingOptions && cityPrice.pricingOptions.length > 0;
      
      if (hasCity && hasPricingOptions) {
        // If city has pricing options, validate each option has both name and price
        cityPrice.pricingOptions.forEach((option, optIndex) => {
          const categoryName = option.categoryName || '';
          const price = option.price || '';
          
          if (categoryName.trim() && !price) {
            newErrors[`cityPrice_${index}_option_${optIndex}`] = 'Price is required when category name is specified';
          }
          if (!categoryName.trim() && price) {
            newErrors[`cityPrice_${index}_option_${optIndex}`] = 'Category name is required when price is specified';
          }
        });
      } else if (hasCity && !hasPricingOptions) {
        newErrors[`cityPrice_${index}`] = 'At least one pricing option is required when city is specified';
      } else if (!hasCity && hasPricingOptions) {
        const hasValidOption = cityPrice.pricingOptions.some(opt => {
          const catName = opt.categoryName || '';
          return catName.trim() || opt.price;
        });
        if (hasValidOption) {
          newErrors[`cityCity_${index}`] = 'City is required when pricing options are specified';
        }
      }
    });

    // Validate video link if provided
    if (formData.videoLink && formData.videoLink.trim()) {
      try {
        new URL(formData.videoLink);
      } catch {
        newErrors.videoLink = 'Please provide a valid URL';
      }
    }

    // Validate maxGroupSize (allow 0 for viewing-only tours)
    if (formData.maxGroupSize < 0) {
      newErrors.maxGroupSize = 'Max group size cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrors(prev => ({ ...prev, submit: 'Please fix the errors above before submitting.' }));
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const submitFormData = new FormData();
      
      // Clean form data before sending
      const cleanedData = {
        ...formData,
        // Filter out empty strings from arrays
        highlights: formData.highlights.filter(h => h.trim()),
        inclusions: formData.inclusions.filter(i => i.trim()),
        exclusions: formData.exclusions.filter(e => e.trim()),
        // Filter out empty city pricing entries (optional - can be empty array)
        cityPricing: formData.cityPricing
          .filter(cp => cp.city.trim() && cp.pricingOptions && cp.pricingOptions.length > 0)
          .map(cp => ({
            city: cp.city.trim(),
            pricingOptions: cp.pricingOptions.filter(opt => opt.categoryName.trim() && opt.price),
            pickupPoints: (cp.pickupPoints || []).filter(point => point && point.trim()), // Include pickup points
            departureDates: (cp.departureDates || []).filter(date => date.startDate && date.endDate) // Include departure dates
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
        // Filter out empty FAQ entries
        faqs: formData.faqs.filter(faq => faq.question.trim() && faq.answer.trim()),
        // Filter out incomplete itinerary entries and clean activities
        itinerary: formData.itinerary
          .filter(item => item.title.trim() && item.description.trim())
          .map(item => ({
            ...item,
            activities: (item.activities || []).filter(a => a && a.trim()) // Clean empty activities
          })),
        // Ensure maxGroupSize is a number
        maxGroupSize: Number(formData.maxGroupSize),
        // Clean video link
        videoLink: formData.videoLink.trim()
      };

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
      if (files.thumbnail) {
        submitFormData.append('thumbnail', files.thumbnail);
      }
      
      if (files.showcaseImages.length > 0) {
        files.showcaseImages.forEach((file) => {
          submitFormData.append('showcaseImages', file);
        });
      }
      
      if (files.hotelImages.length > 0) {
        files.hotelImages.forEach((file) => {
          submitFormData.append('hotelImages', file);
        });
      }

      let response;
      if (isEditing) {
        response = await adminAPI.tours.update(id, submitFormData);
        if (response.data?.success) {
          setShowSuccess(true);
          setTimeout(() => {
            navigate('/admin/tours');
          }, 2000);
        } else {
          throw new Error(response.data?.message || 'Failed to update tour');
        }
      } else {
        response = await adminAPI.tours.create(submitFormData);
        if (response.data?.success) {
          setShowSuccess(true);
          setTimeout(() => {
            navigate('/admin/tours');
          }, 2000);
        } else {
          throw new Error(response.data?.message || 'Failed to create tour');
        }
      }
    } catch (error) {
      
      let errorMessage = 'Error saving tour: ';
      
      // Check for timeout error
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Upload timeout. This can happen with large images. Try: 1) Reduce image sizes (compress before upload), 2) Upload fewer showcase images at once, or 3) Check your internet connection.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
        
        if (error.response.data.message.includes('slug_1') || error.response.data.error === 'SLUG_INDEX_CONFLICT') {
          errorMessage = 'Database index conflict detected. Please restart the backend server to fix this issue automatically.';
        }
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred. Please check your connection.';
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const SectionNav = () => (
    <div className="bg-white rounded-xl shadow-lg border p-4 mb-6" style={{ borderColor: colors.border }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: colors.textDark }}>QUICK NAVIGATION</h3>
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => {
              setActiveSection(section.id);
              document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === section.id
                ? 'text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={activeSection === section.id ? { backgroundColor: colors.primary } : {}}
          >
            <span className="mr-2">{section.icon}</span>
            {section.name}
          </button>
        ))}
      </div>
    </div>
  );

  const SuccessMessage = () => (
    <div className="fixed top-4 right-4 z-50">
      <div 
        className="text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 animate-bounce"
        style={{ backgroundColor: colors.secondary }}
      >
        <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <CheckCircle2 size={16} />
        </div>
        <span className="font-semibold">
          {isEditing ? 'Tour updated successfully!' : 'Tour created successfully!'}
        </span>
      </div>
    </div>
  );

  // Image Lightbox Modal Component
  const ImageLightbox = () => {
    if (!lightboxImage) return null;

    const allImages = [
      thumbnailPreview,
      ...showcasePreviews
    ].filter(Boolean);

    const currentIndex = lightboxIndex;

    const handlePrevious = () => {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
      setLightboxImage(allImages[lightboxIndex > 0 ? lightboxIndex - 1 : allImages.length - 1]);
    };

    const handleNext = () => {
      setLightboxIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
      setLightboxImage(allImages[lightboxIndex < allImages.length - 1 ? lightboxIndex + 1 : 0]);
    };

    const handleClose = () => {
      setLightboxImage(null);
      setLightboxIndex(0);
    };

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
        onClick={handleClose}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X size={32} />
        </button>

        {/* Previous button */}
        {allImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3"
          >
            <ArrowLeft size={24} />
          </button>
        )}

        {/* Image */}
        <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {allImages.length}
          </div>
        </div>

        {/* Next button */}
        {allImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-3"
          >
            <ArrowLeft size={24} className="rotate-180" />
          </button>
        )}
      </div>
    );
  };

  if (loading && !isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.lightBg }}>
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border" style={{ borderColor: colors.border }}>
          <div 
            className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}
          ></div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: colors.darkBg }}>Creating Your Tour</h2>
          <p style={{ color: colors.textDark }}>Please wait while we set up your tour package...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: colors.lightBg }}>
      {showSuccess && <SuccessMessage />}
      {lightboxImage && <ImageLightbox />}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <button
              onClick={() => navigate('/admin/tours')}
              className="inline-flex items-center px-4 py-2 bg-white rounded-xl shadow-lg border hover:bg-gray-50 transition-all transform hover:scale-105"
              style={{ 
                borderColor: colors.border,
                color: colors.textDark
              }}
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Tours
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: colors.darkBg }}>
                {isEditing ? 'Edit Tour Package' : 'Create New Tour'}
              </h1>
              <p className="text-lg" style={{ color: colors.textDark }}>
                {isEditing 
                  ? 'Update and refine your tour details to provide the best experience' 
                  : 'Craft an unforgettable journey for your travelers'
                }
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border px-4 py-3" style={{ borderColor: colors.border }}>
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

        {/* Progress & Navigation */}
        <SectionNav />

        {errors.submit && (
          <div 
            className="mb-6 rounded-xl p-4 border"
            style={{ 
              backgroundColor: '#FEF2F2',
              borderColor: '#EF4444'
            }}
          >
            <div className="flex items-center">
              <AlertCircle size={20} className="text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium" style={{ color: '#991B1B' }}>Submission Error</h3>
                <div className="mt-1 text-sm" style={{ color: '#DC2626' }}>
                  <p>{errors.submit}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div id="basic" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{ backgroundColor: colors.secondary + '15' }}
              >
                <FileText size={24} style={{ color: colors.secondary }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Basic Information</h2>
                <p style={{ color: colors.textDark }}>Essential details that define your tour package</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                { label: 'Tour Name *', name: 'name', type: 'text', placeholder: 'Enter an attractive tour name' },
                { label: 'Location *', name: 'location', type: 'text', placeholder: 'e.g., Delhi, Agra, Jaipur' },
                { label: 'Duration *', name: 'duration', type: 'text', placeholder: 'e.g., 7 days 6 nights' },
                { label: 'Max Group Size', name: 'maxGroupSize', type: 'number', placeholder: '20', min: 0 },
                { label: 'Video Link', name: 'videoLink', type: 'url', placeholder: 'https://youtube.com/...' }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold mb-3" style={{ color: colors.darkBg }}>{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    min={field.min}
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      errors[field.name] ? 'border-red-500' : 'border-gray-200'
                    }`}
                    style={{ focusBorderColor: colors.primary }}
                    placeholder={field.placeholder}
                  />
                  {errors[field.name] && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ))}

              {[
                { label: 'Category', name: 'category', options: ['Honeymoon Package', 'Adventure', 'Cultural', 'Wildlife', 'Spiritual', 'Heritage', 'Beach', 'Hill Station', 'Desert', 'Backwater', 'Photography', 'Pilgrimage', 'Custom'] },
                { label: 'Region Type', name: 'regionType', options: ['Domestic', 'International'] },
                { label: 'Special Type', name: 'specialType', options: ['None', 'Weekend Special', 'Diwali Special', 'Christmas Special', 'New Year Special', 'Summer Special', 'Winter Special', 'Monsoon Special'] },
                { label: 'Tour Type', name: 'tourType', options: ['Adventure', 'Cultural', 'Wildlife', 'Spiritual', 'Heritage', 'Beach', 'Hill Station', 'Desert', 'Backwater', 'Photography'] },
                { label: 'Difficulty', name: 'difficulty', options: ['Easy', 'Moderate', 'Hard'] }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-semibold mb-3" style={{ color: colors.darkBg }}>{field.label}</label>
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all"
                    style={{ focusBorderColor: colors.primary }}
                  >
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              ))}

              {/* State/Country Field based on Region Type */}
              {formData.regionType === 'Domestic' && (
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: colors.darkBg }}>
                    State * <span className="text-red-500">(Required for Domestic tours)</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g., Maharashtra, Kerala, Goa"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      errors.state ? 'border-red-500' : 'border-gray-200'
                    }`}
                    style={{ focusBorderColor: colors.primary }}
                  />
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.state}
                    </p>
                  )}
                </div>
              )}

              {formData.regionType === 'International' && (
                <div>
                  <label className="block text-sm font-semibold mb-3" style={{ color: colors.darkBg }}>
                    Country * <span className="text-red-500">(Required for International tours)</span>
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="e.g., Thailand, Dubai, Singapore"
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      errors.country ? 'border-red-500' : 'border-gray-200'
                    }`}
                    style={{ focusBorderColor: colors.primary }}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <AlertCircle size={16} className="mr-1" />
                      {errors.country}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8">
              <label className="block text-sm font-semibold mb-3" style={{ color: colors.darkBg }}>
                Description * <span className="font-normal" style={{ color: colors.textDark }}>(Use toolbar for formatting - min 20 characters)</span>
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
                placeholder="Describe your tour package in detail. What makes it special? What experiences will travelers have? Use bold, italic, and bullet points to highlight key features."
                minHeight="250px"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="mt-6 flex space-x-6">
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
                <span className="text-sm font-medium" style={{ color: colors.darkBg }}>
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
                <span className="text-sm font-medium" style={{ color: colors.darkBg }}>
                  Featured Tour
                </span>
              </label>

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
                <span className="text-sm font-medium" style={{ color: colors.darkBg }}>
                  📅 Fixed Departure
                </span>
              </label>

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
                    formData.isOnlyFixedDeparture ? 'bg-blue-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.isOnlyFixedDeparture ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
                <span className="text-sm font-medium" style={{ color: colors.darkBg }}>
                  🔒 Only Fixed Departure (Hide from normal tours)
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isGroupTour"
                    checked={formData.isGroupTour}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    formData.isGroupTour ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    formData.isGroupTour ? 'transform translate-x-6' : ''
                  }`}></div>
                </div>
                <span className="text-sm font-medium" style={{ color: colors.darkBg }}>
                  👥 Group Tour
                </span>
              </label>
            </div>
          </div>

          {/* Images */}
          <div id="images" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{ backgroundColor: colors.primary + '15' }}
              >
                <Image size={24} style={{ color: colors.primary }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Media & Images</h2>
                <p style={{ color: colors.textDark }}>Visual content that showcases your tour</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: colors.darkBg }}>
                  Thumbnail Image {!isEditing && '*'}
                  <span className="font-normal ml-2" style={{ color: colors.textDark }}>(Main display image)</span>
                </label>
                <div 
                  className="border-2 border-dashed rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  style={{ borderColor: colors.border }}
                >
                  <input
                    type="file"
                    name="thumbnail"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label htmlFor="thumbnail-upload" className="cursor-pointer">
                    <Upload size={48} className="text-gray-400 mx-auto mb-3" />
                    <p className="mb-2" style={{ color: colors.textDark }}>Click to upload thumbnail</p>
                    <p className="text-sm" style={{ color: colors.textDark }}>Recommended: 800x600px, JPG/PNG</p>
                  </label>
                </div>
                {errors.thumbnail && <p className="text-red-500 text-sm mt-2">{errors.thumbnail}</p>}
                
                {/* Thumbnail Preview */}
                {thumbnailPreview && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2" style={{ color: colors.darkBg }}>Preview:</p>
                    <div className="relative group">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-xl shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => {
                          setLightboxImage(thumbnailPreview);
                          setLightboxIndex(0);
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-xl flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxImage(thumbnailPreview);
                            setLightboxIndex(0);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-white px-4 py-2 rounded-lg transition-all transform translate-y-2 group-hover:translate-y-0 mr-2"
                          style={{ backgroundColor: colors.secondary }}
                        >
                          <Eye size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (thumbnailPreview.startsWith('blob:')) {
                              URL.revokeObjectURL(thumbnailPreview);
                            }
                            setThumbnailPreview('');
                            setFiles(prev => ({ ...prev, thumbnail: null }));
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-4 py-2 rounded-lg transition-all transform translate-y-2 group-hover:translate-y-0"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: colors.darkBg }}>
                  Showcase Images
                  <span className="font-normal ml-2" style={{ color: colors.textDark }}>(Up to 5 additional images)</span>
                </label>
                <div 
                  className="border-2 border-dashed rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
                  style={{ borderColor: colors.border }}
                >
                  <input
                    type="file"
                    name="showcaseImages"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="showcase-upload"
                  />
                  <label htmlFor="showcase-upload" className="cursor-pointer">
                    <Upload size={48} className="text-gray-400 mx-auto mb-3" />
                    <p className="mb-2" style={{ color: colors.textDark }}>Click to upload showcase images</p>
                    <p className="text-sm" style={{ color: colors.textDark }}>Select multiple images to create a gallery</p>
                  </label>
                </div>
                {errors.showcaseImages && <p className="text-red-500 text-sm mt-2">{errors.showcaseImages}</p>}
                
                {/* Showcase Images Preview */}
                {showcasePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2" style={{ color: colors.darkBg }}>
                      Preview ({showcasePreviews.length}/5):
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {showcasePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Showcase ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setLightboxImage(preview);
                              setLightboxIndex(index + 1);
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImage(preview);
                                setLightboxIndex(index + 1);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-white p-2 rounded-full transition-all transform scale-75 group-hover:scale-100 mr-1"
                              style={{ backgroundColor: colors.secondary }}
                              title="View full size"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (preview.startsWith('blob:')) {
                                  URL.revokeObjectURL(preview);
                                }
                                const newPreviews = showcasePreviews.filter((_, i) => i !== index);
                                const newFiles = files.showcaseImages.filter((_, i) => i !== index);
                                setShowcasePreviews(newPreviews);
                                setFiles(prev => ({ ...prev, showcaseImages: newFiles }));
                              }}
                              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full transition-all transform scale-75 group-hover:scale-100"
                              title="Remove image"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hotel Images */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3" style={{ color: colors.darkBg }}>
                  Hotel Images
                  <span className="font-normal ml-2" style={{ color: colors.textDark }}>(Up to 5 hotel/accommodation images)</span>
                </label>
                <div 
                  className="border-2 border-dashed rounded-xl p-6 text-center hover:border-green-400 transition-colors cursor-pointer"
                  style={{ borderColor: colors.border }}
                >
                  <input
                    type="file"
                    name="hotelImages"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="hotel-upload"
                  />
                  <label htmlFor="hotel-upload" className="cursor-pointer">
                    <Upload size={48} className="text-gray-400 mx-auto mb-3" />
                    <p className="mb-2" style={{ color: colors.textDark }}>Click to upload hotel images</p>
                    <p className="text-sm" style={{ color: colors.textDark }}>Showcase accommodation for this tour</p>
                  </label>
                </div>
                {errors.hotelImages && <p className="text-red-500 text-sm mt-2">{errors.hotelImages}</p>}
                
                {/* Hotel Images Preview */}
                {hotelImagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2" style={{ color: colors.darkBg }}>
                      Preview ({hotelImagePreviews.length}/5):
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {hotelImagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Hotel ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              setLightboxImage(preview);
                              setLightboxIndex(index + 1);
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImage(preview);
                                setLightboxIndex(index + 1);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-white p-2 rounded-full transition-all transform scale-75 group-hover:scale-100 mr-1"
                              style={{ backgroundColor: colors.secondary }}
                              title="View full size"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeHotelImage(index);
                              }}
                              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full transition-all transform scale-75 group-hover:scale-100"
                              title="Remove image"
                            >
                              <Trash2 size={16} />
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

          {/* Flexible Pricing */}
          <div id="pricing" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                  style={{ backgroundColor: colors.primary + '15' }}
                >
                  <DollarSign size={24} style={{ color: colors.primary }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Flexible Pricing</h2>
                  <p style={{ color: colors.textDark }}>Add custom pricing categories for each departure city - per person pricing</p>
                </div>
              </div>
              
              {/* Contact for Pricing Toggle */}
              <div className="flex items-center gap-3 p-4 rounded-xl border-2" style={{ borderColor: formData.contactForPricing ? colors.primary : colors.border, backgroundColor: formData.contactForPricing ? colors.primary + '10' : 'transparent' }}>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.contactForPricing}
                      onChange={(e) => setFormData({ ...formData, contactForPricing: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-14 h-7 rounded-full transition-colors duration-300 ${formData.contactForPricing ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
                    <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${formData.contactForPricing ? 'translate-x-7' : ''}`}></div>
                  </div>
                  <span className="ml-3 font-semibold text-sm" style={{ color: colors.darkBg }}>📞 Contact for Pricing</span>
                </label>
              </div>
            </div>
            
            {/* Show message when Contact for Pricing is enabled */}
            {formData.contactForPricing && (
              <div className="mb-6 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: colors.primary, backgroundColor: colors.primary + '10' }}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="font-semibold" style={{ color: colors.darkBg }}>Contact for Pricing Enabled</p>
                    <p className="text-sm" style={{ color: colors.textDark }}>Pricing will be hidden on the booking page. Customers will see a WhatsApp button to contact you directly.</p>
                  </div>
                </div>
              </div>
            )}
            
            {errors.cityPricing && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{errors.cityPricing}</p>
              </div>
            )}
            
            {/* Hide pricing inputs when contactForPricing is enabled */}
            {!formData.contactForPricing && (
              <>
            {formData.cityPricing.map((cityPrice, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl border mb-4"
                style={{ 
                  backgroundColor: colors.lightBg,
                  borderColor: colors.border
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>City Name *</label>
                    <input
                      type="text"
                      value={cityPrice.city}
                      onChange={(e) => handleObjectArrayChange('cityPricing', index, 'city', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      placeholder="Enter departure city"
                    />
                    {errors[`cityCity_${index}`] && <p className="text-red-500 text-sm mt-2">{errors[`cityCity_${index}`]}</p>}
                  </div>
                  
                  <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                      Pickup Points (Optional)
                    </label>
                    <div className="space-y-2">
                      {(cityPrice.pickupPoints || []).map((point, pointIndex) => (
                        <div key={pointIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={point}
                            onChange={(e) => {
                              const updated = [...formData.cityPricing];
                              if (!updated[index].pickupPoints) updated[index].pickupPoints = [];
                              updated[index].pickupPoints[pointIndex] = e.target.value;
                              setFormData({ ...formData, cityPricing: updated });
                            }}
                            className="flex-1 px-4 py-2 border-2 rounded-lg text-sm"
                            style={{ borderColor: colors.border }}
                            placeholder="e.g., Railway Station, Bus Stand, Airport"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...formData.cityPricing];
                              updated[index].pickupPoints = (updated[index].pickupPoints || []).filter((_, i) => i !== pointIndex);
                              setFormData({ ...formData, cityPricing: updated });
                            }}
                            className="px-3 py-2 rounded-lg text-white"
                            style={{ backgroundColor: '#EF4444' }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.cityPricing];
                          if (!updated[index].pickupPoints) updated[index].pickupPoints = [];
                          updated[index].pickupPoints.push('');
                          setFormData({ ...formData, cityPricing: updated });
                        }}
                        className="inline-flex items-center px-3 py-2 rounded-lg text-sm text-white"
                        style={{ backgroundColor: colors.secondary }}
                      >
                        <Plus size={14} className="mr-1" />
                        Add Pickup Point
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold" style={{ color: colors.darkBg }}>
                      Departure Dates
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...formData.cityPricing];
                        if (!updated[index].departureDates) updated[index].departureDates = [];
                        updated[index].departureDates.push({ startDate: '', endDate: '', isAvailable: true });
                        setFormData({ ...formData, cityPricing: updated });
                      }}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-sm text-white transition-all"
                      style={{ backgroundColor: colors.secondary }}
                    >
                      <Plus size={14} className="mr-1" />
                      Add Departure Date
                    </button>
                  </div>
                  
                  {(cityPrice.departureDates || []).map((departure, depIndex) => (
                    <div key={depIndex} className="mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={departure.startDate ? new Date(departure.startDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const updated = [...formData.cityPricing];
                              updated[index].departureDates[depIndex].startDate = e.target.value;
                              setFormData({ ...formData, cityPricing: updated });
                            }}
                            className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                            style={{ borderColor: colors.border }}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">
                            End Date
                          </label>
                          <input
                            type="date"
                            value={departure.endDate ? new Date(departure.endDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                              const updated = [...formData.cityPricing];
                              updated[index].departureDates[depIndex].endDate = e.target.value;
                              setFormData({ ...formData, cityPricing: updated });
                            }}
                            className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                            style={{ borderColor: colors.border }}
                          />
                        </div>
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="flex items-center text-xs font-medium mb-1 text-gray-600">
                              <input
                                type="checkbox"
                                checked={departure.isAvailable !== false}
                                onChange={(e) => {
                                  const updated = [...formData.cityPricing];
                                  updated[index].departureDates[depIndex].isAvailable = e.target.checked;
                                  setFormData({ ...formData, cityPricing: updated });
                                }}
                                className="mr-2"
                              />
                              Available
                            </label>
                          </div>
                          {(cityPrice.departureDates || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...formData.cityPricing];
                                updated[index].departureDates.splice(depIndex, 1);
                                setFormData({ ...formData, cityPricing: updated });
                              }}
                              className="px-3 py-2 rounded-lg text-white transition-all"
                              style={{ backgroundColor: '#EF4444' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold" style={{ color: colors.darkBg }}>
                      Pricing Options (Add custom categories)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...formData.cityPricing];
                        updated[index].pricingOptions = [...(updated[index].pricingOptions || []), { categoryName: '', price: '', minMembers: 1 }];
                        setFormData({ ...formData, cityPricing: updated });
                      }}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-sm text-white transition-all"
                      style={{ backgroundColor: colors.secondary }}
                    >
                      <Plus size={14} className="mr-1" />
                      Add Price Category
                    </button>
                  </div>
                  
                  {(cityPrice.pricingOptions || []).map((priceOpt, priceIndex) => (
                    <div key={priceIndex} className="mb-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                        <div>
                          <label className="block text-xs font-medium mb-1 text-gray-600">
                            Category Name (e.g., Economy, Deluxe, VIP)
                          </label>
                          <input
                            type="text"
                            value={priceOpt.categoryName}
                            onChange={(e) => {
                              const updated = [...formData.cityPricing];
                              updated[index].pricingOptions[priceIndex].categoryName = e.target.value;
                              setFormData({ ...formData, cityPricing: updated });
                            }}
                            className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                            style={{ borderColor: colors.border }}
                            placeholder="e.g., Economy, Premium"
                          />
                        </div>
                        <div>
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
                            className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                            style={{ borderColor: colors.border }}
                            placeholder="5000"
                            min="0"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="block text-xs font-medium mb-1 text-gray-600">
                              Min Members
                            </label>
                            <input
                              type="number"
                              value={priceOpt.minMembers || 1}
                              onChange={(e) => {
                                const updated = [...formData.cityPricing];
                                updated[index].pricingOptions[priceIndex].minMembers = Number(e.target.value);
                                setFormData({ ...formData, cityPricing: updated });
                              }}
                              className="w-full px-3 py-2 border-2 rounded-lg text-sm"
                              style={{ borderColor: colors.border }}
                              placeholder="1"
                              min="1"
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
                              className="mt-6 px-3 py-2 rounded-lg text-white transition-all"
                              style={{ backgroundColor: '#EF4444' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      {errors[`cityPrice_${index}_option_${priceIndex}`] && (
                        <p className="text-red-500 text-xs mt-1 ml-3">{errors[`cityPrice_${index}_option_${priceIndex}`]}</p>
                      )}
                    </div>
                  ))}
                </div>

                {errors[`cityPrice_${index}`] && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{errors[`cityPrice_${index}`]}</p>
                  </div>
                )}

                {formData.cityPricing.length > 1 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('cityPricing', index)}
                      className="px-4 py-2 rounded-xl transition-colors flex items-center text-white"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Remove City
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('cityPricing', { 
                city: '', 
                pickupPoints: [],
                departureDates: [{ startDate: '', endDate: '', isAvailable: true }],
                pricingOptions: [{ categoryName: '', price: '', minMembers: 1 }] 
              })}
              className="inline-flex items-center px-6 py-3 rounded-xl transition-colors transform hover:scale-105 text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus size={20} className="mr-2" />
              Add Another City
            </button>
              </>
            )}
          </div>

          {/* Add-ons Section */}
          <div id="addons" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{ backgroundColor: colors.secondary + '15' }}
              >
                <Plus size={24} style={{ color: colors.secondary }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Add-on Options</h2>
                <p style={{ color: colors.textDark }}>Optional extras that users can select during booking</p>
              </div>
            </div>

            {formData.addOns.map((addon, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl border mb-4"
                style={{ 
                  backgroundColor: colors.lightBg,
                  borderColor: colors.border
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                      Add-on Name *
                    </label>
                    <input
                      type="text"
                      value={addon.name}
                      onChange={(e) => handleObjectArrayChange('addOns', index, 'name', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl"
                      style={{ borderColor: colors.border }}
                      placeholder="e.g., Extra Meal, Guide Service"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={addon.price}
                      onChange={(e) => handleObjectArrayChange('addOns', index, 'price', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 rounded-xl"
                      style={{ borderColor: colors.border }}
                      placeholder="500"
                      min="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                    Description (Optional)
                  </label>
                  <textarea
                    value={addon.description}
                    onChange={(e) => handleObjectArrayChange('addOns', index, 'description', e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-xl"
                    style={{ borderColor: colors.border }}
                    placeholder="Brief description of the add-on"
                    rows="2"
                  />
                </div>
                {formData.addOns.length > 1 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('addOns', index)}
                      className="px-4 py-2 rounded-xl transition-colors flex items-center text-white"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Remove Add-on
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('addOns', { name: '', price: '', description: '' })}
              className="inline-flex items-center px-6 py-3 rounded-xl transition-colors transform hover:scale-105 text-white"
              style={{ backgroundColor: colors.secondary }}
            >
              <Plus size={20} className="mr-2" />
              Add Another Add-on
            </button>
          </div>

          {/* Addon Facilities Section */}
          <div id="facilities" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{ backgroundColor: '#10B981' + '15' }}
              >
                <CheckCircle2 size={24} style={{ color: '#10B981' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Additional Facilities</h2>
                <p style={{ color: colors.textDark }}>Detailed facilities information with categorized features</p>
              </div>
            </div>

            {formData.addonFacilities.map((facility, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl border mb-4"
                style={{ 
                  backgroundColor: colors.lightBg,
                  borderColor: colors.border
                }}
              >
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                    Facility Header *
                  </label>
                  <input
                    type="text"
                    value={facility.header}
                    onChange={(e) => handleObjectArrayChange('addonFacilities', index, 'header', e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-xl"
                    style={{ borderColor: colors.border }}
                    placeholder="e.g., Transportation, Accommodation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                    Sub-points
                  </label>
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
                        className="flex-1 px-4 py-3 border-2 rounded-xl"
                        style={{ borderColor: colors.border }}
                        placeholder="e.g., AC Bus from pickup point"
                      />
                      {facility.subPoints.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formData.addonFacilities];
                            updated[index].subPoints.splice(subIndex, 1);
                            setFormData({ ...formData, addonFacilities: updated });
                          }}
                          className="px-4 py-2 rounded-xl text-white"
                          style={{ backgroundColor: '#EF4444' }}
                        >
                          <X size={16} />
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
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm transition-all"
                    style={{ backgroundColor: colors.lightBg, color: colors.secondary, border: `1px solid ${colors.secondary}` }}
                  >
                    <Plus size={14} className="mr-1" />
                    Add Sub-point
                  </button>
                </div>

                {formData.addonFacilities.length > 1 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('addonFacilities', index)}
                      className="px-4 py-2 rounded-xl transition-colors flex items-center text-white"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Remove Facility
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('addonFacilities', { header: '', subPoints: [''] })}
              className="inline-flex items-center px-6 py-3 rounded-xl transition-colors transform hover:scale-105 text-white"
              style={{ backgroundColor: '#10B981' }}
            >
              <Plus size={20} className="mr-2" />
              Add Another Facility
            </button>
          </div>

          {/* Highlights */}
          <div id="highlights" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{ backgroundColor: '#FEF3C7' }}
              >
                <Star size={24} style={{ color: '#D97706' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Tour Highlights</h2>
                <p style={{ color: colors.textDark }}>Key features and experiences that make your tour special</p>
              </div>
            </div>
            
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="flex gap-3 mb-4">
                <div 
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-3"
                  style={{ backgroundColor: colors.primary + '15' }}
                >
                  <span className="text-sm font-bold" style={{ color: colors.primary }}>{index + 1}</span>
                </div>
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                  className="flex-1 px-4 py-3 border-2 rounded-xl transition-all"
                  style={{ 
                    borderColor: colors.border,
                    focusBorderColor: colors.primary
                  }}
                  placeholder="Describe a key highlight of your tour"
                />
                {formData.highlights.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('highlights', index)}
                    className="px-4 py-3 rounded-xl transition-colors self-start mt-3 text-white"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('highlights', '')}
              className="inline-flex items-center px-6 py-3 rounded-xl transition-colors transform hover:scale-105 text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus size={20} className="mr-2" />
              Add Highlight
            </button>
          </div>

          {/* Inclusions & Exclusions */}
          <div id="inclusions" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{ backgroundColor: '#D1FAE5' }}
              >
                <CheckCircle2 size={24} style={{ color: '#059669' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Inclusions & Exclusions</h2>
                <p style={{ color: colors.textDark }}>Clearly define what's included and what's not</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Inclusions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: colors.darkBg }}>
                  <CheckCircle2 size={20} className="text-green-500 mr-2" />
                  What's Included
                </h3>
                {formData.inclusions.map((inclusion, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={inclusion}
                      onChange={(e) => handleArrayChange('inclusions', index, e.target.value)}
                      className="flex-1 px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      placeholder="e.g., Accommodation, Meals, Guide"
                    />
                    {formData.inclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('inclusions', index)}
                        className="px-4 py-3 rounded-xl transition-colors text-white"
                        style={{ backgroundColor: '#EF4444' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('inclusions', '')}
                  className="inline-flex items-center px-4 py-2 rounded-lg transition-colors text-white"
                  style={{ backgroundColor: '#10B981' }}
                >
                  <Plus size={16} className="mr-2" />
                  Add Inclusion
                </button>
              </div>

              {/* Exclusions */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: colors.darkBg }}>
                  <X size={20} className="text-red-500 mr-2" />
                  What's Not Included
                </h3>
                {formData.exclusions.map((exclusion, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={exclusion}
                      onChange={(e) => handleArrayChange('exclusions', index, e.target.value)}
                      className="flex-1 px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      placeholder="e.g., Flight tickets, Personal expenses"
                    />
                    {formData.exclusions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('exclusions', index)}
                        className="px-4 py-3 rounded-xl transition-colors text-white"
                        style={{ backgroundColor: '#EF4444' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('exclusions', '')}
                  className="inline-flex items-center px-4 py-2 rounded-lg transition-colors text-white"
                  style={{ backgroundColor: '#EF4444' }}
                >
                  <Plus size={16} className="mr-2" />
                  Add Exclusion
                </button>
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <div id="itinerary" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{ backgroundColor: colors.secondary + '15' }}
              >
                <Calendar size={24} style={{ color: colors.secondary }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Tour Itinerary</h2>
                <p style={{ color: colors.textDark }}>Plan each day's activities and arrangements</p>
              </div>
            </div>
            
            {formData.itinerary.map((item, index) => (
              <div 
                key={index} 
                className="mb-8 p-6 rounded-xl border"
                style={{ 
                  backgroundColor: colors.secondary + '08',
                  borderColor: colors.secondary + '30'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: colors.secondary }}>Day {item.day}</h3>
                  {formData.itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('itinerary', index)}
                      className="px-4 py-2 rounded-lg transition-colors text-white"
                      style={{ backgroundColor: '#EF4444' }}
                    >
                      Remove Day
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>Day Number</label>
                    <input
                      type="number"
                      value={item.day}
                      onChange={(e) => handleObjectArrayChange('itinerary', index, 'day', Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>Day Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleObjectArrayChange('itinerary', index, 'title', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      placeholder="e.g., Arrival in Delhi, City Exploration"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                    Day Description <span className="text-xs font-normal text-gray-500">(Use toolbar for formatting)</span>
                  </label>
                  <RichTextEditor
                    key={`description-${index}-${item.day}`}
                    value={item.description || ''}
                    onChange={(html) => handleObjectArrayChange('itinerary', index, 'description', html)}
                    placeholder="Describe the day's activities, sights, and experiences in detail. Use bullet points, bold, italic for better formatting."
                    minHeight="200px"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>Meals Included</label>
                    <input
                      type="text"
                      value={item.meals}
                      onChange={(e) => handleObjectArrayChange('itinerary', index, 'meals', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      placeholder="e.g., Breakfast, Lunch, Dinner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>Accommodation</label>
                    <input
                      type="text"
                      value={item.accommodation}
                      onChange={(e) => handleObjectArrayChange('itinerary', index, 'accommodation', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      placeholder="e.g., 4-star Hotel, Camping, Resort"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>🚗 Cab Type</label>
                    <input
                      type="text"
                      value={item.cabType || ''}
                      onChange={(e) => handleObjectArrayChange('itinerary', index, 'cabType', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      placeholder="e.g., Innova, Tempo Traveller, AC Bus"
                    />
                  </div>
                </div>

                {/* NEW: Note and Activities Fields */}
                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                    📝 Day Note <span className="text-xs font-normal" style={{ color: colors.textDark }}>(Optional - Use toolbar for formatting)</span>
                  </label>
                  <RichTextEditor
                    key={`note-${index}-${item.day}`}
                    value={item.note || ''}
                    onChange={(html) => handleObjectArrayChange('itinerary', index, 'note', html)}
                    placeholder="Add any special notes or important information for this day. Use formatting for emphasis."
                    minHeight="120px"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>
                    🎯 Activities <span className="text-xs font-normal" style={{ color: colors.textDark }}>(Optional - Press Enter to add each activity)</span>
                  </label>
                  <div className="space-y-2">
                    {(item.activities || []).map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => {
                            const newActivities = [...(item.activities || [])];
                            newActivities[actIndex] = e.target.value;
                            handleObjectArrayChange('itinerary', index, 'activities', newActivities);
                          }}
                          className="flex-1 px-4 py-2 border-2 rounded-xl transition-all"
                          style={{ 
                            borderColor: colors.border,
                            focusBorderColor: colors.primary
                          }}
                          placeholder={`Activity ${actIndex + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newActivities = (item.activities || []).filter((_, i) => i !== actIndex);
                            handleObjectArrayChange('itinerary', index, 'activities', newActivities);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          style={{ color: colors.error }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newActivities = [...(item.activities || []), ''];
                        handleObjectArrayChange('itinerary', index, 'activities', newActivities);
                      }}
                      className="inline-flex items-center px-4 py-2 rounded-lg transition-colors text-sm"
                      style={{ 
                        backgroundColor: colors.primary + '15',
                        color: colors.primary
                      }}
                    >
                      <Plus size={16} className="mr-1" />
                      Add Activity
                    </button>
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
                cabType: '',
                note: '',
                activities: []
              })}
              className="inline-flex items-center px-6 py-3 rounded-xl transition-colors transform hover:scale-105 text-white"
              style={{ backgroundColor: colors.secondary }}
            >
              <Plus size={20} className="mr-2" />
              Add New Day
            </button>
          </div>

          {/* FAQs */}
          <div id="faqs" className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex items-center mb-6">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mr-4"
                style={{ backgroundColor: colors.primary + '15' }}
              >
                <HelpCircle size={24} style={{ color: colors.primary }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: colors.darkBg }}>Frequently Asked Questions</h2>
                <p style={{ color: colors.textDark }}>Anticipate and answer common traveler questions</p>
              </div>
            </div>
            
            {formData.faqs.map((faq, index) => (
              <div 
                key={index} 
                className="mb-6 p-6 rounded-xl border"
                style={{ 
                  backgroundColor: colors.primary + '08',
                  borderColor: colors.primary + '30'
                }}
              >
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>Question</label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleObjectArrayChange('faqs', index, 'question', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      placeholder="Enter a common question travelers might have"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: colors.darkBg }}>Answer</label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => handleObjectArrayChange('faqs', index, 'answer', e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-xl transition-all"
                      style={{ 
                        borderColor: colors.border,
                        focusBorderColor: colors.primary
                      }}
                      rows={3}
                      placeholder="Provide a clear and helpful answer"
                    />
                  </div>
                </div>

                {formData.faqs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('faqs', index)}
                    className="mt-4 px-4 py-2 rounded-lg transition-colors text-white"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    Remove FAQ
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('faqs', { question: '', answer: '' })}
              className="inline-flex items-center px-6 py-3 rounded-xl transition-colors transform hover:scale-105 text-white"
              style={{ backgroundColor: colors.primary }}
            >
              <Plus size={20} className="mr-2" />
              Add New FAQ
            </button>
          </div>

          {/* Submit Section */}
          <div className="bg-white rounded-xl shadow-lg border p-8" style={{ borderColor: colors.border }}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: colors.darkBg }}>
                  {isEditing ? 'Ready to update your tour?' : 'Ready to launch your tour?'}
                </h3>
                <p style={{ color: colors.textDark }}>
                  {isEditing 
                    ? 'Review all information and save changes to update your tour package'
                    : 'Double-check all details and create this amazing tour package'
                  }
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/admin/tours')}
                  className="px-8 py-3 border-2 rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 font-semibold"
                  style={{ 
                    borderColor: colors.border,
                    color: colors.textDark
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 rounded-xl disabled:opacity-50 transition-all transform hover:scale-105 font-semibold shadow-lg flex items-center text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  {loading ? (
                    <>
                      <div 
                        className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mr-2"
                        style={{ borderColor: colors.textLight }}
                      ></div>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      {isEditing ? 'Update Tour Package' : 'Create Tour Package'}
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

export default TourForm;