import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { ErrorHandler, ERROR_CODES, ERROR_CATEGORIES } from './errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = path.join(__dirname, '../../plugins');

class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.loaded = false;
  }

  async loadPlugins() {
    if (this.loaded) return;
    
    try {
      // Create plugins directory if it doesn't exist
      await fs.mkdir(PLUGINS_DIR, { recursive: true });
      
      // Get all plugin files
      const pluginFiles = (await fs.readdir(PLUGINS_DIR))
        .filter(file => file.endsWith('.js'));

      // Load all valid plugins
      for (const file of pluginFiles) {
        try {
          const pluginPath = path.join(PLUGINS_DIR, file);
          const module = await import(pluginPath);
          
          if (this.validatePlugin(module.default)) {
            this.plugins.set(module.default.name, module.default);
          }
        } catch (error) {
          ErrorHandler.handle(
            ErrorHandler.createError(
              `Failed to load plugin ${file}: ${error.message}`,
              ERROR_CODES.PLUGIN_LOAD_FAILED,
              ERROR_CATEGORIES.SYSTEM
            )
          );
        }
      }
      
      this.loaded = true;
    } catch (error) {
      ErrorHandler.handle(
        ErrorHandler.createError(
          `Failed to load plugins: ${error.message}`,
          ERROR_CODES.PLUGIN_LOAD_FAILED,
          ERROR_CATEGORIES.SYSTEM
        )
      );
    }
  }

  validatePlugin(plugin) {
    const requiredMethods = ['initialize', 'execute'];
    const requiredProperties = ['name', 'version', 'description'];
    
    if (!plugin) return false;
    
    // Check required methods
    for (const method of requiredMethods) {
      if (typeof plugin[method] !== 'function') {
        return false;
      }
    }
    
    // Check required properties
    for (const prop of requiredProperties) {
      if (!plugin[prop]) {
        return false;
      }
    }
    
    return true;
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  listPlugins() {
    return Array.from(this.plugins.values());
  }
}
