# Aesthetic Weather App 🌤️

A beautiful, responsive weather application built with React and Tailwind CSS. Features dynamic backgrounds, glassmorphism design, smooth animations, and real-time weather data from OpenWeatherMap API.

![Weather App Preview](https://weather-ai-by-z.vercel.app/)

## ✨ Features

- **🔍 City Search**: Search weather by city name with autocomplete suggestions
- **🌡️ Temperature Toggle**: Switch between Celsius and Fahrenheit
- **🎨 Dynamic Backgrounds**: Beautiful gradients that change based on weather conditions
- **💎 Glassmorphism UI**: Modern glass-card design with backdrop blur effects
- **🌊 Smooth Animations**: Fade and slide animations for a polished user experience
- **📱 Responsive Design**: Optimized for both mobile and desktop devices
- **🌍 Geolocation Support**: Automatically detects user location on first visit
- **⚡ Real-time Data**: Current weather conditions, temperature, humidity, wind speed, and more

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org/api))

### Installation

1. **Clone or download the project files**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Get your OpenWeatherMap API key**
   - Visit [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Generate an API key from your account dashboard

4. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Add your API key:
   ```env
   REACT_APP_OPENWEATHER_API_KEY=your_api_key_here
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
│   │   ├── BackgroundGradient.js    # Dynamic weather backgrounds
│   │   ├── SearchBar.js             # City search with suggestions
│   │   ├── WeatherCard.js           # Main weather display card
│   │   ├── WeatherIcon.js           # Weather condition icons
│   │   ├── LoadingSpinner.js        # Loading animation
│   │   └── ErrorMessage.js          # Error handling component
│   ├── App.js                       # Main application component
│   ├── index.js                     # React DOM entry point
│   └── index.css                    # Global styles and Tailwind
├── .env                            # Environment variables
├── package.json                    # Dependencies and scripts
└── tailwind.config.js             # Tailwind CSS configuration
```

## 🎨 Design Features

### Dynamic Backgrounds
The app features beautiful gradient backgrounds that change based on weather conditions:
- **Clear Sky**: Blue gradients
- **Clouds**: Gray to blue transitions
- **Rain**: Dark blue stormy gradients
- **Thunderstorm**: Purple to indigo dramatic gradients
- **Snow**: Light blue to gray winter gradients
- **Mist/Fog**: Soft gray atmospheric gradients

### Glassmorphism UI
- Frosted glass effect with backdrop blur
- Semi-transparent cards with soft borders
- Elegant typography with Inter font family
- Smooth hover and focus transitions

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

## 🌐 API Integration

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

## 🤝 Contributing

Feel free to fork the project and submit pull requests for:
- New weather conditions and backgrounds
- UI/UX improvements
- Performance optimizations
- Bug fixes

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data API
- [Tailwind CSS](https://tailwindcss.com/) for styling framework
- [React](https://reactjs.org/) for the UI library
- [Inter Font](https://rsms.me/inter/) for typography

---

**Enjoy your beautiful weather app!** 🌈
