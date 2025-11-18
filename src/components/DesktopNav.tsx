"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { Home, Search, Calendar } from "lucide-react";

/**
 * DesktopNav Component
 *
 * Desktop-only navigation bar (hidden on mobile/tablet)
 * Appears before the footer on desktop screens
 * Features black background in light mode, white background in dark mode
 *
 * Navigation items:
 * - Home: Navigate to main page
 * - Search: Navigate to all cities search page
 * - Calendar: Navigate to world calendar with timezone support
 *
 * Responsive design:
 * - Mobile/Tablet (< 768px): Hidden
 * - Desktop/Laptop (≥ 768px): Visible with centered layout
 */

export function DesktopNav() {
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
        backgroundColor: "#ffffff",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#e5e7eb",
      }
    : {
        backgroundColor: "#000000",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#1f2937",
      };

  // HARDCODED icon/text colors
  const getItemStyle = (isActive: boolean): React.CSSProperties => {
    if (theme === "dark") {
      return {
        color: "#000000",
        backgroundColor: isActive ? "#f3f4f6" : "transparent",
      };
    } else {
      return {
        color: isActive ? "#ffffff" : "#d1d5db",
        backgroundColor: isActive ? "#1f2937" : "transparent",
      };
    }
  };

  return (
    <nav className="hidden md:block">
      <div className="rounded-2xl px-8 py-6 shadow-lg" style={navBarStyle}>
        <div className="flex items-center justify-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 hover:shadow-xl"
                style={getItemStyle(isActive)}
              >
                <Icon
                  size={28}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="transition-all"
                />
                <span className="text-sm font-light tracking-wide">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
