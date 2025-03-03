import fs from 'fs/promises';
import path from 'path';
import { jest } from '@jest/globals';

export const TEST_CONFIG = {
  serperApiKey: 'test-serper-key-32chars-exactly-here',
  llamaApiKey: 'test-llama-key-32chars-exactly-here',
  openaiApiKey: 'sk-test-openai-key-32chars-exactly',
  claudeApiKey: 'test-claude-key-32chars-exactly-here',
  bardApiKey: 'test-bard-key-32chars-exactly-here-ok'
};

export const TEST_HISTORY = [
  {
    timestamp: '2024-01-01T00:00:00.000Z',
    question: 'test question 1',
    answer: 'test answer 1'
  },
  {
    timestamp: '2024-01-02T00:00:00.000Z',
    question: 'test question 2',
    answer: 'test answer 2'
  }
];

export const TEST_CACHE = new Map([
  ['test question 1', {
    response: 'test answer 1',
    timestamp: '2024-01-01T00:00:00.000Z'
  }]
]);

export const mockFS = () => {
  const files = new Map();

  jest.spyOn(fs, 'readFile').mockImplementation(async (filepath) => {
    const content = files.get(filepath.toString());
    if (content === undefined) {
      throw new Error('File not found');
    }
    return content;
  });

  jest.spyOn(fs, 'writeFile').mockImplementation(async (filepath, content) => {
    files.set(filepath.toString(), content);
  });

  jest.spyOn(fs, 'mkdir').mockImplementation(async () => {});

  return {
    files,
    reset: () => files.clear()
  };
};

export const mockAPI = (responses = {}) => {
  global.fetch = jest.fn((url) => {
    const response = responses[url] || { status: 200, data: {} };
    return Promise.resolve({
      ok: response.status === 200,
      status: response.status,
      json: () => Promise.resolve(response.data)
    });
  });
};

export const createTestPlugin = (name = 'test-plugin') => ({
  name,
  version: '1.0.0',
  description: 'Test plugin for unit tests',
  initialize: jest.fn(),
  execute: jest.fn()
});

export const setupTestEnvironment = () => {
  const originalEnv = process.env;
  const mockFS = jest.spyOn(fs, 'writeFile').mockImplementation(() => Promise.resolve());
  
  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    process.env = originalEnv;
  });
  
  return {
    mockFS
  };
};

export const expectValidationError = (error) => {
  expect(error).toBeDefined();
  expect(error.code).toBeDefined();
  expect(error.category).toBeDefined();
  expect(error.message).toBeDefined();
};

export const expectSuccessfulResponse = (response) => {
  expect(response).toBeDefined();
  expect(response.success).toBe(true);
};

export const createTempTestFiles = async (files) => {
  const testDir = path.join(process.cwd(), 'test-files');
  await fs.mkdir(testDir, { recursive: true });
  
  const createdFiles = [];
  for (const [filename, content] of Object.entries(files)) {
    const filepath = path.join(testDir, filename);
    await fs.writeFile(filepath, content);
    createdFiles.push(filepath);
  }
  
  return {
    testDir,
    files: createdFiles,
    cleanup: async () => {
      for (const file of createdFiles) {
        await fs.unlink(file).catch(() => {});
      }
      await fs.rmdir(testDir).catch(() => {});
    }
  };
};
