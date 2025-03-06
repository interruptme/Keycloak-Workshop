FROM hashicorp/terraform:latest

# Install dependencies for the Keycloak provider
RUN apk add --no-cache curl jq bash

# Set working directory
WORKDIR /terraform

# Create a volume mount point
VOLUME ["/terraform"]

# Copy a script to initialize, plan, and apply the Terraform configuration
COPY init_terraform_realm.sh /init_terraform_realm.sh
RUN chmod +x /init_terraform_realm.sh

# Label for the network configuration
LABEL network="keycloak-network"

# Set entrypoint
ENTRYPOINT ["/init_terraform_realm.sh"]