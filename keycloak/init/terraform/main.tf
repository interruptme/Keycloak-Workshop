resource "keycloak_realm" "demo_realm" {
  realm             = "demo-realm"
  enabled           = true
  display_name      = "Demo Realm"
  display_name_html = "<div>Demo Realm</div>"

  # Basic security headers
  security_defenses {
    headers {
      x_frame_options                     = "SAMEORIGIN"
      content_security_policy             = "frame-src 'self'; frame-ancestors 'self'; object-src 'none';"
      strict_transport_security           = "max-age=31536000; includeSubDomains"
      x_content_type_options             = "nosniff"
      x_xss_protection                   = "1; mode=block"
    }
  }

  # Standard token lifespans
  access_token_lifespan = "15m"
}

resource "keycloak_openid_client" "frontend_client" {
  realm_id            = keycloak_realm.demo_realm.id
  client_id           = "frontend-client"
  name               = "Frontend Application"
  enabled            = true
  access_type        = "PUBLIC"
  standard_flow_enabled = true
  
  # Enforce PKCE for this client
  pkce_code_challenge_method = "S256"

  # Enable refresh tokens
  use_refresh_tokens = true

  # Redirect URIs - adjust these for your development and production environments
  valid_redirect_uris = [
    "http://localhost:5173/*",  # Vite default development port
  ]

  web_origins = [
    "http://localhost:5173",
    "+"  # Allows CORS requests from redirect URIs
  ]

  # Client settings for SPA
  full_scope_allowed = false
  implicit_flow_enabled = false
  direct_access_grants_enabled = false

  # Browser security settings
  base_url = "http://localhost:5173"
  root_url = "http://localhost:5173"
}

resource "keycloak_openid_client" "backend_client" {
  realm_id            = keycloak_realm.demo_realm.id
  client_id           = "backend-client"
  name               = "Backend API"
  enabled            = true
  access_type        = "CONFIDENTIAL"
  standard_flow_enabled = false
  service_accounts_enabled = true

  # Client settings for API
  full_scope_allowed = false
  implicit_flow_enabled = false
  direct_access_grants_enabled = false

  # Client credentials
  client_secret = "secret"
}

resource "keycloak_user" "test_user" {
  realm_id = keycloak_realm.demo_realm.id
  username = "testuser"
  enabled  = true
  email    = "testuser@example.com"
  
  first_name = "Test"
  last_name  = "User"

  initial_password {
    value     = "1234"
    temporary = false
  }
}

# Create a client scope for the backend client
resource "keycloak_openid_client_scope" "backend_access_scope" {
  realm_id               = keycloak_realm.demo_realm.id
  name                   = "backend-access"
  description            = "Adds the backend service as an audience to the token"
  include_in_token_scope = true
  gui_order              = 1
}

# Add the audience mapper to this scope
resource "keycloak_openid_audience_protocol_mapper" "backend_audience_mapper" {
  realm_id        = keycloak_realm.demo_realm.id
  client_scope_id = keycloak_openid_client_scope.backend_access_scope.id
  name            = "backend-audience"
  
  # Reference the backend client directly as the audience
  included_client_audience = keycloak_openid_client.backend_client.client_id
  
  # Set to add to access token only
  add_to_access_token     = true
  add_to_id_token         = false
}

# Assign it as an optional scope, so it has to be requested 
resource "keycloak_openid_client_optional_scopes" "frontend_default_scopes" {
  realm_id  = keycloak_realm.demo_realm.id
  client_id = keycloak_openid_client.frontend_client.id
  
  optional_scopes = [
    keycloak_openid_client_scope.backend_access_scope.name,
  ]
}

# Also assign the default scopes to the frontend client 
resource "keycloak_openid_client_default_scopes" "frontend_default_scopes" {
  realm_id  = keycloak_realm.demo_realm.id
  client_id = keycloak_openid_client.frontend_client.id
  
  default_scopes = [
    "email",
    "profile",
    "roles",
    "web-origins",
  ]
}