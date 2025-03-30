using FastEndpoints;
using FastEndpoints.Swagger;
using SimpleAPI.Core.Extensions;
using SimpleAPI.Web.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerWithJwt();
builder.Services.AddConfiguredCors(builder.Configuration);

// Add Core Services
builder.Services.AddCoreServices();

// Add bearer token authentication
builder.Services.AddKeycloakAuthentication(builder.Configuration, builder.Environment);

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