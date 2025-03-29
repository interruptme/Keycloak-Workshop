using FastEndpoints;
using Microsoft.AspNetCore.Http;
using SimpleAPI.Core.Model;
using SimpleAPI.Core.Services;

namespace SimpleAPI.Core.Endpoints;

public class GetWeatherForecastResponse
{
  public List<WeatherForecast> Forecasts { get; set; } = new();
}

internal class GetWeatherForecastEndpoint : 
  EndpointWithoutRequest<GetWeatherForecastResponse>
{
  private readonly IWeatherService _weatherService;

  public GetWeatherForecastEndpoint(IWeatherService weatherService)
  {
    _weatherService = weatherService;
  }

  public override void Configure()
  {
    Get("/weatherforecast");
    AllowAnonymous();
    Description(d => d
      .WithTags("Weather").
      Produces<List<WeatherForecast>>(StatusCodes.Status200OK));
  }

  public override async Task HandleAsync(CancellationToken cancellationToken = default)
  {
    var forecasts = await _weatherService.GetForecastsAsync();
    
    await SendAsync(new GetWeatherForecastResponse
    {
      Forecasts = forecasts
    }, cancellation: cancellationToken);
  }
}