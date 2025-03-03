# Contributing to Smart AI CLI

First off, thank you for considering contributing to Smart AI CLI! It's people like you that make Smart AI CLI such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include error messages and stack traces if any

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fork the repo and create your branch from `main`
* If you've added code that should be tested, add tests
* If you've changed APIs, update the documentation
* Ensure the test suite passes
* Make sure your code lints
* Issue that pull request!

## Development Process

1. Fork the repository
2. Create a new branch for your feature/fix
3. Write your code
4. Write/update tests
5. Run the test suite
6. Push your changes
7. Create a Pull Request

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/<your-username>/smart-ai-cli.git

# Add upstream remote
git remote add upstream https://github.com/original/smart-ai-cli.git

# Install dependencies
npm install

# Run tests
npm test
```

### Code Style

* Use 2 spaces for indentation
* Use semicolons
* Use meaningful variable names
* Follow ESLint rules

### Testing

* Write tests for new features
* Update tests for bug fixes
* Ensure all tests pass before submitting PR
* Aim for high test coverage

## Project Structure

```
smart-ai-cli/
├── src/               # Source code
├── services/          # AI and cloud services
├── utils/            # Utility functions
├── commands/         # CLI commands
├── plugins/          # Plugin system
├── __tests__/        # Test files
└── docs/             # Documentation
```

## Documentation

* Update README.md with new features
* Document new commands in docs/
* Include JSDoc comments for functions
* Update API documentation if needed

## Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a new release on GitHub
4. Publish to npm

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing to Smart AI CLI! 🚀
