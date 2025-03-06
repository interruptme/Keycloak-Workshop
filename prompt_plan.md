Here's a structured breakdown of iterative implementation prompts following test-driven practices:

```markdown
# Phase 1 - Core Infrastructure Setup

## Prompt 1: Keycloak Docker Setup
```
Create a docker-compose.yml file for Keycloak with:
- Keycloak 22+ with DB_VENDOR=postgres
- PostgreSQL 15
- Pre-configured admin credentials
- Fixed ports (8080 for Keycloak)
- Health checks
- Include test command to verify setup using curl
```

## Prompt 2: Keycloak Realm Configuration
```
Create a Keycloak realm initialization script that:
1. Creates 'demo-realm' with PKCE enforced
2. Creates frontend client (public) with redirect URIs
3. Creates backend client (confidential)
4. Sets access token lifespan (15m) and refresh (7d)
5. Includes test user with test credentials
6. Outputs realm configuration as JSON
Include verification steps using kcadm.sh
```

# Phase 2 - Frontend Foundation

## Prompt 3: Vue Auth Service
```
Create Vue 3 service using @vue/reactivity:
1. Install @keycloak/keycloak-js
2. Implement reactive auth store with:
   - isAuthenticated
   - userProfile
   - authError
3. Methods for init, login, handleCallback, logout
4. Memory-based token storage (no localStorage)
5. Unit tests mocking Keycloak JS
```

## Prompt 4: Auth Guard Component
```
Create Vue router guard that:
1. Checks authentication status
2. Redirects unauthenticated users to login
3. Handles callback route for Keycloak redirect
4. Manages route meta.requiresAuth
5. Unit test with mocked auth states
```

# Phase 3 - Backend Security

## Prompt 5: .NET JWT Validation
```
Create JWT validation setup in .NET 8:
1. Add Microsoft.IdentityModel.Protocols.OpenIdConnect
2. Configure JwtBearerOptions to:
   - Use Keycloak issuer
   - Get JWKS dynamically
   - Validate audience/issuer
3. Add test endpoint returning token claims
4. Unit test with valid/invalid tokens
```

## Prompt 6: Protected Endpoint
```
Create protected controller with:
1. [Authorize] attribute
2. Claims inspection endpoint
3. Role-based policy (if needed)
4. Custom 401/403 handling
5. Integration tests with TestServer
```

# Phase 4 - Integration

## Prompt 7: Token Refresh Flow
```
Implement frontend token refresh:
1. Axios interceptor checking token expiration
2. Silent refresh using refresh_token
3. Error handling for refresh failures
4. Unit tests for expiration scenarios
5. Integration with auth service
```

## Prompt 8: API Service Integration
```
Create API service in Vue that:
1. Attaches Authorization header
2. Handles 401 responses
3. Retries failed requests after refresh
4. Global error handling
5. Unit tests with mocked API responses
```

# Phase 5 - Security Hardening

## Prompt 9: Security Headers
```
Add security middleware to .NET:
1. Strict CSP headers
2. HSTS enforcement
3. X-Content-Type-Options
4. Content-Security-Policy
5. Test with SecurityHeaders.com scan
```

## Prompt 10: Audit Logging
```
Implement structured logging:
1. Frontend auth events
2. Backend token validation results
3. Sensitive action tracking
4. Correlation IDs
5. Integration with monitoring
```

# Phase 6 - Final Integration

## Prompt 11: End-to-End Flow
```
Create main application component with:
1. Login/Logout buttons
2. Token status display
3. Protected content area
4. Error display handling
5. Full integration tests
```

## Prompt 12: Deployment Setup
```
Create production Docker setup with:
1. Frontend static build
2. Backend optimized image
3. Keycloak production config
4. HTTPS configuration
5. Health check endpoints
```
```

Each prompt builds on previous steps and includes testing requirements. Implementation should follow this order with validation at each stage before proceeding to next prompt.
