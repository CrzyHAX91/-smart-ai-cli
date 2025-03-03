import { jest } from '@jest/globals';
import path from 'path';
import fs from 'fs/promises';
import { PluginManager } from '../../utils/pluginManager.js';
import { ErrorHandler } from '../../utils/errorHandler.js';
import { createTestPlugin, mockFS, setupTestEnvironment } from '../utils/testHelpers.js';

describe('Plugin System Integration', () => {
  const { mockFS: mockedFS } = setupTestEnvironment();
  let pluginManager;
  let testPlugin;

  beforeEach(() => {
    pluginManager = new PluginManager();
    testPlugin = createTestPlugin('test-plugin');
  });

  describe('Plugin Lifecycle', () => {
    it('should load and execute plugins correctly', async () => {
      // Create test plugin file
      const pluginContent = `
        export default {
          name: 'test-plugin',
          version: '1.0.0',
          description: 'Test plugin',
          initialize: () => {},
          execute: (args) => ({ result: args })
        };
      `;

      await fs.mkdir(path.join(process.cwd(), 'plugins'), { recursive: true });
      await fs.writeFile(
        path.join(process.cwd(), 'plugins', 'test-plugin.js'),
        pluginContent
      );

      // Load plugins
      await pluginManager.loadPlugins();
      expect(pluginManager.plugins.size).toBe(1);

      // Get plugin
      const plugin = pluginManager.getPlugin('test-plugin');
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('test-plugin');

      // Execute plugin
      const result = await plugin.execute({ test: true });
      expect(result).toEqual({ result: { test: true } });
    });

    it('should handle plugin dependencies correctly', async () => {
      // Create dependent plugin
      const dependentPluginContent = `
        import { getPlugin } from '../../utils/pluginManager.js';
        
        export default {
          name: 'dependent-plugin',
          version: '1.0.0',
          description: 'Plugin that depends on test-plugin',
          initialize: async () => {
            const testPlugin = getPlugin('test-plugin');
            if (!testPlugin) throw new Error('Missing dependency: test-plugin');
          },
          execute: async (args) => {
            const testPlugin = getPlugin('test-plugin');
            const result = await testPlugin.execute(args);
            return { enhanced: result };
          }
        };
      `;

      await fs.writeFile(
        path.join(process.cwd(), 'plugins', 'dependent-plugin.js'),
        dependentPluginContent
      );

      // Load plugins
      await pluginManager.loadPlugins();
      expect(pluginManager.plugins.size).toBe(2);

      // Execute dependent plugin
      const plugin = pluginManager.getPlugin('dependent-plugin');
      const result = await plugin.execute({ test: true });
      expect(result).toEqual({ enhanced: { result: { test: true } } });
    });
  });

  describe('Error Handling', () => {
    it('should handle plugin loading errors gracefully', async () => {
      const invalidPluginContent = 'invalid javascript code';

      await fs.writeFile(
        path.join(process.cwd(), 'plugins', 'invalid-plugin.js'),
        invalidPluginContent
      );

      await pluginManager.loadPlugins();
      expect(pluginManager.plugins.size).toBe(2); // Only valid plugins should be loaded
    });

    it('should handle plugin execution errors properly', async () => {
      const errorPlugin = {
        ...testPlugin,
        execute: () => {
          throw new Error('Plugin execution failed');
        }
      };

      pluginManager.plugins.set('error-plugin', errorPlugin);

      try {
        await errorPlugin.execute({});
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe(ERROR_CODES.PLUGIN_EXECUTION_FAILED);
        expect(error.category).toBe(ERROR_CATEGORIES.SYSTEM);
      }
    });
  });

  describe('Plugin Validation', () => {
    it('should validate plugin interface correctly', () => {
      const invalidPlugin = {
        name: 'invalid-plugin',
        // Missing required methods/properties
      };

      expect(pluginManager.validatePlugin(invalidPlugin)).toBe(false);
      expect(pluginManager.validatePlugin(testPlugin)).toBe(true);
    });

    it('should handle plugins with invalid methods', async () => {
      const invalidMethodPlugin = {
        ...testPlugin,
        execute: 'not a function'
      };

      expect(pluginManager.validatePlugin(invalidMethodPlugin)).toBe(false);
    });
  });

  describe('Plugin State Management', () => {
    it('should maintain plugin state between executions', async () => {
      const statefulPlugin = {
        ...testPlugin,
        state: { counter: 0 },
        execute: function() {
          this.state.counter++;
          return this.state.counter;
        }
      };

      pluginManager.plugins.set('stateful-plugin', statefulPlugin);
      
      const result1 = await statefulPlugin.execute();
      const result2 = await statefulPlugin.execute();
      
      expect(result1).toBe(1);
      expect(result2).toBe(2);
    });
  });

  describe('Plugin List Management', () => {
    it('should list all available plugins correctly', () => {
      pluginManager.plugins.set('test-plugin-1', createTestPlugin('test-plugin-1'));
      pluginManager.plugins.set('test-plugin-2', createTestPlugin('test-plugin-2'));

      const plugins = pluginManager.listPlugins();
      expect(plugins).toHaveLength(2);
      expect(plugins.map(p => p.name)).toContain('test-plugin-1');
      expect(plugins.map(p => p.name)).toContain('test-plugin-2');
    });

    it('should handle plugin removal correctly', () => {
      pluginManager.plugins.set('test-plugin', testPlugin);
      expect(pluginManager.getPlugin('test-plugin')).toBeDefined();

      pluginManager.plugins.delete('test-plugin');
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    });
  });
});
