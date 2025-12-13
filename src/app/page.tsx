/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoadingState } from "@/components/LoadingState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { PageHeader } from "@/components/PageHeader";
import { getWeatherByCoordinates } from "@/lib/getWeather";
import { geocodeCity } from "@/lib/geocode";
import { WeatherData } from "@/types/weather";
// NEW: Import Search icon for visual enhancement
import { Search, Loader2, MapPin } from "lucide-react";
// NEW: Import react-hot-toast for notifications
import toast, { Toaster } from "react-hot-toast";
// NEW: Import DesktopNav for desktop navigation
import { DesktopNav } from "@/components/DesktopNav";
// NEW: Import toggle components for theme and temperature
import { ThemeToggle } from "@/components/ThemeToggle";
import { TemperatureToggle } from "@/components/TemperatureToggle";

// Default city to display on load
const DEFAULT_CITY = "Durham";
const DEFAULT_LAT = 35.9940;
const DEFAULT_LON = -78.8986;

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // NEW: State for user's home location and search query
  const [homeLocation, setHomeLocation] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);

  useEffect(() => {
    // NEW: Check if user has set their home location in localStorage
    const savedLocation = localStorage.getItem("homeLocation");

    if (savedLocation) {
      setHomeLocation(savedLocation);
      setShowLocationPrompt(false);
      // Load saved location weather
      loadCityWeather(savedLocation);
    } else {
      // Show prompt - don't load Durham automatically
      setShowLocationPrompt(true);
      setLoading(false);
    }
  }, []);

  // NEW: Handle setting user's home location
  const handleSetHomeLocation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!homeLocation.trim()) {
      toast.error("Please enter your location", {
        style: {
          background: '#ffffff',
          color: '#dc2626',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: '300',
        },
      });
      return;
    }

    // Save to localStorage and load weather
    localStorage.setItem("homeLocation", homeLocation);
    setShowLocationPrompt(false);
    loadCityWeather(homeLocation);

    toast.success(`Home location set to ${homeLocation}!`, {
      style: {
        background: '#ffffff',
        color: '#059669',
        border: '1px solid #10b981',
        borderRadius: '12px',
        padding: '12px 20px',
        fontWeight: '300',
      },
    });
  };

  // NEW: Handle city search
  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      toast.error("Please enter a city name", {
        style: {
          background: '#ffffff',
          color: '#dc2626',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: '300',
        },
      });
      return;
    }

    loadCityWeather(searchQuery);
  };

  // MODIFIED: Enhanced with geocoding API for any city worldwide
  const loadCityWeather = async (cityName: string) => {
    setLoading(true);
    setError("");

    // NEW: Show loading toast
    const loadingToast = toast.loading(`Fetching weather for ${cityName}...`, {
      style: {
        background: '#ffffff',
        color: '#1f2937',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '12px 20px',
        fontWeight: '300',
      },
    });

    try {
      // NEW: Use geocoding API to get coordinates for any city
      const geoResult = await geocodeCity(cityName);

      if (!geoResult) {
        setError(`Could not find location: ${cityName}`);
        toast.error(`Could not find location: ${cityName}`, {
          id: loadingToast,
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#dc2626',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '12px 20px',
            fontWeight: '300',
          },
        });
        setLoading(false);
        return;
      }

      // Get weather data using coordinates
      const data = await getWeatherByCoordinates(
        geoResult.name,
        geoResult.latitude,
        geoResult.longitude
      );

      if (data) {
        setWeather(data);

        // NEW: Show success toast
        toast.success(`Weather loaded for ${data.city}!`, {
          id: loadingToast,
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#059669',
            border: '1px solid #10b981',
            borderRadius: '12px',
            padding: '12px 20px',
            fontWeight: '300',
          },
          icon: '✅',
        });
      } else {
        setError(`Failed to load weather data for ${cityName}`);

        toast.error(`Failed to load weather for ${cityName}`, {
          id: loadingToast,
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#dc2626',
            border: '1px solid #ef4444',
            borderRadius: '12px',
            padding: '12px 20px',
            fontWeight: '300',
          },
        });
      }
    } catch (err) {
      setError(`An error occurred while fetching weather`);
      toast.error('Something went wrong. Please try again.', {
        id: loadingToast,
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#dc2626',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          padding: '12px 20px',
          fontWeight: '300',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // MODIFIED: Updated background to match minimalistic gradient theme
    // Added pb-24 for bottom navigation spacing on mobile only (md:pb-12 removes it on desktop)
    // NEW: Added dark mode classes
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12 pb-24 md:pb-12">
      {/* NEW: Toast notification container */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          // Default options for all toasts
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#1f2937',
            fontFamily: 'inherit',
          },
        }}
      />
      
      <main className="w-full max-w-2xl space-y-6 md:space-y-8">

        {/* NEW: Toggle controls - positioned at top right */}
        <div className="flex justify-end gap-3 mb-4">
          <ThemeToggle />
          <TemperatureToggle />
        </div>

        {/* MODIFIED: Updated header styling for minimalistic theme */}
        <div className="text-center mb-8">
          {/* NEW: Logo image above title - clickable to return home */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="transition-transform hover:scale-105 duration-200">
              <img
                src="/city-images/weather-app_logo.png"
                alt="Weather App Logo"
                className="w-20 h-20 md:w-24 md:h-24 cursor-pointer"
              />
            </Link>
          </div>

          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight text-gray-900 dark:text-white">
            Weather App
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-light">
            Simple weather forecast for your city
          </p>
        </div>

        {/* NEW: "Where are you?" prompt - shown on first visit */}
        {showLocationPrompt && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-sm p-6 md:p-8 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin size={24} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
              <h2 className="text-2xl font-light text-gray-900 dark:text-white">
                Where are you?
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 font-light">
              Set your home location to see weather instantly
            </p>
            <form onSubmit={handleSetHomeLocation} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={homeLocation}
                onChange={(e) => setHomeLocation(e.target.value)}
                placeholder="Enter your city (e.g., Durham, London, Tokyo)"
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-light focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-light hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <MapPin size={18} strokeWidth={1.5} />
                Set Location
              </button>
            </form>
          </div>
        )}

        {/* NEW: City search bar - always visible after home location is set */}
        {!showLocationPrompt && (
          <div className="mb-6">
            <form onSubmit={handleCitySearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={20}
                  strokeWidth={1.5}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for any city..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-light focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-light hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Search size={18} strokeWidth={1.5} />
                Search
              </button>
            </form>
          </div>
        )}

        {/* MODIFIED: Enhanced loading state with spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-gray-400 dark:text-gray-500 animate-spin mb-4" strokeWidth={1.5} />
            <p className="text-gray-500 dark:text-gray-400 font-light">Loading weather data...</p>
          </div>
        )}
        
        {/* Error state - now also shows toast */}
        {error && !loading && <ErrorMessage message={error} />}
        
        {/* Weather display */}
        {weather && !loading && <WeatherDisplay weather={weather} />}

        {/* NEW: Desktop navigation - appears before footer on desktop only */}
        <div className="mt-12">
          <DesktopNav />
        </div>

        {/* NEW: Footer - extra margin bottom to account for bottom nav */}
        <footer className="mt-8 mb-4 text-center">
          <p className="text-gray-700 dark:text-gray-400 text-sm font-light">
            Made with 🖤 by @theoriginalmapd
          </p>
        </footer>

      </main>
    </div>
  );
}