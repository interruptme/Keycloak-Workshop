// src/services/weather.service.js
import axios from 'axios';
import authService from '@/services/auth.service'
import { ref, reactive } from 'vue';

// Create state for weather data
const state = reactive({
  forecast: null,
  isLoading: false,
  error: null,
  lastUpdated: null
});

// Create a dedicated axios instance for weather API
const weatherApi = axios.create({
  baseURL: import.meta.env.VITE_WEATHER_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 8000 // 8 second timeout
});

// Request interceptor to add auth token if available
weatherApi.interceptors.request.use(
  async (config) => {
    // Add auth token if user is authenticated (optional for weather endpoint)
    if (authService.state.isAuthenticated) {
      try {
        // Check if token needs refresh
        if (authService.tokenExpired.value) {
          await authService.updateToken();
        }
        
        // Get the current token
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error refreshing token in weather service:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Fetch current weather forecast from the backend
 * @returns {Promise} Promise that resolves with the weather forecast
 */
const fetchWeather = async () => {
  state.isLoading = true;
  state.error = null;
  
  try {
      const response = await weatherApi.get('/weather');
      state.forecast = response.data.forecast;
      state.lastUpdated = new Date();
      return state.forecast;
  } catch (err) {
    console.error('Weather fetch failed:', err);
    
    // Set appropriate error message based on error type
    if (err.response) {
      if (err.response.status === 401) {
        state.error = 'Weather forecast service is only available for logged in users';
      } else {
        state.error = `Server error: ${err.response.status} ${err.response.statusText}`;
      }
    } else if (err.request) {
      // Request was made but no response received
      state.error = 'No response from weather service. Please check your connection.';
    } else {
      // Error setting up the request
      state.error = `Request error: ${err.message}`;
    }
    
    return null;
  } finally {
    state.isLoading = false;
  }
};

/**
 * Format date for display
 * @param {string} dateString - Date string from API
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (e) {
    return dateString;
  }
};

/**
 * Get CSS class for weather icon based on summary
 * @param {string} summary - Weather summary from API
 * @returns {string} CSS class name
 */
const getWeatherIconClass = (summary) => {
  if (!summary) return 'default';
  
  const lowerSummary = summary.toLowerCase();
  
  if (lowerSummary.includes('sun') || lowerSummary.includes('hot') || lowerSummary.includes('warm')) {
    return 'sunny';
  } else if (lowerSummary.includes('rain') || lowerSummary.includes('shower')) {
    return 'rainy';
  } else if (lowerSummary.includes('cloud')) {
    return 'cloudy';
  } else if (lowerSummary.includes('snow') || lowerSummary.includes('freez') || lowerSummary.includes('cold') || lowerSummary.includes('cool')) {
    return 'snowy';
  } else if (lowerSummary.includes('wind')) {
    return 'windy';
  } else {
    return 'default';
  }
};

/**
 * Convert temperature from Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} Temperature in Fahrenheit
 */
const celsiusToFahrenheit = (celsius) => {
  return Math.round(celsius * 9/5 + 32);
};

// Export the weather service
export default {
  state,
  fetchWeather,
  formatDate,
  getWeatherIconClass,
  celsiusToFahrenheit
};