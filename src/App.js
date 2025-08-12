import React, { useState, useEffect } from 'react';
import WeatherCard from './components/WeatherCard';
import SearchBar from './components/SearchBar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import BackgroundGradient from './components/BackgroundGradient';
import WeatherChatbot from './components/WeatherChatbot';
import WeatherAnimations from './components/WeatherAnimations';
import DynamicWeatherIcon from './components/DynamicWeatherIcon';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Get user's location on app load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Default to London if geolocation fails
          fetchWeatherByCity('London');
        }
      );
    } else {
      // Default to London if geolocation is not supported
      fetchWeatherByCity('London');
    }
  }, []);

  const fetchWeatherByCity = async (city) => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
      if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
        throw new Error('⚠️ API key is missing or not configured!\n\n1. Get your FREE API key from: https://openweathermap.org/api\n2. Edit .env file and replace with your real API key\n3. Restart the server with: npm start');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found. Please check the spelling and try again.');
        }
        throw new Error('Failed to fetch weather data. Please try again later.');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    setError(null);
    
    try {
      const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
      if (!API_KEY || API_KEY === 'your_openweathermap_api_key_here') {
        throw new Error('⚠️ API key is missing or not configured!\n\n1. Get your FREE API key from: https://openweathermap.org/api\n2. Edit .env file and replace with your real API key\n3. Restart the server with: npm start');
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data. Please try again later.');
      }
      
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (city) => {
    fetchWeatherByCity(city);
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic background gradient based on weather */}
      <BackgroundGradient weatherData={weatherData} />
      
      {/* Weather animations overlay */}
      <WeatherAnimations weatherData={weatherData} />
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* App header */}
          <div className="text-center animate-fade-in">
            <div className="mb-6">
              {/* Beautiful Weather Title with Gradient */}
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text 
                           bg-gradient-to-r from-white via-blue-100 to-white 
                           drop-shadow-2xl animate-pulse-slow font-display tracking-tight">
                Weather
              </h1>
              
              {/* Decorative Elements */}
              <div className="flex items-center justify-center gap-4 mt-4 mb-6">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                <DynamicWeatherIcon weatherData={weatherData} />
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              </div>
              
              <p className="text-white/80 text-lg md:text-xl font-light tracking-wide">
                Beautiful weather, beautifully displayed
              </p>
              <p className="text-white/60 text-sm mt-2">
                Powered by AI • Real-time data • Global coverage
              </p>
            </div>
          </div>

          {/* Search bar */}
          <SearchBar onSearch={handleSearch} />

          {/* Loading spinner */}
          {loading && <LoadingSpinner />}

          {/* Error message */}
          {error && <ErrorMessage message={error} />}

          {/* Weather card */}
          {weatherData && !loading && (
            <WeatherCard 
              weatherData={weatherData} 
              isCelsius={isCelsius}
              onToggleUnit={toggleTemperatureUnit}
            />
          )}

          {/* AI Chat Button */}
          {weatherData && !loading && (
            <div className="flex justify-center animate-fade-in">
              <button
                onClick={() => setShowChat(!showChat)}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 
                         rounded-xl text-white font-medium hover:bg-white/20 transition-all 
                         duration-300 focus:outline-none focus:ring-2 focus:ring-white/40 
                         flex items-center justify-center gap-2 mb-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                Ask Weather AI
              </button>
            </div>
          )}

          {/* AI Chat Component */}
          {showChat && (
            <div className="animate-slide-up">
              <WeatherChatbot 
                weatherData={weatherData}
                isCelsius={isCelsius}
                onClose={() => setShowChat(false)}
                onWeatherUpdate={setWeatherData}
              />
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-white/60 text-sm animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span>Created with</span>
              <span className="text-red-400 animate-pulse text-lg">❤️</span>
              <span>by</span>
              <span className="font-semibold text-white/80">Huzaifa</span>
            </div>
            <p className="text-xs opacity-70">
              Real-time weather data • AI-powered insights
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
