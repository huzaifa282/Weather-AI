/**
 * Enhanced Grok AI integration for intelligent weather queries
 * This function acts as the main intelligence layer that:
 * 1. Understands user intent and context
 * 2. Decides which weather APIs to call
 * 3. Generates contextual responses
 */

// Use environment variable for API URL
const GROK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROK_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

// Export helper functions
export { 
  handleWeatherFetch, 
  handleWeatherComparison, 
  handlePlaceSuggestions,
  generateWeatherMessage,
  generateComparisonMessage,
  generateSuggestionMessage
};

/**
 * Main intelligent weather assistant function
 * Uses Grok to understand queries and orchestrate weather API calls
 */
export const processIntelligentWeatherQuery = async (
  userMessage, 
  conversationHistory = [], 
  currentWeatherData = null,
  userLocation = null,
  fetchWeatherFunction = null
) => {
  try {
    const API_KEY = GROK_API_KEY;
    
    console.log('API Key check:', {
      hasKey: !!API_KEY,
      keyStart: API_KEY ? API_KEY.substring(0, 10) + '...' : 'None',
      keyLength: API_KEY ? API_KEY.length : 0
    });
    
    if (!API_KEY || API_KEY === 'your_grok_api_key_here') {
      console.warn('Grok API key not configured, using fallback');
      return { 
        type: 'error', 
        message: 'AI intelligence not available, using basic weather lookup' 
      };
    }

    // Build conversation context with better city extraction
    const contextMessages = conversationHistory.slice(-6).map(msg => 
      `${msg.type === 'user' ? 'Human' : 'Assistant'}: ${msg.content}`
    ).join('\n');

    // Extract recently mentioned cities from conversation
    const recentCities = [];
    conversationHistory.slice(-4).forEach(msg => {
      // Look for city names in weather responses and user queries
      const cityMatches = msg.content.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s*(?:[A-Z]{2}|[A-Z][a-z]+)?\b/g);
      if (cityMatches) {
        cityMatches.forEach(match => {
          const cleanCity = match.replace(/[,:]/, '').trim();
          if (cleanCity.length > 2 && !recentCities.includes(cleanCity)) {
            recentCities.push(cleanCity);
          }
        });
      }
    });

    const recentCitiesContext = recentCities.length > 0 ? 
      `\nRECENT CITIES DISCUSSED: ${recentCities.slice(0, 3).join(', ')}` : '';

    // Include current weather context if available
    let currentWeatherContext = '';
    if (currentWeatherData) {
      currentWeatherContext = `
CURRENT WEATHER DISPLAY: ${currentWeatherData.name}, ${currentWeatherData.sys?.country}
Temperature: ${Math.round(currentWeatherData.main?.temp)}°C
Condition: ${currentWeatherData.weather?.[0]?.description}
`;
    }

    // Include user location context if available
    let userLocationContext = '';
    if (userLocation) {
      userLocationContext = `
USER LOCATION: Near ${userLocation.name || 'detected location'}
Coordinates: ${userLocation.latitude}, ${userLocation.longitude}
`;
    }

    const systemPrompt = `You are an intelligent weather assistant with access to real-time weather APIs and location services. Your job is to:

1. UNDERSTAND the user's query in context of the conversation
2. DECIDE what weather data to fetch based on user location and preferences
3. GENERATE an appropriate response plan that provides relevant weather information

CONVERSATION CONTEXT:
${contextMessages}${recentCitiesContext}

${currentWeatherContext}
${userLocationContext}

ADVANCED CAPABILITIES:
- Fetch current weather for any city worldwide with detailed conditions
- Compare weather between multiple locations with insights
- Suggest places based on weather preferences (colder, warmer, rainy, sunny, etc.)
- Use user's current location for intelligent suggestions
- Understand context from previous conversation and handle follow-ups
- Parse complex queries like "somewhere warm for vacation" or "colder than here"
- Provide travel and activity recommendations based on weather

INTELLIGENT LOCATION HANDLING:
- If user says "here", "my location", "where I am" → use user_current_location
- For suggestions like "colder place", use user's location as reference point
- Understand relative terms: "warmer than London", "colder than here", etc.
- Detect vacation/travel intent and suggest appropriate destinations
- Consider regional preferences and proximity for suggestions
- ALWAYS prioritize user's home region for suggestions

REGION DETECTION RULES:
- If user location shows PK/Pakistan → use region "PK" for suggestions
- If user location shows US/United States → use region "US" for suggestions  
- If user location shows TR/Turkey → use region "TR" for suggestions
- If user location shows IN/India → use region "IN" for suggestions
- If user location shows GB/UK → use region "GB" for suggestions
- Only use "global" if no specific region can be determined
- For location-based suggestions (warmer/colder), ALWAYS use user's region first

CONTEXT AWARENESS:
- Remember the last discussed location from conversation history
- For queries like "weather in 2 days", "tomorrow", "forecast" → use last mentioned location OR user_current_location
- If conversation history shows a city was recently discussed, use that as default context
- Parse relative time references: "tomorrow", "in 2 days", "next week"
- Maintain conversational flow by understanding implicit location references

RESPONSE FORMAT (JSON only):
{
  "action": "FETCH_WEATHER|COMPARE_WEATHER|SUGGEST_PLACES|PROVIDE_CONTEXT|GENERAL_RESPONSE",
  "locations": ["city1", "city2", ...], // Cities to fetch weather for
  "suggestionType": "colder|warmer|rainy|snowy|sunny|coastal|mountain|vacation|dry|humid|windy", // For suggestions
  "region": "US|PK|TR|IR|GB|CA|AU|EU|global", // Target region for suggestions
  "referenceLocation": "city_name", // For comparisons like "colder than X"
  "responseStyle": "detailed|simple|comparison|suggestion|travel|conversational", 
  "context": "What this query is about in relation to conversation",
  "userIntent": "What the user actually wants to know",
  "reasoning": "Why you chose this action and these locations",
  "conversationalTone": "friendly|helpful|enthusiastic|informative", // How to respond
  "includeContext": true // Always include conversational context
}

ENHANCED PARSING EXAMPLES:

User: "How's the weather?" 
→ { "action": "FETCH_WEATHER", "locations": ["user_current_location"], "responseStyle": "detailed" }

User: "Suggest somewhere colder" or "I want a colder place"
→ { "action": "SUGGEST_PLACES", "suggestionType": "colder", "region": "PK", "referenceLocation": "user_current_location", "responseStyle": "conversational", "conversationalTone": "helpful" }

User: "suggest me a warmer place" (user in Pakistan)
→ { "action": "SUGGEST_PLACES", "suggestionType": "warmer", "region": "PK", "responseStyle": "conversational", "conversationalTone": "helpful" }

User: "Any warm places for vacation?"
→ { "action": "SUGGEST_PLACES", "suggestionType": "vacation", "region": "PK", "responseStyle": "travel", "conversationalTone": "enthusiastic" }

User: "Suggest me a dry place" or "I need somewhere with low humidity"
→ { "action": "SUGGEST_PLACES", "suggestionType": "dry", "region": "global", "responseStyle": "conversational", "conversationalTone": "helpful" }

User: "Somewhere warmer than London"
→ { "action": "SUGGEST_PLACES", "suggestionType": "warmer", "referenceLocation": "London", "region": "global", "responseStyle": "conversational" }

User: "Compare weather in Tokyo and Seoul"
→ { "action": "COMPARE_WEATHER", "locations": ["Tokyo", "Seoul"], "responseStyle": "comparison", "conversationalTone": "informative" }

User: "What about rainy places?" (context-aware)
→ { "action": "SUGGEST_PLACES", "suggestionType": "rainy", "region": "global", "responseStyle": "conversational", "conversationalTone": "friendly" }

User: "weather in 2 days" or "tomorrow's weather" (context-aware, use last discussed location or user location)
→ { "action": "FETCH_WEATHER", "locations": ["user_current_location"], "responseStyle": "conversational", "context": "Future weather request", "conversationalTone": "helpful" }

User: "what about tomorrow?" (after discussing Faisalabad weather)
→ { "action": "FETCH_WEATHER", "locations": ["Faisalabad"], "responseStyle": "conversational", "context": "Follow-up weather query for previously discussed location", "conversationalTone": "helpful" }

CONTEXT PARSING RULES:
- Always check conversation history for recently mentioned cities
- If user asks about time without location, use the most recent location discussed
- If no recent location in conversation, default to user_current_location
- Make responses conversational and natural, not robotic

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

Analyze this query intelligently and provide the JSON response:

USER QUERY: "${userMessage}"`;

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
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`Grok API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const grokResponse = data.choices[0].message.content;
    
    console.log('Grok raw response:', grokResponse);

    // Parse JSON response
    let parsedResponse;
    try {
      // Extract JSON from response if it's wrapped in text
      const jsonMatch = grokResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(grokResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse Grok response:', parseError);
      return {
        type: 'error',
        message: 'AI parsing error, please rephrase your question'
      };
    }

    console.log('Parsed Grok response:', parsedResponse);

    // Now execute the action that Grok decided
    return await executeGrokAction(parsedResponse, fetchWeatherFunction, userLocation);

  } catch (error) {
    console.error('Grok processing error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return {
      type: 'error',
      message: `AI intelligence temporarily unavailable. Error: ${error.message}`
    };
  }
};

/**
 * Execute the action that Grok AI decided upon
 */
async function executeGrokAction(grokDecision, fetchWeatherFunction, userLocation) {
  const { action, locations, suggestionType, region, responseStyle, context, userIntent, reasoning, conversationalTone } = grokDecision;
  
  console.log('Executing Grok action:', action, 'for locations:', locations);

  try {
    switch (action) {
      case 'FETCH_WEATHER':
        return await handleWeatherFetch(locations, responseStyle, fetchWeatherFunction, userLocation, grokDecision);
        
      case 'COMPARE_WEATHER':
        return await handleWeatherComparison(locations, fetchWeatherFunction, grokDecision);
        
      case 'SUGGEST_PLACES':
        return await handlePlaceSuggestions(suggestionType, region, userLocation, grokDecision);
        
      case 'PROVIDE_CONTEXT':
        return {
          type: 'context',
          message: context || userIntent || 'Let me help you with weather information! What would you like to know? 🌤️',
          requiresWeatherData: false,
          conversationalTone: conversationalTone
        };
        
      case 'GENERAL_RESPONSE':
        return {
          type: 'general',
          message: userIntent || 'I can help you with weather information for any location worldwide! Just ask about a city, or say things like "suggest somewhere warmer" for recommendations! 🌟',
          requiresWeatherData: false,
          conversationalTone: conversationalTone
        };
        
      default:
        return {
          type: 'error',
          message: 'I\'m not sure how to help with that. Try asking about weather for a specific location, or ask for suggestions like "suggest somewhere colder"! 😊'
        };
    }
  } catch (error) {
    console.error('Error executing Grok action:', error);
    return {
      type: 'error',
      message: 'Sorry, there was an error processing your request. Please try again! 🤔'
    };
  }
}

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
        model: 'llama-3.1-8b-instant',
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

/**
 * Handle weather fetching for specific locations
 */
async function handleWeatherFetch(locations, responseStyle, fetchWeatherFunction, userLocation, grokDecision = {}) {
  if (!locations || locations.length === 0) {
    return {
      type: 'error',
      message: 'No location specified for weather lookup'
    };
  }

  try {
    let targetLocation = locations[0];
    
    // Handle special location: user_current_location
    if (targetLocation === 'user_current_location' && userLocation) {
      targetLocation = userLocation.name || 'your current location';
    }

    console.log('Fetching weather for:', targetLocation);
    
    if (fetchWeatherFunction) {
      const weatherData = await fetchWeatherFunction(targetLocation);
      
      return {
        type: 'weather',
        weatherData: weatherData,
        location: targetLocation,
        responseStyle: responseStyle,
        conversationalTone: grokDecision.conversationalTone,
        message: generateWeatherMessage(weatherData, responseStyle, targetLocation, grokDecision)
      };
    } else {
      return {
        type: 'error',
        message: 'Weather fetching service not available'
      };
    }
  } catch (error) {
    console.error('Weather fetch error:', error);
    return {
      type: 'error',
      message: `Could not fetch weather for ${locations[0]}. Please check the location name.`
    };
  }
}

/**
 * Handle weather comparison between multiple locations
 */
async function handleWeatherComparison(locations, fetchWeatherFunction) {
  if (!locations || locations.length < 2) {
    return {
      type: 'error', 
      message: 'I need at least two locations to compare weather'
    };
  }

  try {
    const weatherPromises = locations.map(location => fetchWeatherFunction(location));
    const weatherResults = await Promise.all(weatherPromises);
    
    return {
      type: 'comparison',
      weatherData: weatherResults,
      locations: locations,
      message: generateComparisonMessage(weatherResults, locations)
    };
  } catch (error) {
    console.error('Weather comparison error:', error);
    return {
      type: 'error',
      message: 'Could not compare weather for those locations'
    };
  }
}

/**
 * Handle place suggestions based on weather preferences
 */
async function handlePlaceSuggestions(suggestionType, region, userLocation, grokDecision = {}) {
  const suggestions = getPlaceSuggestions(suggestionType, region, userLocation);
  
  if (suggestions.length === 0) {
    return {
      type: 'error',
      message: `Sorry, I don't have ${suggestionType} place suggestions for that region right now. Try asking for a different type of place! 🤔`
    };
  }

  return {
    type: 'suggestions',
    suggestions: suggestions,
    suggestionType: suggestionType,
    region: region,
    userLocationContext: userLocation,
    conversationalTone: grokDecision.conversationalTone,
    message: generateSuggestionMessage(suggestions, suggestionType, region, userLocation, grokDecision)
  };
}

