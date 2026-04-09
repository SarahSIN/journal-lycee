import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Polices personnalisées
      fontFamily: {
        'playfair': ['var(--font-playfair)', 'serif'],
        'roboto': ['var(--font-roboto)', 'sans-serif'],
      },
      // Thème hivernal avec dégradé
      backgroundImage: {
        'winter-gradient': 'linear-gradient(to bottom right, #1E3A8A, #6B21A8, #9D174D)',
      },
      // Effet Glassmorphism pour les cartes
      backdropBlur: {
        'glassmorphism': '10px',
      },
      // Couleurs personnalisées pour le thème hivernal
      colors: {
        'winter': {
          'dark-blue': '#1E3A8A',
          'deep-purple': '#6B21A8',
          'winter-pink': '#9D174D',
        }
      }
    },
  },
  plugins: [],
}

export default config