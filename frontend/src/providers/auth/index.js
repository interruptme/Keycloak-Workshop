import oidcProvider from './OidcProvider';

/**
 * Auth Provider Type Enum
 */
export const ProviderType = {
  OIDC: 'oidc'
};

/**
 * Get the auth provider
 * @returns Auth provider instance
 */
export const getAuthProvider = () => {
  return oidcProvider;
};

/**
 * The default auth provider
 */
export const defaultProvider = oidcProvider;