/**
 * Generate contextual weather message based on response style
 */
function generateWeatherMessage(weatherData, responseStyle, location, grokDecision = {}) {
  if (!weatherData || !weatherData.main) {
    return `I couldn't get weather data for ${location} right now. Could you try a different location or check the spelling? 🤔`;
  }

  const temp = Math.round(weatherData.main.temp);
  const condition = weatherData.weather[0].description;
  const feelsLike = Math.round(weatherData.main.feels_like);
  const city = weatherData.name;
  const country = weatherData.sys?.country;
  const humidity = weatherData.main.humidity;
  const windSpeed = Math.round(weatherData.wind?.speed * 3.6);
  
  // Get conversational tone from AI decision
  const tone = grokDecision.conversationalTone || 'informative';
  
  let message = '';
  
  switch (responseStyle) {
    case 'simple':
      message = `🌤️ ${city}${country ? `, ${country}` : ''}: ${condition}, ${temp}°C`;
      break;
      
    case 'conversational':
      // More natural, conversational responses
      let tempFeeling = '';
      if (feelsLike > temp + 2) tempFeeling = ` (but feels like ${feelsLike}°C - a bit warmer!)`;
      else if (feelsLike < temp - 2) tempFeeling = ` (feels like ${feelsLike}°C though - cooler than expected!)`;
      else if (Math.abs(feelsLike - temp) <= 2) tempFeeling = ` (feels just right at ${feelsLike}°C)`;
      
      let weatherComment = '';
      if (condition.includes('clear')) weatherComment = ' Perfect day! ☀️';
      else if (condition.includes('cloud')) weatherComment = ' Nice and cloudy! ☁️';
      else if (condition.includes('rain')) weatherComment = ' Bring an umbrella! 🌧️';
      else if (condition.includes('snow')) weatherComment = ' Snow day! ❄️';
      
      message = `🌤️ Right now in ${city}${country ? `, ${country}` : ''}, it's ${temp}°C${tempFeeling} with ${condition}.${weatherComment}\n\n`;
      
      // Add helpful context based on conditions
      if (humidity > 80) message += `💧 It's quite humid at ${humidity}% - you might feel a bit sticky!\n`;
      else if (humidity < 30) message += `🏜️ Pretty dry air at ${humidity}% humidity - great for your hair! 😄\n`;
      
      if (windSpeed > 20) message += `💨 Quite breezy with winds at ${windSpeed} km/h - hold onto your hat!\n`;
      else if (windSpeed < 5) message += `� Very calm with light winds at ${windSpeed} km/h - peaceful weather!\n`;
      
      break;
      
    case 'detailed':
      message = `�🌤️ Weather in ${city}${country ? `, ${country}` : ''}:\n` +
               `Temperature: ${temp}°C (feels like ${feelsLike}°C)\n` +
               `Condition: ${condition}\n` +
               `Humidity: ${humidity}%\n` +
               `Wind: ${windSpeed} km/h`;
      break;
             
    default:
      message = `🌤️ ${city}: ${condition}, ${temp}°C (feels like ${feelsLike}°C)`;
  }
  
  return message;
}

