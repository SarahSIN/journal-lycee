import React, { useEffect, useState } from 'react'
import { 
  getCurrentSeasonalTheme, 
  SeasonalTheme, 
  applySeasonalTheme 
} from '@/lib/themes/seasonal'

interface SeasonalThemeProviderProps {
  children: React.ReactNode
}

export const SeasonalThemeProvider: React.FC<SeasonalThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<SeasonalTheme | null>(null)

  useEffect(() => {
    // Initialiser le thème au chargement
    const theme = getCurrentSeasonalTheme()
    setCurrentTheme(theme)
    applySeasonalTheme(theme)

    // Mettre à jour le thème toutes les heures (en cas de changement de saison)
    const themeUpdateInterval = setInterval(() => {
      const newTheme = getCurrentSeasonalTheme()
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme)
        applySeasonalTheme(newTheme)
      }
    }, 3600000) // 1 heure

    return () => clearInterval(themeUpdateInterval)
  }, [])

  if (!currentTheme) return null

  return (
    <div 
      className="seasonal-theme"
      style={{
        backgroundColor: currentTheme.backgroundColor,
        color: currentTheme.textColor
      }}
    >
      {children}
    </div>
  )
}

// Hook personnalisé pour accéder au thème courant
export const useSeasonalTheme = () => {
  const [theme, setTheme] = useState<SeasonalTheme>(getCurrentSeasonalTheme())

  useEffect(() => {
    const updateTheme = () => {
      const newTheme = getCurrentSeasonalTheme()
      setTheme(newTheme)
    }

    // Vérifier le thème toutes les heures
    const interval = setInterval(updateTheme, 3600000)
    
    return () => clearInterval(interval)
  }, [])

  return theme
}