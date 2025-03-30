namespace SimpleAPI.Core.Model;

public class WeatherForecast
{
  public static readonly string[] Summaries = new[]
  {
    "Freezing", "Cold", 
    "Cool", "Cloudy", "Windy", 
    "Warm", "Hot", "Sunny", "Rainy"
  };
  public DateOnly Date { get; set; }
  public int TemperatureC { get; set; }
  public string Summary { get; set; } = string.Empty;
}