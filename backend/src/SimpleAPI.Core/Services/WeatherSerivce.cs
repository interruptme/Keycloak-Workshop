using SimpleAPI.Core.Model;

namespace SimpleAPI.Core.Services;

public class WeatherService : IWeatherService
{
  private static readonly string[] Summaries = new[]
  {
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", 
    "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
  };

  public Task<WeatherForecast> GetForecastAsync()
  {
    var random = new Random();
    var forecast = new WeatherForecast
    {
      Date = DateOnly.FromDateTime(DateTime.Now),
      TemperatureC = random.Next(-20, 55),
      Summary = Summaries[random.Next(Summaries.Length)]
    };
    return Task.FromResult(forecast);
  }
}