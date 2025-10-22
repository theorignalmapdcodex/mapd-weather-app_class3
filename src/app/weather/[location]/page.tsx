import { notFound } from "next/navigation";
import { getWeatherData } from "@/lib/getWeather";
import { CITIES } from "@/data/cities";
import { CurrentWeatherDetail } from "@/components/CurrentWeatherDetail";
import { ForecastCard } from "@/components/ForecastCard";
import { Button } from "@/components/ui/Button";

/**
 * Detailed Weather Page
 *
 * Dynamic route that displays comprehensive weather information
 * for a specific city including current conditions and forecast
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
  const weather = getWeatherData(cityName);

  if (!weather) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <main className="max-w-4xl mx-auto space-y-8">
        {/* Header with back button */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
            {weather.city}
          </h1>
          <Button href="/" variant="ghost">
            ← Back to Home
          </Button>
        </div>

        {/* Current weather - Large display */}
        <CurrentWeatherDetail
          current={weather.current}
          latitude={weather.latitude}
          longitude={weather.longitude}
        />

        {/* 3-Day Forecast */}
        <ForecastCard forecast={weather.forecast} />

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <Button href="/" variant="default">
            Search Another City
          </Button>
        </div>
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
