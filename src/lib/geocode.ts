/**
 * NEW FILE: Geocoding Utility
 * 
 * Converts city names to coordinates using Open-Meteo Geocoding API
 * Used for dynamic city search on All Cities page
 */

export interface GeocodingResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/region
}

/**
 * Search for a city and get its coordinates
 * 
 * @param cityName - Name of the city to search for
 * @returns GeocodingResult with coordinates or null if not found
 * 
 * API Documentation: https://open-meteo.com/en/docs/geocoding-api
 */
export async function geocodeCity(cityName: string): Promise<GeocodingResult | null> {
  try {
    // Build geocoding API URL
    const params = new URLSearchParams({
      name: cityName,
      count: '1', // Get top result only
      language: 'en',
      format: 'json',
    });

    const apiUrl = `https://geocoding-api.open-meteo.com/v1/search?${params}`;

    console.log(`Searching for city: ${cityName}`);
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Geocoding API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Check if any results were found
    if (!data.results || data.results.length === 0) {
      console.log(`No results found for city: ${cityName}`);
      return null;
    }

    const result = data.results[0];

    console.log(`Found city: ${result.name}, ${result.country} at ${result.latitude}, ${result.longitude}`);

    return {
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      admin1: result.admin1, // State/region if available
    };

  } catch (error) {
    console.error(`Error geocoding city "${cityName}":`, error);
    return null;
  }
}
