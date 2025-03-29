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
# Dockerized .NET Backend with Keycloak

This document describes how to run the .NET backend application with Keycloak using Docker.

## Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

## Files Overview

- `Dockerfile` - Builds the .NET backend application
- `docker-compose.yml` - Orchestrates all services (Keycloak, Postgres, and backend)
- `.dockerignore` - Specifies files to exclude from the Docker build context

## Quick Start

1. Place the Dockerfile in the `backend` directory
2. Place the docker-compose.yml file in the root directory
3. Place the .dockerignore file in the `backend` directory
4. Place the HealthCheckExtensions.cs file in the `backend/src/SimpleAPI.Core/Extensions` directory
5. Update the Program.cs file in the `backend/src/SimpleAPI.Web` directory

Then run:

```bash
# Build and start all services
docker-compose up --build

# Or to run in detached mode
docker-compose up --build -d
```

## Service URLs

Once running, the services will be available at:

- **Keycloak Admin Console**: http://localhost:8080/admin (login with admin/admin_password)
- **Backend API**: http://localhost:5000/swagger

Note: The Keycloak service runs on port 8080, while the .NET backend runs on port 5000 to avoid port conflicts.

## Stopping the Services

```bash
# Stop and remove containers
docker-compose down

# To also remove volumes (will lose all data)
docker-compose down -v
```

## Troubleshooting

### Health Checks Failing

If health checks are failing, you can check the logs:

```bash
docker-compose logs backend
docker-compose logs keycloak
```

### Database Connection Issues

If Keycloak can't connect to the database:

```bash
# Check if PostgreSQL is running properly
docker-compose logs postgres
```

### Frontend Development

When developing the frontend locally:

- Ensure the frontend is configured to connect to `http://localhost:5000` for the API
- Ensure CORS is properly configured in the backend to allow requests from `http://localhost:5173`

## Security Notes

- This setup is for development purposes. For production:
  - Use proper secrets management
  - Enable HTTPS
  - Configure more restrictive CORS policies
  - Set up proper authentication for the backend API