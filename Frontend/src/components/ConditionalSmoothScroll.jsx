import React from 'react';
import { useLocation } from 'react-router-dom';
import SmoothScroll from './SmoothScroll'; // Locomotive Scroll with GSAP

const ConditionalSmoothScroll = ({ children }) => {
  const location = useLocation();
  
  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Check if current route is gallery (has its own modal system)
  const isGalleryRoute = location.pathname === '/gallery';
  
  // If it's an admin route or gallery route, render children without smooth scroll
  if (isAdminRoute || isGalleryRoute) {
    return <>{children}</>;
  }
  
  // For user pages, use only Locomotive Scroll with GSAP (removed heavy cursor effects)
  return (
    <>
      <SmoothScroll>{children}</SmoothScroll>
    </>
  );
};

export default ConditionalSmoothScroll;
