"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { geocodeCity } from "@/lib/geocode";
import { getWeatherByCoordinates } from "@/lib/getWeather";
import { WeatherData } from "@/types/weather";

interface WeatherContextType {
  weather: WeatherData | null;
  loading: boolean;
  cityName: string;
  locationMismatch: { city: string; lat: number; lon: number } | null;
  acceptMismatch: () => void;
  dismissMismatch: () => void;
  loadCity: (name: string) => Promise<void>;
  clearCity: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const d = await r.json();
    return d.address?.city || d.address?.town || d.address?.village || d.address?.county || null;
  } catch { return null; }
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [cityName, setCityName] = useState("");
  const [locationMismatch, setLocationMismatch] = useState<{ city: string; lat: number; lon: number } | null>(null);

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

  const acceptMismatch = useCallback(() => {
    if (locationMismatch) {
      loadCity(locationMismatch.city);
      setLocationMismatch(null);
    }
  }, [locationMismatch, loadCity]);

  const dismissMismatch = useCallback(() => {
    setLocationMismatch(null);
    // Suppress for this session
    sessionStorage.setItem("cc-geo-dismissed", "1");
  }, []);

  // Try geolocation check after home loads
  const checkLocation = useCallback(async (homeWeather: WeatherData) => {
    if (sessionStorage.getItem("cc-geo-dismissed")) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude, longitude } = pos.coords;
        const dist = distanceKm(homeWeather.latitude, homeWeather.longitude, latitude, longitude);
        if (dist > 100) {
          const city = await reverseGeocode(latitude, longitude);
          if (city && city.toLowerCase() !== homeWeather.city.toLowerCase()) {
            setLocationMismatch({ city, lat: latitude, lon: longitude });
          }
        }
      },
      () => { /* user denied or unavailable — silent */ },
      { timeout: 6000 }
    );
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("homeLocation");
    if (saved) {
      setCityName(saved);
      loadCity(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger geo check once weather loads
  useEffect(() => {
    if (weather) checkLocation(weather);
  }, [weather, checkLocation]);

  return (
    <WeatherContext.Provider value={{
      weather, loading, cityName, locationMismatch,
      acceptMismatch, dismissMismatch, loadCity, clearCity,
    }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error("useWeather must be within WeatherProvider");
  return ctx;
}
