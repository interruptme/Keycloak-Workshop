using SimpleAPI.Core.Model;

namespace SimpleAPI.Core.Services;

public interface IWeatherService
{
  Task<WeatherForecast> GetForecastAsync();
}