"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { getCurrentSeason, seasonalThemes, Season } from '@/lib/themes/seasonal';

export default function WebsiteLayout({
  children
}: {
  children: React.ReactNode
}) {
  // 1. ÉTATS (States & Refs)
  const [currentSeason, setCurrentSeason] = useState<Season>(getCurrentSeason());
  const [themeClasses, setThemeClasses] = useState(seasonalThemes[currentSeason]);

  // 2. EFFETS (Effects)
  useEffect(() => {
    const updateSeason = () => {
      const season = getCurrentSeason();
      setCurrentSeason(season);
      setThemeClasses(seasonalThemes[season]);
    };

    updateSeason();
    const seasonInterval = setInterval(updateSeason, 3600000);

    return () => clearInterval(seasonInterval);
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
    </>
  );
}
