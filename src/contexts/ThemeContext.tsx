"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    // Default is light - don't check system preference
  }, []);

  // Update HTML class when theme changes (immediately, not waiting for mount)
  useEffect(() => {
    const root = document.documentElement;
    console.log("Theme changed to:", theme);
    console.log("HTML element classes before:", root.className);

    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    console.log("HTML element classes after:", root.className);

    // Only save to localStorage after mounting to avoid SSR issues
    if (mounted) {
      localStorage.setItem("theme", theme);
      console.log("Saved theme to localStorage:", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    console.log("Toggle theme clicked!");
    setTheme((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      console.log("Changing theme from", prev, "to", newTheme);
      return newTheme;
    });
  };

  // Always provide the context, even before mounting
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return default values during SSR instead of throwing
    if (typeof window === "undefined") {
      return { theme: "light" as Theme, toggleTheme: () => {} };
    }
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
