terraform {
  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "~> 5.0.0"
    }
  }
}

provider "keycloak" {
  client_id     = "admin-cli"
  username      = "admin"
  password      = "1234"
  url           = "http://keycloak-26-1-3:8080"
  initial_login = true
}