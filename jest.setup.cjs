const { jest } = require('@jest/globals');
const chalkMock = require('./__tests__/utils/chalkMock.js');

// Set test timeout
jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = 'test';

// Mock chalk globally
jest.mock('chalk', () => chalkMock);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Keep error logging for debugging
  error: jest.fn(),
  // Silence log and info in tests
  log: jest.fn(),
  info: jest.fn(),
  // Keep warnings but make them mockable
  warn: jest.fn()
};

// Mock process.exit to prevent tests from actually exiting
process.exit = jest.fn();

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200
  })
);

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Reset fetch mock
  global.fetch.mockClear();
  // Reset console mocks
  console.log.mockClear();
  console.info.mockClear();
  console.warn.mockClear();
  console.error.mockClear();
});

// Clean up after all tests
afterAll(() => {
  // Restore console
  global.console = console;
  // Restore process.exit
  delete process.exit;
  // Restore fetch
  delete global.fetch;
});
