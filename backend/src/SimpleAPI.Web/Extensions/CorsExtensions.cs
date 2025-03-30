namespace SimpleAPI.Web.Extensions;

public static class CorsExtensions
{
    public static IServiceCollection AddConfiguredCors(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            var allowedOrigins = configuration.GetSection("CORS:AllowedOrigins").Get<string[]>();
            if (allowedOrigins != null && allowedOrigins.Length > 0)
            {
                Console.WriteLine($"Configuring CORS with allowed origins: {string.Join(", ", allowedOrigins)}");
                options.AddDefaultPolicy(policy =>
                {
                    policy.WithOrigins(allowedOrigins)
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            }
            else
            {
                Console.WriteLine("No CORS origins configured, using a permissive development policy");
                // If no origins are configured, add a development fallback
                options.AddDefaultPolicy(policy =>
                {
                    policy.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            }
        });

        return services;
    }
}