export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export const CITIES: City[] = [
  // EXISTING CITIES
  {
    name: "Durham",
    latitude: 35.9940,
    longitude: -78.8986,
  },
  {
    name: "New York",
    latitude: 40.7128,
    longitude: -74.0060,
  },
  {
    name: "Tokyo",
    latitude: 35.6762,
    longitude: 139.6503,
  },
  // NEW: Added Accra, Ghana - West African coastal city
  // Tropical climate with high humidity
  {
    name: "Accra",
    latitude: 5.6037,
    longitude: -0.1870,
  },
  // NEW: Added Lausanne, Switzerland - Swiss lakeside city
  // Temperate climate with alpine influences
  {
    name: "Lausanne",
    latitude: 46.5197,
    longitude: 6.6323,
  },
  // NEW: Added Santorini, Greece - Greek island in the Aegean Sea
  // Mediterranean climate with mild, windy conditions
  {
    name: "Santorini",
    latitude: 36.3932,
    longitude: 25.4615,
  },
];

export function getCityByName(name: string): City | undefined {
  return CITIES.find(
    (city) => city.name.toLowerCase() === name.toLowerCase()
  );
}

export function getRandomCity(): City {
  const randomIndex = Math.floor(Math.random() * CITIES.length);
  return CITIES[randomIndex];
}