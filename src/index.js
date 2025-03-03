#!/usr/bin/env node
import { Command } from 'commander';
import { askQuestion } from '../commands/ask.js';
import { historyCommand, clearHistory } from '../commands/history.js';
import { generateK8sConfig, handleDocker, analyzeInfrastructure } from '../commands/devops.js';
import { configureAPI } from '../utils/config.js';
import figlet from 'figlet';
import chalk from 'chalk';
import boxen from 'boxen';

const NEON_COLORS = ['#FF1B8D', '#00FF9F', '#00F3FF', '#FF3C00', '#FF00FF'];

function rainbow(str) {
  return str.split('').map((char, i) => {
    const color = NEON_COLORS[i % NEON_COLORS.length];
    return chalk.hex(color)(char);
  }).join('');
}

// Display startup banner
console.log('\n' + rainbow(figlet.textSync('Smart AI CLI', { font: 'ANSI Shadow' })));
console.log(boxen(
  chalk.cyan('AI-Powered CLI with DevOps Optimization'),
  {
    padding: 1,
    margin: 1,
    borderStyle: 'double',
    borderColor: 'cyan'
  }
));

const program = new Command();

program
  .name('smart-ai')
  .description('Advanced AI-powered CLI tool with DevOps capabilities')
  .version('1.2.2');

// AI Commands
program
  .command('ask <question>')
  .description('Ask a question and get an AI-powered response')
  .option('-q, --quick', 'Get a quick response using cache when available')
  .option('-d, --detailed', 'Get a detailed response with comprehensive analysis')
  .option('-s, --save <filename>', 'Save the response to a file')
  .action(askQuestion);

// History Commands
program
  .command('history')
  .description('View and manage command history')
  .option('-s, --search <query>', 'Search through history')
  .option('-i, --interactive', 'Browse history interactively with AI-powered insights')
  .option('-l, --limit <number>', 'Limit the number of entries shown', parseInt)
  .action(historyCommand);

program
  .command('clear-history')
  .description('Clear command history')
  .action(clearHistory);

program
  .command('cache-stats')
  .description('Show cache statistics')
  .action(async () => {
    const stats = history.getCacheStats();
    console.log(boxen(
      `Cache Statistics:\n\n` +
      `Hits: ${stats.hits}\n` +
      `Misses: ${stats.misses}\n` +
      `Hit Rate: ${(stats.hitRate * 100).toFixed(2)}%\n` +
      `Size: ${stats.size}/${stats.maxSize}\n` +
      `Evictions: ${stats.evictions}`,
      {
        title: rainbow('📊 Cache Stats'),
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
      }
    ));
  });

program
  .command('clear-cache')
  .description('Clear the response cache')
  .action(async () => {
    await history.clearCache();
    console.log(boxen(
      chalk.green('Cache cleared successfully!'),
      {
        title: rainbow('🧹 Cache Cleared'),
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
      }
    ));
  });

program
  .command('history-stats')
  .description('Show history statistics')
  .action(async () => {
    const stats = history.getHistoryStats();
    console.log(boxen(
      `History Statistics:\n\n` +
      `Total Entries: ${stats.totalEntries}\n` +
      `Compressed Size: ${(stats.compressedSize / 1024).toFixed(2)} KB\n` +
      `Compression Ratio: ${stats.compressionRatio.toFixed(2)}\n` +
      `Max Entries: ${stats.maxEntries}\n` +
      `Max Size: ${stats.maxSizeMB} MB`,
      {
        title: rainbow('📜 History Stats'),
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
      }
    ));
  });

program
  .command('clear-old-history')
  .description('Clear history older than specified days')
  .option('-d, --days <days>', 'Number of days to keep', parseInt, 30)
  .action(async (options) => {
    await history.clearOldHistory(options.days);
    console.log(boxen(
      chalk.green(`Cleared history older than ${options.days} days successfully!`),
      {
        title: rainbow('🧹 Old History Cleared'),
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
      }
    ));
  });

program
  .command('performance')
  .description('Show system performance metrics')
  .action(async () => {
    const metrics = performanceMonitor.getMetrics();
    console.log(boxen(
      `System Performance Metrics:\n\n` +
      `Uptime: ${(metrics.uptime / 1000 / 60).toFixed(2)} minutes\n` +
      `Total Queries: ${metrics.totalQueries}\n` +
      `Average Response Time: ${metrics.averageResponseTime.toFixed(2)} ms\n\n` +
      `Memory Usage:\n` +
      `Current: ${metrics.memoryUsage.current.toFixed(2)} MB\n` +
      `Max: ${metrics.memoryUsage.max.toFixed(2)} MB\n` +
      `Free: ${metrics.freeMemory.toFixed(2)} MB\n` +
      `Total: ${metrics.totalMemory.toFixed(2)} MB\n\n` +
      `CPU Usage:\n` +
      `User: ${metrics.cpuUsage.user.toFixed(2)} ms\n` +
      `System: ${metrics.cpuUsage.system.toFixed(2)} ms\n\n` +
      `Load Average: ${metrics.loadAverage.map(l => l.toFixed(2)).join(', ')}`,
      {
        title: rainbow('📈 Performance Metrics'),
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
      }
    ));
  });

