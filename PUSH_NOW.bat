@echo off
color 0A
title Git Push - WIHI Inventory System

echo.
echo  ========================================================
echo       GIT PUSH TO GITHUB - 1-CLICK SOLUTION
echo  ========================================================
echo.
echo  Repository: AizenKhaje06/EcommerceInventorySystem
echo  Branch: main
echo  Commits ready: 4
echo.
echo  ========================================================
echo.

cd /d "%~dp0"

echo  [1/3] Checking git status...
git status --short
echo.

echo  [2/3] Clearing old credentials...
cmdkey /delete:LegacyGeneric:target=git:https://github.com 2>nul
git credential-manager erase https://github.com 2>nul
echo       Old credentials cleared (if any existed)
echo.

echo  [3/3] Pushing to GitHub...
echo.
echo  ========================================================
echo   You will be prompted for credentials:
echo.
echo   Username: AizenKhaje06
echo   Password: YOUR_GITHUB_TOKEN_HERE
echo.
echo   NOTE: When you paste the token, it won't show on screen
echo         (for security). Just paste and press Enter!
echo  ========================================================
echo.

git push -v origin main

echo.
if %ERRORLEVEL% EQU 0 (
    color 0A
    echo  ========================================================
    echo       SUCCESS! Commits pushed to GitHub!
    echo  ========================================================
    echo.
    echo   Commits pushed: 4
    echo   - Waybill confirmation feature
    echo   - Complete documentation
    echo   - All supporting files
    echo.
    echo   Verify at: https://github.com/AizenKhaje06/EcommerceInventorySystem
    echo.
    echo  ========================================================
    echo       NEXT STEPS:
    echo  ========================================================
    echo   1. Verify commits on GitHub website
    echo   2. Run database migration on Supabase
    echo   3. Deploy to production
    echo   4. Test the feature
    echo.
    echo  See NEXT_STEPS_REQUIRED.md for detailed instructions
    echo  ========================================================
    echo.
) else (
    color 0C
    echo  ========================================================
    echo       PUSH FAILED - Troubleshooting
    echo  ========================================================
    echo.
    echo   Common issues:
    echo   1. Wrong username (must be: AizenKhaje06)
    echo   2. Token missing 'repo' permission
    echo   3. Token expired
    echo   4. Wrong token pasted
    echo.
    echo   To fix:
    echo   1. Go to: https://github.com/settings/tokens
    echo   2. Create new token with 'repo' scope checked
    echo   3. Copy the new token
    echo   4. Run this batch file again
    echo   5. Paste the new token when prompted
    echo.
    echo  ========================================================
    echo.
)

pause
echo.
echo  Window will close in 5 seconds...
timeout /t 5 >nul
