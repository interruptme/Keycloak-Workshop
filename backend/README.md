# SimpleAPI

A boilerplate project for a minimal ASP.NET Core API with FastEndpoints.

## Features

- Clean architecture with Core and Web projects
- FastEndpoints for simplified API development
- Swagger UI for API documentation
- In-memory data storage (no database required)

## Getting Started

### Prerequisites

- .NET 8.0 SDK

### Running the Application

```bash
# Navigate to the Web project directory
cd src/SimpleAPI.Web

# Run the application
dotnet run
```

Access the Swagger UI at: `https://localhost:7000/swagger`

## Project Structure

- **SimpleAPI.Core**: Contains the business logic, services, and models
- **SimpleAPI.Web**: The API host project with endpoint configurations

## API Endpoints

- `GET /weatherforecast`: Returns a list of weather forecasts

## Development

### Adding a New Endpoint

1. Create a new endpoint class in the Core project
2. Create corresponding request/response models if needed
3. Register any required services in `ServiceExtensions.cs`

## License

MIT