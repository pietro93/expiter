export default {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/index-specialized.js',
    '!src/config/*.js',
    '!src/generators/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    },
    './src/utils/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75
    }
  },
  testTimeout: 10000,
  transform: {},
  collectCoverage: true,
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'json'
  ],
  coverageDirectory: 'coverage'
};
