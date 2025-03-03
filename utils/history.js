import fs from 'fs/promises';
import path from 'path';

// Use process.cwd() instead of import.meta.url for better compatibility
const projectRoot = process.cwd();
const HISTORY_FILE = path.join(projectRoot, '.history.json');
const CACHE_FILE = path.join(projectRoot, '.cache.json');

import zlib from 'zlib';
import util from 'util';

const compress = util.promisify(zlib.gzip);
const decompress = util.promisify(zlib.gunzip);

export class HistoryManager {
  constructor() {
    this.history = [];
    this.cache = new Map();
    this.historyStats = {
      totalEntries: 0,
      compressedSize: 0,
      maxEntries: 10000, // Maximum number of history entries
      maxSizeMB: 100 // Maximum history size in MB
    };
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      maxSize: 1000 // Default max cache size
    };
    this.loadHistory();
    this.loadCache();
  }

  async loadHistory() {
    try {
      const compressedData = await fs.readFile(HISTORY_FILE);
      const decompressedData = await decompress(compressedData);
      const historyData = JSON.parse(decompressedData.toString());
      
      this.history = historyData.entries;
      this.historyStats = historyData.stats || {
        totalEntries: this.history.length,
        compressedSize: compressedData.length,
        maxEntries: 10000,
        maxSizeMB: 100
      };
      
      // Clean up old entries if needed
      await this.cleanupHistory();
    } catch (error) {
      this.history = [];
      this.historyStats = {
        totalEntries: 0,
        compressedSize: 0,
        maxEntries: 10000,
        maxSizeMB: 100
      };
    }
  }

  async cleanupHistory() {
    // Remove oldest entries if we exceed max entries
    if (this.history.length > this.historyStats.maxEntries) {
      const removeCount = this.history.length - this.historyStats.maxEntries;
      this.history.splice(0, removeCount);
      this.historyStats.totalEntries = this.history.length;
    }
  }

  async loadCache() {
    try {
      const data = await fs.readFile(CACHE_FILE, 'utf8');
      const cacheData = JSON.parse(data);
      this.cache = new Map(cacheData);
    } catch (error) {
      ErrorHandler.handle(
        ErrorHandler.createError(
          `Failed to load cache: ${error.message}`,
          ERROR_CODES.FILE_SYSTEM_ERROR,
          ERROR_CATEGORIES.SYSTEM
        )
      );
      this.cache = new Map();
    }
  }

  async saveHistory() {
    try {
      const historyData = {
        entries: this.history,
        stats: this.historyStats
      };
      
      const jsonData = JSON.stringify(historyData);
      const compressedData = await compress(jsonData);
      
      // Check size limit
      if (compressedData.length > this.historyStats.maxSizeMB * 1024 * 1024) {
        // Remove oldest entries until we're under the limit
        while (compressedData.length > this.historyStats.maxSizeMB * 1024 * 1024 && this.history.length > 0) {
          this.history.shift();
          this.historyStats.totalEntries--;
        }
      }
      
      await fs.writeFile(HISTORY_FILE, compressedData);
      this.historyStats.compressedSize = compressedData.length;
    } catch (error) {
    ErrorHandler.handle(
      ErrorHandler.createError(
        `Failed to save history: ${error.message}`,
        ERROR_CODES.FILE_SYSTEM_ERROR,
        ERROR_CATEGORIES.SYSTEM
      )
    );
    }
  }

  async saveCache() {
    try {
      await fs.writeFile(CACHE_FILE, JSON.stringify([...this.cache.entries()], null, 2));
    } catch (error) {
      ErrorHandler.handle(
        ErrorHandler.createError(
          `Failed to save cache: ${error.message}`,
          ERROR_CODES.FILE_SYSTEM_ERROR,
          ERROR_CATEGORIES.SYSTEM
        )
      );
    }
  }

  async addToHistory(question, answer) {
    const entry = {
      timestamp: new Date().toISOString(),
      question,
      answer
    };
    
    // Compress large responses
    if (answer.length > 1024) {
      entry.compressed = true;
      entry.answer = (await compress(answer)).toString('base64');
    }
    
    this.history.push(entry);
    this.historyStats.totalEntries++;
    await this.saveHistory();
  }

  getHistoryStats() {
    return {
      ...this.historyStats,
      compressionRatio: this.historyStats.compressedSize > 0 ? 
        (this.historyStats.totalEntries * 1000) / this.historyStats.compressedSize : 0
    };
  }

  async clearOldHistory(days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    this.history = this.history.filter(entry => 
      new Date(entry.timestamp) > cutoffDate
    );
    this.historyStats.totalEntries = this.history.length;
    await this.saveHistory();
  }

  async getCachedResponse(question) {
    const cached = this.cache.get(question);
    if (cached) {
      // Check TTL (default 1 hour)
      const ttl = 60 * 60 * 1000; // 1 hour in milliseconds
      if (Date.now() - new Date(cached.timestamp).getTime() < ttl) {
        this.cacheStats.hits++;
        return cached;
      }
      // Cache expired, remove it
      this.cache.delete(question);
      this.cacheStats.evictions++;
    }
    this.cacheStats.misses++;
    return null;
  }

  async cacheResponse(question, response) {
    // Check cache size and evict if necessary
    if (this.cache.size >= this.cacheStats.maxSize) {
      // Implement LRU eviction
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => new Date(a[1].timestamp) - new Date(b[1].timestamp));
      this.cache.delete(entries[0][0]);
      this.cacheStats.evictions++;
    }

    this.cache.set(question, {
      response,
      timestamp: new Date().toISOString()
    });
    this.cacheStats.size = this.cache.size;
    await this.saveCache();
  }

  getCacheStats() {
    return {
      ...this.cacheStats,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0
    };
  }

  async clearCache() {
    this.cache.clear();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: 0,
      maxSize: 1000
    };
    await this.saveCache();
  }

  getRecentQuestions(limit = 5) {
    return this.history
      .slice(-limit)
      .map(entry => ({
        question: entry.question,
        timestamp: new Date(entry.timestamp).toLocaleString()
      }));
  }

  searchHistory(query) {
    const lowerQuery = query.toLowerCase();
    return this.history.filter(entry =>
      entry.question.toLowerCase().includes(lowerQuery) ||
      entry.answer.toLowerCase().includes(lowerQuery)
    );
  }
}
