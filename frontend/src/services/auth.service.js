import { ref, reactive, computed } from '@vue/reactivity';
import keycloakProvider from './keycloak.provider';

/**
 * Auth Service
 * 
 * This service provides a consistent authentication API for the application.
 * It uses an auth provider (currently Keycloak) that can be swapped out for another
 * implementation as long as it satisfies the auth interface.
 */

// Use the current auth provider
const authProvider = keycloakProvider;

/**
 * Initialize the auth provider
 * @returns {Promise<boolean>} Promise resolving to authentication status
 */
const initAuth = () => {
  return authProvider.initialize();
};

/**
 * Load user profile
 * @returns {Promise<Object>} Promise resolving to user profile
 */
const loadUserProfile = () => {
  return authProvider.loadUserProfile();
};

/**
 * Login function
 * @param {string} redirectUri - URI to redirect after login
 * @returns {Promise<void>} Promise that resolves after login initiated
 */
const login = (redirectUri = window.location.href) => {
  return authProvider.login(redirectUri);
};

/**
 * Logout function
 * @returns {Promise<void>} Promise that resolves after logout initiated
 */
const logout = () => {
  return authProvider.logout();
};

/**
 * Get current auth token
 * @returns {string|null} Current auth token or null if not authenticated
 */
const getToken = () => {
  return authProvider.getToken();
};

/**
 * Update token if needed
 * @param {number} minValidity - Minimum seconds of validity
 * @returns {Promise<string>} Promise resolving to the new token
 */
const updateToken = (minValidity = 60) => {
  return authProvider.updateToken(minValidity);
};

/**
 * Set up automatic token refresh
 * @returns {Function} Cleanup function
 */
const setupTokenRefresh = () => {
  return authProvider.setupTokenRefresh();
};

// Export the auth service
export default {
  // Expose the auth provider state for components to use
  state: authProvider.state,
  
  // Core auth methods
  initialize: initAuth,
  login,
  logout,
  getToken,
  updateToken,
  setupTokenRefresh,
  loadUserProfile,
  
  // Computed values
  tokenExpired: authProvider.tokenExpired,
  
  // For backward compatibility - direct access to provider instance
  // This should be avoided in new code to maintain provider independence
  provider: authProvider
};