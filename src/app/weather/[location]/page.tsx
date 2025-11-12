/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from "next/navigation";
import { getWeatherData } from "@/lib/getWeather";
import { CITIES } from "@/data/cities";
import { CurrentWeatherDetail } from "@/components/CurrentWeatherDetail";
import { ForecastCard } from "@/components/ForecastCard";
import { Button } from "@/components/ui/Button";
// NEW: Import icons for minimalistic weather display
import { Wind, Droplets, Cloud, Search, MapPin } from "lucide-react"; // MODIFIED: Added Search and MapPin icons
// NEW: Import centralized WeatherIcon component for consistent icon display across pages
import { WeatherIcon } from "@/components/WeatherIcon";

/**
 * Detailed Weather Page
 *
 * Dynamic route that displays comprehensive weather information
 * for a specific city including current conditions and forecast
 * MODIFIED: Updated with minimalistic, artistic theme to match All Cities page
 */

interface PageProps {
  params: Promise<{
    location: string;
  }>;
}

export default async function WeatherDetailPage({ params }: PageProps) {
  const { location } = await params;
  const cityName = decodeURIComponent(location);

  // Validate city exists in our list
  const cityExists = CITIES.some(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );

  if (!cityExists) {
    notFound();
  }

  // Fetch weather data
  const weather = await getWeatherData(cityName);

  if (!weather) {
    return (
      // MODIFIED: Updated error state styling to match minimalistic theme
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="text-center space-y-4 bg-white rounded-3xl p-12 shadow-sm">
          <h1 className="text-3xl font-light text-gray-900">
            Weather data unavailable
          </h1>
          <Button href="/" variant="default">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    // MODIFIED: Changed background to match All Cities gradient theme
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-12">
      <main className="max-w-5xl mx-auto space-y-8">
        
        {/* MODIFIED: Updated header with minimalistic styling */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl md:text-6xl font-light tracking-tight text-gray-900 mb-2">
              {weather.city}
            </h1>
            {/* NEW: Added coordinates display matching All Cities style */}
            <p className="text-gray-400 text-sm font-light">
              {weather.latitude.toFixed(2)}°, {weather.longitude.toFixed(2)}°
            </p>
          </div>
          {/* MODIFIED: Updated back button styling */}
          <Button href="/" variant="ghost" className="font-light">
            ← Back
          </Button>
        </div>

        {/* NEW: Current Weather Card - Minimalistic design matching All Cities page */}
        <div className="bg-white rounded-3xl p-10 md:p-12 shadow-sm border border-gray-100">
          
          {/* NEW: Current temperature display with icon */}
          <div className="flex items-start justify-between mb-10">
            <div>
              {/* Large temperature display */}
              <div className="text-8xl md:text-9xl font-light mb-3 text-gray-900">
                {Math.round(weather.current.temperature)}°
              </div>
              {/* Feels like temperature */}
              <div className="text-gray-500 text-xl font-light mb-4">
                Feels like {Math.round(weather.current.feelsLike)}°
              </div>
              {/* Weather condition description */}
              <div className="text-2xl text-gray-700 font-light">
                {weather.current.condition.description}
              </div>
            </div>
            {/* Weather icon on the right */}
            <div className="mt-4">
              <WeatherIcon code={weather.current.condition.code} size={80} />
            </div>
          </div>

          {/* NEW: Weather metrics grid - minimalistic style */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-gray-100">
            
            {/* Wind speed metric */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Wind size={20} strokeWidth={1.5} />
                <span className="text-sm font-light uppercase tracking-wide">Wind</span>
              </div>
              <div className="text-3xl font-light text-gray-900">
                {weather.current.windSpeed} <span className="text-xl text-gray-500">mph</span>
              </div>
            </div>

            {/* Humidity metric */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Droplets size={20} strokeWidth={1.5} />
                <span className="text-sm font-light uppercase tracking-wide">Humidity</span>
              </div>
              <div className="text-3xl font-light text-gray-900">
                {weather.current.humidity}<span className="text-xl text-gray-500">%</span>
              </div>
            </div>

            {/* Condition code (for reference) */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Cloud size={20} strokeWidth={1.5} />
                <span className="text-sm font-light uppercase tracking-wide">Condition</span>
              </div>
              <div className="text-3xl font-light text-gray-900">
                {weather.current.condition.code}
              </div>
            </div>

          </div>
        </div>

        {/* NEW: 3-Day Forecast - Minimalistic card design */}
        <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100">
          <h2 className="text-3xl font-light mb-8 text-gray-900">3-Day Forecast</h2>
          
          {/* Forecast grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weather.forecast.map((day, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                {/* Day label */}
                <div className="text-sm font-light text-gray-500 mb-4 uppercase tracking-wide">
                  {idx === 0 ? "Tomorrow" : new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                </div>
                
                {/* Weather icon centered */}
                <div className="flex justify-center mb-4">
                  <WeatherIcon code={day.condition.code} size={48} />
                </div>

                {/* Condition description */}
                <div className="text-center text-gray-700 font-light mb-4">
                  {day.condition.description}
                </div>

                {/* Temperature range */}
                <div className="text-center">
                  <span className="text-3xl font-light text-gray-900">
                    {Math.round(day.maxTemp)}°
                  </span>
                  <span className="text-gray-400 mx-2 text-xl">/</span>
                  <span className="text-2xl font-light text-gray-500">
                    {Math.round(day.minTemp)}°
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODIFIED: Updated action buttons with icons and minimalistic styling */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          {/* NEW: Search Another City button with icon */}
          <Button 
            href="/" 
            variant="default" 
            className="font-light px-8 py-4"
            icon={<Search size={18} strokeWidth={2} />}
            iconPosition="left"
          >
            Search Another City
          </Button>
          {/* NEW: View All Cities button with icon */}
          <Button 
            href="/weather/all-cities" 
            variant="default" 
            className="font-light px-8 py-4"
            icon={<MapPin size={18} strokeWidth={2} />}
            iconPosition="left"
          >
            View All Cities
          </Button>
        </div>

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

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { location } = await params;
  const cityName = decodeURIComponent(location);

  return {
    title: `${cityName} Weather - Weather App`,
    description: `Detailed weather forecast for ${cityName}`,
  };
}