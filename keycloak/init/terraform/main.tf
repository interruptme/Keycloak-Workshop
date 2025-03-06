# Example: Create a realm
resource "keycloak_realm" "example_realm" {
  realm             = "example"
  enabled           = true
  display_name      = "Example Realm"
  display_name_html = "<strong>Example</strong> Realm"
}

# Example: Create a client
resource "keycloak_openid_client" "example_client" {
  realm_id            = keycloak_realm.example_realm.id
  client_id           = "example-client"
  name                = "Example Client"
  enabled             = true
  access_type         = "CONFIDENTIAL"
  standard_flow_enabled = true
  valid_redirect_uris = [
    "http://localhost:8000/*"
  ]
}

# Example: Create a user
resource "keycloak_user" "example_user" {
  realm_id   = keycloak_realm.example_realm.id
  username   = "example-user"
  enabled    = true
  email      = "example@example.com"
  first_name = "Example"
  last_name  = "User"
  
  initial_password {
    value     = "password"
    temporary = false
  }
}