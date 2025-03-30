using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;

namespace SimpleAPI.Web.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection AddSwaggerWithJwt(this IServiceCollection services)
    {
        // Add Swagger generator
        services.AddSwaggerGen(options =>
        {
            // Define the security scheme
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below. Example: 'Bearer 12345abcdef'",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer"
            });

            // Make sure Swagger UI requires a Bearer token
            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        Scheme = "oauth2",
                        Name = "Bearer",
                        In = ParameterLocation.Header
                    },
                    new string[] {}
                }
            });
            
            // Add additional customizations as needed
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Simple API with JWT Authentication",
                Version = "v1",
                Description = "An API secured with Keycloak JWT authentication"
            });
        });
        
        return services;
    }
}