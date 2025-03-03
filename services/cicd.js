import fs from 'fs/promises';
import path from 'path';
import { ErrorHandler, ERROR_CODES, ERROR_CATEGORIES } from '../utils/errorHandler.js';

export class CICDService {
  constructor() {
    this.templates = {
      github: {
        node: this.getGithubNodeTemplate,
        python: this.getGithubPythonTemplate,
        docker: this.getGithubDockerTemplate
      },
      gitlab: {
        node: this.getGitlabNodeTemplate,
        python: this.getGitlabPythonTemplate,
        docker: this.getGitlabDockerTemplate
      },
      azure: {
        node: this.getAzureNodeTemplate,
        python: this.getAzurePythonTemplate,
        docker: this.getAzureDockerTemplate
      }
    };
  }

  async generatePipeline(options) {
    try {
      const { platform, language, name, tests = true, deploy = false } = options;
      
      if (!this.templates[platform]) {
        throw new Error(`Unsupported platform: ${platform}`);
      }
      
      if (!this.templates[platform][language]) {
        throw new Error(`Unsupported language for ${platform}: ${language}`);
      }
      
      const template = this.templates[platform][language]({ name, tests, deploy });
      const filename = this.getPipelineFilename(platform);
      
      await fs.writeFile(filename, template);
      
      return {
        success: true,
        filename,
        platform,
        language
      };
    } catch (error) {
      throw ErrorHandler.createError(
        `Failed to generate pipeline: ${error.message}`,
        ERROR_CODES.PIPELINE_GENERATION_FAILED,
        ERROR_CATEGORIES.SYSTEM
      );
    }
  }

  getPipelineFilename(platform) {
    switch (platform) {
      case 'github':
        return '.github/workflows/ci.yml';
      case 'gitlab':
        return '.gitlab-ci.yml';
      case 'azure':
        return 'azure-pipelines.yml';
      default:
        throw new Error(`Unknown platform: ${platform}`);
    }
  }

  getGithubNodeTemplate({ name, tests, deploy }) {
    return `name: ${name}

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
    
    steps:
    - uses: actions/checkout@v2
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v2
      with:
        node-version: \${{ matrix.node-version }}
    - run: npm ci
    - run: npm run build --if-present
    ${tests ? '- run: npm test' : ''}
    ${deploy ? `
    deploy:
      needs: build
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/main'
      steps:
        - uses: actions/checkout@v2
        - name: Deploy
          run: |
            # Add deployment steps here
            echo "Deploying..."` : ''}`;
  }

  getGithubPythonTemplate({ name, tests, deploy }) {
    return `name: ${name}

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        python-version: [3.8, 3.9, '3.10']
    
    steps:
    - uses: actions/checkout@v2
    - name: Set up Python \${{ matrix.python-version }}
      uses: actions/setup-python@v2
      with:
        python-version: \${{ matrix.python-version }}
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
    ${tests ? `
    - name: Run tests
      run: |
        pip install pytest
        pytest` : ''}
    ${deploy ? `
    deploy:
      needs: build
      runs-on: ubuntu-latest
      if: github.ref == 'refs/heads/main'
      steps:
        - uses: actions/checkout@v2
        - name: Deploy
          run: |
            # Add deployment steps here
            echo "Deploying..."` : ''}`;
  }

  getGithubDockerTemplate({ name, tests, deploy }) {
    return `name: ${name}

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Build Docker image
      run: docker build . --file Dockerfile --tag ${name}:latest
    
    ${tests ? `
    - name: Run tests
      run: |
        docker run ${name}:latest npm test` : ''}
    
    ${deploy ? `
    - name: Login to DockerHub
      if: github.ref == 'refs/heads/main'
      uses: docker/login-action@v1
      with:
        username: \${{ secrets.DOCKERHUB_USERNAME }}
        password: \${{ secrets.DOCKERHUB_TOKEN }}
    
    - name: Push to DockerHub
      if: github.ref == 'refs/heads/main'
      run: |
        docker tag ${name}:latest \${{ secrets.DOCKERHUB_USERNAME }}/${name}:latest
        docker push \${{ secrets.DOCKERHUB_USERNAME }}/${name}:latest` : ''}`;
  }

