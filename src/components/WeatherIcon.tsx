/**
 * Maps weather codes to appropriate emoji icons
 * Simple visual representation of weather conditions
 */

interface WeatherIconProps {
  code: number;
  size?: "sm" | "md" | "lg" | "xl";
}

export function WeatherIcon({ code, size = "md" }: WeatherIconProps) {
  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
    xl: "text-8xl",
  };

  const getIcon = (code: number): string => {
    // Clear
    if (code === 0) return "☀️";
    if (code === 1) return "🌤️";
    if (code === 2) return "⛅";
    if (code === 3) return "☁️";

    // Fog
    if (code === 45 || code === 48) return "🌫️";

    // Drizzle
    if (code >= 51 && code <= 55) return "🌦️";

    // Rain
    if (code >= 61 && code <= 65) return "🌧️";
    if (code >= 80 && code <= 82) return "🌧️";

    // Snow
    if (code >= 71 && code <= 77) return "🌨️";
    if (code >= 85 && code <= 86) return "🌨️";

    // Thunderstorm
    if (code >= 95 && code <= 99) return "⛈️";

    return "🌡️"; // Default
  };

  return (
    <span className={sizeClasses[size]} role="img" aria-label="weather icon">
      {getIcon(code)}
    </span>
  );
}
