import { WeatherData } from "@/types/weather";

/**
 * Dummy weather data for development and teaching
 *
 * This data structure mimics the format returned by the Open-Meteo API
 * and our weather service layer
 * All temperatures in Fahrenheit, wind speed in mph
 */
export const DUMMY_WEATHER_DATA: Record<string, WeatherData> = {
  durham: {
    city: "Durham",
    latitude: 35.9940,
    longitude: -78.8986,
    current: {
      temperature: 64,
      feelsLike: 61,
      humidity: 65,
      windSpeed: 7,
      condition: {
        code: 2,
        description: "Partly cloudy",
      },
    },
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        maxTemp: 72,
        minTemp: 57,
        condition: {
          code: 1,
          description: "Mainly clear",
        },
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        maxTemp: 75,
        minTemp: 61,
        condition: {
          code: 0,
          description: "Clear sky",
        },
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        maxTemp: 68,
        minTemp: 59,
        condition: {
          code: 61,
          description: "Slight rain",
        },
      },
    ],
  },
  "new york": {
    city: "New York",
    latitude: 40.7128,
    longitude: -74.0060,
    current: {
      temperature: 59,
      feelsLike: 55,
      humidity: 72,
      windSpeed: 11,
      condition: {
        code: 3,
        description: "Overcast",
      },
    },
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        maxTemp: 63,
        minTemp: 54,
        condition: {
          code: 61,
          description: "Slight rain",
        },
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        maxTemp: 66,
        minTemp: 55,
        condition: {
          code: 2,
          description: "Partly cloudy",
        },
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        maxTemp: 70,
        minTemp: 57,
        condition: {
          code: 1,
          description: "Mainly clear",
        },
      },
    ],
  },
  tokyo: {
    city: "Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
    current: {
      temperature: 72,
      feelsLike: 70,
      humidity: 58,
      windSpeed: 5,
      condition: {
        code: 1,
        description: "Mainly clear",
      },
    },
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        maxTemp: 77,
        minTemp: 66,
        condition: {
          code: 0,
          description: "Clear sky",
        },
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
        maxTemp: 79,
        minTemp: 68,
        condition: {
          code: 2,
          description: "Partly cloudy",
        },
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
        maxTemp: 73,
        minTemp: 64,
        condition: {
          code: 63,
          description: "Moderate rain",
        },
      },
    ],
  },
};

export function getDummyWeatherData(cityName: string): WeatherData | null {
  const key = cityName.toLowerCase();
  return DUMMY_WEATHER_DATA[key] || null;
}
