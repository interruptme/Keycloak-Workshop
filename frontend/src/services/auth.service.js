import Keycloak from 'keycloak-js';
import { ref, reactive, computed } from '@vue/reactivity';

// Create reactive state
const keycloakInstance = ref(null);
const state = reactive({
  isAuthenticated: false,
  isInitialized: false,
  userProfile: null,
  authError: null,
  keycloakReady: false,
  tokenExpiration: null,
  initializing: false
});

// Initialize Keycloak instance
const initKeycloak = () => {
  // Prevent duplicate initialization
  if (state.initializing || state.isInitialized) {
    return Promise.resolve(state.isAuthenticated);
  }
  
  state.initializing = true;

  const keycloakConfig = {
    url: import.meta.env.VITE_KEYCLOAK_URL,
    realm: import.meta.env.VITE_KEYCLOAK_REALM,
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
  };

  keycloakInstance.value = new Keycloak(keycloakConfig);

  return keycloakInstance.value
    .init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      silentCheckSsoFallback: false,
    })
    .then((authenticated) => {
      state.isAuthenticated = authenticated;
      state.isInitialized = true;
      state.keycloakReady = true;
      state.initializing = false;
      
      if (authenticated) {
        updateTokenExpiration();
        // Don't automatically load profile here to prevent CORS issues
        // Will load profile on demand when needed
      }
      
      return authenticated;
    })
    .catch((error) => {
      state.authError = error;
      state.isInitialized = true;
      state.initializing = false;
      console.error('Keycloak initialization error', error);
      throw error;
    });
};

// Load user profile with error handling specifically for CORS issues
const loadUserProfile = () => {
  if (!keycloakInstance.value || !state.isAuthenticated) {
    return Promise.reject(new Error('Not authenticated'));
  }

  // Check if we already have the profile
  if (state.userProfile) {
    return Promise.resolve(state.userProfile);
  }

  // First method: Try to use the userinfo endpoint directly
  return getUserInfoFromToken()
    .then(profile => {
      state.userProfile = profile;
      return profile;
    })
    .catch(error => {
      console.warn('Failed to parse user info from token, trying Keycloak API', error);
      
      // Fallback to Keycloak's loadUserProfile method
      return keycloakInstance.value.loadUserProfile()
        .then(profile => {
          state.userProfile = profile;
          return profile;
        })
        .catch(error => {
          console.error('Error loading user profile via Keycloak API', error);
          throw error;
        });
    });
};

// Extract user info directly from the access token
const getUserInfoFromToken = () => {
  if (!keycloakInstance.value || !keycloakInstance.value.token) {
    return Promise.reject(new Error('No token available'));
  }
  
  try {
    // Parse the token
    const tokenParts = keycloakInstance.value.token.split('.');
    const tokenPayload = JSON.parse(atob(tokenParts[1]));
    
    // Create a user profile object from token claims
    const profile = {
      id: tokenPayload.sub,
      username: tokenPayload.preferred_username || tokenPayload.username,
      email: tokenPayload.email,
      firstName: tokenPayload.given_name,
      lastName: tokenPayload.family_name,
      // Add any other fields you need from the token
    };
    
    return Promise.resolve(profile);
  } catch (error) {
    return Promise.reject(error);
  }
};

// Login function
const login = (redirectUri = window.location.href) => {
  if (!keycloakInstance.value) {
    return Promise.reject(new Error('Keycloak not initialized'));
  }
  
  return keycloakInstance.value.login({
    redirectUri,
    prompt: 'login',
  });
};

// Logout function
const logout = () => {
  if (!keycloakInstance.value) {
    return Promise.reject(new Error('Keycloak not initialized'));
  }
  
  return keycloakInstance.value.logout();
};

// Update token expiration time
const updateTokenExpiration = () => {
  if (keycloakInstance.value && keycloakInstance.value.token) {
    // Parse JWT to get expiration
    try {
      const tokenParts = keycloakInstance.value.token.split('.');
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      state.tokenExpiration = tokenPayload.exp * 1000; // Convert to milliseconds
    } catch (error) {
      console.error('Error parsing token', error);
    }
  }
};

// Get auth token
const getToken = () => {
  if (!keycloakInstance.value || !state.isAuthenticated) {
    return null;
  }
  return keycloakInstance.value.token;
};

// Update token - returns a promise
const updateToken = (minValidity = 60) => {
  if (!keycloakInstance.value || !state.isAuthenticated) {
    return Promise.reject(new Error('Not authenticated'));
  }
  
  return keycloakInstance.value
    .updateToken(minValidity)
    .then((refreshed) => {
      if (refreshed) {
        updateTokenExpiration();
      }
      return keycloakInstance.value.token;
    })
    .catch((error) => {
      console.error('Failed to refresh token', error);
      return logout();
    });
};

// Computed value for token expiration
const tokenExpired = computed(() => {
  if (!state.tokenExpiration) return true;
  return state.tokenExpiration <= Date.now();
});

// Handle token expiration
const setupTokenRefresh = () => {
  if (!keycloakInstance.value || !state.isAuthenticated) return;
  
  // Schedule token refresh at 70% of token lifetime
  const tokenUpdateInterval = setInterval(() => {
    if (!state.isAuthenticated) {
      clearInterval(tokenUpdateInterval);
      return;
    }
    
    updateToken()
      .catch(() => {
        clearInterval(tokenUpdateInterval);
      });
  }, 60000); // Check every minute
  
  // Cleanup on unmount
  return () => {
    clearInterval(tokenUpdateInterval);
  };
};

// Check if user has specific role
const hasRole = (role) => {
  if (!keycloakInstance.value || !state.isAuthenticated) {
    return false;
  }
  return keycloakInstance.value.hasRealmRole(role);
};

export default {
  state,
  keycloakInstance, // Expose the Keycloak instance
  initKeycloak,
  login,
  logout,
  getToken,
  updateToken,
  hasRole,
  setupTokenRefresh,
  tokenExpired,
  loadUserProfile
};