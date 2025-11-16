/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { LocationSearch } from "@/components/LocationSearch";
import { LoadingState } from "@/components/LoadingState";
import { ErrorMessage } from "@/components/ErrorMessage";
import { WeatherDisplay } from "@/components/WeatherDisplay";
import { PageHeader } from "@/components/PageHeader";
import { getWeatherData } from "@/lib/getWeather";
import { WeatherData } from "@/types/weather";
// NEW: Import Search icon for visual enhancement
import { Search, Loader2 } from "lucide-react";
// NEW: Import react-hot-toast for notifications
import toast, { Toaster } from "react-hot-toast";
// NEW: Import DesktopNav for desktop navigation
import { DesktopNav } from "@/components/DesktopNav";
// NEW: Import toggle components for theme and temperature
import { ThemeToggle } from "@/components/ThemeToggle";
import { TemperatureToggle } from "@/components/TemperatureToggle";

// Default city to display on load
const DEFAULT_CITY = "Durham";

export default function Home() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Load default city weather on mount
     
    loadCityWeather(DEFAULT_CITY);
  }, []);

  // MODIFIED: Enhanced with toast notifications for better UX
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
      const data = await getWeatherData(cityName);

      if (data) {
        setWeather(data);
        
        // NEW: Show success toast
        toast.success(`Weather loaded for ${cityName}!`, {
          id: loadingToast, // Replace loading toast
          duration: 3000, // Auto-dismiss after 3 seconds
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
        
        // NEW: Show error toast
        toast.error(`Failed to load weather for ${cityName}`, {
          id: loadingToast, // Replace loading toast
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
      // NEW: Handle unexpected errors
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
          {/* NEW: Logo image above title */}
          <div className="flex justify-center mb-6">
            <img 
              src="/city-images/weather-app_logo.png" 
              alt="Weather App Logo" 
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-light mb-3 tracking-tight text-gray-900 dark:text-white">
            Weather App
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-light">
            Simple weather forecast for your city
          </p>
        </div>

        {/* MODIFIED: Search section with enhanced styling */}
        <div className="flex flex-col items-center">
          {/* NEW: Search instruction with icon */}
          <div className="flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300">
            <Search size={18} strokeWidth={1.5} className="text-gray-600 dark:text-gray-400" />
            <p className="text-sm font-light">Select from the top cities to view weather or Click 'View All Cities' below to search for more cities</p>
          </div>
          
          {/* Location search dropdown */}
          <LocationSearch onCitySelect={loadCityWeather} />
        </div>

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