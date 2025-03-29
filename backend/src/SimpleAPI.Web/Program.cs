using FastEndpoints;
using FastEndpoints.Swagger;
using SimpleAPI.Core.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add FastEndpoints
builder.Services.AddFastEndpoints()
    .SwaggerDocument();

// Add Core Services
builder.Services.AddCoreServices();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use FastEndpoints
app.UseFastEndpoints()
    .UseSwaggerGen();

app.Run();