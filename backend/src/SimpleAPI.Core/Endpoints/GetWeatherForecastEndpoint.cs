using FastEndpoints;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using SimpleAPI.Core.Model;
using SimpleAPI.Core.Services;

namespace SimpleAPI.Core.Endpoints;

public class GetWeatherForecastResponse
{
  public WeatherForecast Forecast { get; set; } = new();
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
    Get("/weather");
    AllowAnonymous();
  }

  public override async Task HandleAsync(CancellationToken cancellationToken = default)
  {
    var forecast = await _weatherService.GetForecastAsync();
    
    await SendAsync(new GetWeatherForecastResponse
    {
      Forecast = forecast
    }, cancellation: cancellationToken);
  }
}