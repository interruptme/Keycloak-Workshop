using SimpleAPI.Core.Model;

namespace SimpleAPI.Core.Services;

public class WeatherService : IWeatherService
{
  public Task<WeatherForecast> GetForecastAsync()
  {
    var random = new Random();
    var forecast = new WeatherForecast
    {
      Date = DateOnly.FromDateTime(DateTime.Now),
      TemperatureC = random.Next(-20, 55),
      Summary = WeatherForecast.Summaries[random.Next(WeatherForecast.Summaries.Length)]
    };
    return Task.FromResult(forecast);
  }
}