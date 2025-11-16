"use client";

import { useTemperature } from "@/contexts/TemperatureContext";
import { useState, useEffect } from "react";

export function TemperatureToggle() {
  const { unit, toggleUnit } = useTemperature();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-[90px] h-[42px]" />
    );
  }

  return (
    <button
      onClick={toggleUnit}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
      aria-label="Toggle temperature unit"
    >
      <div className="flex items-center gap-1">
        <span
          className={`text-sm font-light transition-colors ${
            unit === "F" ? "text-gray-900 dark:text-white font-medium" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          °F
        </span>
        <span className="text-gray-400 dark:text-gray-600">/</span>
        <span
          className={`text-sm font-light transition-colors ${
            unit === "C" ? "text-gray-900 dark:text-white font-medium" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          °C
        </span>
      </div>
    </button>
  );
}
