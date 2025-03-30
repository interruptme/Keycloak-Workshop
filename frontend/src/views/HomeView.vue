<template>
  <div class="home">
    <h1>Welcome to the Keycloak Demo App</h1>
    
    <div class="card">
      <p>This is a demonstration of Vue 3 integration with Keycloak for authentication.</p>
      
      <div v-if="isAuthenticated" class="auth-status">
        <p>You are currently logged in as <strong>{{ username }}</strong>.</p>
        <router-link to="/profile" class="btn">View Profile</router-link>
      </div>
      
      <div v-else class="auth-status">
        <p>You are not currently logged in.</p>
        <router-link to="/login" class="btn">Login</router-link>
      </div>
      
      <!-- Weather Box -->
      <div class="weather-box">
        <h3>Weather Forecast</h3>
        <div v-if="weather" class="weather-data">
          <div class="weather-info">
            <p>Date: <strong>{{ weatherService.formatDate(weather.date) }}</strong></p>
            <p>Temperature: <strong>{{ weather.temperatureC }}°C / {{ weatherService.celsiusToFahrenheit(weather.temperatureC) }}°F</strong></p>
            <p>Condition: <strong>{{ weather.summary }}</strong></p>
            <p v-if="lastUpdated" class="last-updated">Last updated: {{ lastUpdated }}</p>
          </div>
          <div class="weather-icon" :class="weatherService.getWeatherIconClass(weather.summary)"></div>
        </div>
        <div v-else-if="isLoading" class="weather-loading">
          <div class="spinner"></div>
          <p>Loading weather data...</p>
        </div>
        <div v-else-if="error" class="weather-error">
          <p>{{ error }}</p>
        </div>
        <button @click="fetchWeather" class="btn weather-btn" :disabled="isLoading">
          {{ isLoading ? 'Fetching...' : 'Refresh Weather' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import authService from '../services/auth.service'
import weatherService from '../services/weather.service'

// Auth state
const isAuthenticated = computed(() => authService.state.isAuthenticated)

// Username computation
const username = computed(() => {
  if (authService.state.userProfile) {
    return authService.state.userProfile.username || 
           authService.state.userProfile.preferred_username || 
           'User'
  }
  return 'User'
})

// Weather state from the weather service
const weather = computed(() => weatherService.state.forecast)
const isLoading = computed(() => weatherService.state.isLoading)
const error = computed(() => weatherService.state.error)
const lastUpdated = computed(() => {
  if (!weatherService.state.lastUpdated) return null
  return weatherService.state.lastUpdated.toLocaleTimeString()
})

// Fetch weather data using the weather service
const fetchWeather = () => {
  weatherService.fetchWeather()
}

// Fetch weather when component is mounted
onMounted(() => {
  fetchWeather()
})
</script>

<style scoped>
.home {
  padding: 1rem;
}

.card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.auth-status {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #e9ecef;
  border-radius: 4px;
}

.btn {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #42b983;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background-color: #3aa876;
}

.btn:disabled {
  background-color: #89d6b3;
  cursor: not-allowed;
}

/* Weather Box Styles */
.weather-box {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #42b983;
}

.weather-box h3 {
  margin-top: 0;
  color: #2c3e50;
}

.weather-data {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 1rem 0;
}

.weather-info {
  flex: 1;
}

.weather-info p {
  margin: 0.5rem 0;
}

.weather-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-left: 1rem;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 40px;
}

.sunny {
  background-color: #ffeb3b;
  box-shadow: 0 0 15px rgba(255, 235, 59, 0.7);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23f57c00'%3E%3Cpath d='M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z'/%3E%3C/svg%3E");
}

.rainy {
  background-color: #90caf9;
  box-shadow: 0 0 15px rgba(144, 202, 249, 0.7);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23607D8B' d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'/%3E%3Cpath fill='%2382B1FF' d='M3.5 18.5v-1.5M6.5 20v-1.5M9.5 18.5v-1.5M12.5 20v-1.5M15.5 18.5v-1.5M18.5 20v-1.5'/%3E%3Cpath stroke='%2382B1FF' stroke-width='1.5' stroke-linecap='round' d='M3.5 18.5v1.5M6.5 20v1.5M9.5 18.5v1.5M12.5 20v1.5M15.5 18.5v1.5M18.5 20v1.5'/%3E%3C/svg%3E");
}

.cloudy {
  background-color: #b0bec5;
  box-shadow: 0 0 15px rgba(176, 190, 197, 0.7);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23546e7a'%3E%3Cpath d='M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z'/%3E%3C/svg%3E");
}

.snowy {
  background-color: #e0e0e0;
  box-shadow: 0 0 15px rgba(224, 224, 224, 0.7);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23757575'%3E%3Cpath d='M22 11h-4.17l3.24-3.24-1.41-1.41L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.41L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22v-2z'/%3E%3C/svg%3E");
}

.windy {
  background-color: #e0e0e0;
  box-shadow: 0 0 15px rgba(224, 224, 224, 0.7);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2381D4FA' d='M3,8a1,1,0,0,1,1-1H17a2,2,0,0,0,0-4,2,2,0,0,0-2,2H13a4,4,0,0,1,8,0,4,4,0,0,1-4,4H4A1,1,0,0,1,3,8Z'/%3E%3Cpath fill='%2381D4FA' d='M4,14h9a2,2,0,0,0,0-4H12a4,4,0,0,1,2-1h1a4,4,0,0,1,0,8H4a1,1,0,0,1,0-2Z'/%3E%3Cpath fill='%2381D4FA' d='M19,17H6a1,1,0,0,0,0,2H19a1,1,0,0,0,0-2Z'/%3E%3C/svg%3E");
}

.default {
  background-color: #bdbdbd;
  box-shadow: 0 0 15px rgba(189, 189, 189, 0.7);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23616161'%3E%3Cpath d='M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E");
}

.weather-btn {
  width: 100%;
  margin-top: 1rem;
}

.weather-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(66, 185, 131, 0.2);
  border-radius: 50%;
  border-top-color: #42b983;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

.weather-error {
  padding: 0.75rem;
  background-color: #ffebee;
  border-radius: 4px;
  color: #d32f2f;
  text-align: center;
  margin: 1rem 0;
}

.last-updated {
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 0.5rem;
  font-style: italic;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>