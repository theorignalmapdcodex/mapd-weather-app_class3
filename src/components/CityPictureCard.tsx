/**
 * NEW COMPONENT: CityPictureCard
 * 
 * Displays a beautiful image card for each city
 * Images change dynamically based on the selected city
 * Features minimalistic design with rounded corners and subtle shadow
 */

import Image from "next/image";

interface CityPictureCardProps {
  cityName: string; // Name of the city to display image for
  className?: string; // Optional additional styling
}

export function CityPictureCard({ cityName, className = "" }: CityPictureCardProps) {
  // Map city names to their corresponding image paths
  // Images should be placed in: /public/city-images/
  const cityImageMap: Record<string, string> = {
    durham: "/city-images/durham.jpg",
    "new york": "/city-images/new-york.jpg",
    tokyo: "/city-images/tokyo.jpg",
    accra: "/city-images/accra.jpg",
    lausanne: "/city-images/lausanne.jpg",
    santorini: "/city-images/santorini.jpg",
  };

  // Get the image path for the current city (case-insensitive)
  const imagePath = cityImageMap[cityName.toLowerCase()] || "/city-images/default.jpg";

  return (
    <div className={`relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-sm border border-gray-100 ${className}`}>
      {/* City Image with Next.js Image optimization */}
      <Image
        src={imagePath}
        alt={`${cityName} cityscape`}
        fill
        className="object-cover"
        priority // Load image with high priority for better UX
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      
      {/* City name overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-3xl md:text-4xl font-light text-white tracking-wide drop-shadow-lg">
          {cityName}
        </h3>
      </div>
    </div>
  );
}
