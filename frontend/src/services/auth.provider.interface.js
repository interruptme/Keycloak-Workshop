/**
 * Auth Provider Interface
 * 
 * This interface defines the contract that all authentication providers must implement.
 * It allows for easy swapping between different authentication libraries (Keycloak, Auth0, etc.)
 * while maintaining a consistent API for the application.
 * 
 * Note: This is just an interface definition and should be implemented by specific providers.
 */

/**
 * Interface example (not actual implementation)
 */
export default class AuthProviderInterface {
  /**
   * Get the reactive state object
   * Should include: isAuthenticated, isInitialized, userProfile, authError, tokenExpiration, etc.
   */
  get state() {
    throw new Error('Method not implemented: state');
  }

  /**
   * Get the tokenExpired computed property
   * Should return whether the current token has expired
   */
  get tokenExpired() {
    throw new Error('Method not implemented: tokenExpired');
  }

  /**
   * Initialize the auth provider and check if user is already authenticated
   * @returns {Promise<boolean>} Promise resolving to authentication status
   */
  initialize() {
    throw new Error('Method not implemented: initialize');
  }

  /**
   * Load user profile information
   * @returns {Promise<Object>} Promise resolving to user profile object
   */
  loadUserProfile() {
    throw new Error('Method not implemented: loadUserProfile');
  }

  /**
   * Redirect to login page or show login UI
   * @param {string} redirectUri - Optional URI to redirect after login
   * @returns {Promise<void>} Promise resolving after login initiated
   */
  login(redirectUri) {
    throw new Error('Method not implemented: login');
  }

  /**
   * Log the user out and optionally redirect to logout page
   * @returns {Promise<void>} Promise resolving after logout initiated
   */
  logout() {
    throw new Error('Method not implemented: logout');
  }

  /**
   * Return the current access token or null if not authenticated
   * @returns {string|null} The current access token
   */
  getToken() {
    throw new Error('Method not implemented: getToken');
  }

  /**
   * Refresh the token if it's about to expire
   * @param {number} minValidity - Minimum seconds of validity required
   * @returns {Promise<string>} Promise resolving to the new token
   */
  updateToken(minValidity) {
    throw new Error('Method not implemented: updateToken');
  }

  /**
   * Set up automatic token refresh
   * @returns {Function} Cleanup function to cancel refresh
   */
  setupTokenRefresh() {
    throw new Error('Method not implemented: setupTokenRefresh');
  }
}