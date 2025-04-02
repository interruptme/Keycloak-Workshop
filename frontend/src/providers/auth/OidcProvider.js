import { UserManager, WebStorageStateStore, Log } from 'oidc-client-ts';
import { ref, reactive, computed } from '@vue/reactivity';
import AuthProviderInterface from '@/interfaces/auth/AuthProvider';

/**
 * OIDC Authentication Provider
 * Implements the auth interface using oidc-client-ts
 */
class OidcProvider extends AuthProviderInterface {
  constructor() {
    super();
    
    // Configure logging
    Log.setLogger(console);
    Log.setLevel(Log.INFO);
    
    // Create reactive state
    this._userManager = null;
    this._user = ref(null);
    this._state = reactive({
      isAuthenticated: false,
      isInitialized: false,
      userProfile: null,
      authError: null,
      tokenExpiration: null,
      initializing: false
    });

    // Create computed property for token expiration
    this._tokenExpired = computed(() => {
      if (!this._state.tokenExpiration) return true;
      return this._state.tokenExpiration <= Date.now();
    });
    
    // Create the UserManager with config
    this._createUserManager();
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
   * Create OIDC UserManager with settings
   * @private
   */
  _createUserManager() {
    const settings = {
      authority: import.meta.env.VITE_OIDC_AUTHORITY || import.meta.env.VITE_KEYCLOAK_URL + '/realms/' + import.meta.env.VITE_KEYCLOAK_REALM,
      client_id: import.meta.env.VITE_OIDC_CLIENT_ID || import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI || window.location.origin + '/callback',
      post_logout_redirect_uri: import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI || window.location.origin,
      response_type: 'code',
      scope: 'openid profile email',
      automaticSilentRenew: true,
      includeIdTokenInSilentRenew: true,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      metadata: {
        issuer: import.meta.env.VITE_OIDC_ISSUER || import.meta.env.VITE_KEYCLOAK_URL + '/realms/' + import.meta.env.VITE_KEYCLOAK_REALM,
        authorization_endpoint: import.meta.env.VITE_OIDC_AUTHORIZATION_ENDPOINT || import.meta.env.VITE_KEYCLOAK_URL + '/realms/' + import.meta.env.VITE_KEYCLOAK_REALM + '/protocol/openid-connect/auth',
        token_endpoint: import.meta.env.VITE_OIDC_TOKEN_ENDPOINT || import.meta.env.VITE_KEYCLOAK_URL + '/realms/' + import.meta.env.VITE_KEYCLOAK_REALM + '/protocol/openid-connect/token',
        userinfo_endpoint: import.meta.env.VITE_OIDC_USERINFO_ENDPOINT || import.meta.env.VITE_KEYCLOAK_URL + '/realms/' + import.meta.env.VITE_KEYCLOAK_REALM + '/protocol/openid-connect/userinfo',
        end_session_endpoint: import.meta.env.VITE_OIDC_END_SESSION_ENDPOINT || import.meta.env.VITE_KEYCLOAK_URL + '/realms/' + import.meta.env.VITE_KEYCLOAK_REALM + '/protocol/openid-connect/logout'
      }
    };

    this._userManager = new UserManager(settings);
    
    // Setup event callbacks
    this._userManager.events.addUserLoaded(user => {
      this._onUserLoaded(user);
    });
    
    this._userManager.events.addUserUnloaded(() => {
      this._onUserUnloaded();
    });
    
    this._userManager.events.addSilentRenewError(error => {
      console.error('OIDC silent renew error', error);
      this._state.authError = error;
    });
    
    this._userManager.events.addAccessTokenExpired(() => {
      console.log('OIDC access token expired');
      this._state.tokenExpiration = Date.now() - 1000; // Set as expired
    });
  }

  /**
   * Handle user loaded event
   * @param {User} user - OIDC user object
   * @private
   */
  _onUserLoaded(user) {
    this._user.value = user;
    this._state.isAuthenticated = true;
    this._updateTokenExpiration();
    
    // Extract user profile from claims
    if (user?.profile) {
      this._state.userProfile = {
        id: user.profile.sub,
        username: user.profile.preferred_username || user.profile.email,
        email: user.profile.email,
        firstName: user.profile.given_name,
        lastName: user.profile.family_name
      };
    }
  }

  /**
   * Handle user unloaded event
   * @private
   */
  _onUserUnloaded() {
    this._user.value = null;
    this._state.isAuthenticated = false;
    this._state.userProfile = null;
    this._state.tokenExpiration = null;
  }

  /**
   * Initialize OIDC client
   * @returns {Promise<boolean>} Promise resolving to authentication status
   */
  initialize() {
    // Prevent duplicate initialization
    if (this._state.initializing || this._state.isInitialized) {
      return Promise.resolve(this._state.isAuthenticated);
    }
    
    this._state.initializing = true;

    return this._userManager.getUser()
      .then(user => {
        if (user && !user.expired) {
          this._onUserLoaded(user);
        }
        
        this._state.isInitialized = true;
        this._state.initializing = false;
        return this._state.isAuthenticated;
      })
      .catch(error => {
        console.error('OIDC initialization error', error);
        this._state.authError = error;
        this._state.isInitialized = true;
        this._state.initializing = false;
        throw error;
      });
  }

  /**
   * Load user profile
   * @returns {Promise<Object>} Promise resolving to user profile object
   */
  loadUserProfile() {
    if (!this._state.isAuthenticated || !this._user.value) {
      return Promise.reject(new Error('Not authenticated'));
    }

    // Check if we already have the profile
    if (this._state.userProfile) {
      return Promise.resolve(this._state.userProfile);
    }
    
    // Try to get user info from the server
    return this._userManager.getUser()
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }
        
        // Extract profile from claims
        const profile = {
          id: user.profile.sub,
          username: user.profile.preferred_username || user.profile.email,
          email: user.profile.email,
          firstName: user.profile.given_name,
          lastName: user.profile.family_name
        };
        
        this._state.userProfile = profile;
        return profile;
      });
  }

  /**
   * Login function
   * @param {string} redirectUri - URI to redirect after login
   * @returns {Promise<void>} Promise that resolves after login initiated
   */
  login(redirectUri) {
    // Override redirect uri if provided
    const args = redirectUri ? { redirect_uri: redirectUri } : undefined;
    return this._userManager.signinRedirect(args);
  }

  /**
   * Handle the callback from login redirect
   * @returns {Promise<User>} Promise resolving to the user
   */
  handleLoginCallback() {
    return this._userManager.signinRedirectCallback()
      .then(user => {
        this._onUserLoaded(user);
        return user;
      });
  }

  /**
   * Logout function
   * @returns {Promise<void>} Promise that resolves after logout initiated
   */
  logout() {
    return this._userManager.signoutRedirect();
  }

  /**
   * Update token expiration time
   * @private
   */
  _updateTokenExpiration() {
    if (this._user.value && this._user.value.expires_at) {
      this._state.tokenExpiration = this._user.value.expires_at * 1000; // Convert to milliseconds
    }
  }

  /**
   * Get auth token
   * @returns {string|null} Current auth token or null if not authenticated
   */
  getToken() {
    if (!this._state.isAuthenticated || !this._user.value) {
      return null;
    }
    return this._user.value.access_token;
  }

  /**
   * Update token if needed
   * @param {number} minValidity - Minimum seconds of validity
   * @returns {Promise<string>} Promise resolving to the new token
   */
  updateToken(minValidity = 60) {
    if (!this._state.isAuthenticated) {
      return Promise.reject(new Error('Not authenticated'));
    }
    
    const now = Math.floor(Date.now() / 1000); // Current time in seconds
    const expiresAt = this._user.value?.expires_at || 0;
    
    // Check if token needs renewal
    if (expiresAt - now < minValidity) {
      return this._userManager.signinSilent()
        .then(user => {
          if (user) {
            this._onUserLoaded(user);
            return user.access_token;
          }
          throw new Error('Silent token renewal failed');
        })
        .catch(error => {
          console.error('Error refreshing token', error);
          // Force logout on token refresh failure
          this.logout();
          throw error;
        });
    }
    
    // Token is still valid
    return Promise.resolve(this._user.value.access_token);
  }

  /**
   * Setup token refresh
   * @returns {Function} Cleanup function
   */
  setupTokenRefresh() {
    // OIDC client already handles automatic token renewal
    // We don't need to do anything here as it's configured in settings
    return () => {};
  }
}

// Create and export a singleton instance
export default new OidcProvider();