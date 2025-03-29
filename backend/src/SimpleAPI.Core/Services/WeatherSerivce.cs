using SimpleAPI.Core.Model;

namespace SimpleAPI.Core.Services;

public class WeatherService : IWeatherService
{
  private static readonly string[] Summaries = new[]
  {
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", 
    "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
  };

  private static readonly List<WeatherForecast> _forecasts = new();

  public WeatherService()
  {
    // Initialize with some data if empty
    if (!_forecasts.Any())
    {
      var rng = new Random();
      _forecasts.AddRange(Enumerable.Range(1, 5).Select(index => new WeatherForecast
      {
        Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
        TemperatureC = rng.Next(-20, 55),
        Summary = Summaries[rng.Next(Summaries.Length)]
      }));
    }
  }

  public Task<List<WeatherForecast>> GetForecastsAsync()
  {
    return Task.FromResult(_forecasts);
  }

  public Task<WeatherForecast?> GetForecastByIdAsync(Guid id)
  {
    return Task.FromResult(_forecasts.FirstOrDefault(f => f.Id == id));
  }
}