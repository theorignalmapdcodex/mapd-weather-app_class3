"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-[90px] h-[42px]" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <>
          <Moon size={18} className="text-gray-700 dark:text-gray-300" strokeWidth={1.5} />
          <span className="text-sm font-light text-gray-700 dark:text-gray-300">Dark</span>
        </>
      ) : (
        <>
          <Sun size={18} className="text-gray-300 dark:text-gray-300" strokeWidth={1.5} />
          <span className="text-sm font-light text-gray-300 dark:text-gray-300">Light</span>
        </>
      )}
    </button>
  );
}
