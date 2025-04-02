import Keycloak from 'keycloak-js';
import { ref, reactive, computed } from '@vue/reactivity';

/**
 * Keycloak Authentication Provider
 * Implements the auth interface using Keycloak
 */
class KeycloakProvider {
  constructor() {
    // Create reactive state
    this.keycloakInstance = ref(null);
    this.state = reactive({
      isAuthenticated: false,
      isInitialized: false,
      userProfile: null,
      authError: null,
      keycloakReady: false,
      tokenExpiration: null,
      initializing: false,
      profileLoadRetries: 0,
      maxProfileLoadRetries: 3,
      profileLoadingStatus: null
    });

    // Create computed property for token expiration
    this.tokenExpired = computed(() => {
      if (!this.state.tokenExpiration) return true;
      return this.state.tokenExpiration <= Date.now();
    });
  }

  /**
   * Initialize Keycloak instance
   * @returns {Promise<boolean>} Promise resolving to authentication status
   */
  initialize() {
    // Prevent duplicate initialization
    if (this.state.initializing || this.state.isInitialized) {
      return Promise.resolve(this.state.isAuthenticated);
    }
    
    this.state.initializing = true;

    const keycloakConfig = {
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
    };

    this.keycloakInstance.value = new Keycloak(keycloakConfig);

    return this.keycloakInstance.value
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        silentCheckSsoFallback: false,
        scope: 'openid profile backend-access'
      })
      .then((authenticated) => {
        this.state.isAuthenticated = authenticated;
        this.state.isInitialized = true;
        this.state.keycloakReady = true;
        this.state.initializing = false;
        
        if (authenticated) {
          this._updateTokenExpiration();
          // Don't automatically load profile here to prevent CORS issues
          // Will load profile on demand when needed
        }
        
        return authenticated;
      })
      .catch((error) => {
        this.state.authError = error;
        this.state.isInitialized = true;
        this.state.initializing = false;
        console.error('Keycloak initialization error', error);
        throw error;
      });
  }

  /**
   * Load user profile with error handling and retry mechanism
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<Object>} Promise resolving to user profile object
   */
  loadUserProfile(retryCount = 0) {
    if (!this.keycloakInstance.value || !this.state.isAuthenticated) {
      return Promise.reject(new Error('Not authenticated'));
    }

    // Check if we already have the profile
    if (this.state.userProfile) {
      return Promise.resolve(this.state.userProfile);
    }
    
    // Update loading status
    this.state.profileLoadingStatus = `Attempt ${retryCount + 1}/${this.state.maxProfileLoadRetries + 1}`;
    this.state.profileLoadRetries = retryCount;

    // First method: Try to use the userinfo endpoint directly
    return this._getUserInfoFromToken()
      .then(profile => {
        this.state.userProfile = profile;
        this.state.profileLoadingStatus = 'success';
        return profile;
      })
      .catch(error => {
        console.warn('Failed to parse user info from token, trying Keycloak API', error);
        
        // Fallback to Keycloak's loadUserProfile method
        return this.keycloakInstance.value.loadUserProfile()
          .then(profile => {
            this.state.userProfile = profile;
            this.state.profileLoadingStatus = 'success';
            return profile;
          })
          .catch(error => {
            console.error(`Error loading user profile (attempt ${retryCount + 1})`, error);
            
            // Implement retry with exponential backoff
            if (retryCount < this.state.maxProfileLoadRetries) {
              const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
              this.state.profileLoadingStatus = `Retrying in ${delay/1000}s...`;
              
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve(this.loadUserProfile(retryCount + 1));
                }, delay);
              });
            } else {
              this.state.profileLoadingStatus = 'failed';
              throw error;
            }
          });
      });
  }

  /**
   * Extract user info directly from the access token
   * @returns {Promise<Object>} Promise resolving to user profile object
   * @private
   */
  _getUserInfoFromToken() {
    if (!this.keycloakInstance.value || !this.keycloakInstance.value.token) {
      return Promise.reject(new Error('No token available'));
    }
    
    try {
      // Parse the token
      const tokenParts = this.keycloakInstance.value.token.split('.');
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
  }

  /**
   * Login function
   * @param {string} redirectUri - URI to redirect after login
   * @returns {Promise<void>} Promise that resolves after login initiated
   */
  login(redirectUri = window.location.href) {
    if (!this.keycloakInstance.value) {
      return Promise.reject(new Error('Keycloak not initialized'));
    }
    
    return this.keycloakInstance.value.login({
      redirectUri,
      prompt: 'login',
    });
  }

  /**
   * Logout function
   * @returns {Promise<void>} Promise that resolves after logout initiated
   */
  logout() {
    if (!this.keycloakInstance.value) {
      return Promise.reject(new Error('Keycloak not initialized'));
    }
    
    return this.keycloakInstance.value.logout();
  }

  /**
   * Update token expiration time
   * @private
   */
  _updateTokenExpiration() {
    if (this.keycloakInstance.value && this.keycloakInstance.value.token) {
      // Parse JWT to get expiration
      try {
        const tokenParts = this.keycloakInstance.value.token.split('.');
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        this.state.tokenExpiration = tokenPayload.exp * 1000; // Convert to milliseconds
      } catch (error) {
        console.error('Error parsing token', error);
      }
    }
  }

  /**
   * Get auth token
   * @returns {string|null} Current auth token or null if not authenticated
   */
  getToken() {
    if (!this.keycloakInstance.value || !this.state.isAuthenticated) {
      return null;
    }
    return this.keycloakInstance.value.token;
  }

  /**
   * Update token - returns a promise
   * @param {number} minValidity - Minimum seconds of validity
   * @returns {Promise<string>} Promise resolving to the new token
   */
  updateToken(minValidity = 60) {
    if (!this.keycloakInstance.value || !this.state.isAuthenticated) {
      return Promise.reject(new Error('Not authenticated'));
    }
    
    return this.keycloakInstance.value
      .updateToken(minValidity)
      .then((refreshed) => {
        if (refreshed) {
          this._updateTokenExpiration();
        }
        return this.keycloakInstance.value.token;
      })
      .catch((error) => {
        console.error('Failed to refresh token', error);
        return this.logout();
      });
  }

  /**
   * Setup token refresh
   * @returns {Function} Cleanup function
   */
  setupTokenRefresh() {
    if (!this.keycloakInstance.value || !this.state.isAuthenticated) return () => {};
    
    // Schedule token refresh at 70% of token lifetime
    const tokenUpdateInterval = setInterval(() => {
      if (!this.state.isAuthenticated) {
        clearInterval(tokenUpdateInterval);
        return;
      }
      
      this.updateToken()
        .catch(() => {
          clearInterval(tokenUpdateInterval);
        });
    }, 60000); // Check every minute
    
    // Cleanup on unmount
    return () => {
      clearInterval(tokenUpdateInterval);
    };
  }

  /**
   * Check if user has specific role (Keycloak specific method)
   * @param {string} role - Role to check
   * @returns {boolean} Whether user has the role
   */
  hasRealmRole(role) {
    if (!this.keycloakInstance.value || !this.state.isAuthenticated) {
      return false;
    }
    return this.keycloakInstance.value.hasRealmRole(role);
  }
}

// Create and export a singleton instance
export default new KeycloakProvider();