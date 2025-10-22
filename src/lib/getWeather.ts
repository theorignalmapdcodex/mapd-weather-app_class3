import { getDummyWeatherData } from "@/data/weather-data";
import { WeatherData } from "@/types/weather";

/**
 * Get weather data for a city
 *
 * Simple function that returns dummy data for illustration purposes
 */
export function getWeatherData(cityName: string): WeatherData | null {
  return getDummyWeatherData(cityName);
}
