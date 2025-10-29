/* eslint-disable @next/next/no-img-element */
import { CITIES } from "@/data/cities";
import { getDummyWeatherData } from "@/data/weather-data";
import Link from "next/link";
import { Cloud, Wind } from "lucide-react"; // MODIFIED: Removed unused icon imports
// NEW: Import centralized WeatherIcon component for consistent icon display
import { WeatherIcon } from "@/components/WeatherIcon";

/**
 * NEW COMPONENT: AllCitiesPage
 * 
 * Displays weather overview for all cities in the dataset
 * Features minimalistic, artistic design with clean cards
 * Each city card is clickable and routes to detailed city weather page
 */

export default function AllCitiesPage() {
  // NEW: Fetch weather data for all cities from the CITIES array
  // Maps through each city and attaches its corresponding weather data
  const citiesWithWeather = CITIES.map((city) => ({
    ...city,
    weather: getDummyWeatherData(city.name),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* NEW: Page Header Section */}
        <div className="mb-12 text-center">
          
          {/* NEW: Logo image above title */}
          <div className="flex justify-center mb-6">
            <img 
              src="/city-images/weather-app_logo.png" 
              alt="Weather App Logo" 
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>

          <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight">
            Weather Overview
          </h1>
          <p className="text-gray-500 text-lg font-light">
            Current conditions across all cities
          </p>
        </div>

        {/* NEW: Cities Grid - Responsive layout (1 col mobile, 2 tablet, 3 desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {citiesWithWeather.map((city) => {
            const weather = city.weather;
            // Skip rendering if weather data is not available for this city
            if (!weather) return null;

            return (
              <Link
                key={city.name}
                href={`/weather/${city.name.toLowerCase()}`} // Routes to individual city detail page
                className="group"
              >
                {/* NEW: City Weather Card - Minimalistic design with hover effects */}
                <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105 cursor-pointer">
                  
                  {/* NEW: City Name and Coordinates */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-light tracking-wide mb-1">
                      {city.name}
                    </h2>
                    {/* Display latitude and longitude with 2 decimal places */}
                    <p className="text-gray-400 text-sm font-light">
                      {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                    </p>
                  </div>

                  {/* NEW: Current Temperature Display with Weather Icon */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      {/* Large temperature display - rounded to whole number */}
                      <div className="text-6xl font-light mb-2">
                        {Math.round(weather.current.temperature)}°
                      </div>
                      {/* "Feels like" temperature for user context */}
                      <div className="text-gray-500 text-sm font-light">
                        Feels like {Math.round(weather.current.feelsLike)}°
                      </div>
                    </div>
                    {/* Weather condition icon on the right */}
                    <div className="text-gray-700 mt-2">
                      <WeatherIcon
                        code={weather.current.condition.code}
                        size={48}
                      />
                    </div>
                  </div>

                  {/* NEW: Weather Condition Description */}
                  <div className="mb-6 pb-6 border-b border-gray-100">
                    <p className="text-gray-600 font-light">
                      {weather.current.condition.description}
                    </p>
                  </div>

                  {/* NEW: Additional Weather Metrics (Wind & Humidity) */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Wind speed display with icon */}
                    <div className="flex items-center gap-2">
                      <Wind size={16} className="text-gray-400" strokeWidth={1.5} />
                      <span className="text-gray-600 font-light">
                        {weather.current.windSpeed} mph
                      </span>
                    </div>
                    {/* Humidity percentage display with icon */}
                    <div className="flex items-center gap-2">
                      <Cloud size={16} className="text-gray-400" strokeWidth={1.5} />
                      <span className="text-gray-600 font-light">
                        {weather.current.humidity}%
                      </span>
                    </div>
                  </div>

                  {/* NEW: 3-Day Forecast Preview */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex gap-4 justify-between">
                      {/* Show first 3 days of forecast */}
                      {weather.forecast.slice(0, 3).map((day, idx) => (
                        <div
                          key={idx}
                          className="text-center flex-1"
                        >
                          {/* Day label - "Tomorrow" for first day, then "+2d", "+3d" */}
                          <div className="text-xs text-gray-400 mb-2 font-light">
                            {idx === 0 ? "Tomorrow" : `+${idx + 1}d`}
                          </div>
                          {/* Weather icon for the forecast day */}
                          <div className="flex justify-center mb-2">
                            <WeatherIcon code={day.condition.code} size={20} />
                          </div>
                          {/* High/Low temperature display */}
                          <div className="text-sm font-light">
                            <span className="text-gray-800">
                              {Math.round(day.maxTemp)}°
                            </span>
                            <span className="text-gray-400 mx-1">/</span>
                            <span className="text-gray-500">
                              {Math.round(day.minTemp)}°
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* NEW: Footer Navigation - Back to Home Link */}
        <div className="mt-12 text-center">
          <Link
            href="/"
            className="text-gray-600 hover:text-gray-900 font-light text-sm transition-colors" // MODIFIED: Changed from gray-500/700 to gray-600/900
          >
            ← Back to Home
          </Link>
        </div>

                {/* NEW: Footer */}
        <footer className="mt-12 text-center pb-8">
          <p className="text-gray-500 text-sm font-light">
            Made with 🖤 by @theoriginalmapd
          </p>
        </footer>

      </div>
    </div>
  );
}