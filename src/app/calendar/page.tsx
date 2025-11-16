"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { DesktopNav } from "@/components/DesktopNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TemperatureToggle } from "@/components/TemperatureToggle";

/**
 * Calendar Page
 *
 * Interactive calendar showing current date and time across different timezones
 * Features:
 * - Current month calendar view
 * - Real-time clock
 * - Major world timezone selection
 * - Responsive design for mobile and desktop
 */

// Major world timezones with unique city icons
const TIMEZONES = [
  { name: "New York", zone: "America/New_York", flag: "🗽" },      // Statue of Liberty
  { name: "London", zone: "Europe/London", flag: "🏰" },           // Castle/Big Ben
  { name: "Paris", zone: "Europe/Paris", flag: "🗼" },             // Eiffel Tower
  { name: "Tokyo", zone: "Asia/Tokyo", flag: "🗾" },               // Japan map
  { name: "Sydney", zone: "Australia/Sydney", flag: "🦘" },        // Kangaroo
  { name: "Dubai", zone: "Asia/Dubai", flag: "🕌" },               // Mosque/Architecture
  { name: "Los Angeles", zone: "America/Los_Angeles", flag: "🎬" }, // Hollywood
  { name: "Hong Kong", zone: "Asia/Hong_Kong", flag: "🏙️" },       // Cityscape
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState(TIMEZONES[0]);
  const [mounted, setMounted] = useState(false);

  // Update time every second
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get calendar data for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Format time for selected timezone
  const getTimeInTimezone = () => {
    if (!mounted) return "Loading...";

    return currentDate.toLocaleTimeString("en-US", {
      timeZone: selectedTimezone.zone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Format date for selected timezone
  const getDateInTimezone = () => {
    if (!mounted) return "Loading...";

    return currentDate.toLocaleDateString("en-US", {
      timeZone: selectedTimezone.zone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const today = currentDate.getDate();
  const calendarDays = getCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6 md:p-12 pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto">

        {/* Toggle controls */}
        <div className="flex justify-end gap-3 mb-6">
          <ThemeToggle />
          <TemperatureToggle />
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
              <CalendarIcon size={40} className="text-gray-900 dark:text-white" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-light mb-2 tracking-tight text-gray-900 dark:text-white">
            World Calendar
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg font-light">
            Current date and time across the globe
          </p>
        </div>

        {/* Timezone Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
            <h2 className="text-lg font-light text-gray-900 dark:text-white">Select Timezone</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TIMEZONES.map((tz) => (
              <button
                key={tz.zone}
                onClick={() => setSelectedTimezone(tz)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  selectedTimezone.zone === tz.zone
                    ? "border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-700"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
              >
                <div className="text-2xl mb-1">{tz.flag}</div>
                <div className="text-sm font-light text-gray-900 dark:text-white">{tz.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Time Display */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock size={20} className="text-gray-600 dark:text-gray-400" strokeWidth={1.5} />
            <h2 className="text-lg font-light text-gray-900 dark:text-white">
              Current Time in {selectedTimezone.name}
            </h2>
          </div>

          <div className="text-center">
            <div className="text-5xl md:text-7xl font-light text-gray-900 dark:text-white mb-4 font-mono">
              {getTimeInTimezone()}
            </div>
            <div className="text-lg md:text-xl text-gray-700 dark:text-gray-300 font-light">
              {getDateInTimezone()}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <h2 className="text-2xl font-light text-gray-900 dark:text-white mb-6 text-center">
            {monthName}
          </h2>

          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs md:text-sm font-light text-gray-600 dark:text-gray-400 uppercase tracking-wide py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center rounded-xl text-sm md:text-base font-light transition-colors ${
                  day === null
                    ? ""
                    : day === today
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-normal"
                    : "bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center">
          <Link
            href="/"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-light text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* NEW: Desktop navigation - appears before footer on desktop only */}
        <div className="mt-12">
          <DesktopNav />
        </div>

        {/* Footer */}
        <footer className="mt-8 mb-4 text-center">
          <p className="text-gray-700 dark:text-gray-400 text-sm font-light">
            Made with 🖤 by @theoriginalmapd
          </p>
        </footer>
      </div>
    </div>
  );
}
