/**
 * MODIFIED COMPONENT: CityPictureCard
 *
 * Displays a beautiful image card for each city
 * Now uses Unsplash API for dynamic city images with fallback to local images
 * Features minimalistic design with rounded corners and subtle shadow
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getCityImage } from "@/lib/unsplash";

interface CityPictureCardProps {
  cityName: string; // Name of the city to display image for
  className?: string; // Optional additional styling
}

export function CityPictureCard({ cityName, className = "" }: CityPictureCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Map city names to their corresponding local fallback image paths
  const cityImageMap: Record<string, string> = {
    durham: "/city-images/durham.jpg",
    "new york": "/city-images/new-york.jpg",
    tokyo: "/city-images/tokyo.jpg",
    accra: "/city-images/accra.jpg",
    lausanne: "/city-images/lausanne.jpg",
    santorini: "/city-images/santorini.jpg",
  };

  // Fetch city image from Unsplash on component mount
  useEffect(() => {
    let isMounted = true;

    async function fetchImage() {
      setIsLoading(true);

      // Try to get image from Unsplash API
      const unsplashUrl = await getCityImage(cityName);

      if (isMounted) {
        if (unsplashUrl) {
          setImageUrl(unsplashUrl);
        } else {
          // Fallback to local image if Unsplash fails or no API key
          const localImage =
            cityImageMap[cityName.toLowerCase()] || "/city-images/default.jpg";
          setImageUrl(localImage);
        }
        setIsLoading(false);
      }
    }

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [cityName]);

  // Get fallback image path
  const fallbackImage =
    cityImageMap[cityName.toLowerCase()] || "/city-images/default.jpg";

  return (
    <div
      className={`relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 font-light">Loading image...</p>
        </div>
      )}

      {/* City Image - either from Unsplash or local fallback */}
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt={`${cityName} cityscape`}
            fill
            className="object-cover"
            priority // Load image with high priority for better UX
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // If Unsplash image fails to load, fallback to local image
              const target = e.target as HTMLImageElement;
              target.src = fallbackImage;
            }}
          />

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* City name overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3
              className="text-3xl md:text-4xl font-light tracking-wide drop-shadow-2xl"
              style={{
                color: "#ffffff",
                textShadow: "2px 2px 8px rgba(0,0,0,0.9)",
              }}
            >
              {cityName}
            </h3>
          </div>
        </>
      )}
    </div>
  );
}