/**
 * Generate comparison message for multiple weather locations
 */
function generateComparisonMessage(weatherResults, locations) {
  if (!weatherResults || weatherResults.length < 2) {
    return 'Could not compare weather for those locations.';
  }

  let comparison = '🔍 Weather Comparison:\n\n';
  
  weatherResults.forEach((weather, index) => {
    if (weather && weather.main) {
      const temp = Math.round(weather.main.temp);
      const condition = weather.weather[0].description;
      comparison += `📍 **${weather.name}**: ${condition}, ${temp}°C\n`;
    }
  });

  // Find warmest and coldest
  const temps = weatherResults
    .filter(w => w && w.main)
    .map(w => ({ name: w.name, temp: w.main.temp }));
    
  if (temps.length >= 2) {
    const warmest = temps.reduce((a, b) => a.temp > b.temp ? a : b);
    const coldest = temps.reduce((a, b) => a.temp < b.temp ? a : b);
    
    comparison += `\n🌡️ **${warmest.name}** is warmer (${Math.round(warmest.temp)}°C)\n`;
    comparison += `❄️ **${coldest.name}** is cooler (${Math.round(coldest.temp)}°C)`;
  }

  return comparison;
}

/**
 * Generate suggestion message for place recommendations
 */
function generateSuggestionMessage(suggestions, suggestionType, region, userLocation, grokDecision = {}) {
  const regionNames = {
    'US': 'United States',
    'PK': 'Pakistan', 
    'TR': 'Turkey',
    'IR': 'Iran',
    'IN': 'India',
    'GB': 'United Kingdom',
    'CA': 'Canada',
    'AU': 'Australia',
    'global': 'worldwide'
  };

  const regionName = regionNames[region] || region;
  
  // Create context-aware introduction with conversational tone
  let introText = '';
  if (userLocation && userLocation.city) {
    const currentLocation = `${userLocation.city}${userLocation.country ? `, ${userLocation.country}` : ''}`;
    
    switch (suggestionType) {
      case 'colder':
        introText = `❄️ Looking for cooler weather than ${currentLocation}? I've got some great suggestions for you:\n\n`;
        break;
      case 'warmer':
        introText = `☀️ Want somewhere warmer than ${currentLocation}? These places should be perfect:\n\n`;
        break;
      case 'dry':
        introText = `🏜️ Need a break from humidity? Here are some wonderfully dry places to consider:\n\n`;
        break;
      case 'humid':
        introText = `💧 Looking for places with higher humidity? These locations might be what you're after:\n\n`;
        break;
      case 'vacation':
        introText = `🏖️ Perfect vacation spots from your location in ${currentLocation}:\n\n`;
        break;
      case 'coastal':
        introText = `🌊 Beautiful coastal destinations accessible from ${currentLocation}:\n\n`;
        break;
      case 'rainy':
        introText = `🌧️ Places with refreshing rain near ${currentLocation}:\n\n`;
        break;
      case 'sunny':
        introText = `☀️ Sunny destinations that'll brighten your day from ${currentLocation}:\n\n`;
        break;
      default:
        introText = `🎯 Here are some fantastic ${suggestionType} places for you:\n\n`;
    }
  } else {
    // More conversational fallback messages
    switch (suggestionType) {
      case 'dry':
        introText = `🏜️ Perfect! I know some amazing dry places with low humidity:\n\n`;
        break;
      case 'humid':
        introText = `💧 Here are some places known for their higher humidity:\n\n`;
        break;
      case 'colder':
        introText = `❄️ Great choice! Here are some cooler destinations:\n\n`;
        break;
      case 'warmer':
        introText = `☀️ Excellent! These warmer places should be perfect:\n\n`;
        break;
      case 'vacation':
        introText = `�️ Time for a getaway! Here are some amazing vacation spots:\n\n`;
        break;
      default:
        introText = `�🎯 Here are some fantastic ${suggestionType} places in ${regionName}:\n\n`;
    }
  }
  
  let message = introText;
  
  suggestions.slice(0, 5).forEach((place, index) => {
    const emoji = index === 0 ? '🔥' : index === 1 ? '⭐' : '📍';
    message += `${emoji} ${place}\n`;
  });
  
  // Add conversational closing with helpful suggestions
  switch (suggestionType) {
    case 'dry':
      message += `\n💡 These places typically have low humidity and less rainfall. Want to check the current weather in any of these? Just ask! 🌟`;
      break;
    case 'humid':
      message += `\n� These places tend to have higher humidity levels. Ask "What's the weather in [city]?" for current conditions! 🌟`;
      break;
    default:
      message += `\n�💬 Ask "What's the weather in [city]?" to get current conditions, or say "compare weather in [city1] and [city2]" for comparisons! 🌟`;
  }
  
  return message;
}