program
  .command('plugins')
  .description('List all available plugins')
  .action(async () => {
    const plugins = pluginManager.listPlugins();
    console.log(boxen(
      `Available Plugins:\n\n` +
      plugins.map(p => `• ${p.name} (v${p.version})\n   ${p.description}`).join('\n\n'),
      {
        title: rainbow('🧩 Plugins'),
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
      }
    ));
  });

program
  .command('plugin-info <name>')
  .description('Show information about a specific plugin')
  .action(async (name) => {
    const plugin = pluginManager.getPlugin(name);
    if (!plugin) {
      console.log(boxen(
        chalk.red(`Plugin "${name}" not found`),
        {
          title: rainbow('❌ Plugin Error'),
          titleAlignment: 'center',
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'red'
        }
      ));
      return;
    }

    console.log(boxen(
      `Plugin Information:\n\n` +
      `Name: ${plugin.name}\n` +
      `Version: ${plugin.version}\n` +
      `Description: ${plugin.description}`,
      {
        title: rainbow('ℹ️ Plugin Info'),
        titleAlignment: 'center',
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'cyan'
      }
    ));
  });

program
  .command('execute-plugin <name>')
  .description('Execute a specific plugin')
  .option('-a, --args <args>', 'Arguments to pass to the plugin (as JSON string)')
  .action(async (name, options) => {
    const plugin = pluginManager.getPlugin(name);
    if (!plugin) {
      console.log(boxen(
        chalk.red(`Plugin "${name}" not found`),
        {
          title: rainbow('❌ Plugin Error'),
          titleAlignment: 'center',
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'red'
        }
      ));
      return;
    }

    try {
      const args = options.args ? JSON.parse(options.args) : {};
      const result = await plugin.execute(args);
      
      console.log(boxen(
        typeof result === 'object' ? 
          JSON.stringify(result, null, 2) : 
          result.toString(),
        {
          title: rainbow(`🔌 ${plugin.name} Output`),
          titleAlignment: 'center',
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'cyan'
        }
      ));
    } catch (error) {
      ErrorHandler.handle(
        ErrorHandler.createError(
          `Failed to execute plugin ${name}: ${error.message}`,
          ERROR_CODES.PLUGIN_EXECUTION_FAILED,
          ERROR_CATEGORIES.SYSTEM
        )
      );
    }
  });

// CI/CD Commands
program
  .command('generate-pipeline')
  .description('Generate a CI/CD pipeline configuration')
  .requiredOption('-p, --platform <platform>', 'CI/CD platform (github, gitlab, azure)')
  .requiredOption('-l, --language <language>', 'Project language (node, python, docker)')
  .requiredOption('-n, --name <name>', 'Project name')
  .option('-t, --tests', 'Include test stage', false)
  .option('-d, --deploy', 'Include deployment stage', false)
  .action(async (options) => {
    try {
      const cicd = new CICDService();
      const result = await cicd.generatePipeline(options);
      
      console.log(boxen(
        chalk.green(`Successfully generated ${options.platform} pipeline!\n\n`) +
        `Platform: ${result.platform}\n` +
        `Language: ${result.language}\n` +
        `File: ${result.filename}\n` +
        `Features:\n` +
        `  - Tests: ${options.tests ? 'Yes' : 'No'}\n` +
        `  - Deployment: ${options.deploy ? 'Yes' : 'No'}`,
        {
          title: rainbow('🚀 Pipeline Generated'),
          titleAlignment: 'center',
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'cyan'
        }
      ));
    } catch (error) {
      ErrorHandler.handle(error);
    }
  });

