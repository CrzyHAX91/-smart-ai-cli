module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest'
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.cjs'],
  collectCoverageFrom: [
    'src/**/*.js',
    'utils/**/*.js',
    'services/**/*.js',
    'commands/**/*.js',
    '!**/node_modules/**'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
  testTimeout: 10000
};
