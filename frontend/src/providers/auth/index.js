import keycloakProvider from './KeycloakProvider';
import oidcProvider from './OidcProvider';

/**
 * Auth Provider Type Enum
 */
export const ProviderType = {
  KEYCLOAK: 'keycloak',
  OIDC: 'oidc'
};

/**
 * Get the appropriate auth provider based on configuration
 * 
 * @param {string} type - Provider type from ProviderType enum
 * @returns Auth provider instance
 */
export const getAuthProvider = (type = null) => {
  // If type is not specified, use the environment variable or default to keycloak
  const providerType = type || import.meta.env.VITE_AUTH_PROVIDER || ProviderType.KEYCLOAK;
  
  switch (providerType.toLowerCase()) {
    case ProviderType.OIDC:
      return oidcProvider;
    case ProviderType.KEYCLOAK:
    default:
      return keycloakProvider;
  }
};

/**
 * The default auth provider based on environment configuration
 */
export const defaultProvider = getAuthProvider();