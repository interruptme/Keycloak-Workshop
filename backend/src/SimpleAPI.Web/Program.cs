using FastEndpoints;
using FastEndpoints.Security;
using FastEndpoints.Swagger;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SimpleAPI.Core.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("CORS:AllowedOrigins").Get<string[]>();
    if(allowedOrigins!= null && allowedOrigins.Length > 0)
    {
        Console.Out.WriteLine($"Allowed Origins: {string.Join(", ", allowedOrigins)}");
        options.AddDefaultPolicy( policy =>
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyMethod()
                .AllowAnyHeader();
        });
    }
});

// Add Core Services
builder.Services.AddCoreServices();

// Add bearer token authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    // Get the Keycloak settings from configuration
    var keycloakUrl = builder.Configuration["Keycloak:BaseUrl"];
    var realm = builder.Configuration["Keycloak:Realm"];
    
    // Keycloak OIDC configuration endpoint
    options.Authority = $"{keycloakUrl}/realms/{realm}";
    
    // The audience is the client ID of this backend in Keycloak
    options.Audience = "backend-client";
    
    // Validate token parameters
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
    };

    // Disable HTTPS requirement for development:
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    
    // Configure events for debugging
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            context.Response.StatusCode = 401;
            context.Response.ContentType = "text/plain";
            context.Response.WriteAsync($"Authentication failed: {context.Exception.Message}").Wait();
            return Task.CompletedTask;
        }
    };
});
builder.Services.AddAuthorization();

// Add FastEndpoints
builder.Services
  .SwaggerDocument()
  .AddFastEndpoints();

var app = builder.Build();

// Log the current environment
app.Logger.LogInformation("Current environment: {Environment}", app.Environment.EnvironmentName);

app.UseCors();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// Use FastEndpoints
app.UseFastEndpoints();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseSwaggerGen();
}

app.Run();