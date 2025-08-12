import React from 'react';

const WeatherAnimations = ({ weatherData }) => {
  if (!weatherData) return null;

  const condition = weatherData.weather[0].main.toLowerCase();
  const description = weatherData.weather[0].description.toLowerCase();
  const isNight = weatherData.weather[0].icon.includes('n');

  // Rain animation
  const RainAnimation = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 bg-gradient-to-b from-blue-200 to-blue-400 opacity-60 animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            height: `${20 + Math.random() * 30}px`,
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
            animationDelay: `${Math.random() * 2}s`,
            transform: 'rotate(10deg)',
            animation: `rainDrop ${0.8 + Math.random() * 0.4}s linear infinite`
          }}
        />
      ))}
    </div>
  );

  // Snow animation
  const SnowAnimation = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-80"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${3 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 3}s`,
            animation: `snowFall ${4 + Math.random() * 2}s linear infinite`
          }}
        />
      ))}
    </div>
  );

  // Cloud animation
  const CloudAnimation = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute opacity-20"
          style={{
            left: `${20 + i * 30}%`,
            top: `${10 + i * 15}%`,
            animation: `cloudFloat ${8 + i * 2}s ease-in-out infinite`
          }}
        >
          <svg className="w-20 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        </div>
      ))}
    </div>
  );

  // Stars animation (for night) - Enhanced version
  const StarsAnimation = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Large prominent stars */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`large-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            animation: `twinkle ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`
          }}
        >
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
      ))}
      
      {/* Medium stars */}
      {[...Array(15)].map((_, i) => (
        <div
          key={`medium-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 60}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`
          }}
        >
          <svg className="w-2.5 h-2.5 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.4 4.86L20 8.17l-4 3.9.94 5.5L12 15.77l-4.94 2.6L8 12.07l-4-3.9 5.6-1.31L12 2z" />
          </svg>
        </div>
      ))}
      
      {/* Small twinkling dots */}
      {[...Array(25)].map((_, i) => (
        <div
          key={`small-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 70}%`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite, starGlow ${3 + Math.random() * 2}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      ))}
      
      {/* Shooting stars */}
      {[...Array(2)].map((_, i) => (
        <div
          key={`shooting-${i}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-0"
          style={{
            left: '0%',
            top: '20%',
            animation: `shootingStar ${8 + Math.random() * 4}s linear infinite`,
            animationDelay: `${i * 6 + Math.random() * 8}s`,
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.8), 2px 2px 20px rgba(255, 255, 255, 0.3)'
          }}
        >
          <div className="absolute w-12 h-0.5 bg-gradient-to-r from-white to-transparent -translate-y-0.5" />
        </div>
      ))}
      
      {/* Constellation lines (subtle) */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 600">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>
        <path 
          d="M100 100 L200 150 L300 120 L250 200" 
          stroke="white" 
          strokeWidth="0.5" 
          fill="none" 
          filter="url(#glow)"
        />
        <path 
          d="M500 80 L580 120 L620 90 L580 160 L520 140" 
          stroke="white" 
          strokeWidth="0.5" 
          fill="none" 
          filter="url(#glow)"
        />
      </svg>
    </div>
  );

  // Sun rays animation
  const SunRaysAnimation = () => (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="relative">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-16 bg-gradient-to-t from-transparent via-yellow-200 to-transparent opacity-30"
            style={{
              transformOrigin: 'bottom center',
              transform: `rotate(${i * 45}deg) translateY(-20px)`,
              animation: `sunRays 4s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );

  // Thunder animation
  const ThunderAnimation = () => (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 bg-white opacity-0"
        style={{
          animation: 'lightning 6s infinite'
        }}
      />
    </div>
  );

  // Fog animation
  const FogAnimation = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"
          style={{
            top: `${20 + i * 15}%`,
            animation: `fogMove ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1}s`
          }}
        />
      ))}
    </div>
  );

  // Determine which animation to show
  const getWeatherAnimation = () => {
    if (condition.includes('rain') || description.includes('rain') || description.includes('drizzle')) {
      return <RainAnimation />;
    }
    
    if (condition.includes('snow') || description.includes('snow')) {
      return <SnowAnimation />;
    }
    
    if (condition.includes('thunderstorm') || description.includes('thunder')) {
      return (
        <>
          <CloudAnimation />
          <ThunderAnimation />
        </>
      );
    }
    
    if (condition.includes('clouds') || description.includes('cloud')) {
      return <CloudAnimation />;
    }
    
    if (condition.includes('mist') || condition.includes('fog') || description.includes('fog')) {
      return <FogAnimation />;
    }
    
    if (condition.includes('clear')) {
      if (isNight) {
        return <StarsAnimation />;
      } else {
        return <SunRaysAnimation />;
      }
    }
    
    return null;
  };

  return (
    <>
      {getWeatherAnimation()}
    </>
  );
};

export default WeatherAnimations;
