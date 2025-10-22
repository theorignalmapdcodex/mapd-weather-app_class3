export interface City {
  name: string;
  latitude: number;
  longitude: number;
}

export const CITIES: City[] = [
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