// Configuration Commands
program
  .command('validate-config')
  .description('Validate current configuration')
  .action(async () => {
    try {
      const config = getConfig();
      const validationResult = ConfigValidator.validate(config);
      const formattedResult = ConfigValidator.formatValidationResult(validationResult);
      
      if (validationResult.isValid) {
        console.log(boxen(
          chalk.green('Configuration is valid!\n\n') +
          (formattedResult.warnings.length > 0 ? 
            chalk.yellow('Warnings:\n') + formattedResult.warnings.join('\n') : 'No warnings'),
          {
            title: rainbow('✅ Validation Passed'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'green'
          }
        ));
      } else {
        console.log(boxen(
          chalk.red('Configuration validation failed!\n\n') +
          formattedResult.errors.join('\n') + '\n\n' +
          (formattedResult.warnings.length > 0 ? 
            chalk.yellow('Warnings:\n') + formattedResult.warnings.join('\n') + '\n\n' : '') +
          (formattedResult.fixes.length > 0 ?
            chalk.blue('Suggested fixes:\n') + formattedResult.fixes.join('\n') : ''),
          {
            title: rainbow('❌ Validation Failed'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'red'
          }
        ));
      }
    } catch (error) {
      ErrorHandler.handle(error);
    }
  });

program
  .command('repair-config')
  .description('Attempt to repair configuration issues')
  .action(async () => {
    try {
      const config = getConfig();
      const repairResult = await ConfigValidator.repair(config);
      
      if (repairResult.success) {
        console.log(boxen(
          chalk.green(`${repairResult.message}\n\n`) +
          (repairResult.appliedFixes?.length > 0 ?
            chalk.blue('Applied fixes:\n') + 
            repairResult.appliedFixes.map(f => `✓ ${f.field}: ${f.message}`).join('\n') :
            'No fixes were needed'),
          {
            title: rainbow('🔧 Configuration Repaired'),
            titleAlignment: 'center',
            padding: 1,
            margin: 1,
            borderStyle: 'double',
            borderColor: 'green'
          }
        ));
      } else {
        throw new Error('Failed to repair configuration');
      }
    } catch (error) {
      ErrorHandler.handle(error);
    }
  });

// Cloud Infrastructure Commands
program
  .command('generate-infrastructure')
  .description('Generate cloud infrastructure configuration')
  .requiredOption('-p, --provider <provider>', 'Cloud provider (aws, gcp, azure)')
  .requiredOption('-t, --type <type>', 'Infrastructure type (webapp, database, serverless)')
  .requiredOption('-n, --name <name>', 'Project name')
  .option('-r, --region <region>', 'Cloud region', 'us-east-1')
  .action(async (options) => {
    try {
      const cloud = new CloudService();
      const result = await cloud.generateInfrastructure(options);
      
      console.log(boxen(
        chalk.green(`Successfully generated ${options.provider} infrastructure!\n\n`) +
        `Provider: ${result.provider}\n` +
        `Type: ${result.type}\n` +
        `File: ${result.filename}\n` +
        `Region: ${options.region}`,
        {
          title: rainbow('☁️ Infrastructure Generated'),
          titleAlignment: 'center',
          padding: 1,
          margin: 1,
          borderStyle: 'double',
          borderColor: 'cyan'
        }
      ));
    } catch (error) {
      ErrorHandler.handle(error);
    }
  });

// Kubernetes Commands
program
  .command('k8s-generate')
  .description('Generate Kubernetes configuration with AI optimization')
  .requiredOption('-n, --name <name>', 'Application name')
  .requiredOption('-i, --image <image>', 'Container image')
  .option('-r, --replicas <number>', 'Number of replicas', parseInt, 1)
  .option('-t, --service-type <type>', 'Service type (ClusterIP, NodePort, LoadBalancer)', 'ClusterIP')
  .action(generateK8sConfig);

// Docker Commands
program
  .command('docker')
  .description('Docker operations with AI-powered optimization')
  .option('-b, --build', 'Build Docker image')
  .option('-r, --run', 'Run Docker container')
  .option('-t, --tag <tag>', 'Image tag')
  .option('-i, --image <image>', 'Image name')
  .option('-n, --name <name>', 'Container name')
  .option('-p, --ports <ports...>', 'Port mappings')
  .option('-e, --env <env...>', 'Environment variables')
  .option('-v, --volumes <volumes...>', 'Volume mappings')
  .option('--network <network>', 'Network name')
  .action(handleDocker);

// Infrastructure Analysis
program
  .command('analyze')
  .description('Analyze infrastructure configurations with AI suggestions')
  .option('-k, --kubernetes', 'Analyze Kubernetes configurations')
  .option('-d, --docker', 'Analyze Dockerfile')
  .option('-p, --path <path>', 'Path to configuration files')
  .action(analyzeInfrastructure);

// Configuration
program
  .command('configure')
  .description('Configure API keys and settings')
  .option('-r, --reset', 'Reset configuration to defaults')
  .option('-t, --test', 'Test API configuration')
  .action(configureAPI);

// Add examples
program.on('--help', () => {
  console.log(boxen(
    `${chalk.cyan('Examples:')}\n\n` +
    chalk.white(
      `  # Generate Kubernetes configuration
  $ smart-ai k8s-generate -n myapp -i nginx:latest -r 3

  # Build and run Docker container
  $ smart-ai docker -b -r -t myapp:latest -p 8080:80

  # Analyze infrastructure
  $ smart-ai analyze -k -d

  # Ask DevOps-related question
  $ smart-ai ask "How to optimize Kubernetes resource usage?"

  # View command history
  $ smart-ai history --interactive`
    ),
    {
      title: rainbow('🚀 Quick Start'),
      titleAlignment: 'center',
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan'
    }
  ));
});

// Error handling
program.showHelpAfterError(chalk.yellow('(add --help for additional information)'));

// Parse command line arguments
program.parse();

// Show help if no arguments provided
if (!process.argv.slice(2).length) {
  program.outputHelp((help) => {
    return boxen(help, {
      title: rainbow('🌟 Smart AI CLI Help'),
      titleAlignment: 'center',
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'cyan'
    });
  });
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error(boxen(
    chalk.red(`Fatal Error: ${error.message}\n\n${error.stack}`),
    {
      title: rainbow('💥 Unhandled Error'),
      titleAlignment: 'center',
      padding: 1,
      margin: 1,
      borderStyle: 'double',
      borderColor: 'red'
    }
  ));
  process.exit(1);
});
