import { CurrentWeather } from "@/types/weather";
import { WeatherIcon } from "./WeatherIcon";

interface CurrentWeatherDetailProps {
  current: CurrentWeather;
  latitude: number;
  longitude: number;
}

export function CurrentWeatherDetail({
  current,
  latitude,
  longitude,
}: CurrentWeatherDetailProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8 border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
        Current Weather
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left side - Main weather */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <WeatherIcon code={current.condition.code} size="xl" />
          <div className="text-center">
            <div className="text-6xl font-bold text-zinc-900 dark:text-white">
              {current.temperature}°F
            </div>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mt-2">
              {current.condition.description}
            </p>
          </div>
        </div>

        {/* Right side - Details grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Feels like
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
              {current.feelsLike}°F
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-500">Humidity</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
              {current.humidity}%
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Wind Speed
            </p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
              {current.windSpeed} mph
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-500">Location</p>
            <p className="text-xs font-semibold text-zinc-900 dark:text-white mt-1">
              {latitude.toFixed(2)}°N, {longitude.toFixed(2)}°E
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
