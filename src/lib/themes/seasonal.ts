// Définition des thèmes saisonniers pour le journal du lycée Ozenne

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonalTheme {
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  accentColor: string
}

export const seasonalThemes: Record<Season, SeasonalTheme> = {
  spring: {
    name: 'Printemps',
    primaryColor: '#4CAF50',
    secondaryColor: '#81C784',
    backgroundColor: '#E8F5E9',
    textColor: '#1B5E20',
    accentColor: '#A5D6A7'
  },
  summer: {
    name: 'Été',
    primaryColor: '#2196F3',
    secondaryColor: '#64B5F6',
    backgroundColor: '#E3F2FD',
    textColor: '#0D47A1',
    accentColor: '#90CAF9'
  },
  autumn: {
    name: 'Automne',
    primaryColor: '#FF5722',
    secondaryColor: '#FF8A50',
    backgroundColor: '#FBE9E7',
    textColor: '#BF360C',
    accentColor: '#FFAB91'
  },
  winter: {
    name: 'Hiver',
    primaryColor: '#9C27B0',
    secondaryColor: '#BA68C8',
    backgroundColor: '#F3E5F5',
    textColor: '#4A148C',
    accentColor: '#E1BEE7'
  }
}

export function getCurrentSeason(): Season {
  const currentMonth = new Date().getMonth()
  
  if (currentMonth >= 2 && currentMonth <= 4) return 'spring'
  if (currentMonth >= 5 && currentMonth <= 7) return 'summer'
  if (currentMonth >= 8 && currentMonth <= 10) return 'autumn'
  
  return 'winter'
}

export function getCurrentSeasonalTheme(): SeasonalTheme {
  return seasonalThemes[getCurrentSeason()]
}

export function applySeasonalTheme(theme: SeasonalTheme) {
  document.documentElement.style.setProperty('--primary-color', theme.primaryColor)
  document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor)
  document.documentElement.style.setProperty('--background-color', theme.backgroundColor)
  document.documentElement.style.setProperty('--text-color', theme.textColor)
  document.documentElement.style.setProperty('--accent-color', theme.accentColor)
}

export function initSeasonalTheme() {
  const currentTheme = getCurrentSeasonalTheme()
  applySeasonalTheme(currentTheme)
}