@echo off
REM 508 Ministry Dashboard - Automated Deployment Script (Windows)

echo =========================================
echo 508 Ministry Dashboard Deployment
echo =========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo [*] Initializing Git repository...
    git init
) else (
    echo [*] Git repository already initialized
)

REM Add all files
echo [*] Adding files to Git...
git add .

REM Create initial commit
echo [*] Creating initial commit...
git commit -m "Initial commit: 508 Ministry Dashboard with full authentication and database integration"

REM Check if remote exists
git remote | findstr "origin" >nul
if %errorlevel%==0 (
    echo [*] Remote 'origin' already configured
    echo.
    echo Current remote URL:
    git remote get-url origin
    echo.
    set /p update_remote="Do you want to update the remote URL? (y/N): "

    if /i "%update_remote%"=="y" (
        set /p repo_url="Enter new GitHub repository URL: "
        git remote set-url origin %repo_url%
        echo [*] Remote URL updated
    )
) else (
    set /p repo_url="Enter your GitHub repository URL: "
    git remote add origin %repo_url%
    echo [*] Remote added
)

REM Set main branch
echo [*] Setting main branch...
git branch -M main

REM Push to GitHub
echo [*] Pushing to GitHub...
set /p confirm_push="Ready to push to GitHub? (y/N): "

if /i "%confirm_push%"=="y" (
    git push -u origin main
    echo.
    echo =========================================
    echo [*] Deployment script complete!
    echo =========================================
    echo.
    echo Next steps:
    echo 1. Go to your Coolify dashboard
    echo 2. Create a new Application from Git
    echo 3. Connect to your GitHub repository
    echo 4. Follow the DEPLOY.md guide for configuration
    echo.
    echo Repository URL: %repo_url%
    echo.
) else (
    echo.
    echo Push cancelled. Run this script again when ready.
)

pause
