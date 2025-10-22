import { CurrentWeather } from "@/types/weather";

/**
 * Basic weather card - no styling, just data display
 * Perfect for teaching how to start with data and gradually add styling
 */

interface WeatherCardProps {
  city: string;
  weather: CurrentWeather;
}

export function WeatherCard({ city, weather }: WeatherCardProps) {
  return (
    <div>
      <h2>{city}</h2>
      <p>{weather.temperature}°F</p>
      <p>{weather.condition.description}</p>
      <p>Feels like: {weather.feelsLike}°F</p>
      <p>Humidity: {weather.humidity}%</p>
      <p>Wind: {weather.windSpeed} mph</p>
    </div>
  );
}
