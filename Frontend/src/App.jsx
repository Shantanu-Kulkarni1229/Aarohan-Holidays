import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HomePage from './pages/HomePage'
import TourPage from './pages/TourPage'
import TrekPage from './pages/TrekPage'
import BookTour from './pages/BookTour'
import BookTrek from './pages/BookTrek'
import BlogPage from './pages/BlogPage'
import HistoryPage from './pages/HistoryPage'
import Gallery from './pages/Gallery'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import ContactSupport from './pages/ContactSupport'
import AdminLayout from './admin/AdminLayout'
import AdminLogin from './admin/AdminLogin'
import ProtectedRoute from './admin/ProtectedRoute'
import AdminDashboard from './admin/AdminDashboard'
import ToursManagement from './admin/ToursManagement'
import TreksManagement from './admin/TreksManagement'
import TourForm from './admin/TourForm'
import TrekForm from './admin/TrekForm'
import BookingsManagement from './admin/BookingsManagement'
import TestimonialsManagement from './admin/TestimonialsManagement'
import EnquiriesManagement from './admin/EnquiriesManagement'
import ExtrasManagement from './admin/ExtrasManagement'
import CustomBookingsManagement from './admin/CustomBookingsManagement'
import CustomBookingForm from './admin/CustomBookingForm'
import CustomBookingDetail from './admin/CustomBookingDetail'
import ConditionalSmoothScroll from './components/ConditionalSmoothScroll'
import NavigationLoader from './components/NavigationLoader'
import { FaWhatsapp } from 'react-icons/fa'
import CancellationPolicy from './pages/CancellationPolicy'
import About from './pages/About'
import OtherServicesPage from './pages/OtherServicesPage'

// Wrapper component to use location as key
const BookTourWrapper = () => {
  const location = useLocation();
  return <BookTour key={location.pathname} />;
};

const BookTrekWrapper = () => {
  const location = useLocation();
  return <BookTrek key={location.pathname} />;
};

// Component to wrap WhatsApp button with location check
const WhatsAppButton = () => {
  const location = useLocation();
  const isAdminRoute = location?.pathname?.startsWith('/admin');

  if (isAdminRoute) return null;

  return (
    <a
      href="https://wa.me/+917276644221?text=Hello! I'm interested in booking a tour/trek."
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float group"
      aria-label="Chat on WhatsApp"
    >
      {/* Ripple Effect */}
      <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20"></div>
      
      {/* Main Button */}
      <div className="relative w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-green-500/50">
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        
        {/* WhatsApp Icon */}
        <FaWhatsapp className="text-white relative z-10 group-hover:rotate-12 transition-transform duration-300" size={32} />
        
        {/* Notification Badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
          <span className="text-white text-xs font-bold">1</span>
        </div>
      </div>

      {/* Tooltip on Hover */}
      <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-lg shadow-xl border-2 border-green-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <p className="text-sm font-bold text-gray-800">Chat with us on WhatsApp!</p>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-3 h-3 bg-white border-r-2 border-b-2 border-green-500"></div>
      </div>
    </a>
  );
};

const App = () => {
  return (
    <Router>
      <NavigationLoader />
      <ConditionalSmoothScroll>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/tours" element={<TourPage />} />
          <Route path="/treks" element={<TrekPage />} />
          <Route path="/tour/:id" element={<BookTourWrapper />} />
          <Route path="/book-tour/:id" element={<BookTourWrapper />} />
          <Route path="/trek/:id" element={<BookTrekWrapper />} />
          <Route path="/book-trek/:id" element={<BookTrekWrapper />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blogs/:identifier" element={<BlogPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/history/:identifier" element={<HistoryPage />} />
          {/* <Route path="/gallery" element={<Gallery />} /> */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<ContactSupport />} />
          <Route path="/cancellation-policy" element={<CancellationPolicy />} />
          <Route path="/about" element={<About />} />
          <Route path="/other-services" element={<OtherServicesPage />} />

        
          {/* Admin Login Route */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tours" element={<ToursManagement />} />
            <Route path="tours/new" element={<TourForm />} />
            <Route path="tours/edit/:id" element={<TourForm />} />
            <Route path="treks" element={<TreksManagement />} />
            <Route path="treks/new" element={<TrekForm />} />
            <Route path="treks/edit/:id" element={<TrekForm />} />
            <Route path="custom-bookings" element={<CustomBookingsManagement />} />
            <Route path="custom-bookings/create" element={<CustomBookingForm />} />
            <Route path="custom-bookings/:id" element={<CustomBookingDetail />} />
            <Route path="bookings" element={<BookingsManagement />} />
            <Route path="testimonials" element={<TestimonialsManagement />} />
            <Route path="enquiries" element={<EnquiriesManagement />} />
            <Route path="extras" element={<ExtrasManagement />} />
          </Route>
        </Routes>
      </ConditionalSmoothScroll>

      {/* Global Floating WhatsApp Button */}
      <WhatsAppButton />

      {/* Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </Router>
  )
}

export default App