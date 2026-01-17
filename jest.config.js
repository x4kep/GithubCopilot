module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'services/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/tests/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/e2e/'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
