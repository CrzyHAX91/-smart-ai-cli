@echo off
:: Smart AI CLI Update Script
:: Version 1.0.0

:: Check if installed
set INSTALL_DIR=%ProgramFiles%\Smart-AI-CLI
if not exist "%INSTALL_DIR%" (
    echo Smart AI CLI is not installed. Please run install.bat first.
    pause
    exit /b 1
)

:: Backup current version
set BACKUP_DIR=%INSTALL_DIR%-backup-%DATE:/=-%-%TIME::=-%
xcopy /E /I /Y "%INSTALL_DIR%" "%BACKUP_DIR%"
if %ERRORLEVEL% neq 0 (
    echo Failed to create backup.
    pause
    exit /b 1
)

:: Update files
xcopy /E /I /Y "%~dp0*" "%INSTALL_DIR%"
if %ERRORLEVEL% neq 0 (
    echo Failed to update files.
    pause
    exit /b 1
)

:: Update dependencies
cd /d "%INSTALL_DIR%"
call npm install --production
if %ERRORLEVEL% neq 0 (
    echo Failed to update dependencies.
    pause
    exit /b 1
)

echo Update completed successfully!
echo Backup created at: %BACKUP_DIR%
pause
