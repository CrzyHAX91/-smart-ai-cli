import { SerperService } from './serper.js';
import { OpenAIService } from './openai.js';
import { LlamaService } from './llama.js';
import { ClaudeService } from './claude.js';
import { BardService } from './bard.js';
import { HistoryManager } from '../utils/history.js';
import { ErrorHandler, ERROR_CODES, ERROR_CATEGORIES } from '../utils/errorHandler.js';
import { performanceMonitor } from '../utils/performance.js';
import dotenv from 'dotenv';

dotenv.config();

export class AIOrchestrator {
  constructor(config = {}) {
    this.serper = new SerperService(config);
    this.openai = new OpenAIService(config);
    this.llama = new LlamaService(config);
    this.claude = new ClaudeService(config);
    this.bard = new BardService(config);
    this.history = new HistoryManager();
    this.modelPriority = ['openai', 'claude', 'bard', 'llama'];
  }

  async processQuery(query, options = {}) {
    const startTime = Date.now();
    try {
      // Check cache first if quick mode is enabled
      if (options.quick) {
        const cached = await this.history.getCachedResponse(query);
        if (cached) {
          return {
            response: cached.response,
            source: 'cache',
            timestamp: cached.timestamp
          };
        }
      }

      // Get search results from Serper
      const searchResults = await this.serper.search(query);

      // Try to get AI-enhanced response using multiple models with fallback
      let aiResponse = null;
      let usedModel = null;

      // Try models in priority order
      for (const model of this.modelPriority) {
        try {
          const context = this.createPrompt(query, searchResults, options);
          switch (model) {
            case 'openai':
              aiResponse = await this.openai.generateResponse(context);
              break;
            case 'claude':
              aiResponse = await this.claude.generateResponse(context);
              break;
            case 'bard':
              aiResponse = await this.bard.generateResponse(context);
              break;
            case 'llama':
              aiResponse = await this.llama.generateResponse(context);
              break;
          }
          usedModel = model;
          break;
        } catch (error) {
          console.warn(`${model} enhancement failed, trying next model:`, error.message);
        }
      }

      // Format the final response
      const formattedResponse = this.formatResponse(aiResponse, searchResults, query);

      // Cache the response
      await this.history.cacheResponse(query, formattedResponse);
      await this.history.addToHistory(query, formattedResponse);

      const result = {
        response: formattedResponse,
        source: usedModel || 'search',
        searchResults,
        usedModel
      };
      
      // Track query performance
      performanceMonitor.trackQuery(startTime);
      
      return result;

    } catch (error) {
      ErrorHandler.handle(
        ErrorHandler.createError(
          `Failed to process query: ${error.message}`,
          ERROR_CODES.API_INVALID_RESPONSE,
          ERROR_CATEGORIES.API
        ),
        { query }
      );
      throw error;
    }
  }

  createPrompt(query, searchResults, options) {
    return `Based on the following search results and the user's query "${query}", please provide a ${options.detailed ? 'detailed' : 'concise'} answer:

Search Results:
${searchResults}

Additional requirements:
${options.detailed ? '- Provide a detailed explanation with examples' : '- Keep it concise'}
- Include relevant facts and figures
- Cite sources when possible
- Focus on practical, actionable information`;
  }

  formatResponse(aiResponse, searchResults, query) {
    // If AI response is available, use it
    if (aiResponse) {
      return aiResponse;
    }
    
    // Otherwise, format search results
    try {
      // Parse the search results
      const results = searchResults.split('\n').filter(line => line.trim());
      
      // Extract the most relevant result
      const mainResult = results.find(line => 
        line.toLowerCase().includes(query.toLowerCase()) ||
        (line.startsWith('1.') && !line.toLowerCase().includes('url:'))
      );

      if (!mainResult) {
        return `Based on the search results, here's what I found:\n\n${results[0]}`;
      }

      // Find additional context
      const additionalInfo = results.find(line => 
        !line.includes(mainResult) &&
        !line.toLowerCase().includes('url:') &&
        line.trim().length > 0
      );

      // Format the response
      let response = mainResult.trim();
      if (additionalInfo) {
        response += '\n\n' + additionalInfo.trim();
      }

      return response;
    } catch (error) {
      console.error('Error formatting search results:', error);
      return `Based on the search results, here's what I found:\n\n${searchResults.split('\n')[0]}`;
    }
  }
}
