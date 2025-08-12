import { useState, useEffect } from 'react';

// Custom hook to get user's geolocation
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('User denied the request for Geolocation.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            setError('The request to get user location timed out.');
            break;
          default:
            setError('An unknown error occurred.');
            break;
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return { location, error, loading, getCurrentLocation };
};

// Function to calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Function to get city name from coordinates using reverse geocoding
export const getCityFromCoordinates = async (lat, lon) => {
  try {
    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!API_KEY) {
      throw new Error('API key not configured');
    }

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to get location name');
    }

    const data = await response.json();
    if (data && data.length > 0) {
      const location = data[0];
      return {
        name: location.name,
        country: location.country,
        state: location.state,
        fullName: location.state 
          ? `${location.name}, ${location.state}, ${location.country}`
          : `${location.name}, ${location.country}`
      };
    }
    
    throw new Error('No location found');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

// Function to search for cities near user location
export const searchNearbyCities = async (userLat, userLon, radius = 50) => {
  try {
    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!API_KEY) {
      throw new Error('API key not configured');
    }

    // Get multiple cities around the user's location
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${userLat}&lon=${userLon}&limit=5&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to search nearby cities');
    }

    const data = await response.json();
    
    // Calculate distances and return sorted by proximity
    const citiesWithDistance = data.map(city => ({
      name: city.name,
      country: city.country,
      state: city.state,
      lat: city.lat,
      lon: city.lon,
      distance: calculateDistance(userLat, userLon, city.lat, city.lon),
      fullName: city.state 
        ? `${city.name}, ${city.state}, ${city.country}`
        : `${city.name}, ${city.country}`
    }));

    return citiesWithDistance
      .filter(city => city.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

  } catch (error) {
    console.error('Nearby cities search error:', error);
    throw error;
  }
};

// Function to find the closest match from a list of cities to user's location
export const findClosestCity = async (cityName, userLat, userLon) => {
  try {
    const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
    if (!API_KEY) {
      throw new Error('API key not configured');
    }

    // Search for cities with the given name
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('Failed to search cities');
    }

    const cities = await response.json();
    
    if (cities.length === 0) {
      return null;
    }

    // If user location is available, find the closest match
    if (userLat && userLon) {
      const citiesWithDistance = cities.map(city => ({
        ...city,
        distance: calculateDistance(userLat, userLon, city.lat, city.lon),
        fullName: city.state 
          ? `${city.name}, ${city.state}, ${city.country}`
          : `${city.name}, ${city.country}`
      }));

      // Sort by distance and return the closest
      return citiesWithDistance.sort((a, b) => a.distance - b.distance)[0];
    }

    // If no user location, return the first result
    return {
      ...cities[0],
      fullName: cities[0].state 
        ? `${cities[0].name}, ${cities[0].state}, ${cities[0].country}`
        : `${cities[0].name}, ${cities[0].country}`
    };

  } catch (error) {
    console.error('Find closest city error:', error);
    throw error;
  }
};
