"use client";

import { Inter, Playfair_Display } from 'next/font/google';
import { getCurrentSeason, seasonalThemes, Season } from '@/lib/themes/seasonal';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// 1. FONT CONFIGURATIONS
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap'
});

const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-playfair',
  display: 'swap'
});

export default function WebsiteLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  // 2. SEASONAL STATE MANAGEMENT
  const [currentSeason, setCurrentSeason] = useState<Season>(getCurrentSeason());
  const [themeClasses, setThemeClasses] = useState(seasonalThemes[currentSeason]);

  // 3. SEASONAL THEME EFFECT
  useEffect(() => {
    const updateSeason = () => {
      const season = getCurrentSeason();
      setCurrentSeason(season);
      setThemeClasses(seasonalThemes[season]);
    };

    // Update season on mount and every hour
    updateSeason();
    const seasonInterval = setInterval(updateSeason, 3600000);

    return () => clearInterval(seasonInterval);
  }, []);

  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body 
        className={`
          ${themeClasses.background} 
          ${themeClasses.textPrimary} 
          min-h-screen flex flex-col 
          seasonal-transition
          font-sans
        `}
      >
        <Navbar season={currentSeason} themeClasses={themeClasses} />
        
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        
        <Footer season={currentSeason} themeClasses={themeClasses} />
      </body>
    </html>
  );
}