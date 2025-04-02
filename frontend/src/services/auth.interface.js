/**
 * Auth Provider Interface
 * 
 * This interface defines the contract that all authentication providers must implement.
 * It allows for easy swapping between different authentication libraries (Keycloak, Auth0, etc.)
 * while maintaining a consistent API for the application.
 */

/**
 * Common auth state structure
 * This should be a reactive object with the following properties:
 * {
 *   isAuthenticated: boolean,    // Whether the user is authenticated
 *   isInitialized: boolean,      // Whether the auth provider has been initialized
 *   userProfile: Object|null,    // User profile information when available
 *   authError: Error|null,       // Last auth error if any
 *   tokenExpiration: number|null // Timestamp when the current token expires (ms)
 * }
 */

/**
 * Required methods for auth providers:
 * 
 * - initialize(): Promise<boolean>
 *   Initialize the auth provider and check if user is already authenticated
 *   Returns Promise resolving to authentication status
 * 
 * - login(redirectUri?: string): Promise<void>
 *   Redirect to login page or show login UI
 *   Optional redirectUri parameter to return after login
 * 
 * - logout(): Promise<void>
 *   Log the user out and optionally redirect to logout page
 * 
 * - getToken(): string|null
 *   Return the current access token or null if not authenticated
 * 
 * - updateToken(minValidity?: number): Promise<string>
 *   Refresh the token if it's about to expire
 *   minValidity is minimum seconds of validity required
 *   Returns Promise resolving to the new token
 * 
 * - loadUserProfile(): Promise<Object>
 *   Load user profile information
 *   Returns Promise resolving to user profile object
 * 
 * - setupTokenRefresh(): Function
 *   Set up automatic token refresh
 *   Returns cleanup function to cancel refresh
 * 
 * - tokenExpired: ComputedRef<boolean>
 *   Computed property that returns whether the token has expired
 */

export default {
  // This is just documentation, no actual implementation
};