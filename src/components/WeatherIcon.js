import React from 'react';

const WeatherIcon = ({ iconCode, condition, size = 'medium' }) => {
  // Size mapping
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  // Get OpenWeatherMap icon URL
  const getIconUrl = () => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  // Fallback SVG icons for different weather conditions
  const getFallbackIcon = () => {
    const iconClass = `${sizeClasses[size]} text-white`;
    
    switch (iconCode.charAt(0)) {
      case '01': // Clear sky
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case '02': // Few clouds
      case '03': // Scattered clouds
      case '04': // Broken clouds
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
      case '09': // Shower rain
      case '10': // Rain
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M8 14l-2 4m4-4l-2 4m4-4l-2 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );
      case '11': // Thunderstorm
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M10 14l-3 3h2l-1 3 3-3h-2l1-3z" stroke="currentColor" strokeWidth="1" fill="none" />
          </svg>
        );
      case '13': // Snow
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <circle cx="8" cy="15" r="1" fill="currentColor" />
            <circle cx="12" cy="15" r="1" fill="currentColor" />
            <circle cx="10" cy="17" r="1" fill="currentColor" />
          </svg>
        );
      case '50': // Mist/fog
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 8a1 1 0 000 2h14a1 1 0 100-2H3zM2 13a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM3 16a1 1 0 100 2h14a1 1 0 100-2H3z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className={`${sizeClasses[size]} animate-float`}>
      {/* Try to load the OpenWeatherMap icon first */}
      <img
        src={getIconUrl()}
        alt={condition}
        className={`${sizeClasses[size]} object-contain drop-shadow-lg`}
        onError={(e) => {
          // If the image fails to load, hide it and show the fallback
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      
      {/* Fallback SVG icon (hidden by default) */}
      <div style={{ display: 'none' }} className="flex items-center justify-center">
        {getFallbackIcon()}
      </div>
    </div>
  );
};

export default WeatherIcon;
