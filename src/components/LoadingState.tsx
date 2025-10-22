/**
 * Displays a loading indicator
 */

export function LoadingState() {
  return (
    <div className="flex justify-center">
      <div className="text-zinc-600 dark:text-zinc-400">
        Loading weather data...
      </div>
    </div>
  );
}
