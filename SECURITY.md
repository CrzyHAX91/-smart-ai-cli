# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions are:

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :white_check_mark: |
| < 1.1   | :x:                |

## Reporting a Vulnerability

We take the security of Smart AI CLI seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Where to Report

Please **DO NOT** report security vulnerabilities through public GitHub issues.

Instead, please report them via email to security@smartaicli.com or through our [Security Advisory](https://github.com/yourusername/smart-ai-cli/security/advisories/new).

### What to Include

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Process

1. We will acknowledge your report within 48 hours
2. We will provide a more detailed response within 72 hours
3. We will follow up if we need additional information
4. Once validated, we will work on a fix
5. We will release a security patch as soon as possible

### Disclosure Policy

- We follow the principle of [Responsible Disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure)
- We will credit researchers who report valid security issues
- Public disclosure will be coordinated with the researcher

## Security Best Practices

When using Smart AI CLI, please follow these security best practices:

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables for sensitive data
   - Rotate API keys regularly

2. **Configuration**
   - Keep your configuration files secure
   - Use the built-in configuration validation
   - Enable all security features

3. **Updates**
   - Keep Smart AI CLI updated to the latest version
   - Monitor our security advisories
   - Update dependencies regularly

4. **Access Control**
   - Limit access to production environments
   - Use the principle of least privilege
   - Implement proper authentication

## Security Features

Smart AI CLI includes several security features:

- API key validation and secure storage
- Configuration validation and repair
- Secure plugin system with sandboxing
- Rate limiting and request validation
- Error handling without information leakage

## Development Security

If you're contributing to Smart AI CLI:

1. **Code Review**
   - All code changes require review
   - Security-sensitive changes require additional review
   - Follow our secure coding guidelines

2. **Dependencies**
   - Keep dependencies up to date
   - Use `npm audit` regularly
   - Review dependency licenses

3. **Testing**
   - Write security-focused tests
   - Include edge cases
   - Test for common vulnerabilities

## Contact

For any questions about this security policy, please contact:
- Email: security@smartaicli.com
- GitHub Security Advisory: [Create Advisory](https://github.com/yourusername/smart-ai-cli/security/advisories/new)
