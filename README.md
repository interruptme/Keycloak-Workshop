# Keycloak Integration

This repository demonstrates how to integrate Keycloak authentication with a Vue.js frontend and a .NET backend. The solution uses Docker for containerization and can be run either as individual components or as a complete solution using Docker Compose.

## System Requirements

Before getting started, make sure you have the following installed:

- [Docker](https://www.docker.com/get-started) (20.10.0+) and Docker Compose (v2+)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (for running the backend locally)
- [Node.js](https://nodejs.org/) (v18+) and npm (for running the frontend locally)

## Repository Structure

```
/
├── backend/                # .NET backend API
├── frontend/               # Vue.js frontend
├── keycloak/               # Keycloak configuration
│   └── init/               # Initialization scripts
│       └── terraform/      # Terraform configuration for Keycloak
└── docker-compose.yml      # Docker Compose configuration
```

## Quick Start with Docker Compose

The easiest way to run the entire solution is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd <repository-directory>

# Start all services
docker-compose up -d
```

This will start:
- Keycloak on http://localhost:8080
- PostgreSQL database for Keycloak
- .NET backend on http://localhost:5000
- Vue.js frontend on http://localhost:5173

After the services are running, you'll need to initialize the Keycloak realm:

```bash
# Navigate to the Keycloak init directory
cd keycloak/init

# Run the initialization
docker-compose up
```
This will create:
- A `demo-realm` realm
- A frontend public client
- A backend confidential client (not strictly needed)
- A test user (username: `testuser`, password: `1234`)
- A scope for backend access with audience mapping

## Running Components Individually

You can also run each component individually for development purposes.

### 1. Running Keycloak

Starting from the base folder, first make sure that the services are not running already

```bash
docker-compose down
docker-compose ps
```

All containers should be down. Now start PostgreSQL and Keycloak only:

```bash
docker-compose up -d postgres keycloak
docker-compose ps
```
You should see only keycloak-demo-postgres-for-keycloak and keycloak-26-1-3

Make sure that you have run the Keycloak initialization if you want the demo to run correctly (see instructions above).

### 2. Running the Backend

#### Using Docker

```bash
cd backend
docker build -t keycloak-demo-backend .
docker run -p 5000:5000 -e ASPNETCORE_ENVIRONMENT=Development keycloak-demo-backend
```

#### Locally with .NET SDK

```bash
cd backend/src/SimpleAPI.Web
dotnet restore
dotnet run
```

Or if you are going to be making modifications to the SimpleAPI.Web project and want them hot-reloaded:

```bash
cd backend/src/SimpleAPI.Web
dotnet restore
dotnet watch run --project src/SimpleAPI.Web/SimpleAPI.Web.csproj        
```

The backend API will be available at http://localhost:5000.

### 3. Running the Frontend

#### Using Docker

```bash
cd frontend
docker build -t keycloak-demo-frontend .
docker run -p 5173:80 keycloak-demo-frontend
```

#### Locally with Node.js

```bash
cd frontend
npm install
npm run dev
```

The frontend application will be available at http://localhost:5173.

## Testing the Application

1. Open http://localhost:5173 in your browser
2. Click "Login" to authenticate with Keycloak
3. Use the test user credentials (username: `testuser`, password: `1234`)
4. Once logged in, you can access the weather information, which requires authentication
5. You can view your profile information and tokens on the Profile page

## Security Notes

This setup is intended for development and learning purposes only. For production use, make sure to:

1. Enable HTTPS for all services
2. Use proper secrets management instead of hardcoded credentials
3. Set up more restrictive CORS policies
4. Configure more secure token handling and refresh mechanisms
5. Use a proper database backup strategy

## Troubleshooting

### Keycloak Issues

- **Cannot access Keycloak**: Check that the container is running with `docker ps`. Verify port mapping with `docker-compose ps`.
- **Realm not showing up**: The initialization may have failed. Check the logs with `docker-compose logs keycloak`.

### Backend Issues

- **401 Unauthorized errors**: Check that the Keycloak realm is properly set up and the backend client exists.
- **CORS errors**: Verify that the frontend origin is allowed in the backend CORS configuration.

### Frontend Issues

- **Cannot connect to backend**: Check that the backend URL in `.env` is correct. Verify network connectivity.
- **Login not working**: Ensure the Keycloak URL, realm, and client ID are correctly set in the frontend configuration.

## Further Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Vue.js Documentation](https://vuejs.org/guide/introduction.html)
- [.NET Documentation](https://learn.microsoft.com/en-us/dotnet/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)