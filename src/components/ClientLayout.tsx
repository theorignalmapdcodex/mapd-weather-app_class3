"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { TutorialOverlay } from "@/components/TutorialOverlay";
import { useWeather } from "@/contexts/WeatherContext";

export function ClientLayout({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const minTimeElapsed = useRef(false);
  const { loading } = useWeather();

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

  // Show tutorial after splash if never completed
  useEffect(() => {
    if (!showSplash) {
      const done = localStorage.getItem('cc-tutorial-v1');
      if (!done) setShowTutorial(true);
    }
  }, [showSplash]);

  // Listen for manual trigger from Settings
  useEffect(() => {
    const handler = () => setShowTutorial(true);
    window.addEventListener('cc-show-tutorial', handler);
    return () => window.removeEventListener('cc-show-tutorial', handler);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      {!showSplash && showTutorial && (
        <TutorialOverlay onDone={() => setShowTutorial(false)} />
      )}
      {children}
    </>
  );
}
