/**
 * Unsplash API integration for fetching city images
 *
 * To use this:
 * 1. Sign up for a free Unsplash API account at https://unsplash.com/developers
 * 2. Create a new application to get your Access Key
 * 3. Create a .env.local file in the root of your project
 * 4. Add: NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_access_key_here
 */

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

/**
 * Fetches a random city image from Unsplash API
 * @param cityName - Name of the city to search for
 * @returns URL of the city image or null if not found
 */
export async function getCityImage(cityName: string): Promise<string | null> {
  // Check if API key is available
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn(
      "Unsplash API key not found. Please add NEXT_PUBLIC_UNSPLASH_ACCESS_KEY to your .env.local file"
    );
    return null;
  }

  try {
    // Search for city images with specific query for better results
    const query = `${cityName} city skyline landmark`;
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=1&orientation=landscape&client_id=${accessKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Unsplash API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();

    // Return the first image URL if available
    if (data.results && data.results.length > 0) {
      const image: UnsplashImage = data.results[0];
      // Return the 'regular' size for good quality without being too large
      return image.urls.regular;
    }

    return null;
  } catch (error) {
    console.error("Error fetching city image from Unsplash:", error);
    return null;
  }
}

/**
 * Fetches a random high-quality city image from Unsplash
 * This version provides variety by using the random endpoint
 * @param cityName - Name of the city
 * @returns URL of the city image or null if not found
 */
export async function getRandomCityImage(
  cityName: string
): Promise<string | null> {
  const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn("Unsplash API key not found");
    return null;
  }

  try {
    // Use random endpoint for variety
    const query = `${cityName} city`;
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      query
    )}&orientation=landscape&client_id=${accessKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error("Unsplash API error:", response.status);
      return null;
    }

    const image: UnsplashImage = await response.json();
    return image.urls.regular;
  } catch (error) {
    console.error("Error fetching random city image:", error);
    return null;
  }
}
