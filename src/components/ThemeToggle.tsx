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

  // HARDCODED inline styles
  const buttonStyle: React.CSSProperties = theme === "dark"
    ? {
        backgroundColor: "#ffffff",
        color: "#000000",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#d1d5db",
      }
    : {
        backgroundColor: "#000000",
        color: "#ffffff",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#1f2937",
      };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg w-[90px] h-[42px]"
        style={buttonStyle}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
      style={buttonStyle}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <>
          <Moon size={18} strokeWidth={1.5} />
          <span className="text-sm font-light">Dark</span>
        </>
      ) : (
        <>
          <Sun size={18} strokeWidth={1.5} />
          <span className="text-sm font-light">Light</span>
        </>
      )}
    </button>
  );
}
