import { WeatherData, HourlyForecast, DailyForecast, PollenData, getWeatherDescription } from "@/types/weather";
import { getCityByName } from "@/data/cities";

export async function getWeatherData(cityName: string): Promise<WeatherData | null> {
  try {
    const city = getCityByName(cityName);
    if (!city) return null;
    return await getWeatherByCoordinates(city.name, city.latitude, city.longitude);
  } catch (error) {
    console.error(`Error fetching weather for ${cityName}:`, error);
    return null;
  }
}

async function fetchPollen(lat: number, lon: number): Promise<PollenData> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'birch_pollen,grass_pollen,ragweed_pollen',
      timezone: 'auto',
      forecast_days: '1',
    });
    const r = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
    if (!r.ok) return {};
    const d = await r.json();
    const idx = new Date().getHours();
    return {
      tree: d.hourly?.birch_pollen?.[idx] ?? undefined,
      grass: d.hourly?.grass_pollen?.[idx] ?? undefined,
      weed: d.hourly?.ragweed_pollen?.[idx] ?? undefined,
    };
  } catch {
    return {};
  }
}

export async function getWeatherByCoordinates(
  cityName: string,
  latitude: number,
  longitude: number
): Promise<WeatherData | null> {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
        'weather_code', 'wind_speed_10m', 'wind_direction_10m',
        'uv_index', 'dew_point_2m', 'surface_pressure', 'visibility',
      ].join(','),
      hourly: 'temperature_2m,precipitation_probability,weather_code',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      timezone: 'auto',
      forecast_days: '7',
    });

    const [response, pollen] = await Promise.all([
      fetch(`https://api.open-meteo.com/v1/forecast?${params}`),
      fetchPollen(latitude, longitude),
    ]);

    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();

    const hourly: HourlyForecast[] = data.hourly.time.map((t: string, i: number) => ({
      time: t,
      temperature: Math.round(data.hourly.temperature_2m[i]),
      precipProbability: data.hourly.precipitation_probability[i] ?? 0,
      weatherCode: data.hourly.weather_code[i],
      condition: {
        code: data.hourly.weather_code[i],
        description: getWeatherDescription(data.hourly.weather_code[i]),
      },
    }));

    const forecast: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
      date,
      maxTemp: Math.round(data.daily.temperature_2m_max[i]),
      minTemp: Math.round(data.daily.temperature_2m_min[i]),
      precipProbability: data.daily.precipitation_probability_max[i] ?? 0,
      condition: {
        code: data.daily.weather_code[i],
        description: getWeatherDescription(data.daily.weather_code[i]),
      },
    }));

    return {
      city: cityName,
      latitude,
      longitude,
      timezone: data.timezone,
      current: {
        temperature: Math.round(data.current.temperature_2m),
        feelsLike: Math.round(data.current.apparent_temperature),
        humidity: data.current.relative_humidity_2m,
        windSpeed: Math.round(data.current.wind_speed_10m),
        windDirection: data.current.wind_direction_10m,
        uvIndex: data.current.uv_index,
        dewPoint: Math.round(data.current.dew_point_2m),
        pressure: Math.round(data.current.surface_pressure),
        visibility: data.current.visibility,
        condition: {
          code: data.current.weather_code,
          description: getWeatherDescription(data.current.weather_code),
        },
      },
      forecast,
      hourly,
      sunrise: data.daily.sunrise?.[0],
      sunset: data.daily.sunset?.[0],
      pollen,
    };
  } catch (error) {
    console.error(`Error fetching weather for ${cityName}:`, error);
    return null;
  }
}
