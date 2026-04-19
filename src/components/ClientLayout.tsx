"use client";

import { useState, useEffect, ReactNode } from "react";
import { SplashScreen } from "@/components/SplashScreen";

export function ClientLayout({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("cc-splash");
    if (!shown) setShowSplash(true);
  }, []);

  const handleSplashDone = () => {
    setShowSplash(false);
    sessionStorage.setItem("cc-splash", "1");
  };

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      {children}
    </>
  );
}
