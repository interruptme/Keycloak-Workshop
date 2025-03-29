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
  initializing: false // New flag to prevent multiple init calls
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
      onLoad: 'check-sso', // Don't auto-login
      pkceMethod: 'S256', // Use PKCE for added security
      checkLoginIframe: false, // Disable iframe check for cross-origin issues
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
      silentCheckSsoFallback: false, // Prevent fallback to login page
    })
    .then((authenticated) => {
      state.isAuthenticated = authenticated;
      state.isInitialized = true;
      state.keycloakReady = true;
      state.initializing = false;
      
      if (authenticated) {
        updateTokenExpiration();
        return loadUserProfile();
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

// Other functions remain the same
const loadUserProfile = () => {
  if (!keycloakInstance.value || !state.isAuthenticated) {
    return Promise.reject(new Error('Not authenticated'));
  }

  return keycloakInstance.value
    .loadUserProfile()
    .then((profile) => {
      state.userProfile = profile;
      return profile;
    })
    .catch((error) => {
      console.error('Error loading user profile', error);
      throw error;
    });
};

const login = (redirectUri = window.location.href) => {
  if (!keycloakInstance.value) {
    return Promise.reject(new Error('Keycloak not initialized'));
  }
  
  return keycloakInstance.value.login({
    redirectUri,
    prompt: 'login',
  });
};

const logout = () => {
  if (!keycloakInstance.value) {
    return Promise.reject(new Error('Keycloak not initialized'));
  }
  
  return keycloakInstance.value.logout();
};

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

const getToken = () => {
  if (!keycloakInstance.value || !state.isAuthenticated) {
    return null;
  }
  return keycloakInstance.value.token;
};

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

const tokenExpired = computed(() => {
  if (!state.tokenExpiration) return true;
  return state.tokenExpiration <= Date.now();
});

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

const hasRole = (role) => {
  if (!keycloakInstance.value || !state.isAuthenticated) {
    return false;
  }
  return keycloakInstance.value.hasRealmRole(role);
};

export default {
  state,
  initKeycloak,
  login,
  logout,
  getToken,
  updateToken,
  hasRole,
  setupTokenRefresh,
  tokenExpired
};