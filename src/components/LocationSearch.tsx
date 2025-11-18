"use client";

import { CITIES } from "@/data/cities";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Simple dropdown to select from available cities
 * Changes weather immediately when a city is selected
 */

interface LocationSearchProps {
  onCitySelect: (cityName: string) => void;
}

export function LocationSearch({ onCitySelect }: LocationSearchProps) {
  const { theme } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    if (cityName) {
      onCitySelect(cityName);
    }
  };

  // HARDCODED dropdown style - white background with black text in both modes
  const dropdownStyle: React.CSSProperties = {
    backgroundColor: "#ffffff",
    color: "#000000",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: theme === "dark" ? "#4b5563" : "#d1d5db",
  };

  return (
    <div className="w-full max-w-md">
      <select
        onChange={handleChange}
        defaultValue=""
        className="w-full ps-2 pe-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 font-light"
        style={dropdownStyle}
      >
        <option value="" style={{ backgroundColor: "#ffffff", color: "#000000" }}>
          Select a city...
        </option>
        {CITIES.map((city) => (
          <option
            key={city.name}
            value={city.name}
            style={{ backgroundColor: "#ffffff", color: "#000000" }}
          >
            {city.name}
          </option>
        ))}
      </select>
    </div>
  );
}
