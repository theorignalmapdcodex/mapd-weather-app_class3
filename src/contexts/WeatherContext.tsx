"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { geocodeCity } from "@/lib/geocode";
import { getWeatherByCoordinates } from "@/lib/getWeather";
import { WeatherData } from "@/types/weather";

interface WeatherContextType {
  weather: WeatherData | null;
  loading: boolean;
  cityName: string;
  loadCity: (name: string) => Promise<void>;
  clearCity: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [cityName, setCityName] = useState("");

  const loadCity = useCallback(async (name: string) => {
    setLoading(true);
    const geo = await geocodeCity(name);
    if (!geo) { setLoading(false); return; }
    const data = await getWeatherByCoordinates(geo.name, geo.latitude, geo.longitude);
    if (data) {
      setWeather(data);
      setCityName(geo.name);
      localStorage.setItem("homeLocation", name);
    }
    setLoading(false);
  }, []);

  const clearCity = useCallback(() => {
    setWeather(null);
    setCityName("");
    localStorage.removeItem("homeLocation");
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("homeLocation");
    if (saved) {
      setCityName(saved);
      loadCity(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WeatherContext.Provider value={{ weather, loading, cityName, loadCity, clearCity }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be within WeatherProvider");
  return ctx;
}
