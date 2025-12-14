import React, { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import UpcomingTours from '../components/UpcomingTours'
import UpcomingTreks from '../components/upcomingTreks'
import Featured from '../components/Featured'
import Testomonial from '../components/Testomonial'
import Footer from '../components/Footer'
import Blogs from '../components/Blogs'
import History from '../components/History'
import WhyTravelWithUs from '../components/WhyTravelWithUs'

const HomePage = () => {
  useEffect(() => {
    // Dispatch custom event to update Locomotive Scroll after all components mount
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
        {/* Main Content - Removed heavy background effects for better performance */}
        <div className="relative z-10">
          <Navbar />
          <div id="hero">
            <Hero />
          </div>
          
          {/* Removed RevealOnScroll wrappers for better performance */}
          <div id="tours">
            <UpcomingTours />
          </div>
          
          <div id="treks">
            <UpcomingTreks />
          </div>
          
        <WhyTravelWithUs />
          
          <div id="testimonials">
            <Testomonial />
          </div>
          <div id="blogs">
            <Blogs />
          </div>
          <div id="history">
            <History />
          </div>
          
          {/* Footer - Always visible */}
          <div id="footer">
            <Footer />
          </div>
        </div>
    </div>
  )
}

export default HomePage