// 1. TYPES
export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

// 2. SEASONAL THEME CONFIGURATION
export const seasonalThemes = {
  winter: {
    background: 'bg-gradient-to-br from-blue-900 via-indigo-800 to-violet-900',
    textPrimary: 'text-blue-50',
    textSecondary: 'text-blue-200',
    cardBackground: 'bg-white/10 backdrop-blur-md',
    accentColor: 'text-blue-300',
  },
  spring: {
    background: 'bg-gradient-to-br from-green-200 via-emerald-300 to-teal-300',
    textPrimary: 'text-green-900',
    textSecondary: 'text-green-700',
    cardBackground: 'bg-white/20 backdrop-blur-md',
    accentColor: 'text-emerald-600',
  },
  summer: {
    background: 'bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400',
    textPrimary: 'text-orange-900',
    textSecondary: 'text-orange-700',
    cardBackground: 'bg-white/30 backdrop-blur-md',
    accentColor: 'text-red-600',
  },
  autumn: {
    background: 'bg-gradient-to-br from-orange-600 via-amber-700 to-red-800',
    textPrimary: 'text-orange-50',
    textSecondary: 'text-orange-200',
    cardBackground: 'bg-white/15 backdrop-blur-md',
    accentColor: 'text-amber-400',
  }
};

// 3. UTILITY FUNCTIONS
export function getCurrentSeason(): Season {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}