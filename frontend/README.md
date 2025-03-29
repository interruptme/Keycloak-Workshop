# Vue 3 Keycloak Integration

This project demonstrates the integration of Vue 3 with Keycloak for authentication and authorization.

## Features

- Vue 3 with Composition API
- Vue Router with navigation guards
- Keycloak integration with PKCE flow
- Token refresh handling
- Protected routes
- User profile display
- API service with token handling

## Prerequisites

- Node.js 16+
- npm or yarn
- Running Keycloak instance (see backend README)

## Project Setup

```bash
# Install dependencies
npm install

# Compile and hot-reload for development
npm run dev

# Compile and minify for production
npm run build

# Run unit tests
npm run test

# Lint and fix files
npm run lint
```

## Environment Variables

Create a `.env.local` file with the following variables:

```
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=demo-realm
VITE_KEYCLOAK_CLIENT_ID=frontend-client
VITE_API_URL=http://localhost:5000/api
```

## Keycloak Configuration

Ensure that your Keycloak server has:

1. A realm named `demo-realm`
2. A public client named `frontend-client` with:
   - Valid redirect URIs for your application (http://localhost:5173/*)
   - Web origins configured
   - PKCE enforced

## Project Structure

- `services/auth.service.js`: Keycloak integration
- `services/api.service.js`: API calls with token handling
- `router/index.js`: Route definitions with auth guards
- `views/`: Page components
- `components/`: Reusable UI components

## Security Features

- PKCE flow for secure authentication
- In-memory token storage (no localStorage)
- Token refresh handling
- CSP headers in index.html

## Development Notes

- The auth service uses Vue 3's reactive system for state management
- Token refresh is handled automatically before API calls
- Protected routes redirect to login if unauthorized