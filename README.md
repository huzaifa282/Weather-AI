# Weather AI App 🌤️

A beautiful, AI-powered weather application built with React and Tailwind CSS. Features dynamic backgrounds, 6-day forecasts, natural language chat, glassmorphism design, and real-time weather data from OpenWeather One Call 3.0 API with Grok AI integration.

![Weather App Preview](https://weather-ai-by-z.vercel.app/)

## ✨ Features

- **🔍 City Search**: Search weather by city name with intelligent location detection
- **📅 6-Day Forecast**: Extended weather forecast with daily summaries
- **🤖 AI Chat Assistant**: Natural language weather queries powered by Grok AI
- **🌡️ Temperature Toggle**: Switch between Celsius and Fahrenheit
- **🎨 Dynamic Backgrounds**: Beautiful gradients that change based on weather conditions
- **💎 Glassmorphism UI**: Modern glass-card design with backdrop blur effects
- **🌊 Smooth Animations**: Fade and slide animations for a polished user experience
- **📱 Responsive Design**: Optimized for both mobile and desktop devices
- **🌍 Geolocation Support**: Automatically detects user location on first visit
- **⚡ Real-time Data**: Current weather conditions, forecasts, temperature, humidity, wind speed, and more
- **🗣️ Natural Language Processing**: Ask questions like "How's Paris tomorrow?" or "What's London like?"

## 🧠 AI-Powered Features

### Grok AI Integration
- **Natural Language Understanding**: Ask weather questions in plain English
- **Smart Date Parsing**: Understands "tomorrow", "next week", "this weekend"
- **City Recognition**: Intelligent location extraction from conversational queries
- **Contextual Responses**: Human-like weather descriptions and recommendations

### Example Queries
- "How's the weather in Paris tomorrow?"
- "What's London like in Fahrenheit?"
- "Is it raining in Tokyo?"
- "Temperature in New York next Monday"
- "Tell me about the weather in Dubai"

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenWeatherMap API key with One Call 3.0 access
- Grok AI API key (optional - will use fallback parsing if not provided)

### Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get your API keys**
   - **OpenWeatherMap**: Visit [OpenWeatherMap](https://openweathermap.org/api)
     - Sign up for a free account
     - Subscribe to One Call 3.0 API (free tier: 1000 calls/day)
     - Generate an API key from your account dashboard
   - **Grok AI** (optional): Visit [x.ai/api](https://x.ai/api)
     - Sign up and get your API key

4. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Add your API keys:
   ```env
   REACT_APP_OPENWEATHER_API_KEY=your_openweather_api_key_here
   REACT_APP_GROK_API_KEY=your_grok_api_key_here
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000` to view the app

## 🛠️ Project Structure

```
weather_app/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── BackgroundGradient.js      # Dynamic weather backgrounds
│   │   ├── SearchBar.js               # City search with suggestions
│   │   ├── WeatherCard.js            # Main weather display with 6-day forecast
│   │   ├── WeatherChatbot.js         # AI-powered chat assistant
│   │   ├── WeatherIcon.js            # Weather condition icons
│   │   ├── WeatherAnimations.js      # Weather particle animations
│   │   ├── DynamicWeatherIcon.js     # Dynamic weather icons
│   │   ├── LoadingSpinner.js         # Loading animation
│   │   └── ErrorMessage.js           # Error handling component
│   ├── utils/
│   │   ├── grokApi.js               # Grok AI integration and NLP
│   │   └── geolocation.js           # Geolocation utilities
│   ├── App.js                       # Main application component
│   ├── index.js                     # React DOM entry point
│   └── index.css                    # Global styles and Tailwind
├── .env                            # Environment variables
├── package.json                    # Dependencies and scripts
└── tailwind.config.js             # Tailwind CSS configuration
```

The app uses the OpenWeatherMap Current Weather API:
- **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **Features**: Current temperature, weather conditions, humidity, wind speed, pressure
- **Icons**: Weather condition icons from OpenWeatherMap
- **Geolocation**: Automatic location detection with fallback

## 📱 Usage

1. **Automatic Location**: On first visit, the app will request your location for local weather
2. **Search Cities**: Use the search bar to find weather for any city worldwide
3. **Quick Suggestions**: Click on popular city suggestions for quick access
4. **Temperature Units**: Toggle between Celsius and Fahrenheit using the temperature unit buttons
5. **Weather Details**: View comprehensive weather information including:
   - Current temperature and "feels like" temperature
   - High and low temperatures for the day
   - Humidity, wind speed, pressure, and visibility
   - Weather condition with descriptive text

## 🔧 Customization

### Adding New Weather Conditions
Edit `BackgroundGradient.js` to add new weather condition gradients:

```javascript
const weatherGradients = {
  'your-condition': 'bg-gradient-to-br from-color-400 via-color-500 to-color-600',
};
```

### Modifying Animations
Customize animations in `tailwind.config.js`:

```javascript
animation: {
  'custom-animation': 'customKeyframe 2s ease-in-out infinite',
}
```

### Styling Components
All components use Tailwind CSS classes. Modify styles directly in component files or add custom classes in `index.css`.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify, Vercel, or GitHub Pages
The app is ready for deployment to any static hosting service. Make sure to add your environment variables to your hosting platform.

## 🛡️ Environment Variables

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_OPENWEATHER_API_KEY` | Your OpenWeatherMap API key | Yes |

## 📦 Dependencies

### Main Dependencies
- `react` - UI library
- `react-dom` - React DOM renderer
- `react-scripts` - Create React App scripts

### Development Dependencies
- `tailwindcss` - Utility-first CSS framework
- `autoprefixer` - CSS vendor prefixing
- `postcss` - CSS processing tool

## 🏗️ Technical Implementation

### API Architecture
- **OpenWeather One Call 3.0**: Primary weather data source with 7-day forecasts
- **OpenWeather Geocoding**: Location coordinate resolution
- **Grok AI**: Natural language processing for chat queries
- **Fallback Parsing**: Local NLP when Grok API is unavailable

### Data Flow
1. **User Query** → Grok AI extracts intent (city, date, units)
2. **City Resolution** → Geocoding API converts city to coordinates  
3. **Weather Fetch** → One Call 3.0 API provides comprehensive weather data
4. **Response Generation** → Grok AI formats natural language response

### Key Components
- **WeatherCard**: Displays current weather + 6-day forecast grid
- **WeatherChatbot**: Handles AI conversations and weather queries
- **grokApi**: Manages AI integration with fallback mechanisms
- **App**: Orchestrates data flow and state management

### Error Handling
- API key validation with helpful error messages
- Graceful fallbacks when AI services are unavailable
- Network error recovery and user feedback
- Input validation and sanitization

## 🤝 Contributing

Feel free to fork the project and submit pull requests for:
- New weather conditions and backgrounds
- UI/UX improvements
- AI prompt optimizations
- Performance optimizations
- Bug fixes

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data and geocoding APIs
- [Grok AI](https://x.ai/) for natural language processing capabilities
- [Tailwind CSS](https://tailwindcss.com/) for styling framework
- [React](https://reactjs.org/) for the UI library
- [Inter Font](https://rsms.me/inter/) for typography

---

**Enjoy your beautiful weather app!** 🌈
