using FastEndpoints;
using FastEndpoints.Swagger;
using SimpleAPI.Core.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    if (builder.Environment.IsDevelopment())
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
    }
});

// Add FastEndpoints
builder.Services.AddFastEndpoints().SwaggerDocument();

// Add Core Services
builder.Services.AddCoreServices();

var app = builder.Build();

// Log the current environment
app.Logger.LogInformation("Current environment: {Environment}", 
    app.Environment.EnvironmentName);

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// CORS middleware should be before routing
app.UseCors();

app.UseHttpsRedirection();

// Use FastEndpoints
app.UseFastEndpoints().UseSwaggerGen();

app.Run();