@echo off
:: Smart AI CLI Uninstallation Script
:: Version 1.0.0

:: Check if installed
set INSTALL_DIR=D:\Project 2025\SmartCLI-AI
if not exist "%INSTALL_DIR%" (
    echo Smart AI CLI is not installed.
    pause
    exit /b 1
)

:: Remove from PATH
set PATH_STR=%PATH%
set PATH_STR=%PATH_STR:;%INSTALL_DIR%;=;%
set PATH_STR=%PATH_STR:;%INSTALL_DIR%=%
set PATH_STR=%PATH_STR:%INSTALL_DIR%;=%
set PATH_STR=%PATH_STR:%INSTALL_DIR%=%
setx PATH "%PATH_STR%"
if %ERRORLEVEL% neq 0 (
    echo Failed to remove from PATH.
    pause
    exit /b 1
)

:: Remove installation directory
rd /S /Q "%INSTALL_DIR%"
if %ERRORLEVEL% neq 0 (
    echo Failed to remove installation directory.
    pause
    exit /b 1
)

echo Uninstallation completed successfully!
pause
