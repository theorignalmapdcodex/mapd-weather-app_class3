"use client";

interface WeatherIconProps {
  /** WMO weather code OR CityCast condition key */
  code?: number;
  type?: 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow';
  size?: number;
  color?: string;
  accent?: string;
  night?: boolean;
  className?: string;
}

function codeToType(code: number): 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow' {
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloudy';
}

export function WeatherIcon({
  code,
  type,
  size = 48,
  color = 'currentColor',
  accent = '#FF6B1A',
  night = false,
  className,
}: WeatherIconProps) {
  const s = size;
  const stroke = Math.max(2, s * 0.055);
  const t = type ?? (code !== undefined ? codeToType(code) : 'cloudy');

  if (t === 'sunny') {
    if (night) {
      return (
        <svg width={s} height={s} viewBox="0 0 48 48" fill="none" className={className}>
          <path
            d="M32 24a12 12 0 0 1-14.5-14 12 12 0 1 0 14.5 14Z"
            fill={color} stroke={color} strokeWidth={stroke} strokeLinejoin="round"
          />
        </svg>
      );
    }
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" className={className}>
        <circle cx="24" cy="24" r="9" fill={accent} stroke={color} strokeWidth={stroke} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
          const rad = (a * Math.PI) / 180;
          return (
            <line key={a}
              x1={24 + Math.cos(rad) * 15} y1={24 + Math.sin(rad) * 15}
              x2={24 + Math.cos(rad) * 20} y2={24 + Math.sin(rad) * 20}
              stroke={color} strokeWidth={stroke} strokeLinecap="round"
            />
          );
        })}
      </svg>
    );
  }

  if (t === 'cloudy') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M14 32h22a6 6 0 0 0 0-12 5.5 5.5 0 0 0-1-.1A9 9 0 0 0 17 17a7 7 0 0 0-3 15Z"
          fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (t === 'rain') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M14 26h22a6 6 0 0 0 0-12 5.5 5.5 0 0 0-1-.1A9 9 0 0 0 17 11a7 7 0 0 0-3 15Z"
          fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round"
        />
        <line x1="17" y1="32" x2="14" y2="40" stroke={accent} strokeWidth={stroke} strokeLinecap="round" />
        <line x1="25" y1="32" x2="22" y2="40" stroke={accent} strokeWidth={stroke} strokeLinecap="round" />
        <line x1="33" y1="32" x2="30" y2="40" stroke={accent} strokeWidth={stroke} strokeLinecap="round" />
      </svg>
    );
  }

  if (t === 'storm') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M14 24h22a6 6 0 0 0 0-12 5.5 5.5 0 0 0-1-.1A9 9 0 0 0 17 9a7 7 0 0 0-3 15Z"
          fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round"
        />
        <path
          d="M24 28l-5 9h5l-2 8 7-10h-5l3-7z"
          fill={accent} stroke={color} strokeWidth={stroke * 0.7} strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (t === 'snow') {
    return (
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none" className={className}>
        <path
          d="M14 26h22a6 6 0 0 0 0-12 5.5 5.5 0 0 0-1-.1A9 9 0 0 0 17 11a7 7 0 0 0-3 15Z"
          fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round"
        />
        {[16, 24, 32].map((x, i) => (
          <g key={i} stroke={accent} strokeWidth={stroke} strokeLinecap="round">
            <line x1={x} y1="33" x2={x} y2="39" />
            <line x1={x - 2.5} y1="34.5" x2={x + 2.5} y2="37.5" />
            <line x1={x + 2.5} y1="34.5" x2={x - 2.5} y2="37.5" />
          </g>
        ))}
      </svg>
    );
  }

  return null;
}
