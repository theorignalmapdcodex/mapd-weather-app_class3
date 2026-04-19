"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { useWeather } from "@/contexts/WeatherContext";

export function ClientLayout({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const minTimeElapsed = useRef(false);
  const { loading } = useWeather();

  // Minimum display time: 1.8s — after that, dismiss as soon as weather loads
  useEffect(() => {
    const t = setTimeout(() => {
      minTimeElapsed.current = true;
      if (!loading) setShowSplash(false);
    }, 1800);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!loading && minTimeElapsed.current) setShowSplash(false);
  }, [loading]);

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {children}
    </>
  );
}
