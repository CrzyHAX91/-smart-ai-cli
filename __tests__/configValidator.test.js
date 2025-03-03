import { jest } from '@jest/globals';
import { ConfigValidator } from '../utils/configValidator.js';
import { TEST_CONFIG, expectValidationError } from './utils/testHelpers.js';

describe('ConfigValidator', () => {
  describe('validate', () => {
    it('should validate a correct configuration', () => {
      const result = ConfigValidator.validate(TEST_CONFIG);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const config = { ...TEST_CONFIG };
      delete config.serperApiKey;
      
      const result = ConfigValidator.validate(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'serperApiKey',
          message: 'serperApiKey is required'
        })
      );
    });

    it('should validate API key formats', () => {
      const config = {
        ...TEST_CONFIG,
        openaiApiKey: 'invalid-key'
      };
      
      const result = ConfigValidator.validate(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          field: 'openaiApiKey',
          message: 'openaiApiKey has invalid format'
        })
      );
    });

    it('should allow optional fields to be empty', () => {
      const config = { ...TEST_CONFIG };
      delete config.claudeApiKey;
      delete config.bardApiKey;
      
      const result = ConfigValidator.validate(config);
      expect(result.isValid).toBe(true);
    });

    it('should detect whitespace issues', () => {
      const config = {
        ...TEST_CONFIG,
        serperApiKey: ' ' + TEST_CONFIG.serperApiKey + ' '
      };
      
      const result = ConfigValidator.validate(config);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'serperApiKey',
          message: 'serperApiKey contains leading or trailing whitespace'
        })
      );
    });

    it('should detect development/test keys', () => {
      const config = {
        ...TEST_CONFIG,
        openaiApiKey: 'sk-test-development-key-here-32chars'
      };
      
      const result = ConfigValidator.validate(config);
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          field: 'openaiApiKey',
          message: 'openaiApiKey appears to be a development/test key'
        })
      );
    });
  });

  describe('repair', () => {
    it('should repair whitespace issues', async () => {
      const config = {
        ...TEST_CONFIG,
        serperApiKey: ' ' + TEST_CONFIG.serperApiKey + ' '
      };
      
      const result = await ConfigValidator.repair(config);
      expect(result.success).toBe(true);
      expect(result.config.serperApiKey).toBe(TEST_CONFIG.serperApiKey);
    });

    it('should not modify valid configurations', async () => {
      const result = await ConfigValidator.repair(TEST_CONFIG);
      expect(result.success).toBe(true);
      expect(result.config).toEqual(TEST_CONFIG);
      expect(result.message).toBe('Configuration is valid, no repairs needed');
    });

    it('should fail on unfixable issues', async () => {
      const config = {
        ...TEST_CONFIG,
        serperApiKey: 'invalid-key'
      };
      
      await expect(ConfigValidator.repair(config)).rejects.toThrow();
    });
  });

  describe('formatValidationResult', () => {
    it('should format validation results correctly', () => {
      const result = {
        errors: [{ field: 'test', message: 'error' }],
        warnings: [{ field: 'test', message: 'warning' }],
        fixes: [{ field: 'test', message: 'fix' }]
      };
      
      const formatted = ConfigValidator.formatValidationResult(result);
      expect(formatted.errors).toContain('❌ test: error');
      expect(formatted.warnings).toContain('⚠️ test: warning');
      expect(formatted.fixes).toContain('🔧 test: fix');
    });

    it('should handle empty results', () => {
      const result = {
        errors: [],
        warnings: [],
        fixes: []
      };
      
      const formatted = ConfigValidator.formatValidationResult(result);
      expect(formatted.errors).toHaveLength(0);
      expect(formatted.warnings).toHaveLength(0);
      expect(formatted.fixes).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should throw appropriate error types', () => {
      const config = {
        invalidField: 'value'
      };
      
      try {
        ConfigValidator.validate(config);
      } catch (error) {
        expectValidationError(error);
      }
    });

    it('should include detailed error information', async () => {
      const config = {
        ...TEST_CONFIG,
        serperApiKey: null
      };
      
      try {
        await ConfigValidator.repair(config);
      } catch (error) {
        expect(error.message).toContain('repair');
        expect(error.code).toBeDefined();
        expect(error.category).toBeDefined();
      }
    });
  });
});
