export interface WeatherCondition {
  code: number;
  description: string;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number;   // degrees 0-360
  uvIndex?: number;
  dewPoint?: number;
  pressure?: number;        // hPa
  visibility?: number;      // meters
  condition: WeatherCondition;
}

export interface PollenData {
  tree?: number;   // grains/m³
  grass?: number;
  weed?: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  precipProbability: number;
  weatherCode: number;
  condition: WeatherCondition;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: WeatherCondition;
  precipProbability: number;
}

export interface WeatherData {
  city: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: CurrentWeather;
  forecast: DailyForecast[];
  hourly?: HourlyForecast[];
  sunrise?: string;
  sunset?: string;
  pollen?: PollenData;
}

export const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

export function getWeatherDescription(code: number): string {
  return WEATHER_CODES[code] || "Unknown";
}
