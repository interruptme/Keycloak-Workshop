using SimpleAPI.Core.Model;

namespace SimpleAPI.Core.Services;

public interface IWeatherService
{
  Task<List<WeatherForecast>> GetForecastsAsync();
  Task<WeatherForecast?> GetForecastByIdAsync(Guid id);
}