/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"; // MODIFIED: Changed to client component for search interactivity

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { CITIES } from "@/data/cities";
import { getWeatherData, getWeatherByCoordinates } from "@/lib/getWeather";
import { geocodeCity } from "@/lib/geocode";
import { WeatherData } from "@/types/weather";
import Link from "next/link";
import { Cloud, Wind, Search as SearchIcon, Loader2 } from "lucide-react";
import { WeatherIcon } from "@/components/WeatherIcon";
import toast, { Toaster } from "react-hot-toast";
import { DesktopNav } from "@/components/DesktopNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TemperatureToggle } from "@/components/TemperatureToggle";
import { useTemperature } from "@/contexts/TemperatureContext";

/**
 * MODIFIED: AllCitiesPage
 * 
 * Now includes dynamic city search functionality
 * - Shows default cities from cities.ts
 * - Allows searching for any city via Open-Meteo API
 * - Uses geocoding to convert city names to coordinates
 */

export default function AllCitiesPage() {
  const { convertTemp, getUnitSymbol } = useTemperature();

  // State for default cities weather
  const [citiesWithWeather, setCitiesWithWeather] = useState<Array<{
    name: string;
    latitude: number;
    longitude: number;
    weather: WeatherData | null;
  }>>([]);

  // State for search functionality
  const [searchCity, setSearchCity] = useState("");
  const [searchedCityWeather, setSearchedCityWeather] = useState<WeatherData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(true);

  // Load default cities on mount
  useEffect(() => {
    loadDefaultCities();
  }, []);

  // NEW: Load weather for all default cities
  const loadDefaultCities = async () => {
    setIsLoadingDefault(true);
    
    const citiesData = await Promise.all(
      CITIES.map(async (city) => ({
        ...city,
        weather: await getWeatherData(city.name),
      }))
    );
    
    setCitiesWithWeather(citiesData);
    setIsLoadingDefault(false);
  };

  // NEW: Handle city search with validation
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // VALIDATION 1: Check if input is empty
    if (!searchCity.trim()) {
      toast.error('Please enter a city name', {
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

    // VALIDATION 2: Check minimum length (at least 2 characters)
    if (searchCity.trim().length < 2) {
      toast.error('City name must be at least 2 characters', {
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

    // VALIDATION 3: Check for invalid characters (only letters, spaces, hyphens, apostrophes)
    const validCityRegex = /^[a-zA-Z\s\-']+$/;
    if (!validCityRegex.test(searchCity.trim())) {
      toast.error('City name can only contain letters, spaces, hyphens, and apostrophes', {
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

    setIsSearching(true);
    setSearchedCityWeather(null);

    // Clean up the city name (trim spaces, proper case)
    const cleanedCityName = searchCity.trim();

    // Show loading toast
    const loadingToast = toast.loading(`Searching for ${cleanedCityName}...`, {
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
      // Step 1: Geocode the city name to get coordinates (case-insensitive)
      const geocodeResult = await geocodeCity(cleanedCityName);

      if (!geocodeResult) {
        // ENHANCED ERROR: City not found with helpful suggestions
        toast.error(
          (t) => (
            <div className="text-left">
              <div className="font-medium mb-2">City "{cleanedCityName}" not found</div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>💡 Try these tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check the spelling</li>
                  <li>Try the full city name</li>
                  <li>Include the country (e.g., "Paris, France")</li>
                  <li>Use English spelling</li>
                </ul>
              </div>
            </div>
          ),
          {
            id: loadingToast,
            duration: 6000, // Longer duration for reading tips
            style: {
              background: '#ffffff',
              color: '#dc2626',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '16px 20px',
              fontWeight: '300',
              maxWidth: '400px',
            },
          }
        );
        setIsSearching(false);
        return;
      }

      // Step 2: Fetch weather using coordinates
      const weather = await getWeatherByCoordinates(
        geocodeResult.name,
        geocodeResult.latitude,
        geocodeResult.longitude
      );

      if (weather) {
        setSearchedCityWeather(weather);
        // Clear the search input after successful search
        setSearchCity("");
        
        toast.success(`Weather loaded for ${geocodeResult.name}, ${geocodeResult.country}!`, {
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
        toast.error(`Failed to load weather for ${geocodeResult.name}. Please try again.`, {
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
    } catch (error) {
      toast.error('An error occurred. Please check your connection and try again.', {
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
      setIsSearching(false);
    }
  };

  // NEW: Render weather card component - Responsive padding
  const WeatherCard = ({ weather }: { weather: WeatherData }) => (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
      {/* City Name and Coordinates */}
      <div className="mb-6">
        <h2 className="text-2xl font-light tracking-wide mb-1 text-gray-900 dark:text-white">
          {weather.city}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm font-light">
          {weather.latitude.toFixed(2)}°, {weather.longitude.toFixed(2)}°
        </p>
      </div>

      {/* Current Temperature Display with Weather Icon - Responsive sizing */}
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <div className="text-5xl md:text-6xl font-light mb-2 text-gray-900 dark:text-white">
            {Math.round(convertTemp(weather.current.temperature))}{getUnitSymbol()}
          </div>
          <div className="text-gray-700 dark:text-gray-300 text-xs md:text-sm font-light">
            Feels like {Math.round(convertTemp(weather.current.feelsLike))}{getUnitSymbol()}
          </div>
        </div>
        <div className="text-gray-700 dark:text-gray-300 mt-1 md:mt-2">
          <WeatherIcon code={weather.current.condition.code} size={40} className="md:w-12 md:h-12" />
        </div>
      </div>

      {/* Weather Condition Description */}
      <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-700">
        <p className="text-gray-700 dark:text-gray-300 font-light">
          {weather.current.condition.description}
        </p>
      </div>

      {/* Additional Weather Metrics */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Wind size={16} className="text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
          <span className="text-gray-800 dark:text-gray-200 font-light">
            {weather.current.windSpeed} mph
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Cloud size={16} className="text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
          <span className="text-gray-800 dark:text-gray-200 font-light">
            {weather.current.humidity}%
          </span>
        </div>
      </div>

      {/* 3-Day Forecast Preview */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-4 justify-between">
          {weather.forecast.slice(0, 3).map((day, idx) => (
            <div key={idx} className="text-center flex-1">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-light">
                {idx === 0 ? "Tomorrow" : `+${idx + 1}d`}
              </div>
              <div className="flex justify-center mb-2">
                <WeatherIcon code={day.condition.code} size={20} />
              </div>
              <div className="text-sm font-light">
                <span className="text-gray-900 dark:text-white">{Math.round(convertTemp(day.maxTemp))}{getUnitSymbol()}</span>
                <span className="text-gray-600 dark:text-gray-500 mx-1">/</span>
                <span className="text-gray-700 dark:text-gray-300">{Math.round(convertTemp(day.minTemp))}{getUnitSymbol()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 md:p-12 pb-24 md:pb-12">
      {/* Toast notifications container */}
      <Toaster position="top-center" reverseOrder={false} gutter={8} />

      <div className="max-w-6xl mx-auto">
        {/* NEW: Toggle controls */}
        <div className="flex justify-end gap-3 mb-6">
          <ThemeToggle />
          <TemperatureToggle />
        </div>

        {/* Page Header Section */}
        <div className="mb-12 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img 
              src="/city-images/weather-app_logo.png" 
              alt="Weather App Logo" 
              className="w-20 h-20 md:w-24 md:h-24"
            />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4 tracking-tight text-gray-900 dark:text-white">
            Weather Overview
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg font-light mb-6">
            Current conditions across all cities
          </p>

          {/* NEW: City Search Bar - Responsive layout */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search any city worldwide..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-transparent font-light text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-base bg-white dark:bg-gray-800"
                disabled={isSearching}
                maxLength={50} // Limit input length
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-light text-sm md:text-base"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                ) : (
                  <SearchIcon size={20} strokeWidth={2} />
                )}
                <span>Search</span>
              </button>
            </div>
            {/* NEW: Helper text below search bar */}
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-light text-center">
              💡 Tip: Search is case-insensitive. Try "london" or "New York"
            </p>
          </form>
        </div>

        {/* NEW: Searched City Result */}
        {searchedCityWeather && (
          <div className="mb-12">
            <h2 className="text-2xl font-light mb-4 text-gray-700 dark:text-gray-300">Search Result:</h2>
            <div className="max-w-md mx-auto">
              <WeatherCard weather={searchedCityWeather} />
            </div>
          </div>
        )}

        {/* Default Cities Grid */}
        <div>
          <h2 className="text-2xl font-light mb-6 text-gray-700 dark:text-gray-300 text-center">
            {searchedCityWeather ? "Top Cities:" : ""}
          </h2>

          {isLoadingDefault ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-12 h-12 text-gray-400 dark:text-gray-500 animate-spin" strokeWidth={1.5} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {citiesWithWeather.map((city) => {
                if (!city.weather) return null;
                
                return (
                  <Link
                    key={city.name}
                    href={`/weather/${city.name.toLowerCase()}`}
                    className="group"
                  >
                    <WeatherCard weather={city.weather} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-light text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>

        {/* NEW: Desktop navigation - appears before footer on desktop only */}
        <div className="mt-12">
          <DesktopNav />
        </div>

        {/* Footer - adjusted for bottom nav */}
        <footer className="mt-8 mb-4 text-center">
          <p className="text-gray-700 dark:text-gray-400 text-sm font-light">
            Made with 🖤 by @theoriginalmapd
          </p>
        </footer>
      </div>
    </div>
  );
}














// "use client"; // MODIFIED: Changed to client component for search interactivity

// /* eslint-disable @next/next/no-img-element */
// import { useEffect, useState } from "react";
// import { CITIES } from "@/data/cities";
// import { getWeatherData, getWeatherByCoordinates } from "@/lib/getWeather";
// import { geocodeCity } from "@/lib/geocode";
// import { WeatherData } from "@/types/weather";
// import Link from "next/link";
// import { Cloud, Wind, Search as SearchIcon, Loader2 } from "lucide-react";
// import { WeatherIcon } from "@/components/WeatherIcon";
// import toast, { Toaster } from "react-hot-toast";

// /**
//  * MODIFIED: AllCitiesPage
//  * 
//  * Now includes dynamic city search functionality
//  * - Shows default cities from cities.ts
//  * - Allows searching for any city via Open-Meteo API
//  * - Uses geocoding to convert city names to coordinates
//  */

// export default function AllCitiesPage() {
//   // State for default cities weather
//   const [citiesWithWeather, setCitiesWithWeather] = useState<Array<{
//     name: string;
//     latitude: number;
//     longitude: number;
//     weather: WeatherData | null;
//   }>>([]);

//   // State for search functionality
//   const [searchCity, setSearchCity] = useState("");
//   const [searchedCityWeather, setSearchedCityWeather] = useState<WeatherData | null>(null);
//   const [isSearching, setIsSearching] = useState(false);
//   const [isLoadingDefault, setIsLoadingDefault] = useState(true);

//   // Load default cities on mount
//   useEffect(() => {
//     loadDefaultCities();
//   }, []);

//   // NEW: Load weather for all default cities
//   const loadDefaultCities = async () => {
//     setIsLoadingDefault(true);
    
//     const citiesData = await Promise.all(
//       CITIES.map(async (city) => ({
//         ...city,
//         weather: await getWeatherData(city.name),
//       }))
//     );
    
//     setCitiesWithWeather(citiesData);
//     setIsLoadingDefault(false);
//   };

//   // NEW: Handle city search
//   const handleSearch = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!searchCity.trim()) {
//       toast.error('Please enter a city name', {
//         style: {
//           background: '#ffffff',
//           color: '#dc2626',
//           border: '1px solid #ef4444',
//           borderRadius: '12px',
//           padding: '12px 20px',
//           fontWeight: '300',
//         },
//       });
//       return;
//     }

//     setIsSearching(true);
//     setSearchedCityWeather(null);

//     // Show loading toast
//     const loadingToast = toast.loading(`Searching for ${searchCity}...`, {
//       style: {
//         background: '#ffffff',
//         color: '#1f2937',
//         border: '1px solid #e5e7eb',
//         borderRadius: '12px',
//         padding: '12px 20px',
//         fontWeight: '300',
//       },
//     });

//     try {
//       // Step 1: Geocode the city name to get coordinates
//       const geocodeResult = await geocodeCity(searchCity);

//       if (!geocodeResult) {
//         toast.error(`City "${searchCity}" not found. Try another name.`, {
//           id: loadingToast,
//           duration: 4000,
//           style: {
//             background: '#ffffff',
//             color: '#dc2626',
//             border: '1px solid #ef4444',
//             borderRadius: '12px',
//             padding: '12px 20px',
//             fontWeight: '300',
//           },
//         });
//         setIsSearching(false);
//         return;
//       }

//       // Step 2: Fetch weather using coordinates
//       const weather = await getWeatherByCoordinates(
//         geocodeResult.name,
//         geocodeResult.latitude,
//         geocodeResult.longitude
//       );

//       if (weather) {
//         setSearchedCityWeather(weather);
//         toast.success(`Weather loaded for ${geocodeResult.name}, ${geocodeResult.country}!`, {
//           id: loadingToast,
//           duration: 3000,
//           style: {
//             background: '#ffffff',
//             color: '#059669',
//             border: '1px solid #10b981',
//             borderRadius: '12px',
//             padding: '12px 20px',
//             fontWeight: '300',
//           },
//           icon: '✅',
//         });
//       } else {
//         toast.error(`Failed to load weather for ${geocodeResult.name}`, {
//           id: loadingToast,
//           duration: 4000,
//           style: {
//             background: '#ffffff',
//             color: '#dc2626',
//             border: '1px solid #ef4444',
//             borderRadius: '12px',
//             padding: '12px 20px',
//             fontWeight: '300',
//           },
//         });
//       }
//     } catch (error) {
//       toast.error('An error occurred. Please try again.', {
//         id: loadingToast,
//         duration: 4000,
//         style: {
//           background: '#ffffff',
//           color: '#dc2626',
//           border: '1px solid #ef4444',
//           borderRadius: '12px',
//           padding: '12px 20px',
//           fontWeight: '300',
//         },
//       });
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   // NEW: Render weather card component
//   const WeatherCard = ({ weather }: { weather: WeatherData }) => (
//     <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
//       {/* City Name and Coordinates */}
//       <div className="mb-6">
//         <h2 className="text-2xl font-light tracking-wide mb-1">
//           {weather.city}
//         </h2>
//         <p className="text-gray-400 text-sm font-light">
//           {weather.latitude.toFixed(2)}°, {weather.longitude.toFixed(2)}°
//         </p>
//       </div>

//       {/* Current Temperature Display with Weather Icon */}
//       <div className="flex items-start justify-between mb-8">
//         <div>
//           <div className="text-6xl font-light mb-2">
//             {Math.round(weather.current.temperature)}°
//           </div>
//           <div className="text-gray-500 text-sm font-light">
//             Feels like {Math.round(weather.current.feelsLike)}°
//           </div>
//         </div>
//         <div className="text-gray-700 mt-2">
//           <WeatherIcon code={weather.current.condition.code} size={48} />
//         </div>
//       </div>

//       {/* Weather Condition Description */}
//       <div className="mb-6 pb-6 border-b border-gray-100">
//         <p className="text-gray-600 font-light">
//           {weather.current.condition.description}
//         </p>
//       </div>

//       {/* Additional Weather Metrics */}
//       <div className="grid grid-cols-2 gap-4 text-sm">
//         <div className="flex items-center gap-2">
//           <Wind size={16} className="text-gray-400" strokeWidth={1.5} />
//           <span className="text-gray-600 font-light">
//             {weather.current.windSpeed} mph
//           </span>
//         </div>
//         <div className="flex items-center gap-2">
//           <Cloud size={16} className="text-gray-400" strokeWidth={1.5} />
//           <span className="text-gray-600 font-light">
//             {weather.current.humidity}%
//           </span>
//         </div>
//       </div>

//       {/* 3-Day Forecast Preview */}
//       <div className="mt-6 pt-6 border-t border-gray-100">
//         <div className="flex gap-4 justify-between">
//           {weather.forecast.slice(0, 3).map((day, idx) => (
//             <div key={idx} className="text-center flex-1">
//               <div className="text-xs text-gray-400 mb-2 font-light">
//                 {idx === 0 ? "Tomorrow" : `+${idx + 1}d`}
//               </div>
//               <div className="flex justify-center mb-2">
//                 <WeatherIcon code={day.condition.code} size={20} />
//               </div>
//               <div className="text-sm font-light">
//                 <span className="text-gray-800">{Math.round(day.maxTemp)}°</span>
//                 <span className="text-gray-400 mx-1">/</span>
//                 <span className="text-gray-500">{Math.round(day.minTemp)}°</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-12">
//       {/* Toast notifications container */}
//       <Toaster position="top-center" reverseOrder={false} gutter={8} />

//       <div className="max-w-6xl mx-auto">
//         {/* Page Header Section */}
//         <div className="mb-12 text-center">
//           {/* Logo */}
//           <div className="flex justify-center mb-6">
//             <img 
//               src="/city-images/weather-app_logo.png" 
//               alt="Weather App Logo" 
//               className="w-20 h-20 md:w-24 md:h-24"
//             />
//           </div>

//           <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight">
//             Weather Overview
//           </h1>
//           <p className="text-gray-500 text-lg font-light mb-6">
//             Current conditions across all cities
//           </p>

//           {/* NEW: City Search Bar */}
//           <form onSubmit={handleSearch} className="max-w-md mx-auto">
//             <div className="flex gap-3">
//               <input
//                 type="text"
//                 value={searchCity}
//                 onChange={(e) => setSearchCity(e.target.value)}
//                 placeholder="Search any city..."
//                 className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent font-light text-gray-900 placeholder-gray-400"
//                 disabled={isSearching}
//               />
//               <button
//                 type="submit"
//                 disabled={isSearching}
//                 className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-light"
//               >
//                 {isSearching ? (
//                   <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
//                 ) : (
//                   <SearchIcon size={20} strokeWidth={2} />
//                 )}
//                 <span>Search</span>
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* NEW: Searched City Result */}
//         {searchedCityWeather && (
//           <div className="mb-12">
//             <h2 className="text-2xl font-light mb-4 text-gray-700">Search Result:</h2>
//             <div className="max-w-md mx-auto">
//               <WeatherCard weather={searchedCityWeather} />
//             </div>
//           </div>
//         )}

//         {/* Default Cities Grid */}
//         <div>
//           <h2 className="text-2xl font-light mb-6 text-gray-700 text-center">
//             {searchedCityWeather ? "Top Cities:" : ""}
//           </h2>
          
//           {isLoadingDefault ? (
//             <div className="flex justify-center py-12">
//               <Loader2 className="w-12 h-12 text-gray-400 animate-spin" strokeWidth={1.5} />
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {citiesWithWeather.map((city) => {
//                 if (!city.weather) return null;
                
//                 return (
//                   <Link
//                     key={city.name}
//                     href={`/weather/${city.name.toLowerCase()}`}
//                     className="group"
//                   >
//                     <WeatherCard weather={city.weather} />
//                   </Link>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Footer Navigation */}
//         <div className="mt-12 text-center">
//           <Link href="/" className="text-gray-600 hover:text-gray-900 font-light text-sm transition-colors">
//             ← Back to Home
//           </Link>
//         </div>

//         {/* Footer */}
//         <footer className="mt-12 text-center pb-8">
//           <p className="text-gray-500 text-sm font-light">
//             Made with 🖤 by @theoriginalmapd
//           </p>
//         </footer>
//       </div>
//     </div>
//   );
// }




// /* eslint-disable @next/next/no-img-element */
// import { CITIES } from "@/data/cities";
// // MODIFIED: Import getWeatherData instead of getDummyWeatherData for API integration
// import { getWeatherData } from "@/lib/getWeather";
// import Link from "next/link";
// import { Cloud, Wind } from "lucide-react";
// // NEW: Import centralized WeatherIcon component for consistent icon display
// import { WeatherIcon } from "@/components/WeatherIcon";

// /**
//  * NEW COMPONENT: AllCitiesPage
//  * 
//  * Displays weather overview for all cities in the dataset
//  * Features minimalistic, artistic design with clean cards
//  * Each city card is clickable and routes to detailed city weather page
//  * MODIFIED: Now fetches real weather data from Open-Meteo API
//  */

// // MODIFIED: Made async to handle API calls
// export default async function AllCitiesPage() {
//   // MODIFIED: Fetch real weather data for all cities using API
//   // Use Promise.all to fetch all cities' weather data in parallel for better performance
//   const citiesWithWeather = await Promise.all(
//     CITIES.map(async (city) => ({
//       ...city,
//       weather: await getWeatherData(city.name), // Fetch real API data for each city
//     }))
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-12">
//       <div className="max-w-6xl mx-auto">
//         {/* NEW: Page Header Section */}
//         <div className="mb-12 text-center">
          
//           {/* NEW: Logo image above title */}
//           <div className="flex justify-center mb-6">
//             <img 
//               src="/city-images/weather-app_logo.png" 
//               alt="Weather App Logo" 
//               className="w-20 h-20 md:w-24 md:h-24"
//             />
//           </div>

//           <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight">
//             Weather Overview
//           </h1>
//           <p className="text-gray-500 text-lg font-light">
//             Current conditions across all cities
//           </p>
//         </div>

//         {/* NEW: Cities Grid - Responsive layout (1 col mobile, 2 tablet, 3 desktop) */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {citiesWithWeather.map((city) => {
//             const weather = city.weather;
//             // Skip rendering if weather data is not available for this city
//             if (!weather) return null;

//             return (
//               <Link
//                 key={city.name}
//                 href={`/weather/${city.name.toLowerCase()}`} // Routes to individual city detail page
//                 className="group"
//               >
//                 {/* NEW: City Weather Card - Minimalistic design with hover effects */}
//                 <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105 cursor-pointer">
                  
//                   {/* NEW: City Name and Coordinates */}
//                   <div className="mb-6">
//                     <h2 className="text-2xl font-light tracking-wide mb-1">
//                       {city.name}
//                     </h2>
//                     {/* Display latitude and longitude with 2 decimal places */}
//                     <p className="text-gray-400 text-sm font-light">
//                       {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
//                     </p>
//                   </div>

//                   {/* NEW: Current Temperature Display with Weather Icon */}
//                   <div className="flex items-start justify-between mb-8">
//                     <div>
//                       {/* Large temperature display - rounded to whole number */}
//                       <div className="text-6xl font-light mb-2">
//                         {Math.round(weather.current.temperature)}°
//                       </div>
//                       {/* "Feels like" temperature for user context */}
//                       <div className="text-gray-500 text-sm font-light">
//                         Feels like {Math.round(weather.current.feelsLike)}°
//                       </div>
//                     </div>
//                     {/* Weather condition icon on the right */}
//                     <div className="text-gray-700 mt-2">
//                       <WeatherIcon
//                         code={weather.current.condition.code}
//                         size={48}
//                       />
//                     </div>
//                   </div>

//                   {/* NEW: Weather Condition Description */}
//                   <div className="mb-6 pb-6 border-b border-gray-100">
//                     <p className="text-gray-600 font-light">
//                       {weather.current.condition.description}
//                     </p>
//                   </div>

//                   {/* NEW: Additional Weather Metrics (Wind & Humidity) */}
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     {/* Wind speed display with icon */}
//                     <div className="flex items-center gap-2">
//                       <Wind size={16} className="text-gray-400" strokeWidth={1.5} />
//                       <span className="text-gray-600 font-light">
//                         {weather.current.windSpeed} mph
//                       </span>
//                     </div>
//                     {/* Humidity percentage display with icon */}
//                     <div className="flex items-center gap-2">
//                       <Cloud size={16} className="text-gray-400" strokeWidth={1.5} />
//                       <span className="text-gray-600 font-light">
//                         {weather.current.humidity}%
//                       </span>
//                     </div>
//                   </div>

//                   {/* NEW: 3-Day Forecast Preview */}
//                   <div className="mt-6 pt-6 border-t border-gray-100">
//                     <div className="flex gap-4 justify-between">
//                       {/* Show first 3 days of forecast */}
//                       {weather.forecast.slice(0, 3).map((day, idx) => (
//                         <div
//                           key={idx}
//                           className="text-center flex-1"
//                         >
//                           {/* Day label - "Tomorrow" for first day, then "+2d", "+3d" */}
//                           <div className="text-xs text-gray-400 mb-2 font-light">
//                             {idx === 0 ? "Tomorrow" : `+${idx + 1}d`}
//                           </div>
//                           {/* Weather icon for the forecast day */}
//                           <div className="flex justify-center mb-2">
//                             <WeatherIcon code={day.condition.code} size={20} />
//                           </div>
//                           {/* High/Low temperature display */}
//                           <div className="text-sm font-light">
//                             <span className="text-gray-800">
//                               {Math.round(day.maxTemp)}°
//                             </span>
//                             <span className="text-gray-400 mx-1">/</span>
//                             <span className="text-gray-500">
//                               {Math.round(day.minTemp)}°
//                             </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>

//         {/* NEW: Footer Navigation - Back to Home Link */}
//         <div className="mt-12 text-center">
//           <Link
//             href="/"
//             className="text-gray-600 hover:text-gray-900 font-light text-sm transition-colors"
//           >
//             ← Back to Home
//           </Link>
//         </div>

//         {/* NEW: Footer */}
//         <footer className="mt-12 text-center pb-8">
//           <p className="text-gray-500 text-sm font-light">
//             Made with 🖤 by @theoriginalmapd
//           </p>
//         </footer>

//       </div>
//     </div>
//   );
// }



// /* eslint-disable @next/next/no-img-element */
// import { CITIES } from "@/data/cities";
// import { getDummyWeatherData } from "@/data/weather-data";
// import Link from "next/link";
// import { Cloud, Wind } from "lucide-react"; // MODIFIED: Removed unused icon imports
// // NEW: Import centralized WeatherIcon component for consistent icon display
// import { WeatherIcon } from "@/components/WeatherIcon";

// /**
//  * NEW COMPONENT: AllCitiesPage
//  * 
//  * Displays weather overview for all cities in the dataset
//  * Features minimalistic, artistic design with clean cards
//  * Each city card is clickable and routes to detailed city weather page
//  */

// export default function AllCitiesPage() {
//   // NEW: Fetch weather data for all cities from the CITIES array
//   // Maps through each city and attaches its corresponding weather data
//   const citiesWithWeather = CITIES.map((city) => ({
//     ...city,
//     weather: getDummyWeatherData(city.name),
//   }));

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-12">
//       <div className="max-w-6xl mx-auto">
//         {/* NEW: Page Header Section */}
//         <div className="mb-12 text-center">
          
//           {/* NEW: Logo image above title */}
//           <div className="flex justify-center mb-6">
//             <img 
//               src="/city-images/weather-app_logo.png" 
//               alt="Weather App Logo" 
//               className="w-20 h-20 md:w-24 md:h-24"
//             />
//           </div>

//           <h1 className="text-5xl md:text-6xl font-light mb-4 tracking-tight">
//             Weather Overview
//           </h1>
//           <p className="text-gray-500 text-lg font-light">
//             Current conditions across all cities
//           </p>
//         </div>

//         {/* NEW: Cities Grid - Responsive layout (1 col mobile, 2 tablet, 3 desktop) */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {citiesWithWeather.map((city) => {
//             const weather = city.weather;
//             // Skip rendering if weather data is not available for this city
//             if (!weather) return null;

//             return (
//               <Link
//                 key={city.name}
//                 href={`/weather/${city.name.toLowerCase()}`} // Routes to individual city detail page
//                 className="group"
//               >
//                 {/* NEW: City Weather Card - Minimalistic design with hover effects */}
//                 <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105 cursor-pointer">
                  
//                   {/* NEW: City Name and Coordinates */}
//                   <div className="mb-6">
//                     <h2 className="text-2xl font-light tracking-wide mb-1">
//                       {city.name}
//                     </h2>
//                     {/* Display latitude and longitude with 2 decimal places */}
//                     <p className="text-gray-400 text-sm font-light">
//                       {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
//                     </p>
//                   </div>

//                   {/* NEW: Current Temperature Display with Weather Icon */}
//                   <div className="flex items-start justify-between mb-8">
//                     <div>
//                       {/* Large temperature display - rounded to whole number */}
//                       <div className="text-6xl font-light mb-2">
//                         {Math.round(weather.current.temperature)}°
//                       </div>
//                       {/* "Feels like" temperature for user context */}
//                       <div className="text-gray-500 text-sm font-light">
//                         Feels like {Math.round(weather.current.feelsLike)}°
//                       </div>
//                     </div>
//                     {/* Weather condition icon on the right */}
//                     <div className="text-gray-700 mt-2">
//                       <WeatherIcon
//                         code={weather.current.condition.code}
//                         size={48}
//                       />
//                     </div>
//                   </div>

//                   {/* NEW: Weather Condition Description */}
//                   <div className="mb-6 pb-6 border-b border-gray-100">
//                     <p className="text-gray-600 font-light">
//                       {weather.current.condition.description}
//                     </p>
//                   </div>

//                   {/* NEW: Additional Weather Metrics (Wind & Humidity) */}
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     {/* Wind speed display with icon */}
//                     <div className="flex items-center gap-2">
//                       <Wind size={16} className="text-gray-400" strokeWidth={1.5} />
//                       <span className="text-gray-600 font-light">
//                         {weather.current.windSpeed} mph
//                       </span>
//                     </div>
//                     {/* Humidity percentage display with icon */}
//                     <div className="flex items-center gap-2">
//                       <Cloud size={16} className="text-gray-400" strokeWidth={1.5} />
//                       <span className="text-gray-600 font-light">
//                         {weather.current.humidity}%
//                       </span>
//                     </div>
//                   </div>

//                   {/* NEW: 3-Day Forecast Preview */}
//                   <div className="mt-6 pt-6 border-t border-gray-100">
//                     <div className="flex gap-4 justify-between">
//                       {/* Show first 3 days of forecast */}
//                       {weather.forecast.slice(0, 3).map((day, idx) => (
//                         <div
//                           key={idx}
//                           className="text-center flex-1"
//                         >
//                           {/* Day label - "Tomorrow" for first day, then "+2d", "+3d" */}
//                           <div className="text-xs text-gray-400 mb-2 font-light">
//                             {idx === 0 ? "Tomorrow" : `+${idx + 1}d`}
//                           </div>
//                           {/* Weather icon for the forecast day */}
//                           <div className="flex justify-center mb-2">
//                             <WeatherIcon code={day.condition.code} size={20} />
//                           </div>
//                           {/* High/Low temperature display */}
//                           <div className="text-sm font-light">
//                             <span className="text-gray-800">
//                               {Math.round(day.maxTemp)}°
//                             </span>
//                             <span className="text-gray-400 mx-1">/</span>
//                             <span className="text-gray-500">
//                               {Math.round(day.minTemp)}°
//                             </span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </Link>
//             );
//           })}
//         </div>

//         {/* NEW: Footer Navigation - Back to Home Link */}
//         <div className="mt-12 text-center">
//           <Link
//             href="/"
//             className="text-gray-600 hover:text-gray-900 font-light text-sm transition-colors" // MODIFIED: Changed from gray-500/700 to gray-600/900
//           >
//             ← Back to Home
//           </Link>
//         </div>

//                 {/* NEW: Footer */}
//         <footer className="mt-12 text-center pb-8">
//           <p className="text-gray-500 text-sm font-light">
//             Made with 🖤 by @theoriginalmapd
//           </p>
//         </footer>

//       </div>
//     </div>
//   );
// }