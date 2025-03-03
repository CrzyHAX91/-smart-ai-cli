# Smart AI CLI Tool

A powerful command-line interface tool powered by multiple AI models, with support for plugins, CI/CD pipeline generation, and cloud infrastructure management.

## Features

- 🤖 Multiple AI Model Support
  - OpenAI GPT
  - Claude
  - Bard
  - Llama
  - Automatic fallback mechanism

- 🔌 Plugin System
  - Extensible plugin architecture
  - Hot-loading of plugins
  - Plugin management commands
  - Example plugins included

- 🚀 CI/CD Pipeline Generation
  - GitHub Actions
  - GitLab CI
  - Azure DevOps
  - Support for Node.js, Python, and Docker
  - Customizable test and deployment stages

- ☁️ Cloud Infrastructure Management
  - AWS infrastructure templates
  - GCP infrastructure templates
  - Azure infrastructure templates
  - Web apps, databases, and serverless templates
  - Region configuration support

- 🛠️ System Features
  - Advanced caching with TTL and LRU eviction
  - Compressed history storage
  - Comprehensive error handling
  - Performance monitoring
  - Configuration validation and repair

## Installation

### Using npm
```bash
npm install -g smart-ai-cli
```

### Using Windows Installer
```bash
# Download and run the installer
./install.bat
```

### Manual Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/smart-ai-cli.git

# Install dependencies
cd smart-ai-cli
npm install

# Link the CLI globally
npm link
```

## Configuration

```bash
# Configure API keys and settings
smart-ai configure

# Validate configuration
smart-ai validate-config

# Repair configuration if needed
smart-ai repair-config
```

## Usage

### Basic Commands
```bash
# Get help
smart-ai --help

# Ask a question
smart-ai ask "What is Node.js?"

# View command history
smart-ai history

# Show performance metrics
smart-ai performance
```

### Plugin Management
```bash
# List available plugins
smart-ai plugins

# Get plugin info
smart-ai plugin-info <plugin-name>

# Execute a plugin
smart-ai execute-plugin <plugin-name> --args '{"key": "value"}'
```

### CI/CD Pipeline Generation
```bash
# Generate a GitHub Actions pipeline for Node.js
smart-ai generate-pipeline -p github -l node -n my-app

# Generate a GitLab CI pipeline for Python with tests
smart-ai generate-pipeline -p gitlab -l python -n my-app -t
```

### Cloud Infrastructure
```bash
# Generate AWS web app infrastructure
smart-ai generate-infrastructure -p aws -t webapp -n my-app

# Generate Azure serverless infrastructure
smart-ai generate-infrastructure -p azure -t serverless -n my-app
```

## Development

### Setup
```bash
# Install dependencies
npm install

# Run in development mode
npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Building
```bash
# Build for production
npm run build
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [docs/](docs/)
- Issue Tracker: [GitHub Issues](https://github.com/yourusername/smart-ai-cli/issues)
- Discussion: [GitHub Discussions](https://github.com/yourusername/smart-ai-cli/discussions)

## Acknowledgments

- OpenAI for GPT API
- Anthropic for Claude API
- Google for Bard API
- Meta for Llama model
