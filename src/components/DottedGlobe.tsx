"use client";

interface DottedGlobeProps {
  size?: number;
  color?: string;
  accent?: string;
  pinLat?: number;
  pinLon?: number;
}

export function DottedGlobe({
  size = 200,
  color = '#222',
  accent = '#FF6B1A',
  pinLat = 0.5,
  pinLon = 0.5,
}: DottedGlobeProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const dots: { x: number; y: number; s: number; op: number }[] = [];
  const rows = 22;

  for (let i = 0; i < rows; i++) {
    const lat = (i / (rows - 1)) * Math.PI - Math.PI / 2;
    const cosLat = Math.cos(lat);
    const yy = cy + Math.sin(lat) * r;
    const rowWidth = Math.max(2, Math.round(rows * cosLat * 1.2));
    for (let j = 0; j < rowWidth; j++) {
      const lon = (j / (rowWidth - 1)) * Math.PI * 0.95 - Math.PI * 0.475;
      const xx = cx + Math.sin(lon) * r * cosLat;
      const landish = (Math.sin(lat * 5.2) + Math.cos(lon * 3.1 + lat * 2)) > -0.2;
      dots.push({ x: xx, y: yy, s: landish ? 1.6 : 1.1, op: landish ? 0.95 : 0.35 });
    }
  }

  const pinX = cx + (pinLon - 0.5) * r * 1.2;
  const pinY = cy - (pinLat - 0.5) * r * 1.2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={color} opacity={d.op} />
      ))}
      <circle cx={pinX} cy={pinY} r="14" fill={accent} opacity="0.18" />
      <circle cx={pinX} cy={pinY} r="6" fill={accent} />
      <circle cx={pinX} cy={pinY} r="2.5" fill="#fff" />
    </svg>
  );
}

export function latLonToPinCoords(lat: number, lon: number): { pinLat: number; pinLon: number } {
  const pinLat = Math.max(0.05, Math.min(0.95, (lat + 90) / 180));
  const pinLon = Math.max(0.05, Math.min(0.95, 0.5 + (lon / 180) * 0.45));
  return { pinLat, pinLon };
}
