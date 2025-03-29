using Microsoft.Extensions.DependencyInjection;
using SimpleAPI.Core.Services;

namespace SimpleAPI.Core.Extensions;

public static class ServiceExtensions
{
  public static IServiceCollection AddCoreServices(this IServiceCollection services)
  {
    services.AddSingleton<IWeatherService, WeatherService>();
    return services;
  }
}