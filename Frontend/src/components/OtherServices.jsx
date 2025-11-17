import React, { useState } from 'react';
import { otherServicesAPI } from '../api/userAPI';
import { showSuccess, showApiError } from '../utils/toast';

const OtherServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    destination: '',
    pickupLocation: '',
    dropLocation: '',
    travelStartDate: '',
    travelEndDate: '',
    numberOfMembers: 1,
    adults: 0,
    children: 0,
    infants: 0,
    preferredSeason: 'Any',
    checkInDate: '',
    checkOutDate: '',
    numberOfRooms: 1,
    hotelPreference: 'Any',
    visaCountry: '',
    visaType: '',
    urgency: 'Normal',
    taxiType: '',
    journeyType: '',
    transportMode: '',
    classPreference: '',
    cruiseDestination: '',
    cruiseDuration: '',
    parcelWeight: '',
    parcelDimensions: '',
    deliverySpeed: '',
    membersExpected: '',
    specialRequests: '',
    additionalDetails: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [enquiryReference, setEnquiryReference] = useState('');

  // Service cards with icons and descriptions
  const services = [
    {
      id: 1,
      name: "Taxi Booking Services",
      icon: "🚕",
      description: "Local and outstation taxi services with professional drivers",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 2,
      name: "Hotel Bookings and Accommodation",
      icon: "🏨",
      description: "Premium hotel bookings with verified accommodations",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 3,
      name: "Visa and Passport Assistance",
      icon: "✈️",
      description: "Complete visa processing and passport services",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 4,
      name: "Season-Wise Segregated Tours",
      icon: "🌸",
      description: "Destination packages optimized for seasonal experiences",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 5,
      name: "Cruise Holidays",
      icon: "🚢",
      description: "Luxury cruise packages with premium amenities",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 6,
      name: "Bus, Train, and Flight Booking",
      icon: "🚄",
      description: "Complete transportation booking services",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 7,
      name: "Parcel and Courier Services",
      icon: "📦",
      description: "Reliable domestic and international courier services",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 8,
      name: "Customized Tours",
      icon: "🗺️",
      description: "Personalized travel itineraries tailored to your needs",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 9,
      name: "Tour Packages",
      icon: "🎒",
      description: "Curated tour packages for popular destinations",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 10,
      name: "Treks and Adventure Packages",
      icon: "⛰️",
      description: "Adventure experiences with certified guides",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 11,
      name: "Tours and Travel Services",
      icon: "🌍",
      description: "Comprehensive travel planning and coordination",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    },
    {
      id: 12,
      name: "Online Taxi Booking",
      icon: "🚗",
      description: "Instant taxi bookings for local and outstation travel",
      bgColor: "bg-white",
      borderColor: "border-blue-200"
    }
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle service card click
  const handleServiceClick = (serviceName) => {
    setSelectedService(serviceName);
    setFormData(prev => ({
      ...prev,
      serviceType: serviceName
    }));
    // Smooth scroll to form
    setTimeout(() => {
      document.getElementById('service-form')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  // Handle back to services
  const handleBackToServices = () => {
    setSelectedService(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      serviceType: '',
      destination: '',
      pickupLocation: '',
      dropLocation: '',
      travelStartDate: '',
      travelEndDate: '',
      numberOfMembers: 1,
      adults: 0,
      children: 0,
      infants: 0,
      preferredSeason: 'Any',
      checkInDate: '',
      checkOutDate: '',
      numberOfRooms: 1,
      hotelPreference: 'Any',
      visaCountry: '',
      visaType: '',
      urgency: 'Normal',
      taxiType: '',
      journeyType: '',
      transportMode: '',
      classPreference: '',
      cruiseDestination: '',
      cruiseDuration: '',
      parcelWeight: '',
      parcelDimensions: '',
      deliverySpeed: '',
      budgetRange: 'Flexible',
      specialRequests: '',
      additionalDetails: ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await otherServicesAPI.createEnquiry(formData);
      
      if (response.data.success) {
        setSuccess(true);
        setEnquiryReference(response.data.enquiryReference);
        showSuccess(`Thank you! Your enquiry has been received. Reference ID: ${response.data.enquiryReference}`);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          serviceType: '',
          destination: '',
          pickupLocation: '',
          dropLocation: '',
          travelStartDate: '',
          travelEndDate: '',
          numberOfMembers: 1,
          adults: 0,
          children: 0,
          infants: 0,
          preferredSeason: 'Any',
          checkInDate: '',
          checkOutDate: '',
          numberOfRooms: 1,
          hotelPreference: 'Any',
          visaCountry: '',
          visaType: '',
          urgency: 'Normal',
          taxiType: '',
          journeyType: '',
          transportMode: '',
          classPreference: '',
          cruiseDestination: '',
          cruiseDuration: '',
          parcelWeight: '',
          parcelDimensions: '',
          deliverySpeed: '',
          budgetRange: 'Flexible',
          specialRequests: '',
          additionalDetails: ''
        });

        // Scroll to success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'We encountered an issue submitting your enquiry. Please try again.';
      setError(errorMessage);
      showApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Check which fields to show based on service type
  const showDestinationFields = [
    'Taxi Booking Services',
    'Online Taxi Booking',
    'Tours and Travel Services',
    'Tour Packages',
    'Treks and Adventure Packages',
    'Customized Tours',
    'Season-Wise Segregated Tours'
  ].includes(formData.serviceType);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1E9ABF' }}>
            Additional Services
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive range of travel and support services designed for your convenience
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-green-800">Enquiry Received Successfully!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Thank you for your enquiry. Our team will contact you shortly.</p>
                  <p className="mt-2">
                    <strong>Reference ID:</strong> 
                    <span className="ml-2 px-3 py-1 bg-green-100 text-green-800 rounded-md font-mono">
                      {enquiryReference}
                    </span>
                  </p>
                  <p className="mt-2 text-xs">
                    Please keep this reference number for future communication.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSuccess(false);
                    handleBackToServices();
                  }}
                  className="mt-4 text-sm font-medium text-green-700 hover:text-green-900 flex items-center"
                >
                  ← Return to Services
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">Submission Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tempo Traveller Rental Section */}
        {!selectedService && (
          <div className="mb-16">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl mb-12 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1E9ABF] via-[#1E9ABF] to-[#156d87]"></div>
              <div className="relative px-8 py-16 md:px-16 md:py-20">
                <div className="max-w-4xl">
                  <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold mb-6">
                    🚐 Premium Fleet Services
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Vehicle On Rent
                  </h2>
                  <p className="text-xl md:text-2xl text-white/95 font-medium mb-4">
                    Aarohan Holidays: Best  Traveller Vehicle Rental in Aurangabad
                  </p>
                  <p className="text-lg text-white/90 leading-relaxed">
                    Looking for a Traveller Vehicle on Rent in Aurangabad? We've Got You Covered!
                  </p>
                </div>
              </div>
            </div>

            {/* Introduction Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Are you planning a <span className="font-semibold text-[#1E9ABF]">family vacation, group trip, or corporate outing</span> in Aurangabad? 
                  Look no further! We offer the best  Traveller Vehicle  services on rent in Aurangabad to make your journey smooth, comfortable, and hassle-free.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  Our Travellers Vehicle in Aurangabad are equipped with <span className="font-semibold text-[#1E9ABF]">adjustable, cushioned seats</span> that 
                  ensure you can relax throughout your trip. Whether you're feeling tired or just want some extra space, our vehicles are designed with your 
                  comfort in mind. Plus, there's ample luggage space, so you never have to worry about carrying bags around.
                </p>
                <div className="bg-gradient-to-r from-[#1E9ABF]/10 to-transparent border-l-4 border-[#1E9ABF] p-6 rounded-lg">
                  <p className="text-gray-800 font-medium text-lg mb-2">
                    💎 Make memories that last a lifetime
                  </p>
                  <p className="text-gray-600">
                    As one of the most trusted travels in Aurangabad, we ensure safe, reliable, and comfortable transportation every time you travel with us.
                  </p>
                </div>
              </div>
            </div>

            {/* Fleet Options Section */}
            <div className="mb-12">
              <div className="text-center mb-10">
                <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E9ABF' }}>
                  Our Fleet Options
                </h3>
                <p className="text-xl text-gray-600">
                  We provide  Travellers Vehicle in a variety of sizes to suit your needs
                </p>
              </div>

              {/* Fleet Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {[
                  { capacity: '10-seater', icon: '🚐' },
                  { capacity: '13-seater', icon: '🚐' },
                  { capacity: '17-seater', icon: '🚌' },
                  { capacity: '20-seater', icon: '🚌' },
                  { capacity: '26-seater', icon: '🚍' }
                ].map((vehicle, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg border-2 border-[#1E9ABF]/20 hover:border-[#1E9ABF] transition-all duration-300 transform hover:scale-105">
                    <div className="text-4xl mb-3">{vehicle.icon}</div>
                    <div className="font-bold text-lg" style={{ color: '#1E9ABF' }}>{vehicle.capacity}</div>
                  </div>
                ))}
              </div>

              {/* Premium Options */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-8 border-2 border-amber-200 shadow-xl">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">👑</span>
                    <h4 className="text-2xl font-bold text-amber-800">Maharaja  Traveller</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Perfect for those who prefer added <span className="font-semibold">comfort and style</span>. 
                    Experience luxury travel with premium amenities and spacious interiors.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border-2 border-blue-200 shadow-xl">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">✨</span>
                    <h4 className="text-2xl font-bold text-blue-800">Force Urbania</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Looking for something premium? Book Force Urbania for a <span className="font-semibold">modern travel experience</span> 
                    with cutting-edge features and elegant design.
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Specifications Table */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
              <div className="px-8 py-6 text-white" style={{ backgroundColor: '#1E9ABF' }}>
                <h3 className="text-2xl md:text-3xl font-bold text-center">Vehicle Specifications</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-b-2 border-[#1E9ABF]">Seating Capacity</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-b-2 border-[#1E9ABF]">Ideal For</th>
                      <th className="px-6 py-4 text-left font-bold text-gray-900 border-b-2 border-[#1E9ABF]">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-5 font-semibold" style={{ color: '#1E9ABF' }}>10 Seater Traveller</td>
                      <td className="px-6 py-5 text-gray-700">Sightseeing</td>
                      <td className="px-6 py-5 text-gray-600">Perfect for small groups or families exploring Aurangabad. Comes with AC and comfortable seating, making it ideal for short trips and local tours.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-5 font-semibold" style={{ color: '#1E9ABF' }}>13 Seater Tempo Traveller</td>
                      <td className="px-6 py-5 text-gray-700">Small Family Trips</td>
                      <td className="px-6 py-5 text-gray-600">Suitable for slightly larger families or small groups. Features AC and comfort seating, making it ideal for family outings or city tours.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-5 font-semibold" style={{ color: '#1E9ABF' }}>17 Seater Tempo Traveller</td>
                      <td className="px-6 py-5 text-gray-700">Small Group Trips</td>
                      <td className="px-6 py-5 text-gray-600">Great for small family trips or group travel. This AC vehicle provides a relaxed and enjoyable ride for trips within the city or nearby locations.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-5 font-semibold" style={{ color: '#1E9ABF' }}>20 Seater Tempo Traveller</td>
                      <td className="px-6 py-5 text-gray-700">Large Groups</td>
                      <td className="px-6 py-5 text-gray-600">Ideal for bigger groups or families. Spacious and equipped with AC, it's perfect for long-distance journeys or group outings.</td>
                    </tr>
                    <tr className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-5 font-semibold" style={{ color: '#1E9ABF' }}>26 Seater Tempo Traveller</td>
                      <td className="px-6 py-5 text-gray-700">Pilgrimages, Weddings, Business Gatherings, Educational Excursions</td>
                      <td className="px-6 py-5 text-gray-600">Best for large groups attending weddings, religious trips, or school/business outings. AC and ample space make it suitable for comfortable long trips.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Premium Amenities Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
              <div className="text-center mb-10">
                <div className="inline-block px-6 py-3 bg-[#1E9ABF]/10 rounded-full mb-4">
                  <span className="text-2xl">⭐</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1E9ABF' }}>
                  Premium Amenities On Board
                </h3>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Experience a luxurious journey with our services, equipped with amenities to ensure a comfortable and enjoyable ride
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                  { icon: '🪑', title: 'Comfortable Seating', desc: 'Cushioned seats' },
                  { icon: '❄️', title: 'Air Conditioning', desc: 'Climate control' },
                  { icon: '📶', title: 'Wi-Fi', desc: 'Stay connected' },
                  { icon: '🎵', title: 'Entertainment', desc: 'Music systems' },
                  { icon: '🥤', title: 'Refreshments', desc: 'Snacks & beverages' },
                  { icon: '🚻', title: 'Restrooms', desc: 'On select vehicles' },
                  { icon: '🔌', title: 'Charging Ports', desc: 'USB & power outlets' },
                  { icon: '🪟', title: 'Scenic Views', desc: 'Large windows' },
                  { icon: '📍', title: 'GPS Tracking', desc: 'Real-time updates' },
                  { icon: '👨‍✈️', title: 'Professional Guides', desc: 'Friendly & knowledgeable' }
                ].map((amenity, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200 hover:border-[#1E9ABF] transition-all duration-300 transform hover:scale-105">
                    <div className="text-4xl mb-3">{amenity.icon}</div>
                    <h4 className="font-bold text-gray-900 mb-1">{amenity.title}</h4>
                    <p className="text-sm text-gray-600">{amenity.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="my-16 border-t-2 border-gray-200"></div>

            {/* Cabs & Cars Section */}
            <div className="mb-16">
              {/* Hero Section for Cabs */}
              <div className="relative overflow-hidden rounded-2xl mb-12 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E66926] via-[#E66926] to-[#c44d0f]"></div>
                <div className="relative px-8 py-16 md:px-16 md:py-20">
                  <div className="max-w-4xl">
                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold mb-6">
                      🚗 Premium Cab Services
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                      Cab Services in Aurangabad
                    </h2>
                    <p className="text-xl md:text-2xl text-white/95 font-medium mb-4">
                      Comfortable & Reliable Taxi Services for Every Need
                    </p>
                    <p className="text-lg text-white/90 leading-relaxed">
                      From sedan to SUV, we have the perfect vehicle for your journey!
                    </p>
                  </div>
                </div>
              </div>

              {/* Introduction for Cabs */}
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    Looking for <span className="font-semibold text-[#E66926]">reliable cab services in Aurangabad</span>? Whether it's a quick city ride, 
                    airport transfer, or outstation trip, we offer a diverse fleet of well-maintained vehicles with professional drivers to ensure your 
                    journey is safe, comfortable, and hassle-free.
                  </p>
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    Our cabs come equipped with <span className="font-semibold text-[#E66926]">GPS tracking, air conditioning, and comfortable interiors</span>, 
                    perfect for both short city rides and long-distance travel. All our drivers are experienced, courteous, and well-versed with local routes.
                  </p>
                  <div className="bg-gradient-to-r from-[#E66926]/10 to-transparent border-l-4 border-[#E66926] p-6 rounded-lg">
                    <p className="text-gray-800 font-medium text-lg mb-2">
                      🚗 Travel in Style and Comfort
                    </p>
                    <p className="text-gray-600">
                      Book your cab with Aarohan Holidays and experience premium transportation services at competitive prices.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cab Fleet Options */}
              <div className="mb-12">
                <div className="text-center mb-10">
                  <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#E66926' }}>
                    Our Cab Fleet
                  </h3>
                  <p className="text-xl text-gray-600">
                    Choose from our range of vehicles suited for every travel need
                  </p>
                </div>

                {/* Cab Types Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {[
                    { 
                      type: 'Sedan (4-Seater)', 
                      icon: '🚗',
                      models: 'Swift Dzire, Honda Amaze, Etios',
                      ideal: 'Perfect for couples or small families',
                      features: ['AC', 'GPS', 'Music System', 'Comfortable Seating']
                    },
                    { 
                      type: 'Sedan Plus (4-Seater)', 
                      icon: '🚙',
                      models: 'Honda City, Verna, Ciaz',
                      ideal: 'Ideal for business trips and comfort',
                      features: ['Premium AC', 'Spacious Boot', 'Leather Seats', 'Advanced Safety']
                    },
                    { 
                      type: 'SUV (6-Seater)', 
                      icon: '🚙',
                      models: 'Ertiga, Innova Crysta',
                      ideal: 'Great for families and group travel',
                      features: ['7-Seater', 'Extra Luggage Space', 'Captain Seats', 'Premium Comfort']
                    },
                    { 
                      type: 'SUV Premium (7-Seater)', 
                      icon: '🚐',
                      models: 'Toyota Innova Crysta, Mahindra XUV700',
                      ideal: 'Perfect for larger families',
                      features: ['8-Seater', 'Luxury Interior', 'Advanced Entertainment', 'Push-Back Seats']
                    },
                    { 
                      type: 'Luxury Sedan (4-Seater)', 
                      icon: '✨',
                      models: 'BMW, Audi, Mercedes',
                      ideal: 'Premium business and special occasions',
                      features: ['Luxury Interior', 'Chauffeur Service', 'Premium Sound System', 'VIP Treatment']
                    },
                    { 
                      type: 'Hatchback (4-Seater)', 
                      icon: '🚗',
                      models: 'Swift, i10, Wagon R',
                      ideal: 'Budget-friendly city rides',
                      features: ['AC', 'Compact', 'Fuel Efficient', 'Easy Parking']
                    }
                  ].map((cab, index) => (
                    <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200 hover:border-[#E66926] transition-all duration-300 transform hover:scale-105">
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-3">{cab.icon}</div>
                        <h4 className="text-xl font-bold mb-2" style={{ color: '#E66926' }}>{cab.type}</h4>
                        <p className="text-sm text-gray-600 font-medium mb-2">{cab.models}</p>
                        <p className="text-sm text-gray-500 italic">{cab.ideal}</p>
                      </div>
                      <div className="border-t border-gray-200 pt-4 mt-4">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Key Features:</p>
                        <ul className="space-y-1">
                          {cab.features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cab Services Table */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-12">
                <div className="px-8 py-6 text-white" style={{ backgroundColor: '#E66926' }}>
                  <h3 className="text-2xl md:text-3xl font-bold text-center">Cab Service Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold text-gray-900 border-b-2 border-[#E66926]">Vehicle Type</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900 border-b-2 border-[#E66926]">Seating</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900 border-b-2 border-[#E66926]">Best For</th>
                        <th className="px-6 py-4 text-left font-bold text-gray-900 border-b-2 border-[#E66926]">Special Features</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-5 font-semibold" style={{ color: '#E66926' }}>Hatchback</td>
                        <td className="px-6 py-5 text-gray-700">4 Passengers</td>
                        <td className="px-6 py-5 text-gray-600">Quick city rides, solo travelers, budget trips</td>
                        <td className="px-6 py-5 text-gray-600">Compact size, fuel-efficient, easy to navigate in traffic</td>
                      </tr>
                      <tr className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-5 font-semibold" style={{ color: '#E66926' }}>Sedan (Economy)</td>
                        <td className="px-6 py-5 text-gray-700">4 Passengers</td>
                        <td className="px-6 py-5 text-gray-600">Daily commute, airport transfers, small families</td>
                        <td className="px-6 py-5 text-gray-600">Comfortable seating, AC, moderate luggage space</td>
                      </tr>
                      <tr className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-5 font-semibold" style={{ color: '#E66926' }}>Sedan (Premium)</td>
                        <td className="px-6 py-5 text-gray-700">4 Passengers</td>
                        <td className="px-6 py-5 text-gray-600">Business meetings, corporate travel, comfort seekers</td>
                        <td className="px-6 py-5 text-gray-600">Leather seats, extra legroom, premium sound system</td>
                      </tr>
                      <tr className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-5 font-semibold" style={{ color: '#E66926' }}>SUV (6-Seater)</td>
                        <td className="px-6 py-5 text-gray-700">6 Passengers</td>
                        <td className="px-6 py-5 text-gray-600">Family trips, group outings, luggage-heavy travel</td>
                        <td className="px-6 py-5 text-gray-600">Captain seats, spacious interiors, large boot space</td>
                      </tr>
                      <tr className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-5 font-semibold" style={{ color: '#E66926' }}>SUV (7-Seater)</td>
                        <td className="px-6 py-5 text-gray-700">7 Passengers</td>
                        <td className="px-6 py-5 text-gray-600">Large families, extended trips, group tours</td>
                        <td className="px-6 py-5 text-gray-600">3-row seating, push-back seats, entertainment system</td>
                      </tr>
                      <tr className="hover:bg-orange-50 transition-colors">
                        <td className="px-6 py-5 font-semibold" style={{ color: '#E66926' }}>Luxury Sedan</td>
                        <td className="px-6 py-5 text-gray-700">4 Passengers</td>
                        <td className="px-6 py-5 text-gray-600">VIP transfers, weddings, corporate executives</td>
                        <td className="px-6 py-5 text-gray-600">Premium interior, chauffeur service, complimentary refreshments</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cab Service Types */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-8 border-2 border-blue-200 shadow-xl">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">🏙️</span>
                    <h4 className="text-xl font-bold text-blue-800">Local City Rides</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Quick and reliable transportation within Aurangabad city limits. Perfect for shopping, meetings, or visiting local attractions.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border-2 border-purple-200 shadow-xl">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">🛫</span>
                    <h4 className="text-xl font-bold text-purple-800">Airport Transfers</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Punctual pickup and drop services to/from Aurangabad Airport. Track flight schedules for timely service.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-8 border-2 border-green-200 shadow-xl">
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">🗺️</span>
                    <h4 className="text-xl font-bold text-green-800">Outstation Trips</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    Long-distance travel made comfortable. Visit nearby cities, tourist destinations, or hill stations with ease.
                  </p>
                </div>
              </div>

              {/* Why Choose Our Cabs */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="text-center mb-10">
                  <div className="inline-block px-6 py-3 bg-[#E66926]/10 rounded-full mb-4">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#E66926' }}>
                    Why Choose Our Cab Services
                  </h3>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Experience the difference with our premium features and customer-first approach
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[
                    { icon: '✅', title: 'Verified Drivers', desc: 'Background checked' },
                    { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges' },
                    { icon: '🕐', title: '24/7 Availability', desc: 'Round-the-clock service' },
                    { icon: '📱', title: 'Easy Booking', desc: 'Online & phone' },
                    { icon: '🧼', title: 'Clean Vehicles', desc: 'Sanitized regularly' },
                    { icon: '⏱️', title: 'On-Time Service', desc: 'Punctual pickups' },
                    { icon: '🛡️', title: 'Insured Vehicles', desc: 'Complete safety' },
                    { icon: '💳', title: 'Multiple Payment', desc: 'Cash, card, UPI' }
                  ].map((feature, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg border border-gray-200 hover:border-[#E66926] transition-all duration-300 transform hover:scale-105">
                      <div className="text-4xl mb-3">{feature.icon}</div>
                      <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Services Section Header */}
        {!selectedService && (
          <div className="text-center mb-12">
            <div className="inline-block px-6 py-3 bg-[#1E9ABF]/10 rounded-full mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1E9ABF' }}>
              Explore Our Additional Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From taxi bookings to visa assistance, discover all the ways we can make your travel seamless
            </p>
            <div className="mt-6 h-1 w-32 mx-auto rounded-full" style={{ backgroundColor: '#E66926' }}></div>
          </div>
        )}

        {/* Service Cards Grid - Show when no service selected */}
        {!selectedService && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {services.map((service, index) => (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service.name)}
                className={`${service.bgColor} border-2 ${service.borderColor} rounded-xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
              >
                <div className="flex flex-col items-center text-center h-full">
                  {/* Icon */}
                  <div className="text-5xl mb-4 transform transition-transform duration-300 group-hover:scale-110">
                    {service.icon}
                  </div>
                  
                  {/* Service Name */}
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1E9ABF' }}>
                    {service.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 flex-grow">
                    {service.description}
                  </p>
                  
                  {/* Button */}
                  <div className="mt-auto w-full py-2 px-4 rounded-lg font-semibold text-sm transform transition-all duration-300 group-hover:shadow-md text-white"
                       style={{ backgroundColor: '#1E9ABF' }}>
                    Get Details →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Enquiry Form - Show when service selected */}
        {selectedService && (
          <div id="service-form">
            {/* Back Button */}
            <button
              onClick={handleBackToServices}
              className="mb-6 flex items-center font-medium transition-colors"
              style={{ color: '#1E9ABF' }}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to All Services
            </button>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Form Header */}
              <div className="px-8 py-6 text-white" style={{ backgroundColor: '#1E9ABF' }}>
                <div className="flex items-center">
                  <span className="text-4xl mr-4">{services.find(s => s.name === selectedService)?.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedService}</h2>
                    <p className="opacity-90 mt-1">Provide your requirements to receive customized assistance</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                         style={{ backgroundColor: '#1E9ABF' }}>
                      1
                    </div>
                    <h3 className="ml-4 text-xl font-bold text-gray-900">
                      Contact Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                        style={{ focusRingColor: '#1E9ABF' }}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                        style={{ focusRingColor: '#1E9ABF' }}
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        pattern="[6-9][0-9]{9}"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                        style={{ focusRingColor: '#1E9ABF' }}
                        placeholder="10-digit mobile number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Group Size
                      </label>
                      <input
                        type="text"
                        name="membersExpected"
                        value={formData.membersExpected}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                        style={{ focusRingColor: '#1E9ABF' }}
                        placeholder="e.g., 2 Adults, 1 Child"
                      />
                    </div>
                  </div>
                </div>

                {/* Service-Specific Fields */}
                {showDestinationFields && (
                  <div className="space-y-6">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                           style={{ backgroundColor: '#1E9ABF' }}>
                        2
                      </div>
                      <h3 className="ml-4 text-xl font-bold text-gray-900">
                        Service Requirements
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Destination
                        </label>
                        <input
                          type="text"
                          name="destination"
                          value={formData.destination}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                          style={{ focusRingColor: '#1E9ABF' }}
                          placeholder="Enter your destination"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pickup Location
                        </label>
                        <input
                          type="text"
                          name="pickupLocation"
                          value={formData.pickupLocation}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                          style={{ focusRingColor: '#1E9ABF' }}
                          placeholder="Enter pickup location"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred Start Date
                        </label>
                        <input
                          type="date"
                          name="travelStartDate"
                          value={formData.travelStartDate}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                          style={{ focusRingColor: '#1E9ABF' }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Preferred End Date
                        </label>
                        <input
                          type="date"
                          name="travelEndDate"
                          value={formData.travelEndDate}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                          style={{ focusRingColor: '#1E9ABF' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Special Requests */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                         style={{ backgroundColor: '#1E9ABF' }}>
                      {showDestinationFields ? '3' : '2'}
                    </div>
                    <h3 className="ml-4 text-xl font-bold text-gray-900">
                      Additional Requirements
                    </h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests or Additional Details
                    </label>
                    <textarea
                      name="specialRequests"
                      value={formData.specialRequests}
                      onChange={handleChange}
                      rows="6"
                      maxLength="1000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all resize-none"
                      style={{ focusRingColor: '#1E9ABF' }}
                      placeholder="Please share any specific requirements, preferences, or additional information that will help us serve you better..."
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      {formData.specialRequests.length}/1000 characters
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all duration-300 ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'hover:shadow-lg'
                    }`}
                    style={{ backgroundColor: loading ? '#9CA3AF' : '#1E9ABF' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Your Request...
                      </span>
                    ) : (
                      'Submit Service Request'
                    )}
                  </button>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  By submitting this form, you agree to our terms of service. Our team typically responds within 24 hours.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Add custom styles for focus rings */}
      <style jsx>{`
        input:focus, textarea:focus {
          ring-color: #1E9ABF;
          border-color: #1E9ABF;
        }
      `}</style>
    </div>
  );
};

export default OtherServices;