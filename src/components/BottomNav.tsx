"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

const MONO = 'var(--font-jetbrains-mono), "JetBrains Mono", monospace';

const TABS = [
  {
    href: "/",
    label: "Now",
    icon: (c: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z"
          stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 21v-6h6v6" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/hourly",
    label: "Hourly",
    icon: (c: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.8" />
        <path d="M12 7v5l3 3" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/7-day",
    label: "7-Day",
    icon: (c: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="17" rx="3" stroke={c} strokeWidth="1.8" />
        <line x1="3" y1="9" x2="21" y2="9" stroke={c} strokeWidth="1.8" />
        <line x1="8" y1="2" x2="8" y2="6" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <line x1="16" y1="2" x2="16" y2="6" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="8" cy="14" r="1.2" fill={c} />
        <circle cx="12" cy="14" r="1.2" fill={c} />
        <circle cx="16" cy="14" r="1.2" fill={c} />
        <circle cx="8" cy="18" r="1.2" fill={c} />
        <circle cx="12" cy="18" r="1.2" fill={c} />
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

export function BottomNav() {
  const pathname = usePathname();
  const { theme, accent } = useTheme();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

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
        {TABS.map(tab => {
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
      </div>
    </nav>
  );
}
