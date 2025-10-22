"use client";

import { useEffect, useState } from "react";
import { LocationSearch } from "@/components/LocationSearch";
import { LoadingState } from "@/components/LoadingState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { PageHeader } from "@/components/PageHeader";
import { getWeatherData } from "@/lib/getWeather";
import { WeatherData } from "@/types/weather";

// Default city to display on load
const DEFAULT_CITY = "Durham";

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load default city weather on mount
    loadCityWeather(DEFAULT_CITY);
  }, []);

  const loadCityWeather = (cityName: string) => {
    setLoading(true);
    setError("");

    const data = getWeatherData(cityName);

    if (data) {
      setWeather(data);
    } else {
      setError(`Failed to load weather data for ${cityName}`);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <main className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <PageHeader
          title="Weather App"
          subtitle="Simple weather forecast for your city"
        />

        {/* Search at the top */}
        <div className="flex flex-col items-center">
          <LocationSearch onCitySelect={loadCityWeather} />
        </div>

        {/* Weather display */}
        {loading && <LoadingState />}
        {error && <ErrorMessage message={error} />}
        {weather && !loading && <WeatherDisplay weather={weather} />}
      </main>
    </div>
  );
}
