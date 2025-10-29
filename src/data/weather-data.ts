import { WeatherData } from "@/types/weather";

/**
 * Dummy weather data for development and teaching
 *
 * This data structure mimics the format returned by the Open-Meteo API
 * and our weather service layer
 * All temperatures in Fahrenheit, wind speed in mph
 */
export const DUMMY_WEATHER_DATA: Record<string, WeatherData> = {
  // EXISTING CITIES DATA
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
  // NEW: Accra, Ghana weather data
  // Tropical climate - high temperatures (86°F), high humidity (78%), warm all year
  // Includes rain typical of West African coastal weather
  accra: {
    city: "Accra",
    latitude: 5.6037,
    longitude: -0.1870,
    current: {
      temperature: 86, // Hot tropical temperature
      feelsLike: 91, // Higher feels-like due to humidity
      humidity: 78, // High humidity near the coast
      windSpeed: 9, // Moderate coastal breeze
      condition: {
        code: 2,
        description: "Partly cloudy",
      },
    },
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
        maxTemp: 88,
        minTemp: 77,
        condition: {
          code: 61,
          description: "Slight rain", // Common in tropical regions
        },
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Day 2
        maxTemp: 87,
        minTemp: 76,
        condition: {
          code: 3,
          description: "Overcast",
        },
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0], // Day 3
        maxTemp: 85,
        minTemp: 75,
        condition: {
          code: 80,
          description: "Slight rain showers", // Tropical showers
        },
      },
    ],
  },
  // NEW: Lausanne, Switzerland weather data
  // Temperate/Alpine climate - cooler temperatures (52°F), moderate humidity
  // Variable conditions typical of Swiss lakeside location
  lausanne: {
    city: "Lausanne",
    latitude: 46.5197,
    longitude: 6.6323,
    current: {
      temperature: 52, // Cool temperate temperature
      feelsLike: 48, // Feels cooler due to wind/elevation
      humidity: 68, // Moderate humidity
      windSpeed: 8, // Moderate wind from the lake
      condition: {
        code: 3,
        description: "Overcast", // Common in Swiss weather
      },
    },
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
        maxTemp: 55,
        minTemp: 45,
        condition: {
          code: 61,
          description: "Slight rain", // Frequent in alpine regions
        },
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Day 2
        maxTemp: 59,
        minTemp: 48,
        condition: {
          code: 2,
          description: "Partly cloudy",
        },
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0], // Day 3
        maxTemp: 61,
        minTemp: 50,
        condition: {
          code: 1,
          description: "Mainly clear", // Nice weather improving
        },
      },
    ],
  },
  // NEW: Santorini, Greece weather data
  // Mediterranean climate - mild temperatures (68°F), moderate humidity
  // Clear skies typical of Greek islands, with Aegean wind
  santorini: {
    city: "Santorini",
    latitude: 36.3932,
    longitude: 25.4615,
    current: {
      temperature: 68, // Pleasant Mediterranean temperature
      feelsLike: 66, // Comfortable feel
      humidity: 62, // Moderate island humidity
      windSpeed: 12, // Strong Aegean winds typical of the islands
      condition: {
        code: 1,
        description: "Mainly clear", // Typical sunny Greek weather
      },
    },
    forecast: [
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
        maxTemp: 71,
        minTemp: 63,
        condition: {
          code: 0,
          description: "Clear sky", // Beautiful Greek weather
        },
      },
      {
        date: new Date(Date.now() + 172800000).toISOString().split("T")[0], // Day 2
        maxTemp: 73,
        minTemp: 65,
        condition: {
          code: 1,
          description: "Mainly clear",
        },
      },
      {
        date: new Date(Date.now() + 259200000).toISOString().split("T")[0], // Day 3
        maxTemp: 70,
        minTemp: 64,
        condition: {
          code: 2,
          description: "Partly cloudy", // Some clouds rolling in
        },
      },
    ],
  },
};

export function getDummyWeatherData(cityName: string): WeatherData | null {
  const key = cityName.toLowerCase();
  return DUMMY_WEATHER_DATA[key] || null;
}