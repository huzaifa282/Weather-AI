import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className="weather-card text-center">
      <div className="flex items-center justify-center mb-4">
        <svg 
          className="w-12 h-12 text-red-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
          />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Oops!</h3>
      <div className="text-white/80 text-center leading-relaxed whitespace-pre-line">
        {message}
      </div>
      <div className="mt-4 text-sm text-white/60">
        <p>Try searching for a different city or check your internet connection.</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