/**
 * Get place suggestions based on type and region
 */
function getPlaceSuggestions(suggestionType, region, userLocation) {
  const suggestions = {
    'US': {
      'colder': ['Seattle, WA', 'Minneapolis, MN', 'Chicago, IL', 'Boston, MA', 'Denver, CO', 'Anchorage, AK'],
      'warmer': ['Phoenix, AZ', 'Las Vegas, NV', 'Miami, FL', 'San Diego, CA', 'Austin, TX', 'Honolulu, HI'],
      'rainy': ['Seattle, WA', 'Portland, OR', 'New Orleans, LA', 'Atlanta, GA', 'Tampa, FL'],
      'coastal': ['San Francisco, CA', 'Miami, FL', 'New York, NY', 'Seattle, WA', 'Myrtle Beach, SC'],
      'vacation': ['Hawaii, USA', 'Florida Keys, FL', 'Napa Valley, CA', 'Jackson Hole, WY'],
      'dry': ['Phoenix, AZ', 'Las Vegas, NV', 'Tucson, AZ', 'Palm Springs, CA', 'Reno, NV'],
      'humid': ['Miami, FL', 'Houston, TX', 'New Orleans, LA', 'Orlando, FL', 'Tampa, FL']
    },
    'PK': {
      'colder': ['Murree, Pakistan', 'Skardu, Pakistan', 'Chitral, Pakistan', 'Gilgit, Pakistan', 'Swat, Pakistan', 'Naran, Pakistan'],
      'warmer': ['Karachi, Pakistan', 'Multan, Pakistan', 'Jacobabad, Pakistan', 'Hyderabad, Pakistan', 'Sukkur, Pakistan'],
      'coastal': ['Karachi, Pakistan', 'Gwadar, Pakistan'],
      'vacation': ['Hunza Valley, Pakistan', 'Kaghan Valley, Pakistan', 'Fairy Meadows, Pakistan', 'Skardu, Pakistan'],
      'dry': ['Quetta, Pakistan', 'Bahawalpur, Pakistan', 'Multan, Pakistan', 'Dera Ghazi Khan, Pakistan', 'Jacobabad, Pakistan'],
      'humid': ['Karachi, Pakistan', 'Lahore, Pakistan', 'Islamabad, Pakistan', 'Peshawar, Pakistan']
    },
    'TR': {
      'colder': ['Ankara, Turkey', 'Erzurum, Turkey', 'Trabzon, Turkey', 'Kars, Turkey'],
      'warmer': ['Antalya, Turkey', 'Izmir, Turkey', 'Adana, Turkey', 'Mersin, Turkey'],
      'coastal': ['Antalya, Turkey', 'Bodrum, Turkey', 'Izmir, Turkey', 'Kas, Turkey'],
      'vacation': ['Cappadocia, Turkey', 'Pamukkale, Turkey', 'Cesme, Turkey'],
      'dry': ['Ankara, Turkey', 'Konya, Turkey', 'Kayseri, Turkey', 'Afyon, Turkey'],
      'humid': ['Istanbul, Turkey', 'Rize, Turkey', 'Trabzon, Turkey']
    },
    'IN': {
      'colder': ['Shimla, India', 'Manali, India', 'Darjeeling, India', 'Ooty, India'],
      'warmer': ['Mumbai, India', 'Chennai, India', 'Hyderabad, India', 'Bangalore, India'],
      'coastal': ['Goa, India', 'Mumbai, India', 'Chennai, India', 'Kochi, India'],
      'vacation': ['Kerala, India', 'Rajasthan, India', 'Goa, India', 'Kashmir, India'],
      'dry': ['Rajasthan, India', 'Jodhpur, India', 'Jaisalmer, India', 'Bikaner, India'],
      'humid': ['Mumbai, India', 'Kolkata, India', 'Chennai, India', 'Kochi, India']
    },
    'GB': {
      'colder': ['Edinburgh, Scotland', 'Manchester, UK', 'Glasgow, Scotland', 'Newcastle, UK'],
      'warmer': ['London, UK', 'Brighton, UK', 'Bath, UK', 'Oxford, UK'],
      'coastal': ['Brighton, UK', 'Liverpool, UK', 'Plymouth, UK', 'Cardiff, Wales'],
      'vacation': ['Lake District, UK', 'Cornwall, UK', 'Edinburgh, Scotland'],
      'dry': ['London, UK', 'Cambridge, UK', 'Norwich, UK', 'Canterbury, UK'],
      'humid': ['Manchester, UK', 'Glasgow, Scotland', 'Belfast, Northern Ireland']
    },
    'global': {
      'colder': ['Reykjavik, Iceland', 'Moscow, Russia', 'Stockholm, Sweden', 'Oslo, Norway', 'Helsinki, Finland'],
      'warmer': ['Dubai, UAE', 'Bangkok, Thailand', 'Singapore', 'Cairo, Egypt', 'Doha, Qatar'],
      'rainy': ['London, UK', 'Mumbai, India', 'Singapore', 'Vancouver, Canada', 'Seattle, WA'],
      'coastal': ['Sydney, Australia', 'Barcelona, Spain', 'Rio de Janeiro, Brazil', 'Nice, France'],
      'vacation': ['Maldives', 'Bali, Indonesia', 'Santorini, Greece', 'Maui, Hawaii', 'Swiss Alps'],
      'dry': ['Cairo, Egypt', 'Riyadh, Saudi Arabia', 'Phoenix, AZ', 'Alice Springs, Australia', 'Atacama, Chile'],
      'humid': ['Singapore', 'Bangkok, Thailand', 'Miami, FL', 'Mumbai, India', 'Jakarta, Indonesia']
    }
  };

  let baseSuggestions = suggestions[region]?.[suggestionType] || suggestions['global']?.[suggestionType] || [];
  
  // If user location is available, add context-aware filtering and prioritization
  if (userLocation && userLocation.country) {
    const userCountry = userLocation.country.toUpperCase();
    console.log('User location for suggestions:', userLocation);
    console.log('User country detected:', userCountry);
    
    // If region wasn't specified or is global, try to use user's country
    if (region === 'global' || !region) {
      const userRegionSuggestions = suggestions[userCountry]?.[suggestionType] || [];
      if (userRegionSuggestions.length > 0) {
        console.log(`Using ${userCountry} regional suggestions:`, userRegionSuggestions);
        baseSuggestions = userRegionSuggestions;
      }
    }
    
    // For any suggestion type, prioritize local suggestions first
    if (suggestionType === 'vacation' || suggestionType === 'warmer' || suggestionType === 'colder' || suggestionType === 'dry') {
      const localSuggestions = suggestions[userCountry]?.[suggestionType] || [];
      
      if (localSuggestions.length > 0) {
        // Combine local and global suggestions, prioritizing local
        const globalSuggestions = suggestions['global']?.[suggestionType] || [];
        baseSuggestions = [...localSuggestions, ...globalSuggestions.slice(0, 2)];
        console.log('Combined suggestions (local + global):', baseSuggestions);
      }
      
      // Remove duplicates while preserving order
      baseSuggestions = [...new Set(baseSuggestions)];
    }
  }

  console.log('Final suggestions:', baseSuggestions.slice(0, 5));
  return baseSuggestions.slice(0, 5); // Limit to 5 suggestions
}
