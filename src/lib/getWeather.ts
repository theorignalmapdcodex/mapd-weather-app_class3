import { getDummyWeatherData } from "@/data/weather-data";
import { WeatherData } from "@/types/weather";
import { getCityByName } from "@/data/cities";
import { getWeatherDescription } from "@/types/weather";

/**
 * Get weather data for a city
 *
 * MODIFIED: Now fetches real data from Open-Meteo API
 * Falls back to dummy data if API fails
 */

// ========================================
// OLD CODE - DUMMY DATA (COMMENTED OUT)
// ========================================
// export function getWeatherData(cityName: string): WeatherData | null {
//   return getDummyWeatherData(cityName);
// }

// ========================================
// NEW CODE - OPEN-METEO API INTEGRATION
// ========================================

/**
 * Fetches real weather data from Open-Meteo API
 * 
 * @param cityName - Name of the city to get weather for
 * @returns Promise with WeatherData or null if city not found
 * 
 * API Documentation: https://open-meteo.com/en/docs
 */
export async function getWeatherData(cityName: string): Promise<WeatherData | null> {
  try {
    // Step 1: Get city coordinates from our cities data
    const city = getCityByName(cityName);
    
    if (!city) {
      console.error(`City "${cityName}" not found in cities list`);
      return getDummyWeatherData(cityName); // Fallback to dummy data
    }

    // Step 2: Build Open-Meteo API URL with parameters
    const params = new URLSearchParams({
      latitude: city.latitude.toString(),
      longitude: city.longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      temperature_unit: 'fahrenheit', // Get temps in Fahrenheit
      wind_speed_unit: 'mph', // Get wind speed in mph
      timezone: 'auto', // Automatic timezone detection
      forecast_days: '3', // Get 3-day forecast (must be string)
    });

    const apiUrl = `https://api.open-meteo.com/v1/forecast?${params}`;

    // Step 3: Fetch data from Open-Meteo API
    console.log(`Fetching weather for ${cityName} from Open-Meteo...`);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Step 4: Transform API response to match our WeatherData structure
    const weatherData: WeatherData = {
      city: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
      
      // Current weather data
      current: {
        temperature: Math.round(data.current.temperature_2m), // Round to whole number
        feelsLike: Math.round(data.current.apparent_temperature), // "Feels like" temperature
        humidity: data.current.relative_humidity_2m, // Humidity percentage
        windSpeed: Math.round(data.current.wind_speed_10m), // Wind speed in mph
        condition: {
          code: data.current.weather_code, // WMO weather code
          description: getWeatherDescription(data.current.weather_code), // Human-readable description
        },
      },
      
      // 3-day forecast data
      forecast: data.daily.time.map((date: string, index: number) => ({
        date: date, // ISO date string (YYYY-MM-DD)
        maxTemp: Math.round(data.daily.temperature_2m_max[index]), // High temp
        minTemp: Math.round(data.daily.temperature_2m_min[index]), // Low temp
        condition: {
          code: data.daily.weather_code[index], // WMO weather code
          description: getWeatherDescription(data.daily.weather_code[index]), // Description
        },
      })),
    };

    console.log(`Successfully fetched weather for ${cityName}`);
    return weatherData;

  } catch (error) {
    // If API fails, log error and fallback to dummy data
    console.error(`Error fetching weather data for ${cityName}:`, error);
    console.log(`Falling back to dummy data for ${cityName}`);
    return getDummyWeatherData(cityName);
  }
}