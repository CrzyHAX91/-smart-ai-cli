@echo off
:: Smart AI CLI Installation Script
:: Version 1.0.0

:: Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Node.js is not installed. Please install Node.js v16 or later.
    pause
    exit /b 1
)

:: Set installation directory
set INSTALL_DIR=D:\Project 2025\SmartCLI-AI

:: Create installation directory
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    if %ERRORLEVEL% neq 0 (
        echo Failed to create installation directory.
        pause
        exit /b 1
    )
)

:: Copy files
xcopy /E /I /Y "%~dp0*" "%INSTALL_DIR%"
if %ERRORLEVEL% neq 0 (
    echo Failed to copy files.
    pause
    exit /b 1
)

:: Install dependencies
cd /d "%INSTALL_DIR%"
call npm install --production
if %ERRORLEVEL% neq 0 (
    echo Failed to install dependencies.
    pause
    exit /b 1
)

:: Add to PATH
setx PATH "%PATH%;%INSTALL_DIR%"
if %ERRORLEVEL% neq 0 (
    echo Failed to add to PATH.
    pause
    exit /b 1
)

echo Installation completed successfully!
echo You can now use the Smart AI CLI from any directory.
pause
