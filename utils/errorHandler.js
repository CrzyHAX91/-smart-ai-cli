import chalk from 'chalk';
import boxen from 'boxen';
import { getConfig } from './config.js';

const ERROR_CATEGORIES = {
  API: 'API Error',
  VALIDATION: 'Validation Error',
  CONFIG: 'Configuration Error',
  NETWORK: 'Network Error',
  SYSTEM: 'System Error',
  UNKNOWN: 'Unknown Error'
};

const ERROR_CODES = {
  // API Errors
  API_CONNECTION_FAILED: 1001,
  API_RATE_LIMIT_EXCEEDED: 1002,
  API_INVALID_RESPONSE: 1003,
  
  // Validation Errors
  INVALID_INPUT: 2001,
  MISSING_REQUIRED_FIELD: 2002,
  
  // Configuration Errors
  MISSING_API_KEY: 3001,
  INVALID_CONFIG: 3002,
  
  // Network Errors
  NETWORK_TIMEOUT: 4001,
  NETWORK_UNAVAILABLE: 4002,
  
  // System Errors
  FILE_SYSTEM_ERROR: 5001,
  MEMORY_LIMIT_EXCEEDED: 5002,
  
  // Unknown Errors
  UNKNOWN_ERROR: 9999
};

export class ErrorHandler {
  static handle(error, context = {}) {
    const config = getConfig();
    
    // Log the error
    this.logError(error, context);
    
    // Generate user-friendly message
    const message = this.createUserMessage(error);
    
    // Display error to user
    console.error(boxen(
      chalk.red(message),
      {
        title: chalk.red('❌ Error'),
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'red'
      }
    ));
    
    // Attempt recovery if possible
    if (this.isRecoverable(error)) {
      this.attemptRecovery(error, context);
    }
  }

  static logError(error, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        code: error.code || ERROR_CODES.UNKNOWN_ERROR,
        category: error.category || ERROR_CATEGORIES.UNKNOWN
      },
      context
    };
    
    // TODO: Implement proper logging mechanism
    console.error('Error Log:', logEntry);
  }

  static createUserMessage(error) {
    let message = error.message;
    
    // Add specific guidance based on error type
    switch (error.code) {
      case ERROR_CODES.MISSING_API_KEY:
        message += '\n\nPlease run "smart-ai configure" to set up your API keys.';
        break;
      case ERROR_CODES.API_RATE_LIMIT_EXCEEDED:
        message += '\n\nPlease wait a few minutes and try again.';
        break;
      case ERROR_CODES.NETWORK_UNAVAILABLE:
        message += '\n\nPlease check your internet connection and try again.';
        break;
    }
    
    return message;
  }

  static isRecoverable(error) {
    const recoverableCodes = [
      ERROR_CODES.API_RATE_LIMIT_EXCEEDED,
      ERROR_CODES.NETWORK_UNAVAILABLE,
      ERROR_CODES.MISSING_API_KEY
    ];
    return recoverableCodes.includes(error.code);
  }

  static attemptRecovery(error, context) {
    // TODO: Implement recovery strategies
    // For example, retry logic, fallback mechanisms, etc.
  }

  static createError(message, code, category) {
    const error = new Error(message);
    error.code = code;
    error.category = category;
    return error;
  }
}
