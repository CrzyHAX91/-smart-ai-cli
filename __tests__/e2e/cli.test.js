import { jest } from '@jest/globals';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { 
  TEST_CONFIG, 
  mockFS, 
  mockAPI, 
  setupTestEnvironment 
} from '../utils/testHelpers.js';

const execAsync = promisify(exec);
const CLI_PATH = path.resolve(process.cwd(), 'src/index.js');

describe('CLI End-to-End Tests', () => {
  const { mockFS: mockedFS } = setupTestEnvironment();
  
  beforeEach(() => {
    // Mock API responses
    mockAPI({
      'https://api.openai.com/v1/chat/completions': {
        status: 200,
        data: { choices: [{ message: { content: 'Test response' } }] }
      },
      'https://api.anthropic.com/v1/complete': {
        status: 200,
        data: { completion: 'Test response' }
      }
    });
  });

  describe('Basic Commands', () => {
    it('should display help information', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('Commands:');
      expect(stdout).toContain('Options:');
    });

    it('should display version information', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --version`);
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('Configuration Management', () => {
    it('should configure API keys', async () => {
      const configProcess = await execAsync(
        `node ${CLI_PATH} configure --reset`,
        { env: { ...process.env, ...TEST_CONFIG } }
      );
      
      expect(configProcess.stdout).toContain('Configuration saved successfully');
    });

    it('should validate configuration', async () => {
      const validationProcess = await execAsync(`node ${CLI_PATH} validate-config`);
      expect(validationProcess.stdout).toContain('Configuration is valid');
    });
  });

  describe('AI Interactions', () => {
    it('should process AI queries', async () => {
      const queryProcess = await execAsync(
        `node ${CLI_PATH} ask "What is Node.js?"`,
        { env: { ...process.env, ...TEST_CONFIG } }
      );
      
      expect(queryProcess.stdout).toContain('Test response');
    });

    it('should handle query failures gracefully', async () => {
      mockAPI({
        'https://api.openai.com/v1/chat/completions': {
          status: 500,
          data: { error: 'Internal server error' }
        }
      });

      try {
        await execAsync(
          `node ${CLI_PATH} ask "What is Node.js?"`,
          { env: { ...process.env, ...TEST_CONFIG } }
        );
      } catch (error) {
        expect(error.stderr).toContain('Error');
      }
    });
  });

  describe('Plugin System', () => {
    it('should list available plugins', async () => {
      const pluginsProcess = await execAsync(`node ${CLI_PATH} plugins`);
      expect(pluginsProcess.stdout).toContain('Available Plugins');
    });

    it('should execute plugins', async () => {
      const executeProcess = await execAsync(
        `node ${CLI_PATH} execute-plugin hello-world --args '{"message":"test"}'`
      );
      expect(executeProcess.stdout).toContain('Hello from plugin');
    });
  });

  describe('Infrastructure Management', () => {
    it('should generate cloud infrastructure', async () => {
      const infraProcess = await execAsync(
        `node ${CLI_PATH} generate-infrastructure -p aws -t webapp -n test-app`
      );
      expect(infraProcess.stdout).toContain('Successfully generated');
      
      const terraform = await fs.readFile('terraform/main.tf', 'utf8');
      expect(terraform).toContain('provider "aws"');
    });

    it('should generate CI/CD pipelines', async () => {
      const cicdProcess = await execAsync(
        `node ${CLI_PATH} generate-pipeline -p github -l node -n test-app`
      );
      expect(cicdProcess.stdout).toContain('Successfully generated');
      
      const workflow = await fs.readFile('.github/workflows/ci.yml', 'utf8');
      expect(workflow).toContain('name: test-app');
    });
  });

  describe('Performance and Caching', () => {
    it('should show performance metrics', async () => {
      const metricsProcess = await execAsync(`node ${CLI_PATH} performance`);
      expect(metricsProcess.stdout).toContain('System Performance Metrics');
    });

    it('should handle cached responses', async () => {
      // First query to cache
      await execAsync(
        `node ${CLI_PATH} ask "Cached question?" --quick`,
        { env: { ...process.env, ...TEST_CONFIG } }
      );

      // Second query should use cache
      const cachedProcess = await execAsync(
        `node ${CLI_PATH} ask "Cached question?" --quick`,
        { env: { ...process.env, ...TEST_CONFIG } }
      );
      
      expect(cachedProcess.stdout).toContain('cache');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing configuration', async () => {
      try {
        await execAsync(
          `node ${CLI_PATH} ask "Question?"`,
          { env: { ...process.env, OPENAI_API_KEY: '' } }
        );
      } catch (error) {
        expect(error.stderr).toContain('Configuration error');
      }
    });

    it('should handle network errors', async () => {
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      try {
        await execAsync(
          `node ${CLI_PATH} ask "Question?"`,
          { env: { ...process.env, ...TEST_CONFIG } }
        );
      } catch (error) {
        expect(error.stderr).toContain('Network error');
      }
    });
  });

  describe('History Management', () => {
    it('should track command history', async () => {
      await execAsync(
        `node ${CLI_PATH} ask "History test?"`,
        { env: { ...process.env, ...TEST_CONFIG } }
      );

      const historyProcess = await execAsync(`node ${CLI_PATH} history`);
      expect(historyProcess.stdout).toContain('History test?');
    });

    it('should clear old history', async () => {
      const clearProcess = await execAsync(
        `node ${CLI_PATH} clear-old-history --days 30`
      );
      expect(clearProcess.stdout).toContain('cleared successfully');
    });
  });
});
