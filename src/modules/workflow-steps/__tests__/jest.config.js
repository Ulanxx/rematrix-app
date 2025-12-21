module.exports = {
  displayName: 'Workflow Steps',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    '../**/*.ts',
    '!../**/*.spec.ts',
    '!../**/__tests__/**',
    '!../index.ts',
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/../../$1',
  },
  testTimeout: 30000,
};
