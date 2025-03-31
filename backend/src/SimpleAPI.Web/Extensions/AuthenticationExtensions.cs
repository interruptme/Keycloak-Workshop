using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace SimpleAPI.Web.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddKeycloakAuthentication(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
    {
        // Get Keycloak settings from configuration
        var keycloakUrl = configuration["Keycloak:BaseUrl"];
        var realm = configuration["Keycloak:Realm"];

        if (string.IsNullOrEmpty(keycloakUrl) || string.IsNullOrEmpty(realm))
        {
            throw new InvalidOperationException("Keycloak configuration is missing. Please check your appsettings.json file.");
        }

        Console.WriteLine($"Configuring Keycloak authentication with URL: {keycloakUrl}, Realm: {realm}");
        
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            // Keycloak OIDC configuration endpoint
            options.Authority = $"{keycloakUrl}/realms/{realm}";
            
            // The audience is the client ID of this backend in Keycloak
            options.Audience = "backend-client";
            
            // Only disable HTTPS requirement in Development environment
            options.RequireHttpsMetadata = !environment.IsDevelopment();
            
            // Configure token validation parameters
            var validIssuers = new[]
            {
                $"{keycloakUrl}/realms/{realm}",
            };
            if (environment.IsDevelopment())
            {
                // Convert to list, add new item, convert back to array
                validIssuers = validIssuers.Concat(new[] { $"http://localhost:8080/realms/{realm}" }).ToArray();
                Console.WriteLine("Development environment detected. Added localhost issuer.");
            }
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuers = validIssuers,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
            };
            
            // Configure events for debugging
            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = context =>
                {
                    Console.WriteLine("Authentication failed: " + context.Exception.Message);
                    return Task.CompletedTask;
                },
                OnTokenValidated = context =>
                {
                    Console.WriteLine("Token validated successfully");
                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization();

        return services;
    }
}