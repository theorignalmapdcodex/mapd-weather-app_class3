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

// MODIFIED: Updated to use lucide-react icons with thin stroke weights for minimalistic aesthetic
export function WeatherIcon({ code, size = 32, className = "" }: WeatherIconProps) {
  // Common props for all icons - thin stroke for minimalistic look
  const iconProps = {
    size,
    strokeWidth: 1.5, // Thin strokes for elegant, minimal design
    className: className || "text-gray-700", // Default gray, can be overridden
  };

  // Helper function to determine which icon to render based on weather code
  const getIcon = (code: number) => {
    // Clear sky (code 0)
    if (code === 0) return <Sun {...iconProps} className={className || "text-amber-500"} />;
    
    // Mainly clear (code 1)
    if (code === 1) return <Sun {...iconProps} className={className || "text-amber-400"} />;
    
    // Partly cloudy (code 2)
    if (code === 2) return <Cloud {...iconProps} className={className || "text-gray-500"} />;
    
    // Overcast (code 3)
    if (code === 3) return <Cloud {...iconProps} className={className || "text-gray-600"} />;

    // Fog (codes 45, 48)
    if (code === 45 || code === 48) return <CloudFog {...iconProps} className={className || "text-gray-400"} />;

    // Drizzle (codes 51-55)
    if (code >= 51 && code <= 55) return <CloudDrizzle {...iconProps} className={className || "text-blue-400"} />;

    // Rain (codes 61-65)
    if (code >= 61 && code <= 65) return <CloudRain {...iconProps} className={className || "text-blue-500"} />;
    
    // Rain showers (codes 80-82)
    if (code >= 80 && code <= 82) return <CloudRain {...iconProps} className={className || "text-blue-600"} />;

    // Snow (codes 71-77, 85-86)
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return <CloudSnow {...iconProps} className={className || "text-blue-300"} />;
    }

    // Thunderstorm (codes 95-99)
    if (code >= 95 && code <= 99) return <CloudLightning {...iconProps} className={className || "text-purple-500"} />;

    // Default fallback - generic cloud
    return <Cloud {...iconProps} />;
  };

  return getIcon(code);
}