/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { WeatherCard } from "./WeatherCard";
import { Button } from "./ui/Button";
import { WeatherData } from "@/types/weather";
// NEW: Import CityPictureCard component for visual city representation
import { CityPictureCard } from "./CityPictureCard";
// NEW: Import WeatherIcon for consistent weather display
import { WeatherIcon } from "./WeatherIcon";
// NEW: Import icons for buttons and weather metrics
import { Eye, MapPin, Wind, Droplets } from "lucide-react";
// NEW: Import temperature context for unit conversion
import { useTemperature } from "@/contexts/TemperatureContext";

/**
 * Displays weather information with links to detailed forecast and all cities
 * MODIFIED: Complete redesign with minimalistic theme matching All Cities and location pages
 * MODIFIED: Added CityPictureCard for visual engagement
 */

interface WeatherDisplayProps {
  weather: WeatherData;
}

export function WeatherDisplay({ weather }: WeatherDisplayProps) {
  const { convertTemp, getUnitSymbol } = useTemperature();

  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      
      {/* NEW: City Picture Card - Visual representation of the city */}
      <CityPictureCard cityName={weather.city} className="mb-4" />

      {/* NEW: Main weather card with minimalistic design */}
      <div className="w-full bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        
        {/* NEW: City name with coordinates */}
        <div className="mb-6">
          <h2 className="text-3xl font-light tracking-wide text-gray-900 dark:text-white mb-2">
            {weather.city}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-light">
            {weather.latitude.toFixed(2)}°, {weather.longitude.toFixed(2)}°
          </p>
        </div>

        {/* NEW: Current temperature and weather icon */}
        <div className="flex items-start justify-between mb-8">
          <div>
            {/* Large temperature display */}
            <div className="text-7xl md:text-8xl font-light text-gray-900 dark:text-white mb-2">
              {Math.round(convertTemp(weather.current.temperature))}{getUnitSymbol()}
            </div>
            {/* Feels like temperature */}
            <div className="text-gray-700 dark:text-gray-300 text-lg font-light mb-3">
              Feels like {Math.round(convertTemp(weather.current.feelsLike))}{getUnitSymbol()}
            </div>
            {/* Weather condition description */}
            <div className="text-xl text-gray-700 dark:text-gray-300 font-light">
              {weather.current.condition.description}
            </div>
          </div>
          {/* Weather icon */}
          <div className="mt-2">
            <WeatherIcon code={weather.current.condition.code} size={72} />
          </div>
        </div>

        {/* NEW: Weather metrics grid */}
        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          {/* Wind speed */}
          <div className="flex items-center gap-3">
            <Wind size={24} className="text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-1">
                Wind
              </p>
              <p className="text-2xl font-light text-gray-900 dark:text-white">
                {weather.current.windSpeed} <span className="text-lg text-gray-700 dark:text-gray-300">mph</span>
              </p>
            </div>
          </div>

          {/* Humidity */}
          <div className="flex items-center gap-3">
            <Droplets size={24} className="text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-light uppercase tracking-wide mb-1">
                Humidity
              </p>
              <p className="text-2xl font-light text-gray-900 dark:text-white">
                {weather.current.humidity}<span className="text-lg text-gray-700 dark:text-gray-300">%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODIFIED: Navigation buttons with icons - responsive layout */}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        
        {/* NEW: View Detailed Forecast button with icon */}
        <Button 
          href={`/weather/${weather.city.toLowerCase()}`} 
          variant="default"
          className="flex-1 font-light"
          icon={<Eye size={18} strokeWidth={2} />}
          iconPosition="left"
        >
          View Detailed Forecast
        </Button>

        {/* NEW: View All Cities button with icon */}
        <Button 
          href="/weather/all-cities"
          variant="default"
          className="flex-1 font-light"
          icon={<MapPin size={18} strokeWidth={2} />}
          iconPosition="left"
        >
          View All Cities
        </Button>
      </div>
    </div>
  );
}