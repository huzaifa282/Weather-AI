import React from 'react';

const DynamicWeatherIcon = ({ weatherData }) => {
  if (!weatherData) {
    // Default sun icon when no weather data
    return (
      <div className="animate-float">
        <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  const isNight = weatherData.weather[0].icon.includes('n');
  const condition = weatherData.weather[0].main.toLowerCase();
  
  // Night icons
  if (isNight) {
    if (condition.includes('clear')) {
      // Moon and stars for clear night
      return (
        <div className="animate-float relative">
          <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          {/* Small stars around the moon */}
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-white/40 rounded-full animate-pulse"></div>
          <div className="absolute top-1 -left-2 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute -bottom-1 right-1 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
      );
    } else {
      // Moon for other night conditions
      return (
        <div className="animate-float">
          <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      );
    }
  }
  
  // Day icons
  if (condition.includes('clear')) {
    // Sun with animated rays
    return (
      <div className="animate-float relative">
        <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
        {/* Animated glow effect */}
        <div className="absolute inset-0 w-8 h-8 rounded-full bg-yellow-300/20 animate-ping"></div>
      </div>
    );
  }
  
  if (condition.includes('clouds')) {
    // Cloud icon
    return (
      <div className="animate-float">
        <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>
      </div>
    );
  }
  
  if (condition.includes('rain') || condition.includes('drizzle')) {
    // Rain cloud
    return (
      <div className="animate-float relative">
        <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>
        {/* Animated rain drops */}
        <div className="absolute top-6 left-2 w-0.5 h-2 bg-blue-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-7 left-4 w-0.5 h-2 bg-blue-400/60 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-6 left-6 w-0.5 h-2 bg-blue-400/60 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
      </div>
    );
  }
  
  if (condition.includes('thunderstorm')) {
    // Thunder cloud
    return (
      <div className="animate-float relative">
        <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>
        {/* Lightning bolt */}
        <div className="absolute top-6 left-3 text-yellow-300 animate-pulse" style={{animationDuration: '0.5s'}}>
          <svg className="w-3 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    );
  }
  
  if (condition.includes('snow')) {
    // Snow cloud
    return (
      <div className="animate-float relative">
        <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>
        {/* Snowflakes */}
        <div className="absolute top-6 left-2 text-white/60 animate-pulse">❅</div>
        <div className="absolute top-7 left-4 text-white/60 animate-pulse" style={{animationDelay: '0.5s'}}>❅</div>
        <div className="absolute top-6 left-6 text-white/60 animate-pulse" style={{animationDelay: '1s'}}>❅</div>
      </div>
    );
  }
  
  if (condition.includes('mist') || condition.includes('fog')) {
    // Fog icon
    return (
      <div className="animate-float">
        <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 8a1 1 0 000 2h14a1 1 0 100-2H3zM2 13a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM3 16a1 1 0 100 2h14a1 1 0 100-2H3z" />
        </svg>
      </div>
    );
  }
  
  // Default to sun for unknown conditions
  return (
    <div className="animate-float">
      <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
      </svg>
    </div>
  );
};

export default DynamicWeatherIcon;
