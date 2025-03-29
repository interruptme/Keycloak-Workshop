namespace SimpleAPI.Core.Model;

public class WeatherForecast
{
  public Guid Id { get; set; } = Guid.NewGuid();
  public DateOnly Date { get; set; }
  public int TemperatureC { get; set; }
  public string Summary { get; set; } = string.Empty;
}