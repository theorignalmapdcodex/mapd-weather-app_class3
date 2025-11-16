"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar } from "lucide-react";

/**
 * DesktopNav Component
 *
 * Desktop-only navigation bar (hidden on mobile/tablet)
 * Appears before the footer on desktop screens
 * Features dark background with white/light icons
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

  return (
    <nav className="hidden md:block">
      <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl px-8 py-6 shadow-lg">
        <div className="flex items-center justify-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-300 hover:text-white hover:bg-black"
                }`}
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
