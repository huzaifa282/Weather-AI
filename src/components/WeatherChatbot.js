import React, { useState, useRef, useEffect } from 'react';
import { useGeolocation, findClosestCity, getCityFromCoordinates, calculateDistance } from '../utils/geolocation';

const WeatherChatbot = ({ weatherData, isCelsius, onClose, onWeatherUpdate }) => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: '🌤️ Hi! I\'m your Weather AI assistant. Ask me about weather conditions anywhere in the world! \n\nTry natural questions like:\n• "How\'s it in New York?"\n• "What\'s London like?"\n• "How\'s Tokyo today?"\n• "Tell me about Paris"\n• "Is it raining in Seattle?"\n\nI understand natural language and can get real-time weather for any city! 🌍\n\n📍 I can use your location to suggest nearby places - just allow location access when prompted!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Use geolocation hook
  const { location: userLocation } = useGeolocation();
  const [userCity, setUserCity] = useState(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user's city name when location is available
  useEffect(() => {
    const getUserCity = async () => {
      if (userLocation && !userCity) {
        try {
          const city = await getCityFromCoordinates(userLocation.latitude, userLocation.longitude);
          setUserCity(city);
          
          // Add a welcome message with location info
          setMessages(prev => [...prev, {
            type: 'bot',
            content: `📍 I detected you're near ${city.fullName}! Now I can prioritize nearby locations when you ask about weather. Ask me about weather anywhere! 🌟`,
            timestamp: new Date()
          }]);
        } catch (error) {
          console.error('Failed to get user city:', error);
        }
      }
    };

    getUserCity();
  }, [userLocation, userCity]);

  // Weather-related keywords for filtering
  const weatherKeywords = [
    'weather', 'temperature', 'rain', 'snow', 'sunny', 'cloudy', 'wind', 'humidity', 
    'pressure', 'forecast', 'climate', 'storm', 'thunder', 'lightning', 'fog', 'mist',
    'hot', 'cold', 'warm', 'cool', 'freezing', 'boiling', 'degrees', 'celsius', 'fahrenheit',
    'precipitation', 'drizzle', 'shower', 'blizzard', 'hurricane', 'tornado', 'cyclone',
    'atmosphere', 'barometric', 'visibility', 'uv', 'index', 'seasons', 'winter', 'summer',
    'spring', 'autumn', 'fall', 'monsoon', 'dry', 'wet', 'arid', 'tropical', 'arctic'
  ];

  const isWeatherRelated = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // First check if it contains any weather keywords
    const hasWeatherKeywords = weatherKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // Check for contextual weather questions (like "how's it in...")
    const contextualWeatherPatterns = [
      /how'?s?\s+it\s+in\s+[a-zA-Z\s,.-]+/,           // "how's it in new york"
      /how\s+is\s+it\s+in\s+[a-zA-Z\s,.-]+/,          // "how is it in paris"
      /what'?s?\s+it\s+like\s+in\s+[a-zA-Z\s,.-]+/,   // "what's it like in london"
      /how'?s?\s+[a-zA-Z\s,.-]+\s+today/,             // "how's tokyo today"
      /how'?s?\s+[a-zA-Z\s,.-]+\s+right\s+now/,       // "how's paris right now"
      /what'?s?\s+[a-zA-Z\s,.-]+\s+like/,             // "what's london like"
      /how\s+about\s+[a-zA-Z\s,.-]+/,                 // "how about new york"
      /tell\s+me\s+about\s+[a-zA-Z\s,.-]+/,           // "tell me about tokyo"
      /condition.*in\s+[a-zA-Z\s,.-]+/,               // "conditions in miami"
      /outside.*in\s+[a-zA-Z\s,.-]+/,                 // "outside in chicago"
      /suggest.*cold/,                                // "suggest me a colder place"
      /suggest.*warm/,                                // "suggest me a warmer place"
      /suggest.*place/,                               // "suggest me a place"
      /where.*is.*it.*raining/,                      // "where is it raining"
      /where.*is.*it.*snowing/,                      // "where is it snowing"
      /where.*can.*i.*see.*rain/,                    // "where can i see rain"
      /where.*can.*i.*see.*snow/,                    // "where can i see snow"
      /i.*want.*to.*see.*rain/,                      // "i want to see rain"
      /i.*want.*to.*see.*snow/,                      // "i want to see snow"
      /show.*me.*rain/,                              // "show me rain"
      /show.*me.*snow/,                              // "show me snow"
    ];
    
    // Check for location-based questions that are implicitly weather-related
    const locationBasedPatterns = [
      /in\s+[a-zA-Z\s,.-]+\??\s*$/,                   // ends with "in [city]"
      /[a-zA-Z\s,.-]+\s+(today|now|currently)/,       // "[city] today/now"
      /^(how|what|tell).*[a-zA-Z\s,.-]+$/,            // starts with how/what and has a location
      /^[a-zA-Z\s,.-]+\??\s*$/,                       // single location name like "turkey" or "london"
    ];
    
    // If it has weather keywords, it's definitely weather-related
    if (hasWeatherKeywords) {
      return true;
    }
    
    // Check for contextual weather patterns
    for (const pattern of contextualWeatherPatterns) {
      if (pattern.test(lowerMessage)) {
        return true;
      }
    }
    
    // Check if it's a location-based question that might be weather-related
    for (const pattern of locationBasedPatterns) {
      if (pattern.test(lowerMessage)) {
        // Additional check: if it contains a potential city/country name, assume it's weather
        const words = lowerMessage.split(/\s+/);
        
        // For single word queries, check if it could be a location
        if (words.length === 1 && words[0].length > 2) {
          return true; // Single word location like "turkey", "london", etc.
        }
        
        const hasCapitalizedWord = words.some(word => 
          word.length > 2 && 
          !['how', 'what', 'where', 'when', 'why', 'the', 'and', 'but', 'for', 'are', 'any', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'end', 'few', 'got', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word)
        );
        if (hasCapitalizedWord) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Location-based region detection helper function
  const getRegionFromLocation = (location, fallbackCountry = 'PK') => {
    if (!location) return fallbackCountry;
    
    const locationLower = location.toLowerCase();
    
    // Turkish cities
    if (locationLower.includes('istanbul') || locationLower.includes('ankara') || 
        locationLower.includes('izmir') || locationLower.includes('turkey')) {
      return 'TR';
    }
    
    // Pakistani cities
    if (locationLower.includes('karachi') || locationLower.includes('lahore') || 
        locationLower.includes('islamabad') || locationLower.includes('pakistan')) {
      return 'PK';
    }
    
    // US cities and states
    if (locationLower.includes('california') || locationLower.includes('los angeles') || 
        locationLower.includes('san francisco') || locationLower.includes('new york') ||
        locationLower.includes('chicago') || locationLower.includes('miami') ||
        locationLower.includes('seattle') || locationLower.includes('usa') ||
        locationLower.includes('united states') || locationLower.includes('america') ||
        locationLower.includes('texas') || locationLower.includes('florida') ||
        locationLower.includes('mississippi') || locationLower.includes('alabama') ||
        locationLower.includes('georgia') || locationLower.includes('nevada') ||
        locationLower.includes('oregon') || locationLower.includes('washington') ||
        locationLower.includes('colorado') || locationLower.includes('arizona') ||
        locationLower.includes('the united states') || locationLower.includes('us')) {
      return 'US';
    }
    
    // Canadian cities
    if (locationLower.includes('toronto') || locationLower.includes('vancouver') || 
        locationLower.includes('montreal') || locationLower.includes('canada') ||
        locationLower.includes('calgary') || locationLower.includes('ottawa')) {
      return 'CA';
    }
    
    // Iranian cities
    if (locationLower.includes('tehran') || locationLower.includes('isfahan') || 
        locationLower.includes('tabriz') || locationLower.includes('iran') ||
        locationLower.includes('shiraz') || locationLower.includes('mashhad')) {
      return 'IR';
    }
    
    // UK cities
    if (locationLower.includes('london') || locationLower.includes('manchester') || 
        locationLower.includes('birmingham') || locationLower.includes('uk') ||
        locationLower.includes('england') || locationLower.includes('scotland') ||
        locationLower.includes('wales') || locationLower.includes('britain')) {
      return 'GB';
    }
    
    // Australian cities
    if (locationLower.includes('sydney') || locationLower.includes('melbourne') || 
        locationLower.includes('brisbane') || locationLower.includes('australia') ||
        locationLower.includes('perth') || locationLower.includes('adelaide')) {
      return 'AU';
    }
    
    // Default to fallback country
    return fallbackCountry;
  };

  // Function to suggest nearby places based on user's request
  const suggestNearbyPlaces = async (requestType, userCountry, mentionedLocation = null) => {
    // Define nearby cities based on different countries and regions
    const nearbyPlaces = {
      'PK': { // Pakistan
        'colder': [
          'Murree, Pakistan', 'Nathiagali, Pakistan', 'Kaghan Valley, Pakistan', 
          'Skardu, Pakistan', 'Chitral, Pakistan', 'Gilgit, Pakistan',
          'Hunza Valley, Pakistan', 'Swat, Pakistan', 'Dir, Pakistan'
        ],
        'warmer': [
          'Karachi, Pakistan', 'Hyderabad, Pakistan', 'Sukkur, Pakistan',
          'Multan, Pakistan', 'Bahawalpur, Pakistan', 'Jacobabad, Pakistan'
        ],
        'rainy': [
          'Lahore, Pakistan', 'Islamabad, Pakistan', 'Sialkot, Pakistan',
          'Gujranwala, Pakistan', 'Rawalpindi, Pakistan', 'Sargodha, Pakistan'
        ],
        'snowy': [
          'Murree, Pakistan', 'Skardu, Pakistan', 'Chitral, Pakistan',
          'Hunza Valley, Pakistan', 'Kaghan Valley, Pakistan', 'Naran, Pakistan'
        ],
        'coastal': [
          'Karachi, Pakistan', 'Gwadar, Pakistan', 'Pasni, Pakistan'
        ],
        'mountain': [
          'Murree, Pakistan', 'Skardu, Pakistan', 'Chitral, Pakistan',
          'Hunza Valley, Pakistan', 'Kaghan Valley, Pakistan'
        ]
      },
      'TR': { // Turkey (for Istanbul area)
        'colder': [
          'Ankara, Turkey', 'Bursa, Turkey', 'Eskişehir, Turkey',
          'Samsun, Turkey', 'Trabzon, Turkey', 'Erzurum, Turkey'
        ],
        'warmer': [
          'Antalya, Turkey', 'Izmir, Turkey', 'Adana, Turkey',
          'Mersin, Turkey', 'Bodrum, Turkey', 'Marmaris, Turkey'
        ],
        'rainy': [
          'Rize, Turkey', 'Artvin, Turkey', 'Giresun, Turkey',
          'Trabzon, Turkey', 'Ordu, Turkey', 'Samsun, Turkey'
        ],
        'snowy': [
          'Erzurum, Turkey', 'Kars, Turkey', 'Ağrı, Turkey',
          'Van, Turkey', 'Ardahan, Turkey', 'Bingöl, Turkey'
        ],
        'coastal': [
          'Antalya, Turkey', 'Bodrum, Turkey', 'Marmaris, Turkey',
          'Izmir, Turkey', 'Mersin, Turkey', 'Trabzon, Turkey'
        ],
        'mountain': [
          'Cappadocia, Turkey', 'Mount Ararat, Turkey', 'Uludağ, Turkey',
          'Palandöken, Turkey', 'Erciyes, Turkey'
        ]
      },
      'US': { // United States (California and general US)
        'colder': [
          'Seattle, WA', 'Minneapolis, MN', 'Chicago, IL',
          'Boston, MA', 'Denver, CO', 'Salt Lake City, UT'
        ],
        'warmer': [
          'Phoenix, AZ', 'Las Vegas, NV', 'Miami, FL',
          'San Diego, CA', 'Los Angeles, CA', 'Austin, TX'
        ],
        'rainy': [
          'Seattle, WA', 'Portland, OR', 'New Orleans, LA',
          'Atlanta, GA', 'Jacksonville, FL', 'Birmingham, AL'
        ],
        'snowy': [
          'Denver, CO', 'Minneapolis, MN', 'Chicago, IL',
          'Buffalo, NY', 'Salt Lake City, UT', 'Anchorage, AK'
        ],
        'coastal': [
          'San Francisco, CA', 'Los Angeles, CA', 'San Diego, CA',
          'Miami, FL', 'New York, NY', 'Seattle, WA'
        ],
        'mountain': [
          'Denver, CO', 'Salt Lake City, UT', 'Bozeman, MT',
          'Flagstaff, AZ', 'Aspen, CO', 'Jackson, WY'
        ]
      },
      'CA': { // Canada  
        'colder': [
          'Winnipeg, MB', 'Edmonton, AB', 'Quebec City, QC',
          'Ottawa, ON', 'Halifax, NS', 'Yellowknife, NT'
        ],
        'warmer': [
          'Vancouver, BC', 'Victoria, BC', 'Toronto, ON',
          'Montreal, QC', 'Calgary, AB', 'Windsor, ON'
        ],
        'rainy': [
          'Vancouver, BC', 'Victoria, BC', 'St. John\'s, NL',
          'Halifax, NS', 'Charlottetown, PE', 'Saint John, NB'
        ],
        'snowy': [
          'Montreal, QC', 'Quebec City, QC', 'Winnipeg, MB',
          'Edmonton, AB', 'Ottawa, ON', 'Saskatoon, SK'
        ],
        'coastal': [
          'Vancouver, BC', 'Victoria, BC', 'Halifax, NS',
          'St. John\'s, NL', 'Charlottetown, PE'
        ],
        'mountain': [
          'Calgary, AB', 'Vancouver, BC', 'Banff, AB',
          'Whistler, BC', 'Jasper, AB'
        ]
      },
      'IR': { // Iran
        'colder': [
          'Tabriz, Iran', 'Tehran, Iran', 'Kermanshah, Iran',
          'Hamadan, Iran', 'Ardabil, Iran', 'Urmia, Iran'
        ],
        'warmer': [
          'Ahvaz, Iran', 'Bandar Abbas, Iran', 'Zahedan, Iran',
          'Kerman, Iran', 'Yazd, Iran', 'Bushehr, Iran'
        ],
        'rainy': [
          'Rasht, Iran', 'Gorgan, Iran', 'Sari, Iran',
          'Babol, Iran', 'Lahijan, Iran', 'Astara, Iran'
        ],
        'snowy': [
          'Tabriz, Iran', 'Tehran, Iran', 'Zanjan, Iran',
          'Sanandaj, Iran', 'Hamadan, Iran', 'Arak, Iran'
        ],
        'coastal': [
          'Bandar Abbas, Iran', 'Bushehr, Iran', 'Kish Island, Iran',
          'Chabahar, Iran', 'Bandar Lengeh, Iran'
        ],
        'mountain': [
          'Tehran, Iran', 'Tabriz, Iran', 'Kermanshah, Iran',
          'Hamadan, Iran', 'Shiraz, Iran'
        ]
      },
      'GB': { // United Kingdom
        'colder': [
          'Edinburgh, Scotland', 'Glasgow, Scotland', 'Newcastle, England',
          'Manchester, England', 'Leeds, England', 'Aberdeen, Scotland'
        ],
        'warmer': [
          'London, England', 'Brighton, England', 'Southampton, England',
          'Plymouth, England', 'Cornwall, England', 'Bristol, England'
        ],
        'rainy': [
          'Manchester, England', 'Liverpool, England', 'Cardiff, Wales',
          'Glasgow, Scotland', 'Belfast, N. Ireland', 'Preston, England'
        ],
        'snowy': [
          'Edinburgh, Scotland', 'Glasgow, Scotland', 'Newcastle, England',
          'Leeds, England', 'Sheffield, England'
        ],
        'coastal': [
          'Brighton, England', 'Liverpool, England', 'Plymouth, England',
          'Southampton, England', 'Cardiff, Wales'
        ]
      },
      'AU': { // Australia
        'colder': [
          'Melbourne, VIC', 'Hobart, TAS', 'Canberra, ACT',
          'Adelaide, SA', 'Sydney, NSW', 'Perth, WA'
        ],
        'warmer': [
          'Darwin, NT', 'Cairns, QLD', 'Brisbane, QLD',
          'Gold Coast, QLD', 'Townsville, QLD', 'Alice Springs, NT'
        ],
        'rainy': [
          'Darwin, NT', 'Cairns, QLD', 'Brisbane, QLD',
          'Sydney, NSW', 'Melbourne, VIC'
        ],
        'coastal': [
          'Sydney, NSW', 'Melbourne, VIC', 'Brisbane, QLD',
          'Perth, WA', 'Adelaide, SA', 'Gold Coast, QLD'
        ]
      }
    };

    // Global suggestions for weather conditions if no local data
    const globalSuggestions = {
      'rainy': [
        'London, UK', 'Seattle, USA', 'Vancouver, Canada',
        'Mumbai, India', 'Singapore', 'Kuala Lumpur, Malaysia'
      ],
      'snowy': [
        'Moscow, Russia', 'Toronto, Canada', 'Stockholm, Sweden',
        'Oslo, Norway', 'Helsinki, Finland', 'Reykjavik, Iceland'
      ],
      'colder': [
        'Moscow, Russia', 'Stockholm, Sweden', 'Oslo, Norway',
        'Helsinki, Finland', 'Reykjavik, Iceland', 'Toronto, Canada'
      ],
      'warmer': [
        'Dubai, UAE', 'Bangkok, Thailand', 'Singapore',
        'Miami, USA', 'Cairo, Egypt', 'Delhi, India'
      ]
    };

    // Determine the region to use for suggestions
    const targetRegion = mentionedLocation ? getRegionFromLocation(mentionedLocation, userCountry) : userCountry;
    
    console.log('Target region for suggestions:', targetRegion);
    console.log('Mentioned location:', mentionedLocation);
    
    // Get suggestions based on target region first, then global
    let suggestions = [];
    
    if (nearbyPlaces[targetRegion] && nearbyPlaces[targetRegion][requestType]) {
      suggestions = [...nearbyPlaces[targetRegion][requestType]];
    } else if (globalSuggestions[requestType]) {
      suggestions = [...globalSuggestions[requestType]];
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  };

  // Function to detect request type from message
  const detectRequestType = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Temperature-based requests
    if (lowerMessage.includes('cold') || lowerMessage.includes('cool') || 
        lowerMessage.includes('chill') || lowerMessage.includes('mountain') ||
        lowerMessage.includes('hill')) {
      return 'colder';
    }
    
    if (lowerMessage.includes('hot') || lowerMessage.includes('warm') || 
        lowerMessage.includes('heat') || lowerMessage.includes('desert')) {
      return 'warmer';
    }
    
    // Weather condition requests
    if (lowerMessage.includes('rain') && (lowerMessage.includes('where') || 
        lowerMessage.includes('want') || lowerMessage.includes('see') || 
        lowerMessage.includes('show'))) {
      return 'rainy';
    }
    
    if (lowerMessage.includes('snow') && (lowerMessage.includes('where') || 
        lowerMessage.includes('want') || lowerMessage.includes('see') || 
        lowerMessage.includes('show'))) {
      return 'snowy';
    }
    
    // Geographic requests
    if (lowerMessage.includes('beach') || lowerMessage.includes('coast') || 
        lowerMessage.includes('sea') || lowerMessage.includes('ocean')) {
      return 'coastal';
    }
    
    if (lowerMessage.includes('mountain') || lowerMessage.includes('hill') ||
        lowerMessage.includes('altitude')) {
      return 'mountain';
    }
    
    return null;
  };

  // Enhanced function to fetch weather data for any location using One Call 3.0 API
  const fetchWeatherForLocation = async (location) => {
    try {
      const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
      if (!API_KEY) {
        throw new Error('Weather API key not configured');
      }

      // First get coordinates from city name using Geocoding API
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${API_KEY}`
      );
      
      if (!geoResponse.ok) {
        throw new Error('Failed to find location coordinates');
      }
      
      const geoData = await geoResponse.json();
      if (!geoData.length) {
        // If direct search fails and user location is available, try geolocation assistance
        if (userLocation) {
          try {
            const targetCity = await findClosestCity(location, userLocation.latitude, userLocation.longitude);
            if (targetCity) {
              geoData.push({
                name: targetCity.name,
                country: targetCity.country,
                lat: targetCity.lat,
                lon: targetCity.lon
              });
            }
          } catch (geoError) {
            console.error('Geolocation search failed:', geoError);
          }
        }
        
        if (!geoData.length) {
          throw new Error(`Location "${location}" not found. Please check the spelling and try again.`);
        }
      }
      
      const { lat, lon, name, country } = geoData[0];
      
      // Try One Call 3.0 API first
      try {
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`
        );
        
        if (weatherResponse.ok) {
          const weatherData = await weatherResponse.json();
          
          console.log('One Call 3.0 API Response:', weatherData);
          
          // Check if the response has the expected structure
          if (!weatherData.current || !weatherData.current.temp) {
            console.log('Invalid One Call 3.0 response structure, falling back');
            throw new Error('Invalid API response structure');
          }
          const transformedData = {
            coord: { lon: lon, lat: lat },
            weather: weatherData.current.weather,
            base: "stations",
            main: {
              temp: weatherData.current.temp,
              feels_like: weatherData.current.feels_like,
              temp_min: weatherData.daily?.[0]?.temp?.min || weatherData.current.temp,
              temp_max: weatherData.daily?.[0]?.temp?.max || weatherData.current.temp,
              pressure: weatherData.current.pressure,
              humidity: weatherData.current.humidity,
              sea_level: weatherData.current.pressure,
              grnd_level: weatherData.current.pressure
            },
            visibility: weatherData.current.visibility || 10000,
            wind: {
              speed: weatherData.current.wind_speed,
              deg: weatherData.current.wind_deg,
              gust: weatherData.current.wind_gust
            },
            clouds: {
              all: weatherData.current.clouds
            },
            dt: weatherData.current.dt,
            sys: {
              type: 2,
              id: 2000000,
              country: country,
              sunrise: weatherData.current.sunrise,
              sunset: weatherData.current.sunset
            },
            timezone: weatherData.timezone_offset,
            id: Math.floor(Math.random() * 1000000),
            name: name,
            cod: 200,
            // Include daily forecast for WeatherCard
            daily: weatherData.daily
          };

          // Add location information for display
          if (userLocation) {
            const distance = calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              lat, 
              lon
            );
            transformedData.locationInfo = {
              fullName: `${name}, ${country}`,
              distance: Math.round(distance),
              isNearUser: distance < 100
            };
          }

          return transformedData;
        }
      } catch (oneCallError) {
        console.log('One Call 3.0 API failed, trying fallback:', oneCallError.message);
      }
      
      // Fallback to Current Weather API 2.5
      console.log('Using Current Weather API 2.5 fallback for:', name);
      const fallbackResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!fallbackResponse.ok) {
        console.error('Fallback API also failed with status:', fallbackResponse.status);
        throw new Error('Failed to fetch weather data from both APIs');
      }
      
      const weatherData = await fallbackResponse.json();
      console.log('Current Weather API Response:', weatherData);
      
      // Add location information for display  
      if (userLocation) {
        const distance = calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          lat, 
          lon
        );
        weatherData.locationInfo = {
          fullName: `${name}, ${country}`,
          distance: Math.round(distance),
          isNearUser: distance < 100
        };
      }
      
      return weatherData;
    } catch (error) {
      console.error('Weather fetch error:', error);
      throw new Error(error.message || 'Failed to fetch weather data');
    }
  };

  // Enhanced function to detect location mentions in user messages
  const extractLocationFromMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Skip common weather phrases that aren't locations
    const nonLocationPhrases = [
      'the weather', 'weather like', 'weather today', 'weather now',
      'how\'s the weather', 'what\'s the weather', 'weather forecast'
    ];
    
    if (nonLocationPhrases.some(phrase => lowerMessage.includes(phrase) && !lowerMessage.includes(' in ') && !lowerMessage.includes(' at '))) {
      return null;  // This is a general weather query, not location-specific
    }
    
    // Check for single location name first (like "turkey", "london", etc.)
    const words = lowerMessage.split(/\s+/);
    if (words.length === 1 && words[0].length > 2) {
      // Common single-word locations
      const commonLocations = [
        'turkey', 'london', 'paris', 'tokyo', 'sydney', 'moscow', 'delhi', 
        'beijing', 'bangkok', 'singapore', 'dubai', 'cairo', 'stockholm',
        'oslo', 'madrid', 'rome', 'berlin', 'vienna', 'prague', 'budapest',
        'karachi', 'lahore', 'islamabad', 'mumbai', 'kolkata', 'chennai',
        // US states and locations
        'california', 'texas', 'florida', 'newyork', 'chicago', 'boston',
        'seattle', 'miami', 'denver', 'phoenix', 'atlanta', 'detroit',
        'mississippi', 'alabama', 'georgia', 'nevada', 'oregon', 'washington',
        'america', 'usa'
      ];
      
      if (commonLocations.includes(words[0])) {
        return words[0];
      }
      
      // If it's not a common word and longer than 3 chars, assume it's a location
      if (words[0].length > 3 && !/^(what|how|when|where|why|the|and|but|for|are|any|can|had|her|was|one|our|out|day|get|has|him|his|its|may|new|now|old|see|two|way|who|boy|did|man|end|few|got|let|put|say|she|too|use|yes|not|you|all|any|may|say|her|use|can|oil|now|its|who|get|has|him|way|oil|man|end|few|got|let|put|say|she|too)$/.test(words[0])) {
        return words[0];
      }
    }
    
    // Common patterns for location requests
    const locationPatterns = [
      // Specific multi-word locations first
      /(?:colder|warmer|hotter|cooler|places?)\s+(?:in|near|around|close\s+to|by)\s+(united states|the united states)(?:\s|$)/,
      /(?:in|near|around|close\s+to|by)\s+(united states|the united states)(?:\s|$)/,
      
      // "What is [city] like" patterns - more specific
      /what\s+is\s+([a-zA-Z\s,.-]+?)\s+like(?:\s+today)?(?:\?|$|\.)/,
      /what'?s\s+([a-zA-Z\s,.-]+?)\s+like(?:\s+today)?(?:\?|$|\.)/,
      
      // Direct weather questions
      /weather in ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /weather at ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /weather for ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /how.*is.*weather.*in ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /what.*weather.*like.*in ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      
      // Location context patterns (near, around, close to, in) - improved  
      /(?:colder|warmer|hotter|cooler|places?)\s+(?:in|near|around|close\s+to|by)\s+([a-zA-Z\s,.-]+?)(?:\s|$)/,
      /(?:near|around|close\s+to|by|in)\s+([a-zA-Z\s,.-]+?)(?:\s|$)/,
      /places?\s+(?:in|near|around|close\s+to|by)\s+([a-zA-Z\s,.-]+?)(?:\s|$)/,
      
      // Contextual questions (like "how's it in new york")
      /how'?s?\s+it\s+in\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /how\s+is\s+it\s+in\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /what'?s?\s+it\s+like\s+in\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /how'?s?\s+([a-zA-Z\s,.-]+?)\s+today/,
      /how'?s?\s+([a-zA-Z\s,.-]+?)\s+right\s+now/,
      
      /how\s+about\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /tell\s+me\s+about\s+([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      
      // Temperature questions
      /temperature in ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /temp in ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /hot.*in ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /cold.*in ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /warm.*in ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
      /cool.*in ([a-zA-Z\s,.-]+?)(?:\?|$|\.)/,
    ];

    for (const pattern of locationPatterns) {
      const match = lowerMessage.match(pattern);
      if (match && match[1]) {
        let location = match[1].trim();
        // Clean up the location string
        location = location.replace(/[?!.]*$/, '').trim();
        // Remove common words that might get captured
        location = location.replace(/\b(today|now|right now|currently)\b/g, '').trim();
        if (location.length > 1) {
          return location;
        }
      }
    }

    return null;
  };

  const formatWeatherResponse = (weatherData, location, question) => {
    // Safety checks to prevent undefined errors
    if (!weatherData || !weatherData.main || !weatherData.weather || !weatherData.weather[0]) {
      return `⚠️ Weather data for "${location}" is incomplete. Please try again or ask about a different location.`;
    }
    
    const temp = Math.round(weatherData.main.temp);
    const feelsLike = Math.round(weatherData.main.feels_like);
    const condition = weatherData.weather[0].description;
    const city = `${weatherData.name}, ${weatherData.sys.country}`;
    const humidity = weatherData.main.humidity;
    const windSpeed = Math.round(weatherData.wind.speed * 3.6);
    const pressure = weatherData.main.pressure;

    // Add location context if available
    let locationContext = '';
    if (weatherData.locationInfo) {
      if (weatherData.locationInfo.isNearUser && weatherData.locationInfo.distance < 50) {
        locationContext = ` (📍 ${Math.round(weatherData.locationInfo.distance)} km from your location)`;
      } else if (weatherData.locationInfo.fullName !== city) {
        locationContext = ` (Found: ${weatherData.locationInfo.fullName})`;
      }
    }

    const cityWithContext = city + locationContext;
    const lowerQuestion = question.toLowerCase();

    // Specific question responses
    if (lowerQuestion.includes('temperature') || lowerQuestion.includes('temp') || lowerQuestion.includes('hot') || lowerQuestion.includes('cold')) {
      return `🌡️ Temperature in ${cityWithContext}: ${temp}°C (feels like ${feelsLike}°C). Currently ${condition}.`;
    }
    
    if (lowerQuestion.includes('rain') || lowerQuestion.includes('precipitation')) {
      return condition.includes('rain') 
        ? `🌧️ Yes, it's ${condition} in ${cityWithContext}. Temperature: ${temp}°C.`
        : `☀️ No rain in ${cityWithContext}. Currently ${condition}, ${temp}°C.`;
    }
    
    if (lowerQuestion.includes('wind')) {
      return `💨 Wind in ${cityWithContext}: ${windSpeed} km/h. Temperature: ${temp}°C, ${condition}.`;
    }
    
    if (lowerQuestion.includes('humidity')) {
      return `💧 Humidity in ${cityWithContext}: ${humidity}%. Temperature: ${temp}°C, ${condition}.`;
    }

    if (lowerQuestion.includes('pressure')) {
      return `🌫️ Atmospheric pressure in ${cityWithContext}: ${pressure} hPa. Temperature: ${temp}°C, ${condition}.`;
    }

    // General weather summary with location context
    let response = `🌤️ Weather in ${cityWithContext}: ${condition}, ${temp}°C (feels like ${feelsLike}°C). Humidity: ${humidity}%, Wind: ${windSpeed} km/h, Pressure: ${pressure} hPa.`;
    
    // Add helpful context for nearby locations
    if (weatherData.locationInfo?.isNearUser) {
      response += ` ✨ This location is close to you!`;
    }
    
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      let botResponse;

      // Check if message is weather-related
      if (!isWeatherRelated(currentMessage)) {
        botResponse = "I'm sorry, but I can only help with weather-related questions! 🌤️ Try asking me about temperature, rain, wind, humidity, or weather conditions in different locations like 'What's the weather in Paris?' or 'Is it raining in Tokyo?'";
      } else {
        // Check if user is asking for place suggestions (colder, warmer, etc.)
        const requestType = detectRequestType(currentMessage);
        console.log('Detected request type:', requestType, 'for message:', currentMessage);
        
        if (requestType) {
          try {
            console.log('Step 1: Starting suggestion logic for request type:', requestType);
            
            // Check if user mentioned a specific location in their request
            const mentionedLocation = extractLocationFromMessage(currentMessage);
            console.log('Step 2: Extracted location:', mentionedLocation);
            
            let countryCode = 'PK'; // Default fallback
            console.log('Step 3: Default country code:', countryCode);
            
            // If user has location data, use it as fallback
            if (userCity && userCity.country) {
              countryCode = userCity.country;
              console.log('Step 4: Using user country code:', countryCode);
            }
            
            // If a specific location is mentioned, use that for context (priority over user location)
            if (mentionedLocation) {
              // Use the same region detection logic
              const detectedRegion = getRegionFromLocation(mentionedLocation, countryCode);
              console.log('Step 5: Detected region from location:', detectedRegion, 'for location:', mentionedLocation);
              countryCode = detectedRegion;
            }
            
            console.log('Step 6: Final country code for suggestions:', countryCode);
            const suggestions = await suggestNearbyPlaces(requestType, countryCode, mentionedLocation);
            console.log('Step 7: Got suggestions:', suggestions);
            
            if (suggestions.length > 0) {
              // Automatically fetch weather for the first suggestion and update card
              const firstSuggestion = suggestions[0];
              const weatherDataResult = await fetchWeatherForLocation(firstSuggestion);
              
              // Update the main weather card with the suggested location
              if (onWeatherUpdate) {
                onWeatherUpdate(weatherDataResult);
              }
              
              // Create response with suggestion and weather data
              const weatherInfo = formatWeatherResponse(weatherDataResult, firstSuggestion, `weather in ${firstSuggestion}`);
              
              const locationContext = mentionedLocation ? 
                `near ${mentionedLocation}` : 
                (userCity ? `your location in ${userCity.fullName}` : 'your area');
              
              botResponse = `🎯 Based on ${locationContext}, here are some nearby ${requestType} places:\n\n` +
                `🔥 **${firstSuggestion}** (showing in weather card above):\n${weatherInfo}\n\n` +
                `📍 Other nearby options:\n${suggestions.slice(1).map(place => `• ${place}`).join('\n')}\n\n` +
                `Just ask "What's [city name] like?" to see weather for any of these places! 🌟`;
            } else {
              botResponse = `I'd be happy to suggest ${requestType} places near you! However, I don't have enough local data for your area. Try asking about specific cities you're interested in! 🌍`;
            }
          } catch (error) {
            console.error('Error in suggestion logic:', error);
            console.error('Error details:', {
              requestType,
              mentionedLocation: extractLocationFromMessage(currentMessage),
              userCity,
              userLocation
            });
            botResponse = `I'd love to suggest ${requestType} places near you! Try asking about specific cities like "What's Murree like?" or "How's Karachi today?" 🌤️`;
          }
        } else {
          // Check if user is asking about a specific location
          const requestedLocation = extractLocationFromMessage(currentMessage);
          
          if (requestedLocation) {
            // User asked about a specific location - fetch weather for that location
            try {
              const locationWeatherData = await fetchWeatherForLocation(requestedLocation);
              botResponse = formatWeatherResponse(locationWeatherData, requestedLocation, currentMessage);
              
              // Update the main weather card with the new location data
              if (onWeatherUpdate) {
                onWeatherUpdate(locationWeatherData);
              }
            } catch (error) {
              botResponse = `I couldn't find weather data for "${requestedLocation}". ${error.message} Please try with a different city name or check the spelling.`;
            }
          } else {
            // If no specific location mentioned, check if it's a general weather query and use user location
            if (userCity && (currentMessage.toLowerCase().includes('weather') || 
                            currentMessage.toLowerCase().includes("how's") ||
                            currentMessage.toLowerCase().includes("what's") ||
                            currentMessage.toLowerCase().match(/^(weather|how|what)/))) {
              // Use user's location for general weather queries
              try {
                // Extract and clean city name more aggressively
                let cityName = userCity.name || userCity.fullName.split(',')[0];
                
                // Clean up common administrative suffixes and complex names
                cityName = cityName
                  .replace(/\s+(City|Tehsil|District|Division|Metropolitan|Metro|Municipality|County|Borough|Township|Ward|Region|Province|State)\b/gi, '')
                  .replace(/\s+(Urban|Rural|Central|North|South|East|West)\b/gi, '')
                  .replace(/\s+Area\b/gi, '')
                  .trim();
                
                // For complex Pakistani city names, try to extract the main city
                if (cityName.includes('Faisalabad')) {
                  cityName = 'Faisalabad';
                } else if (cityName.includes('Lahore')) {
                  cityName = 'Lahore'; 
                } else if (cityName.includes('Karachi')) {
                  cityName = 'Karachi';
                } else if (cityName.includes('Islamabad')) {
                  cityName = 'Islamabad';
                }
                
                console.log('Cleaned city name for weather:', cityName, 'from original:', userCity.fullName);
                
                const locationWeatherData = await fetchWeatherForLocation(cityName);
                botResponse = `🌍 Here's the weather in your area (${userCity.fullName}):\n\n${formatWeatherResponse(locationWeatherData, cityName, currentMessage)}`;
                
                // Update the main weather card with the user's location data
                if (onWeatherUpdate) {
                  onWeatherUpdate(locationWeatherData);
                }
              } catch (error) {
                botResponse = `I couldn't get weather data for your location (${userCity.fullName}). Please try asking about a specific city! 🌤️`;
              }
            } else {
              // General weather question - provide helpful response
              botResponse = "I'm here to help with weather questions! Try asking about specific places like:\n• 'What's Tokyo like?'\n• 'How's London today?'\n• 'Temperature in Paris?'\n• 'Is it raining in New York?'\n\nOr if you're looking for suggestions, try:\n• 'Suggest me a colder place'\n• 'Suggest me a warmer place' 🌍";
            }
          }
        }
      }

      const botMessage = {
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: 'bot',
        content: "I'm sorry, I encountered an error. Please try asking your weather question again! 🌤️",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="glass-card max-w-md mx-auto">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Weather AI</h3>
            <p className="text-white/60 text-xs">
              {userCity ? `📍 Near ${userCity.name}` : 'Ask me about weather'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Chat Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white ml-2'
                  : 'bg-white/10 text-white mr-2'
              } whitespace-pre-line`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-white max-w-xs px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20">
        <div className="flex items-stretch space-x-2">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about weather anywhere..."
              className="w-full bg-white/10 text-white placeholder-white/60 px-3 py-2 rounded-lg resize-none border border-white/20 focus:border-white/40 focus:outline-none min-h-[42px] h-[42px]"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white px-3 rounded-lg transition-colors duration-200 flex items-center justify-center w-[42px] h-[42px] flex-shrink-0"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-2 mt-2">
          {userCity && (
            <>
              <button
                onClick={() => setInputMessage('suggest me a colder place')}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-full transition-colors duration-200"
              >
                🏔️ Colder places
              </button>
              <button
                onClick={() => setInputMessage('suggest me a warmer place')}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-full transition-colors duration-200"
              >
                🌴 Warmer places
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherChatbot;