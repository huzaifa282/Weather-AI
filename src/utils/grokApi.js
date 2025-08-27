/**
 * Grok AI integration for natural language weather queries
 * Handles structured JSON extraction from user queries
 */

// Use environment variable for API URL
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

/**
 * Get date string for days in the future
 * @param {number} daysFromNow - Number of days from today
 * @returns {string} Date in YYYY-MM-DD format
 */
function getNextDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

/**
 * Get weekend dates (Saturday and Sunday)
 * @returns {Array} [Saturday date, Sunday date]
 */
function getWeekendDates() {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
  
  let daysToSaturday = 6 - currentDay;
  if (daysToSaturday <= 0) daysToSaturday += 7; // Next weekend if it's already weekend
  
  const saturday = new Date(today);
  saturday.setDate(today.getDate() + daysToSaturday);
  
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  
  return [
    saturday.toISOString().split('T')[0],
    sunday.toISOString().split('T')[0]
  ];
}

/**
 * Extract structured data from user query using Grok AI with conversation context
 * @param {string} userMessage - The user's natural language query
 * @param {Array} conversationHistory - Previous conversation messages for context
 * @returns {Promise<Object>} Structured data with cities, date, units, and query type
 */
export const extractWeatherIntent = async (userMessage, conversationHistory = []) => {
  try {
    // Use consistent environment variable name
    const API_KEY = process.env.REACT_APP_GROQ_API_KEY;
    
    if (!API_KEY || API_KEY === 'your_grok_api_key_here') {
      console.warn('Grok API key not configured, using fallback parsing');
      return fallbackParsing(userMessage, conversationHistory);
    }

    // Build context from conversation history
    const contextMessages = conversationHistory.slice(-4).map(msg => 
      `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    const systemPrompt = `You are a weather assistant that understands conversation context and complex queries.

CONTEXT AWARENESS:
- Remember previous questions and locations mentioned
- Handle follow-up questions like "on which day", "which is colder", "what about alaska", "what about sep 3"
- If a query lacks location but context provides it, use the contextual location
- "What about X" usually refers to the same question type but for location/date X

QUERY TYPES SUPPORTED:
1. SINGLE_LOCATION: Weather for one city
2. COMPARISON: Compare weather between multiple cities  
3. FOLLOW_UP: Reference to previous conversation ("what about", "which day", etc.)
4. DATE_RANGE: Weather for specific time periods (weekend, date ranges)
5. SUGGESTION: User asking for place suggestions ("suggest me a colder place")

RESPONSE FORMAT (JSON only):
{
  "queryType": "SINGLE_LOCATION|COMPARISON|FOLLOW_UP|DATE_RANGE|SUGGESTION",
  "cities": ["city1", "city2"],  // Array of cities (can be 1 or multiple)
  "date": "YYYY-MM-DD",         // Target date or today if not specified
  "dateRange": ["YYYY-MM-DD", "YYYY-MM-DD"], // For weekend/range queries
  "units": "Celsius|Fahrenheit", 
  "comparisonType": "temperature|rain|general", // For comparison queries
  "suggestionType": "colder|warmer|rainy|snowy|general", // For suggestion queries
  "context": "brief context from conversation if needed"
}

IMPORTANT PARSING RULES:
- "what about alaska" → FOLLOW_UP with cities: ["Alaska"]
- "what about sep 3" → FOLLOW_UP with same cities from context, date: "2025-09-03"  
- "which is colder murree or faisalabad" → COMPARISON with cities: ["Murree", "Faisalabad"]
- "suggest me a colder place" → SUGGESTION with suggestionType: "colder"

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

EXAMPLES:
User: "How's weather in Paris?"
Response: {"queryType": "SINGLE_LOCATION", "cities": ["Paris"], "date": "${new Date().toISOString().split('T')[0]}", "units": "Celsius"}

User: "Compare weather of Karachi and Istanbul"  
Response: {"queryType": "COMPARISON", "cities": ["Karachi", "Istanbul"], "date": "${new Date().toISOString().split('T')[0]}", "units": "Celsius", "comparisonType": "general"}

User: "which is colder. murree or faisalabad"
Response: {"queryType": "COMPARISON", "cities": ["Murree", "Faisalabad"], "date": "${new Date().toISOString().split('T')[0]}", "units": "Celsius", "comparisonType": "temperature"}

User: "what about alaska" (after asking about istanbul)
Response: {"queryType": "FOLLOW_UP", "cities": ["Alaska"], "date": "${new Date().toISOString().split('T')[0]}", "units": "Celsius", "context": "follow-up query"}

User: "what about sep 3" (after asking about a city)
Response: {"queryType": "FOLLOW_UP", "cities": ["Istanbul"], "date": "2025-09-03", "units": "Celsius", "context": "date follow-up query"}

User: "suggest me a colder place"
Response: {"queryType": "SUGGESTION", "cities": [], "date": "${new Date().toISOString().split('T')[0]}", "units": "Celsius", "suggestionType": "colder"}

CONVERSATION CONTEXT:
${contextMessages}

USER QUERY: "${userMessage}"

Return JSON only. No explanations.`;

    const response = await fetch(GROK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        model: 'grok-beta',
        stream: false,
        temperature: 0.1,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      console.error('Grok API error:', response.status, response.statusText);
      return fallbackParsing(userMessage, conversationHistory);
    }

    const data = await response.json();
    const grokResponse = data.choices[0].message.content.trim();
    
    try {
      const parsedResult = JSON.parse(grokResponse);
      
      // Validate and normalize the response
      return normalizeGrokResponse(parsedResult);
    } catch (parseError) {
      console.error('Failed to parse Grok JSON response:', grokResponse);
      return fallbackParsing(userMessage, conversationHistory);
    }

  } catch (error) {
    console.error('Grok API request failed:', error);
    return fallbackParsing(userMessage, conversationHistory);
  }
};

/**
 * Normalize and validate Grok response
 * @param {Object} parsedResult - Raw Grok response
 * @returns {Object} Normalized response
 */
function normalizeGrokResponse(parsedResult) {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    queryType: parsedResult.queryType || 'SINGLE_LOCATION',
    cities: Array.isArray(parsedResult.cities) ? parsedResult.cities : 
            parsedResult.city ? [parsedResult.city] : 
            parsedResult.cities ? [parsedResult.cities] : [],
    date: parsedResult.date || today,
    dateRange: parsedResult.dateRange || null,
    units: parsedResult.units === 'Fahrenheit' ? 'Fahrenheit' : 'Celsius',
    comparisonType: parsedResult.comparisonType || 'general',
    suggestionType: parsedResult.suggestionType || null,
    context: parsedResult.context || null
  };
}

/**
 * Fallback parsing when Grok API is not available
 * Uses pattern matching and context awareness
 * @param {string} userMessage - The user's query
 * @param {Array} conversationHistory - Previous conversation for context
 * @returns {Object} Parsed intent
 */
function fallbackParsing(userMessage, conversationHistory = []) {
  const lowerMessage = userMessage.toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  
  // Get context from recent conversation
  const recentMessages = conversationHistory.slice(-3);
  const mentionedCities = [];
  
  // Extract cities from recent conversation
  recentMessages.forEach(msg => {
    const cities = extractCitiesFromText(msg.content);
    mentionedCities.push(...cities);
  });
  
  // Detect query type
  let queryType = 'SINGLE_LOCATION';
  let comparisonType = 'general';
  
  if (lowerMessage.includes('compare') || lowerMessage.includes('vs') || lowerMessage.includes('versus')) {
    queryType = 'COMPARISON';
  } else if (lowerMessage.match(/which\s+(is|are)\s+(cold|warm|hot|cool|rain|sun|better)/)) {
    queryType = 'COMPARISON';
    comparisonType = lowerMessage.includes('better') ? 'general' : 'temperature';
  } else if (lowerMessage.match(/suggest.*(?:cold|warm|hot|cool|place)/i) || 
             lowerMessage.match(/(?:cold|warm|hot|cool|better).*place/i)) {
    queryType = 'SUGGESTION';
  } else if (lowerMessage.match(/weekend|saturday|sunday/)) {
    queryType = 'DATE_RANGE';
  } else if (lowerMessage.match(/which\s+day|what\s+day|on\s+which|when/)) {
    queryType = 'FOLLOW_UP';
  } else if (lowerMessage.match(/what\s+about/)) {
    queryType = 'FOLLOW_UP';
  }
  
  // Extract cities from current message
  let cities = extractCitiesFromText(userMessage);
  
  // If no cities found in current message, use context
  if (cities.length === 0 && mentionedCities.length > 0) {
    cities = [...new Set(mentionedCities)]; // Remove duplicates
  }
  
  // Handle comparison queries with "and" or "or"
  if (queryType === 'COMPARISON' && cities.length < 2) {
    const andSplit = userMessage.split(/\s+(and|or)\s+/i);
    if (andSplit.length >= 3) { // [city1, "and/or", city2]
      cities = [andSplit[0], andSplit[2]].map(part => extractCitiesFromText(part.trim())).flat();
    }
  }
  
  // Handle suggestion queries - detect location preference
  let suggestionType = null;
  if (queryType === 'SUGGESTION') {
    if (lowerMessage.match(/cold|cool|chill|mountain|hill/i)) {
      suggestionType = 'colder';
    } else if (lowerMessage.match(/warm|hot|heat|desert|beach/i)) {
      suggestionType = 'warmer';
    } else if (lowerMessage.match(/rain/i)) {
      suggestionType = 'rainy';
    } else if (lowerMessage.match(/snow/i)) {
      suggestionType = 'snowy';
    } else {
      suggestionType = 'general';
    }
  }
  
  // Date parsing
  let date = today;
  let dateRange = null;
  
  if (lowerMessage.includes('tomorrow')) {
    date = getNextDate(1);
  } else if (lowerMessage.includes('weekend')) {
    queryType = 'DATE_RANGE';
    dateRange = getWeekendDates();
  } else if (lowerMessage.includes('next week')) {
    date = getNextDate(7);
  } else if (lowerMessage.match(/sep\s*3|september\s*3/i)) {
    // Handle "sep 3" - assuming current year
    const currentYear = new Date().getFullYear();
    date = `${currentYear}-09-03`;
  } else if (lowerMessage.match(/(\w+)\s+(\d{1,2})/)) {
    // Handle other month/day combinations
    const match = lowerMessage.match(/(\w+)\s+(\d{1,2})/);
    const monthName = match[1].toLowerCase();
    const day = parseInt(match[2]);
    
    const months = {
      jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
      apr: '04', april: '04', may: '05', jun: '06', june: '06',
      jul: '07', july: '07', aug: '08', august: '08', sep: '09', september: '09',
      oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12'
    };
    
    if (months[monthName] && day >= 1 && day <= 31) {
      const currentYear = new Date().getFullYear();
      const monthNumber = months[monthName];
      date = `${currentYear}-${monthNumber}-${day.toString().padStart(2, '0')}`;
    }
  }
  
  // Units detection
  const units = lowerMessage.includes('fahrenheit') || lowerMessage.includes('°f') ? 'Fahrenheit' : 'Celsius';
  
  return {
    queryType,
    cities: cities.length > 0 ? cities : [],
    date,
    dateRange,
    units,
    comparisonType,
    suggestionType,
    context: mentionedCities.length > 0 ? `Referenced cities from context: ${mentionedCities.join(', ')}` : null
  };
}

/**
 * Extract city names from text using patterns and common city names
 * @param {string} text - Text to extract cities from
 * @returns {Array} Array of city names
 */
function extractCitiesFromText(text) {
  const cities = [];
  const lowerText = text.toLowerCase();
  
  // Common city patterns
  const cityPatterns = [
    /(?:in|for|at|about)\s+([a-zA-Z\s]+?)(?:\s|$|[?.!,])/gi,
    /weather\s+(?:in|of)\s+([a-zA-Z\s]+?)(?:\s|$|[?.!,])/gi,
    /how['\s]+?s?\s+([a-zA-Z\s]+?)(?:\s|$|[?.!,])/gi
  ];
  
  // Known cities database (expanded)
  const knownCities = [
    'karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'peshawar', 'quetta', 'murree',
    'london', 'paris', 'new york', 'tokyo', 'delhi', 'mumbai', 'istanbul', 'dubai', 'singapore',
    'berlin', 'madrid', 'rome', 'vienna', 'amsterdam', 'barcelona', 'moscow', 'sydney', 'melbourne',
    'toronto', 'vancouver', 'chicago', 'los angeles', 'san francisco', 'miami', 'boston',
    'beijing', 'shanghai', 'hong kong', 'seoul', 'osaka', 'bangkok', 'jakarta', 'manila',
    'alaska', 'anchorage', 'fairbanks', 'juneau', 'sitka', 'ketchikan', 'nome', 'barrow'
  ];
  
  // Extract using patterns
  cityPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const cityCandidate = match[1].trim();
      if (cityCandidate.length > 2) {
        cities.push(cityCandidate);
      }
    }
  });
  
  // Check for known cities mentioned directly
  knownCities.forEach(city => {
    if (lowerText.includes(city)) {
      cities.push(city);
    }
  });
  
  // Remove duplicates and return
  return [...new Set(cities.map(city => 
    city.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  ))];
}

/**
 * Format weather comparison between multiple cities
 * @param {Array} weatherDataArray - Array of weather data for different cities
 * @param {Array} cityNames - Array of city names
 * @param {string} comparisonType - Type of comparison (temperature, rain, general)
 * @param {boolean} isCelsius - Temperature unit preference
 * @returns {string} Formatted comparison response
 */
export const formatWeatherComparison = (weatherDataArray, cityNames, comparisonType, isCelsius) => {
  if (!weatherDataArray || weatherDataArray.length < 2) {
    return "I need at least two cities to make a comparison.";
  }

  const unit = isCelsius ? '°C' : '°F';
  const comparisons = weatherDataArray.map((data, index) => {
    if (!data || !data.current) return null;
    
    const temp = Math.round(isCelsius ? data.current.temp : (data.current.temp * 9/5) + 32);
    const condition = data.current.weather[0].description;
    const city = cityNames[index];
    
    return { city, temp, condition };
  }).filter(Boolean);

  if (comparisons.length < 2) {
    return "I couldn't get weather data for all the requested cities.";
  }

  let response = `🌍 **Weather Comparison**\n\n`;
  
  // Add current conditions for each city
  comparisons.forEach(({ city, temp, condition }) => {
    response += `📍 **${city}**: ${temp}${unit}, ${condition}\n`;
  });
  
  response += '\n';

  // Specific comparison based on type
  if (comparisonType === 'temperature') {
    const coldest = comparisons.reduce((prev, curr) => prev.temp < curr.temp ? prev : curr);
    const warmest = comparisons.reduce((prev, curr) => prev.temp > curr.temp ? prev : curr);
    
    if (coldest.city !== warmest.city) {
      response += `🥶 **Coldest**: ${coldest.city} at ${coldest.temp}${unit}\n`;
      response += `🌡️ **Warmest**: ${warmest.city} at ${warmest.temp}${unit}\n`;
      response += `📊 **Temperature difference**: ${warmest.temp - coldest.temp}${unit.slice(1)}`;
    } else {
      response += `🌡️ Both cities have similar temperatures around ${coldest.temp}${unit}`;
    }
  } else {
    // General comparison
    const tempDiff = Math.abs(comparisons[0].temp - comparisons[1].temp);
    if (tempDiff > 5) {
      const warmer = comparisons[0].temp > comparisons[1].temp ? comparisons[0] : comparisons[1];
      const cooler = comparisons[0].temp < comparisons[1].temp ? comparisons[0] : comparisons[1];
      response += `🌡️ ${warmer.city} is significantly warmer (${tempDiff}${unit.slice(1)} difference)\n`;
      response += `❄️ ${cooler.city} feels cooler with ${cooler.condition}`;
    } else {
      response += `🌡️ Both cities have similar temperatures with only ${tempDiff}${unit.slice(1)} difference`;
    }
  }

  return response;
};

/**
 * Format a natural language response for weather data with date context
 * @param {Object} weatherData - Weather data from One Call 3.0 API
 * @param {string} city - City name
 * @param {string} date - Requested date
 * @param {boolean} isCelsius - Temperature unit preference
 * @param {Array} dateRange - Date range for weekend/multi-day queries
 * @returns {string} Natural language weather description
 */
export const formatWeatherResponse = (weatherData, city, date, isCelsius, dateRange = null) => {
  if (!weatherData) {
    return `Sorry, I couldn't get weather information for ${city}.`;
  }

  const today = new Date().toISOString().split('T')[0];
  const requestedDate = new Date(date);
  const isToday = date === today;
  const isTomorrow = date === getNextDate(1);
  
  // Handle date range (weekend) queries
  if (dateRange && dateRange.length === 2) {
    const startDate = new Date(dateRange[0]);
    const endDate = new Date(dateRange[1]);
    
    let response = `🌤️ **Weekend Weather for ${city}**\n\n`;
    
    if (weatherData.daily) {
      const startDayIndex = Math.floor((startDate - new Date(today)) / (1000 * 60 * 60 * 24));
      const endDayIndex = Math.floor((endDate - new Date(today)) / (1000 * 60 * 60 * 24));
      
      for (let i = Math.max(0, startDayIndex); i <= Math.min(6, endDayIndex); i++) {
        const dayData = weatherData.daily[i];
        if (dayData) {
          const dayDate = new Date(today);
          dayDate.setDate(dayDate.getDate() + i);
          const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
          
          const high = Math.round(isCelsius ? dayData.temp.max : (dayData.temp.max * 9/5) + 32);
          const low = Math.round(isCelsius ? dayData.temp.min : (dayData.temp.min * 9/5) + 32);
          const condition = dayData.weather[0].description;
          const unit = isCelsius ? '°C' : '°F';
          
          response += `📅 **${dayName}**: ${condition}, High ${high}${unit}, Low ${low}${unit}\n`;
        }
      }
    }
    
    return response;
  }
  
  let timeReference = '';
  if (isToday) {
    timeReference = 'today';
  } else if (isTomorrow) {
    timeReference = 'tomorrow';
  } else {
    timeReference = `on ${requestedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
  }

  try {
    let temperature, condition, high, low;
    
    if (isToday && weatherData.current) {
      // Use current weather for today
      temperature = Math.round(isCelsius ? weatherData.current.temp : (weatherData.current.temp * 9/5) + 32);
      condition = weatherData.current.weather?.[0]?.description || 'clear';
      
      if (weatherData.daily && weatherData.daily[0]) {
        high = Math.round(isCelsius ? weatherData.daily[0].temp.max : (weatherData.daily[0].temp.max * 9/5) + 32);
        low = Math.round(isCelsius ? weatherData.daily[0].temp.min : (weatherData.daily[0].temp.min * 9/5) + 32);
      }
    } else if (weatherData.daily && weatherData.daily.length > 0) {
      // Find matching day in daily forecast
      const dayIndex = Math.max(0, Math.floor((requestedDate - new Date(today)) / (1000 * 60 * 60 * 24)));
      const dayData = weatherData.daily[dayIndex] || weatherData.daily[0];
      
      if (dayData) {
        temperature = Math.round(isCelsius ? (dayData.temp?.day || dayData.temp?.max || 0) : ((dayData.temp?.day || dayData.temp?.max || 0) * 9/5) + 32);
        condition = dayData.weather?.[0]?.description || 'clear';
        high = Math.round(isCelsius ? (dayData.temp?.max || 0) : ((dayData.temp?.max || 0) * 9/5) + 32);
        low = Math.round(isCelsius ? (dayData.temp?.min || 0) : ((dayData.temp?.min || 0) * 9/5) + 32);
      } else {
        return `I can only provide weather forecasts up to 7 days in advance for ${city}.`;
      }
    } else if (weatherData.current) {
      // Fallback to current weather
      temperature = Math.round(isCelsius ? weatherData.current.temp : (weatherData.current.temp * 9/5) + 32);
      condition = weatherData.current.weather?.[0]?.description || 'clear';
    } else {
      return `Weather data is not available for ${city} at the moment.`;
    }

    const unit = isCelsius ? '°C' : '°F';
    let response = `🌤️ It will be ${condition} in ${city} ${timeReference}`;
    
    if (high && low && high !== low) {
      response += ` with a high of ${high}${unit} and a low of ${low}${unit}`;
    } else if (temperature) {
      response += ` with a temperature of ${temperature}${unit}`;
    }
    
    response += '.';
    
    return response;
  } catch (error) {
    console.error('Error formatting weather response:', error);
    return `Here's the weather information for ${city} ${timeReference}.`;
  }
};
