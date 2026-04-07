"use client";

import '../globals.css';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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
    <html lang="fr">
      <body className="bg-slate-950 text-white min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-black">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
