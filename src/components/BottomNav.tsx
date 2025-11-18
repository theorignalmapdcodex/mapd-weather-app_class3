"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { Home, Search, Calendar } from "lucide-react";

/**
 * BottomNav Component
 *
 * Mobile-only fixed bottom navigation bar (hidden on desktop/laptop)
 * - Home: Navigate to main page
 * - Search: Navigate to all cities search page
 * - Calendar: Navigate to world calendar with timezone support
 *
 * Responsive design:
 * - Mobile/Tablet (< 768px): Visible with full-width layout
 * - Desktop/Laptop (≥ 768px): Hidden (navigation through page links instead)
 */

export function BottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Search",
      href: "/weather/all-cities",
      icon: Search,
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
    },
  ];

  // HARDCODED nav bar background style
  const navBarStyle: React.CSSProperties = theme === "dark"
    ? {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: "#e5e7eb",
      }
    : {
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: "#1f2937",
      };

  // HARDCODED icon/text colors
  const getItemStyle = (isActive: boolean): React.CSSProperties => {
    if (theme === "dark") {
      return {
        color: "#000000",
        backgroundColor: isActive ? "#f3f4f6" : "transparent",
        borderWidth: isActive ? "1px" : "1px",
        borderStyle: "solid",
        borderColor: isActive ? "#d1d5db" : "transparent",
      };
    } else {
      return {
        color: isActive ? "#ffffff" : "#d1d5db",
        backgroundColor: isActive ? "#374151" : "transparent",
        borderWidth: isActive ? "1px" : "1px",
        borderStyle: "solid",
        borderColor: isActive ? "#4b5563" : "transparent",
      };
    }
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur-md shadow-lg z-50 safe-area-inset-bottom" style={navBarStyle}>
      {/*
        Mobile-only navigation bar (hidden on desktop with md:hidden)
        - Shows only on screens smaller than 768px (mobile/tablet)
        - Hidden on desktop/laptop screens
      */}
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[70px] shadow-sm"
                style={getItemStyle(isActive)}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className="transition-all"
                />
                <span className="text-[10px] font-light tracking-wide">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Safe area for mobile devices with notches/home indicators */}
      <div className="h-safe-area-inset-bottom backdrop-blur-md" style={navBarStyle} />
    </nav>
  );
}