  getGitlabNodeTemplate({ name, tests, deploy }) {
    return `image: node:latest

stages:
  - build
  - test
  ${deploy ? '- deploy' : ''}

cache:
  paths:
    - node_modules/

build:
  stage: build
  script:
    - npm ci
    - npm run build --if-present
  artifacts:
    paths:
      - dist/

${tests ? `
test:
  stage: test
  script:
    - npm test` : ''}

${deploy ? `
deploy:
  stage: deploy
  script:
    - echo "Deploying..."
  only:
    - main` : ''}`;
  }

  getGitlabPythonTemplate({ name, tests, deploy }) {
    return `image: python:latest

stages:
  - build
  - test
  ${deploy ? '- deploy' : ''}

before_script:
  - python -V
  - pip install -r requirements.txt

build:
  stage: build
  script:
    - echo "Building..."

${tests ? `
test:
  stage: test
  script:
    - pip install pytest
    - pytest` : ''}

${deploy ? `
deploy:
  stage: deploy
  script:
    - echo "Deploying..."
  only:
    - main` : ''}`;
  }

  getGitlabDockerTemplate({ name, tests, deploy }) {
    return `image: docker:latest

services:
  - docker:dind

stages:
  - build
  - test
  ${deploy ? '- deploy' : ''}

before_script:
  - docker info

build:
  stage: build
  script:
    - docker build -t ${name}:latest .

${tests ? `
test:
  stage: test
  script:
    - docker run ${name}:latest npm test` : ''}

${deploy ? `
deploy:
  stage: deploy
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker tag ${name}:latest $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main` : ''}`;
  }

  getAzureNodeTemplate({ name, tests, deploy }) {
    return `trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

strategy:
  matrix:
    node_14_x:
      node_version: '14.x'
    node_16_x:
      node_version: '16.x'
    node_18_x:
      node_version: '18.x'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '\$(node_version)'
  displayName: 'Install Node.js'

- script: |
    npm ci
    npm run build --if-present
  displayName: 'npm install and build'

${tests ? `
- script: npm test
  displayName: 'Run tests'` : ''}

${deploy ? `
- task: AzureWebApp@1
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  inputs:
    azureSubscription: '\$(AZURE_SUBSCRIPTION)'
    appName: '${name}'
    package: '.'` : ''}`;
  }

  getAzurePythonTemplate({ name, tests, deploy }) {
    return `trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

strategy:
  matrix:
    Python38:
      python.version: '3.8'
    Python39:
      python.version: '3.9'
    Python310:
      python.version: '3.10'

steps:
- task: UsePythonVersion@0
  inputs:
    versionSpec: '\$(python.version)'
  displayName: 'Use Python \$(python.version)'

- script: |
    python -m pip install --upgrade pip
    pip install -r requirements.txt
  displayName: 'Install dependencies'

${tests ? `
- script: |
    pip install pytest
    pytest
  displayName: 'Run tests'` : ''}

${deploy ? `
- task: AzureWebApp@1
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  inputs:
    azureSubscription: '\$(AZURE_SUBSCRIPTION)'
    appName: '${name}'
    package: '.'` : ''}`;
  }

  getAzureDockerTemplate({ name, tests, deploy }) {
    return `trigger:
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  imageName: '${name}'

steps:
- task: Docker@2
  displayName: Build Docker image
  inputs:
    command: build
    dockerfile: '**/Dockerfile'
    tags: |
      \$(Build.BuildId)
      latest

${tests ? `
- script: |
    docker run ${name}:latest npm test
  displayName: 'Run tests'` : ''}

${deploy ? `
- task: Docker@2
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  inputs:
    containerRegistry: '\$(DOCKER_REGISTRY_SERVICE_CONNECTION)'
    repository: '\$(imageName)'
    command: 'push'
    tags: |
      \$(Build.BuildId)
      latest` : ''}`;
  }
}
