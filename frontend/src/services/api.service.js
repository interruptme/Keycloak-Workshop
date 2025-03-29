import axios from 'axios';
import authService from './auth.service';

// Create an axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000 // Request timeout: 10 seconds
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    // Check if user is authenticated
    if (authService.state.isAuthenticated) {
      try {
        // Check if token needs refresh (if it will expire in the next 60 seconds)
        if (authService.tokenExpired.value) {
          await authService.updateToken();
        }
        
        // Get the current token
        const token = authService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error refreshing token in request interceptor', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh token yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        await authService.updateToken();
        
        // Get new token and update the request
        const token = authService.getToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token fails, redirect to login
        console.error('Token refresh failed', refreshError);
        
        // Force logout
        try {
          await authService.logout();
        } catch (logoutError) {
          console.error('Logout failed', logoutError);
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default {
  // Basic API methods
  get(url, params = {}) {
    return apiClient.get(url, { params });
  },
  
  post(url, data = {}) {
    return apiClient.post(url, data);
  },
  
  put(url, data = {}) {
    return apiClient.put(url, data);
  },
  
  delete(url) {
    return apiClient.delete(url);
  },
  
  // Exposed axios instance for more complex usage
  client: apiClient
};