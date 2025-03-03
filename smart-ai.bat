@echo off
:: Smart AI CLI - Windows Batch File
:: Version 1.0.0

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js v16 or later.
    pause
    exit /b 1
)

:: Set environment variables
set NODE_ENV=production
set SMART_AI_HOME=%~dp0

:: Check for required files
if not exist "%SMART_AI_HOME%package.json" (
    echo package.json not found. Please ensure you're in the correct directory.
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
if not exist "%SMART_AI_HOME%node_modules" (
    echo Installing dependencies...
    call npm install --production
    if %ERRORLEVEL% neq 0 (
        echo Failed to install dependencies.
        pause
        exit /b 1
    )
)

:: Run the CLI
node "%SMART_AI_HOME%src/index.js" %*
