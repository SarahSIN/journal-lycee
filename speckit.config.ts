import { defineConfig } from 'speckit'

export default defineConfig({
  // Configuration de base pour Speckit
  testDir: './src/__tests__',
  coverageDir: './coverage',
  reporters: ['default', 'html'],
  
  // Configuration spécifique à React et TypeScript
  framework: 'react',
  setupFiles: ['./jest.setup.ts'],
  
  // Règles de transformation
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  
  // Modules à ignorer lors des tests
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/node_modules/'
  ],
  
  // Configuration de couverture de code
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__tests__/**'
  ]
})