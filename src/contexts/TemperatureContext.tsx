"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type TemperatureUnit = "F" | "C";

interface TemperatureContextType {
  unit: TemperatureUnit;
  toggleUnit: () => void;
  convertTemp: (tempF: number) => number;
  getUnitSymbol: () => string;
}

const TemperatureContext = createContext<TemperatureContextType | undefined>(undefined);

// Conversion helper functions
function fahrenheitToCelsius(tempF: number): number {
  return (tempF - 32) * (5 / 9);
}

export function TemperatureProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<TemperatureUnit>("F");
  const [mounted, setMounted] = useState(false);

  // Load unit preference from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedUnit = localStorage.getItem("temperatureUnit") as TemperatureUnit | null;
    if (savedUnit) {
      setUnit(savedUnit);
    }
  }, []);

  // Save to localStorage when unit changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("temperatureUnit", unit);
  }, [unit, mounted]);

  const toggleUnit = () => {
    setUnit((prev) => (prev === "F" ? "C" : "F"));
  };

  // Convert temperature based on current unit
  const convertTemp = (tempF: number): number => {
    if (unit === "C") {
      return fahrenheitToCelsius(tempF);
    }
    return tempF;
  };

  const getUnitSymbol = (): string => {
    return unit === "F" ? "°F" : "°C";
  };

  // Always provide the context, even before mounting
  return (
    <TemperatureContext.Provider value={{ unit, toggleUnit, convertTemp, getUnitSymbol }}>
      {children}
    </TemperatureContext.Provider>
  );
}

export function useTemperature() {
  const context = useContext(TemperatureContext);
  if (context === undefined) {
    // Return default values during SSR instead of throwing
    if (typeof window === "undefined") {
      return {
        unit: "F" as TemperatureUnit,
        toggleUnit: () => {},
        convertTemp: (temp: number) => temp,
        getUnitSymbol: () => "°F"
      };
    }
    throw new Error("useTemperature must be used within a TemperatureProvider");
  }
  return context;
}
