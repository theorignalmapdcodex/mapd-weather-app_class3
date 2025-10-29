/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { LocationSearch } from "@/components/LocationSearch";
import { LoadingState } from "@/components/LoadingState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { PageHeader } from "@/components/PageHeader";
import { getWeatherData } from "@/lib/getWeather";
import { WeatherData } from "@/types/weather";
// NEW: Import Search icon for visual enhancement
import { Search } from "lucide-react";

// Default city to display on load
const DEFAULT_CITY = "Durham";

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load default city weather on mount
    // eslint-disable-next-line
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
    // MODIFIED: Updated background to match minimalistic gradient theme
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <main className="w-full max-w-2xl space-y-8">
        
        {/* MODIFIED: Updated header styling for minimalistic theme */}
        <div className="text-center mb-8">
          {/* NEW: Logo image above title */}
          <div className="flex justify-center mb-6">
            <img 
              src="/city-images/weather-app_logo.png" 
              alt="Weather App Logo" 
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight text-gray-900">
            Weather App
          </h1>
          <p className="text-gray-500 text-lg font-light">
            Simple weather forecast for your city
          </p>
        </div>

        {/* MODIFIED: Search section with enhanced styling */}
        <div className="flex flex-col items-center">
          {/* NEW: Search instruction with icon */}
          <div className="flex items-center gap-2 mb-4 text-gray-600">
            <Search size={18} strokeWidth={1.5} className="text-gray-400" />
            <p className="text-sm font-light">Select a city to view weather</p>
          </div>
          
          {/* Location search dropdown */}
          <LocationSearch onCitySelect={loadCityWeather} />
        </div>

        {/* Weather display with loading and error states */}
        {loading && <LoadingState />}
        {error && <ErrorMessage message={error} />}
        {weather && !loading && <WeatherDisplay weather={weather} />}

        {/* NEW: Footer */}
        <footer className="mt-12 text-center pb-8">
          <p className="text-gray-500 text-sm font-light">
            Made with 🖤 by @theoriginalmapd
          </p>
        </footer>

      </main>
    </div>
  );
}