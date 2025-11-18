"use client";

import { useTemperature } from "@/contexts/TemperatureContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";

export function TemperatureToggle() {
  const { unit, toggleUnit } = useTemperature();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // HARDCODED inline styles
  const buttonStyle: React.CSSProperties = theme === "dark"
    ? {
        backgroundColor: "#ffffff",
        color: "#000000",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#d1d5db",
      }
    : {
        backgroundColor: "#000000",
        color: "#ffffff",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#1f2937",
      };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg w-[90px] h-[42px]"
        style={buttonStyle}
      />
    );
  }

  return (
    <button
      onClick={toggleUnit}
      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
      style={buttonStyle}
      aria-label="Toggle temperature unit"
    >
      <div className="flex items-center gap-1">
        <span
          className={`text-sm font-light transition-colors ${
            unit === "F" ? "font-medium" : "opacity-50"
          }`}
        >
          °F
        </span>
        <span className="opacity-50">/</span>
        <span
          className={`text-sm font-light transition-colors ${
            unit === "C" ? "font-medium" : "opacity-50"
          }`}
        >
          °C
        </span>
      </div>
    </button>
  );
}
