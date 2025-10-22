# Weather App

A simple weather application built with Next.js 16, TypeScript, and Tailwind CSS for teaching basic React concepts.

## Features

- Simple home page with current weather display
- Detailed forecast page with 3-day predictions
- City selection dropdown
- Reusable UI components
- Clean, modern design with dark mode support

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page
│   └── weather/[location]/
│       └── page.tsx                # Detailed weather page
├── components/
│   ├── LocationSearch.tsx          # City dropdown selector
│   ├── WeatherCard.tsx             # Current weather card
│   ├── WeatherDisplay.tsx          # Weather display with navigation
│   ├── WeatherIcon.tsx             # Weather condition icons
│   └── ui/
│       └── Button.tsx              # Reusable button component
├── data/
│   ├── cities.ts                   # Available cities
│   └── weather-data.ts             # Weather data
├── lib/
│   └── getWeather.ts               # Weather data retrieval
└── types/
    └── weather.ts                  # TypeScript interfaces
```

## Available Cities

- Durham, NC
- New York, NY
- Tokyo, Japan

## Key Concepts

This project demonstrates:

- **Component Composition**: Building UIs from reusable components
- **Props**: Passing data between components
- **State Management**: Using useState for interactive UI
- **Dynamic Routes**: Next.js App Router with `[location]` parameter
- **TypeScript**: Type safety throughout the application
- **Tailwind CSS**: Utility-first styling
- **Conditional Rendering**: Showing different UI states

## Building for Production

```bash
npm run build
npm start
```

## License

This project is for educational purposes.
