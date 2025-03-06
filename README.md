## Configuring Keycloak

### Initialize Keycloak Authentication Service

This section contains commands to set up and start the Keycloak authentication service using Docker Compose.

The sequence of commands:
1. Navigate to the Keycloak directory
2. Enter the initialization directory
3. Build and start the Docker containers using Docker Compose

#### Prerequisites:
- Docker installed
- Docker Compose installed
- Keycloak configuration files in place

#### Note:
The `--build` flag ensures that Docker images are rebuilt if there are any changes to the configuration.

```bash
cd keycloak
cd init
docker-compose up --build
```
