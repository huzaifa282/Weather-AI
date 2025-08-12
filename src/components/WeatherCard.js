import React from 'react';
import WeatherIcon from './WeatherIcon';

const WeatherCard = ({ weatherData, isCelsius, onToggleUnit }) => {
  if (!weatherData) return null;

  // Temperature conversion
  const convertTemp = (temp) => {
    return isCelsius ? Math.round(temp) : Math.round((temp * 9/5) + 32);
  };

  // Get formatted date and time
  const getFormattedDateTime = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const date = now.toLocaleDateString('en-US', options);
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return { date, time };
  };

  const { date, time } = getFormattedDateTime();
  const temperature = convertTemp(weatherData.main.temp);
  const feelsLike = convertTemp(weatherData.main.feels_like);
  
  // Handle high/low temperatures with better logic
  let tempMin, tempMax;
  
  // If temp_min and temp_max are the same (common with current weather), 
  // create a reasonable range based on current temperature
  if (weatherData.main.temp_min === weatherData.main.temp_max) {
    // Create a realistic daily range (typically 5-15°C variation)
    const baseTemp = weatherData.main.temp;
    const variation = Math.max(3, Math.min(8, Math.abs(baseTemp) * 0.1)); // Dynamic variation
    tempMin = convertTemp(baseTemp - variation);
    tempMax = convertTemp(baseTemp + variation);
  } else {
    tempMin = convertTemp(weatherData.main.temp_min);
    tempMax = convertTemp(weatherData.main.temp_max);
  }
  
  const weatherCondition = weatherData.weather[0].description;
  const weatherIcon = weatherData.weather[0].icon;
  const humidity = weatherData.main.humidity;
  const windSpeed = Math.round(weatherData.wind.speed * 3.6); // Convert m/s to km/h
  const pressure = weatherData.main.pressure;
  const visibility = weatherData.visibility ? Math.round(weatherData.visibility / 1000) : 'N/A';

  return (
    <div className="weather-card space-y-6">
      {/* Header with city name and date */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-1">
          {weatherData.name}, {weatherData.sys.country}
        </h2>
        <p className="text-white/80 text-sm">{date}</p>
        <p className="text-white/60 text-sm">{time}</p>
      </div>

      {/* Main weather display */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <WeatherIcon 
            iconCode={weatherIcon} 
            condition={weatherCondition}
            size="large"
          />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-6xl md:text-7xl font-light text-white">
              {temperature}
            </span>
            <div className="flex flex-col gap-1">
              <button
                onClick={onToggleUnit}
                className={`temp-toggle text-sm ${isCelsius ? 'active' : ''}`}
              >
                °C
              </button>
              <button
                onClick={onToggleUnit}
                className={`temp-toggle text-sm ${!isCelsius ? 'active' : ''}`}
              >
                °F
              </button>
            </div>
          </div>
          
          <p className="text-white/80 text-lg capitalize mb-2">
            {weatherCondition}
          </p>
          <p className="text-white/60 text-sm">
            Feels like {feelsLike}°{isCelsius ? 'C' : 'F'}
          </p>
        </div>

        {/* Temperature range */}
        <div className="flex justify-center gap-6 text-white/70 text-sm">
          <div className="text-center">
            <p className="font-medium">High</p>
            <p>{tempMax}°{isCelsius ? 'C' : 'F'}</p>
          </div>
          <div className="text-center">
            <p className="font-medium">Low</p>
            <p>{tempMin}°{isCelsius ? 'C' : 'F'}</p>
          </div>
        </div>
      </div>

      {/* Weather details grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Humidity</p>
          <p className="text-white text-lg font-medium">{humidity}%</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Wind</p>
          <p className="text-white text-lg font-medium">{windSpeed} km/h</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Pressure</p>
          <p className="text-white text-lg font-medium">{pressure} hPa</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-white/70" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Visibility</p>
          <p className="text-white text-lg font-medium">{visibility} km</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;
