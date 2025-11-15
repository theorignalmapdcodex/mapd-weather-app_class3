"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Calendar } from "lucide-react";

/**
 * BottomNav Component
 *
 * Mobile-only fixed bottom navigation bar (hidden on desktop/laptop)
 * - Home: Navigate to main page
 * - Search: Navigate to all cities search page
 * - Calendar: Navigate to forecast/calendar view (future feature)
 *
 * Responsive design:
 * - Mobile/Tablet (< 768px): Visible with full-width layout
 * - Desktop/Laptop (≥ 768px): Hidden (navigation through page links instead)
 */

export function BottomNav() {
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
      href: "#", // Placeholder for future feature
      icon: Calendar,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50 safe-area-inset-bottom">
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
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[70px] ${
                  isActive
                    ? "text-gray-900 bg-gray-100"
                    : "text-gray-500 active:bg-gray-100"
                }`}
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
      <div className="h-safe-area-inset-bottom bg-white/95 backdrop-blur-md" />
    </nav>
  );
}
