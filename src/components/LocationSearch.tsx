"use client";

import { CITIES } from "@/data/cities";

/**
 * Simple dropdown to select from available cities
 * Changes weather immediately when a city is selected
 */

interface LocationSearchProps {
  onCitySelect: (cityName: string) => void;
}

export function LocationSearch({ onCitySelect }: LocationSearchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    if (cityName) {
      onCitySelect(cityName);
    }
  };

  return (
    <div className="w-full max-w-md">
      <select
        onChange={handleChange}
        defaultValue=""
        className="w-full ps-2 pe-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white text-gray-900 font-light"
      >
        <option value="">Select a city...</option>
        {CITIES.map((city) => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </select>
    </div>
  );
}
