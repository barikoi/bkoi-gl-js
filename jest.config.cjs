module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/test/config/setup.js'],
  testMatch: ['<rootDir>/test/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
  ],
  moduleFileExtensions: ['js', 'ts', 'json', 'mjs'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest',
  },
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  // Mock external dependencies
  moduleNameMapper: {
    '^maplibre-gl$': '<rootDir>/test/mocks/__mocks__/maplibre-gl.js',
    '^maplibre-gl-draw$': '<rootDir>/test/mocks/__mocks__/maplibre-gl-draw.js',
  },
  // Transform ESM imports in test files
  transformIgnorePatterns: [
    'node_modules/(?!maplibre-gl|maplibre-gl-draw)',
  ],
  // Handle async/await in tests and browser environment
  setupFiles: [
    '<rootDir>/test/config/babel-setup.js',
    '<rootDir>/test/config/browser-env.js'
  ],
};
