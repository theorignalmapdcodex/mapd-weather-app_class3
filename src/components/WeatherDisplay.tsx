import { WeatherCard } from "./WeatherCard";
import { Button } from "./ui/Button";
import { WeatherData } from "@/types/weather";

/**
 * Displays weather information with a link to detailed forecast
 */

interface WeatherDisplayProps {
  weather: WeatherData;
}

export function WeatherDisplay({ weather }: WeatherDisplayProps) {
  return (
    <div className="flex flex-col items-center space-y-6">
      <WeatherCard city={weather.city} weather={weather.current} />

      {/* Link to detailed weather */}
      <Button href={`/weather/${weather.city.toLowerCase()}`} variant="default">
        View Detailed Forecast
      </Button>
    </div>
  );
}
