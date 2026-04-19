"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useWeather } from "@/contexts/WeatherContext";
import { useTasks } from "@/contexts/TaskContext";
import { weatherCodeToCondition } from "@/lib/copy";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';

// Dynamic calendar icon showing day + weather + task badge
function CalendarTabIcon({
  color, accent, inkBg, weatherCode, taskCount,
}: {
  color: string; accent: string; inkBg: string;
  weatherCode?: number; taskCount: number;
}) {
  const day = new Date().getDate();
  const cond = weatherCode !== undefined ? weatherCodeToCondition(weatherCode) : null;

  return (
    <div style={{ position: 'relative', width: 24, height: 24 }}>
      {/* Calendar outline + day number */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="19" rx="2.5" stroke={color} strokeWidth="1.6" />
        <line x1="2" y1="8" x2="22" y2="8" stroke={color} strokeWidth="1.6" />
        <line x1="7" y1="1.5" x2="7" y2="5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <line x1="17" y1="1.5" x2="17" y2="5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        <text
          x="12" y="18.5"
          textAnchor="middle"
          fill={color}
          style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700 }}
        >{day}</text>
      </svg>

      {/* Small weather icon top-left */}
      {cond && (
        <div style={{ position: 'absolute', top: -3, left: -3, width: 11, height: 11 }}>
          {cond === 'sunny' && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="2.5" fill={accent} />
              <path d="M6 1v1.2M6 9.8V11M1 6h1.2M9.8 6H11M2.5 2.5l.85.85M8.65 8.65l.85.85M9.5 2.5l-.85.85M3.35 8.65l-.85.85"
                stroke={accent} strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          )}
          {cond === 'rain' && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 7h8a3 3 0 0 0 0-6 2.8 2.8 0 0 0-.4.04A4 4 0 0 0 2 4.5a3 3 0 0 0 0 2.5Z" fill={accent} opacity="0.7" />
              <path d="M4 9l-.5 1.5M7 9l-.5 1.5" stroke={accent} strokeWidth="1.1" strokeLinecap="round" />
            </svg>
          )}
          {(cond === 'cloudy' || cond === 'snow' || cond === 'storm') && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 7h8a3 3 0 0 0 0-6 2.8 2.8 0 0 0-.4.04A4 4 0 0 0 2 4.5a3 3 0 0 0 0 2.5Z" fill={accent} opacity="0.7" />
            </svg>
          )}
        </div>
      )}

      {/* Task count badge */}
      {taskCount > 0 && (
        <div style={{
          position: 'absolute', top: -4, right: -5,
          minWidth: 13, height: 13, borderRadius: 99,
          background: accent, color: inkBg,
          fontSize: 7, fontWeight: 800, fontFamily: MONO,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 2px', lineHeight: 1,
        }}>
          {taskCount > 9 ? '9+' : taskCount}
        </div>
      )}
    </div>
  );
}

const STATIC_TABS = [
  {
    href: "/",
    label: "Home",
    icon: (c: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z"
          stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 21v-6h6v6" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/plan",
    label: "Plan",
    icon: (c: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <line x1="4" y1="7" x2="20" y2="7" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="4" y1="12" x2="20" y2="12" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="4" y1="17" x2="14" y2="17" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/places",
    label: "Places",
    icon: (c: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z"
          stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="12" cy="9" r="2.5" fill={c} />
      </svg>
    ),
  },
];

const SETTINGS_TAB = {
  href: "/settings",
  label: "Settings",
  icon: (c: string) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={c} strokeWidth="1.8" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke={c} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
};

export function BottomNav() {
  const pathname = usePathname();
  const { theme, accent } = useTheme();
  const { weather } = useWeather();
  const { incompleteCount } = useTasks();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const calendarActive = pathname.startsWith("/calendar");
  const calendarColor = calendarActive ? accent : theme.chipText;

  return (
    <nav style={{
      position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 50,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: theme.chip, borderRadius: 999, padding: '8px 6px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
      }}>
        {/* Static tabs: Home / Plan / Places */}
        {STATIC_TABS.map(tab => {
          const active = isActive(tab.href);
          const color = active ? accent : theme.chipText;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                minWidth: 44, minHeight: 44, justifyContent: 'center',
                textDecoration: 'none', WebkitUserSelect: 'none', userSelect: 'none',
              }}
            >
              {tab.icon(color)}
              <span style={{
                fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                textTransform: 'uppercase', color, transition: 'color 0.15s',
              }}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* Calendar tab — dynamic icon */}
        <Link
          href="/calendar"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            minWidth: 44, minHeight: 44, justifyContent: 'center',
            textDecoration: 'none', WebkitUserSelect: 'none', userSelect: 'none',
          }}
        >
          <CalendarTabIcon
            color={calendarColor}
            accent={accent}
            inkBg={theme.chip}
            weatherCode={weather?.current.condition.code}
            taskCount={incompleteCount}
          />
          <span style={{
            fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
            textTransform: 'uppercase', color: calendarColor, transition: 'color 0.15s',
          }}>
            Calendar
          </span>
        </Link>

        {/* Settings tab */}
        {(() => {
          const active = isActive(SETTINGS_TAB.href);
          const color = active ? accent : theme.chipText;
          return (
            <Link
              href={SETTINGS_TAB.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                minWidth: 44, minHeight: 44, justifyContent: 'center',
                textDecoration: 'none', WebkitUserSelect: 'none', userSelect: 'none',
              }}
            >
              {SETTINGS_TAB.icon(color)}
              <span style={{
                fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                textTransform: 'uppercase', color, transition: 'color 0.15s',
              }}>
                Settings
              </span>
            </Link>
          );
        })()}
      </div>
    </nav>
  );
}
