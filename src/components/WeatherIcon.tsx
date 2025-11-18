/**
 * Maps weather codes to appropriate weather icons
 * MODIFIED: Updated to use lucide-react icons instead of emojis for minimalistic theme
 * Used in: All Cities page and location-specific weather pages
 */

// NEW: Import lucide-react icons for minimalistic design
import { Cloud, CloudRain, Sun, CloudFog, CloudSnow, CloudDrizzle, CloudLightning } from "lucide-react";

interface WeatherIconProps {
  code: number;
  size?: number; // MODIFIED: Changed from preset sizes to flexible pixel size
  className?: string; // NEW: Added className prop for additional styling
}

// MODIFIED: Updated to use lucide-react icons with thin stroke weights for minimalistic aesthetic and colorful icons
export function WeatherIcon({ code, size = 32, className = "" }: WeatherIconProps) {
  // Base props for all icons
  const baseProps = {
    size,
    strokeWidth: 1.5, // Thin strokes for elegant, minimal design
  };

  // Helper function to determine which icon to render based on weather code
  const getIcon = (code: number) => {
    // Merge className with default color classes - className first so colors can override
    const mergeClasses = (defaultColor: string) => {
      // Remove any text-color classes from className to prevent conflicts
      const filteredClassName = className.replace(/text-\w+-\d+/g, '').trim();
      return `${defaultColor} ${filteredClassName}`;
    };

    // Clear sky (code 0) - Bright yellow/amber for sunny
    if (code === 0) return <Sun {...baseProps} className={mergeClasses("text-yellow-400")} />;

    // Mainly clear (code 1) - Lighter yellow for mostly sunny
    if (code === 1) return <Sun {...baseProps} className={mergeClasses("text-yellow-300")} />;

    // Partly cloudy (code 2) - Light gray for clouds
    if (code === 2) return <Cloud {...baseProps} className={mergeClasses("text-gray-400")} />;

    // Overcast (code 3) - Darker gray for heavy clouds
    if (code === 3) return <Cloud {...baseProps} className={mergeClasses("text-gray-500")} />;

    // Fog (codes 45, 48) - Lighter gray for fog
    if (code === 45 || code === 48) return <CloudFog {...baseProps} className={mergeClasses("text-gray-300")} />;

    // Drizzle (codes 51-55) - Light blue for light rain
    if (code >= 51 && code <= 55) return <CloudDrizzle {...baseProps} className={mergeClasses("text-blue-400")} />;

    // Rain (codes 61-65) - Blue for rain
    if (code >= 61 && code <= 65) return <CloudRain {...baseProps} className={mergeClasses("text-blue-500")} />;

    // Rain showers (codes 80-82) - Darker blue for heavy rain
    if (code >= 80 && code <= 82) return <CloudRain {...baseProps} className={mergeClasses("text-blue-600")} />;

    // Snow (codes 71-77, 85-86) - Light blue/cyan for snow
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return <CloudSnow {...baseProps} className={mergeClasses("text-cyan-300")} />;
    }

    // Thunderstorm (codes 95-99) - Purple for storms
    if (code >= 95 && code <= 99) return <CloudLightning {...baseProps} className={mergeClasses("text-purple-500")} />;

    // Default fallback - generic cloud
    return <Cloud {...baseProps} className={mergeClasses("text-gray-400")} />;
  };

  return getIcon(code);
}