<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" class="logo" width="120"/>

# 

---

# Can you make a `todo.md` that I can use as a checklist? Be thorough.

```markdown
# Keycloak Authentication Integration Checklist

## Pre-Implementation
- [x] Install Docker & Docker Compose
- [x] Set up Node.js 18+ environment
- [x] Install .NET 8 SDK
- [x] Create project directories:
  - `/frontend` (Vue.js)
  - `/backend` (.NET)
  - `/keycloak` (config files)

---

## Phase 1: Core Infrastructure Setup

### Keycloak Configuration
- [x] Docker Compose file created with:
  - PostgreSQL 15 service
  - Keycloak 22+ service
  - Health checks configured
  - Fixed ports (8080:8080)
- [x] Verify Keycloak accessibility:
```

curl http://localhost:8080/health/ready

```
- [x] Realm initialization script created with:
- demo-realm configuration
- Frontend (public) and backend (confidential) clients
- Test user `testuser:testpass`
- [x] Verify realm setup using kcadm.sh:
```

kcadm.sh get realms/demo-realm --fields realm

```

---

## Phase 2: Frontend Foundation

### Authentication Service
- [ ] Install required packages:
- `@keycloak/keycloak-js`
- `@vue/reactivity`
- [ ] Create `auth.service.js` with:
- Reactive store implementation
- PKCE flow handlers
- In-memory token storage
- [ ] Write unit tests covering:
- Successful login flow
- Token expiration handling
- Error states

### Router Guard
- [ ] Create navigation guard with:
- Authentication check
- Route meta handling
- Callback route processing
- [ ] Test guard behavior with:
- Authenticated user
- Unauthenticated user
- Expired token scenario

---

## Phase 3: Backend Security

### JWT Validation
- [ ] Add NuGet packages:
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `Microsoft.IdentityModel.Protocols.OpenIdConnect`
- [ ] Configure services with:
- Valid issuer URL
- JWKS endpoint integration
- Audience validation
- [ ] Create test endpoint:
```

[HttpGet("claims")]
public IActionResult GetClaims() => Ok(User.Claims);

```

### Protected Endpoints
- [ ] Implement `[Authorize]` controller
- [ ] Create policies for:
- Authentication requirement
- Role-based access (if needed)
- [ ] Write integration tests for:
- Valid token access
- Invalid token rejection
- Expired token handling

---

## Phase 4: Integration

### Token Refresh
- [ ] Implement Axios interceptor:
- Token expiration check
- Silent refresh mechanism
- Request retry logic
- [ ] Test refresh flow:
- Successful token renewal
- Failed refresh → logout
- Concurrent request handling

### API Service
- [ ] Create API client with:
- Automatic header injection
- 401 response handling
- Error state management
- [ ] Verify with:
- Valid token requests
- Invalid token requests
- Network error simulation

---

## Phase 5: Security Hardening

### Headers Middleware
- [ ] Implement security headers:
- Content-Security-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- [ ] Verify using:
```

curl -I http://localhost:5000

```

### Audit Logging
- [ ] Add structured logging for:
- Authentication attempts
- Token validation results
- Authorization decisions
- [ ] Test log capture for:
- Successful login
- Failed token validation
- Permission denied event

---

## Phase 6: Final Integration

### UI Components
- [ ] Create login/logout UI
- [ ] Implement token status display
- [ ] Build protected content area
- [ ] Add error display component
- [ ] Write end-to-end tests covering:
- Full authentication flow
- Token refresh scenario
- Error state recovery

### Deployment Prep
- [ ] Create production Dockerfiles:
- Vue static build
- .NET optimized image
- Keycloak with TLS
- [ ] Configure environment variables:
- Keycloak URLs
- Client secrets
- JWT validation settings
- [ ] Set up health checks:
- Frontend: `/healthz`
- Backend: `/hc`
- Keycloak: `/health/ready`

---

## Post-Implementation
- [ ] Verify all unit tests pass
- [ ] Run end-to-end test suite
- [ ] Perform security audit:
- Check for token leakage
- Validate storage mechanisms
- Verify HTTPS enforcement
- [ ] Update documentation:
- Setup instructions
- Environment configuration
- Troubleshooting guide
- [ ] Create demo user flow:
- Public → Login → Protected → Logout
```

This checklist follows an incremental implementation path with verification steps at each stage. Mark items as complete only after:

1. Implementation done
2. Tests written
3. Manual verification performed
4. Cross-component integration validated
