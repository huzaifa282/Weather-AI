import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="loading-spinner mb-4"></div>
      <p className="text-white/80 text-lg">Fetching weather data...</p>
      <p className="text-white/60 text-sm mt-1">Please wait a moment</p>
    </div>
  );
};

export default LoadingSpinner;
