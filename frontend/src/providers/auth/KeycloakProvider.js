import Keycloak from 'keycloak-js';
import { ref, reactive, computed } from '@vue/reactivity';
import AuthProviderInterface from '@/interfaces/auth/AuthProvider';

/**
 * Keycloak Authentication Provider
 * Implements the auth interface using Keycloak
 */
class KeycloakProvider extends AuthProviderInterface {
  constructor() {
    super();
    
    // Create reactive state
    this._keycloakInstance = ref(null);
    this._state = reactive({
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
    this._tokenExpired = computed(() => {
      if (!this._state.tokenExpiration) return true;
      return this._state.tokenExpiration <= Date.now();
    });
  }

  /**
   * @returns {Object} Reactive state object
   */
  get state() {
    return this._state;
  }

  /**
   * @returns {import('vue').ComputedRef<boolean>} Whether token is expired
   */
  get tokenExpired() {
    return this._tokenExpired;
  }

  /**
   * Get the Keycloak instance (specific to this provider)
   * @returns {import('vue').Ref<Keycloak>} Keycloak instance
   */
  get keycloakInstance() {
    return this._keycloakInstance;
  }

  /**
   * Initialize Keycloak instance
   * @returns {Promise<boolean>} Promise resolving to authentication status
   */
  initialize() {
    // Prevent duplicate initialization
    if (this._state.initializing || this._state.isInitialized) {
      return Promise.resolve(this._state.isAuthenticated);
    }
    
    this._state.initializing = true;

    const keycloakConfig = {
      url: import.meta.env.VITE_KEYCLOAK_URL,
      realm: import.meta.env.VITE_KEYCLOAK_REALM,
      clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID
    };

    this._keycloakInstance.value = new Keycloak(keycloakConfig);

    return this._keycloakInstance.value
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        silentCheckSsoFallback: false,
        scope: 'openid profile backend-access'
      })
      .then((authenticated) => {
        this._state.isAuthenticated = authenticated;
        this._state.isInitialized = true;
        this._state.keycloakReady = true;
        this._state.initializing = false;
        
        if (authenticated) {
          this._updateTokenExpiration();
          // Don't automatically load profile here to prevent CORS issues
          // Will load profile on demand when needed
        }
        
        return authenticated;
      })
      .catch((error) => {
        this._state.authError = error;
        this._state.isInitialized = true;
        this._state.initializing = false;
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
    if (!this._keycloakInstance.value || !this._state.isAuthenticated) {
      return Promise.reject(new Error('Not authenticated'));
    }

    // Check if we already have the profile
    if (this._state.userProfile) {
      return Promise.resolve(this._state.userProfile);
    }
    
    // Update loading status
    this._state.profileLoadingStatus = `Attempt ${retryCount + 1}/${this._state.maxProfileLoadRetries + 1}`;
    this._state.profileLoadRetries = retryCount;

    // First method: Try to use the userinfo endpoint directly
    return this._getUserInfoFromToken()
      .then(profile => {
        this._state.userProfile = profile;
        this._state.profileLoadingStatus = 'success';
        return profile;
      })
      .catch(error => {
        console.warn('Failed to parse user info from token, trying Keycloak API', error);
        
        // Fallback to Keycloak's loadUserProfile method
        return this._keycloakInstance.value.loadUserProfile()
          .then(profile => {
            this._state.userProfile = profile;
            this._state.profileLoadingStatus = 'success';
            return profile;
          })
          .catch(error => {
            console.error(`Error loading user profile (attempt ${retryCount + 1})`, error);
            
            // Implement retry with exponential backoff
            if (retryCount < this._state.maxProfileLoadRetries) {
              const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
              this._state.profileLoadingStatus = `Retrying in ${delay/1000}s...`;
              
              return new Promise(resolve => {
                setTimeout(() => {
                  resolve(this.loadUserProfile(retryCount + 1));
                }, delay);
              });
            } else {
              this._state.profileLoadingStatus = 'failed';
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
    if (!this._keycloakInstance.value || !this._keycloakInstance.value.token) {
      return Promise.reject(new Error('No token available'));
    }
    
    try {
      // Parse the token
      const tokenParts = this._keycloakInstance.value.token.split('.');
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
    if (!this._keycloakInstance.value) {
      return Promise.reject(new Error('Keycloak not initialized'));
    }
    
    return this._keycloakInstance.value.login({
      redirectUri,
      prompt: 'login',
    });
  }

  /**
   * Logout function
   * @returns {Promise<void>} Promise that resolves after logout initiated
   */
  logout() {
    if (!this._keycloakInstance.value) {
      return Promise.reject(new Error('Keycloak not initialized'));
    }
    
    return this._keycloakInstance.value.logout();
  }

  /**
   * Update token expiration time
   * @private
   */
  _updateTokenExpiration() {
    if (this._keycloakInstance.value && this._keycloakInstance.value.token) {
      // Parse JWT to get expiration
      try {
        const tokenParts = this._keycloakInstance.value.token.split('.');
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        this._state.tokenExpiration = tokenPayload.exp * 1000; // Convert to milliseconds
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
    if (!this._keycloakInstance.value || !this._state.isAuthenticated) {
      return null;
    }
    return this._keycloakInstance.value.token;
  }

  /**
   * Update token - returns a promise
   * @param {number} minValidity - Minimum seconds of validity
   * @returns {Promise<string>} Promise resolving to the new token
   */
  updateToken(minValidity = 60) {
    if (!this._keycloakInstance.value || !this._state.isAuthenticated) {
      return Promise.reject(new Error('Not authenticated'));
    }
    
    return this._keycloakInstance.value
      .updateToken(minValidity)
      .then((refreshed) => {
        if (refreshed) {
          this._updateTokenExpiration();
        }
        return this._keycloakInstance.value.token;
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
    if (!this._keycloakInstance.value || !this._state.isAuthenticated) return () => {};
    
    // Schedule token refresh at 70% of token lifetime
    const tokenUpdateInterval = setInterval(() => {
      if (!this._state.isAuthenticated) {
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
    if (!this._keycloakInstance.value || !this._state.isAuthenticated) {
      return false;
    }
    return this._keycloakInstance.value.hasRealmRole(role);
  }
}

// Create and export a singleton instance
export default new KeycloakProvider();