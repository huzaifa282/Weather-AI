import React from 'react';

// Weather condition to gradient mapping
const weatherGradients = {
  // Clear skies
  'clear sky': 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
  
  // Clouds
  'few clouds': 'bg-gradient-to-br from-blue-400 via-gray-400 to-gray-500',
  'scattered clouds': 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
  'broken clouds': 'bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700',
  'overcast clouds': 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800',
  
  // Rain
  'light rain': 'bg-gradient-to-br from-gray-500 via-blue-600 to-blue-700',
  'moderate rain': 'bg-gradient-to-br from-gray-600 via-blue-700 to-blue-800',
  'heavy intensity rain': 'bg-gradient-to-br from-gray-700 via-blue-800 to-blue-900',
  'shower rain': 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800',
  'rain': 'bg-gradient-to-br from-gray-500 via-blue-600 to-blue-700',
  
  // Drizzle
  'light intensity drizzle': 'bg-gradient-to-br from-gray-400 via-blue-500 to-blue-600',
  'drizzle': 'bg-gradient-to-br from-gray-400 via-blue-500 to-blue-600',
  
  // Thunderstorm
  'thunderstorm': 'bg-gradient-to-br from-gray-800 via-purple-800 to-indigo-900',
  'thunderstorm with light rain': 'bg-gradient-to-br from-gray-700 via-purple-700 to-indigo-800',
  'thunderstorm with rain': 'bg-gradient-to-br from-gray-800 via-purple-800 to-indigo-900',
  
  // Snow
  'light snow': 'bg-gradient-to-br from-blue-200 via-blue-300 to-gray-400',
  'snow': 'bg-gradient-to-br from-blue-100 via-gray-300 to-gray-500',
  'heavy snow': 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-600',
  
  // Atmosphere
  'mist': 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500',
  'smoke': 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
  'haze': 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400',
  'fog': 'bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500',
  
  // Night (when no specific condition matches)
  'night': 'bg-gradient-to-br from-gray-900 via-gray-800 to-black',
  'clear night': 'bg-gradient-to-br from-indigo-950 via-gray-900 to-black',
};

// Time-based gradients (fallback)
const timeBasedGradients = {
  dawn: 'bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400',
  morning: 'bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400',
  day: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
  evening: 'bg-gradient-to-br from-orange-400 via-red-400 to-purple-500',
  night: 'bg-gradient-to-br from-indigo-950 via-gray-900 to-black',
};

const BackgroundGradient = ({ weatherData }) => {
  const getGradientClass = () => {
    if (!weatherData) {
      // Default gradient when no weather data
      return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
    }

    // Handle both old API format and new One Call 3.0 format
    const currentWeather = weatherData.current || weatherData;
    const weatherArray = currentWeather.weather || weatherData.weather;
    
    if (!weatherArray || !weatherArray[0]) {
      // Fallback if weather array is not available
      return 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600';
    }

    const condition = weatherArray[0].description.toLowerCase();
    const mainCondition = weatherArray[0].main.toLowerCase();
    const isNight = weatherArray[0].icon.includes('n');
    
    // Check for specific weather condition first
    if (weatherGradients[condition]) {
      return weatherGradients[condition];
    }

    // Special handling for clear night skies
    if (isNight && mainCondition === 'clear') {
      return weatherGradients['clear night'];
    }

    // Fallback based on main weather category
    switch (mainCondition) {
      case 'clear':
        return isNight 
          ? weatherGradients['clear night'] 
          : timeBasedGradients.day;
      case 'clouds':
        return weatherGradients['scattered clouds'];
      case 'rain':
        return weatherGradients.rain;
      case 'drizzle':
        return weatherGradients.drizzle;
      case 'thunderstorm':
        return weatherGradients.thunderstorm;
      case 'snow':
        return weatherGradients.snow;
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'dust':
      case 'fog':
      case 'sand':
      case 'ash':
      case 'squall':
      case 'tornado':
        return weatherGradients.mist;
      default:
        return isNight 
          ? timeBasedGradients.night 
          : timeBasedGradients.day;
    }
  };

  return (
    <div 
      className={`absolute inset-0 transition-all duration-1000 ease-in-out ${getGradientClass()}`}
    >
      {/* Animated overlay for extra visual appeal */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default BackgroundGradient;
