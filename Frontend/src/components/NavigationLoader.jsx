import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigationLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [targetPath, setTargetPath] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for custom navigation event
    const handleNavigationStart = (event) => {
      const { path } = event.detail;
      setTargetPath(path);
      setIsLoading(true);
    };

    window.addEventListener('navigationStart', handleNavigationStart);

    return () => {
      window.removeEventListener('navigationStart', handleNavigationStart);
    };
  }, []);

  useEffect(() => {
    if (isLoading && targetPath) {
      // Show loader for a brief moment, then refresh
      const timer = setTimeout(() => {
        // Navigate first
        navigate(targetPath);
        
        // Then trigger a soft reload after navigation
        setTimeout(() => {
          window.location.href = targetPath;
        }, 100);
      }, 500); // Show loader for 500ms

      return () => clearTimeout(timer);
    }
  }, [isLoading, targetPath, navigate]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 transform transition-all">
        {/* Animated Logo/Spinner */}
        <div className="flex flex-col items-center space-y-6">
          {/* Spinning Circle Loader */}
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-blue-600 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
            {/* Inner pulse */}
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Loading...
            </h3>
            <p className="text-gray-600 text-sm">
              Preparing your adventure details
            </p>
          </div>

          {/* Animated Dots */}
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationLoader;
