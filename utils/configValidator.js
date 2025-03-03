import { ErrorHandler, ERROR_CODES, ERROR_CATEGORIES } from './errorHandler.js';

const CONFIG_SCHEMA = {
  serperApiKey: {
    type: 'string',
    required: true,
    minLength: 32,
    validate: (value) => value.match(/^[a-f0-9]{32,}$/i)
  },
  llamaApiKey: {
    type: 'string',
    required: true,
    minLength: 32,
    validate: (value) => value.match(/^[a-f0-9]{32,}$/i)
  },
  openaiApiKey: {
    type: 'string',
    required: true,
    minLength: 32,
    validate: (value) => value.match(/^sk-[A-Za-z0-9]{32,}$/)
  },
  claudeApiKey: {
    type: 'string',
    required: false,
    minLength: 32,
    validate: (value) => value ? value.match(/^[A-Za-z0-9]{32,}$/) : true
  },
  bardApiKey: {
    type: 'string',
    required: false,
    minLength: 32,
    validate: (value) => value ? value.match(/^[A-Za-z0-9]{32,}$/) : true
  }
};

export class ConfigValidator {
  static validate(config) {
    const errors = [];
    const warnings = [];
    const fixes = [];

    for (const [key, schema] of Object.entries(CONFIG_SCHEMA)) {
      const value = config[key];

      // Check required fields
      if (schema.required && !value) {
        errors.push({
          field: key,
          message: `${key} is required`
        });
        continue;
      }

      // Skip validation for optional empty fields
      if (!schema.required && !value) {
        continue;
      }

      // Type checking
      if (typeof value !== schema.type) {
        errors.push({
          field: key,
          message: `${key} must be a ${schema.type}`
        });
        continue;
      }

      // Length validation
      if (schema.minLength && value.length < schema.minLength) {
        errors.push({
          field: key,
          message: `${key} must be at least ${schema.minLength} characters long`
        });
      }

      // Custom validation
      if (schema.validate && !schema.validate(value)) {
        errors.push({
          field: key,
          message: `${key} has invalid format`
        });
      }

      // Check for common issues
      this.checkCommonIssues(key, value, warnings, fixes);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fixes
    };
  }

  static checkCommonIssues(key, value, warnings, fixes) {
    // Check for whitespace
    if (value && (value.startsWith(' ') || value.endsWith(' '))) {
      warnings.push({
        field: key,
        message: `${key} contains leading or trailing whitespace`
      });
      fixes.push({
        field: key,
        message: 'Remove whitespace',
        fix: value.trim()
      });
    }

    // Check for environment variable format
    if (value && value.includes('${')) {
      warnings.push({
        field: key,
        message: `${key} contains unresolved environment variable`
      });
    }

    // Check for development/test keys
    if (value && (
      value.includes('test') ||
      value.includes('dev') ||
      value.includes('dummy')
    )) {
      warnings.push({
        field: key,
        message: `${key} appears to be a development/test key`
      });
    }
  }

  static async repair(config) {
    try {
      const validationResult = this.validate(config);
      
      if (validationResult.isValid && validationResult.fixes.length === 0) {
        return {
          success: true,
          message: 'Configuration is valid, no repairs needed',
          config
        };
      }

      const repairedConfig = { ...config };

      // Apply fixes
      for (const fix of validationResult.fixes) {
        repairedConfig[fix.field] = fix.fix;
      }

      // Validate again after fixes
      const finalValidation = this.validate(repairedConfig);

      if (finalValidation.isValid) {
        return {
          success: true,
          message: 'Configuration repaired successfully',
          config: repairedConfig,
          appliedFixes: validationResult.fixes
        };
      } else {
        throw new Error('Configuration could not be automatically repaired');
      }
    } catch (error) {
      throw ErrorHandler.createError(
        `Failed to repair configuration: ${error.message}`,
        ERROR_CODES.CONFIG_REPAIR_FAILED,
        ERROR_CATEGORIES.CONFIG
      );
    }
  }

  static formatValidationResult(result) {
    return {
      errors: result.errors.map(e => `❌ ${e.field}: ${e.message}`),
      warnings: result.warnings.map(w => `⚠️ ${w.field}: ${w.message}`),
      fixes: result.fixes.map(f => `🔧 ${f.field}: ${f.message}`)
    };
  }
}
