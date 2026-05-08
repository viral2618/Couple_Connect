@echo off
echo.
echo ========================================
echo   Fixing API Server Port Issue
echo ========================================
echo.

echo Step 1: Installing dotenv package...
cd apps\api
call npm install dotenv
cd ..\..

echo.
echo Step 2: Killing process on port 3000...
npx kill-port 3000

echo.
echo Step 3: Verifying .env file...
if exist "apps\api\.env" (
    echo ✅ .env file exists
    findstr "PORT=4000" apps\api\.env >nul
    if %errorlevel% equ 0 (
        echo ✅ PORT=4000 is set
    ) else (
        echo ⚠️  PORT=4000 not found in .env
        echo Adding PORT=4000 to .env...
        echo PORT=4000 >> apps\api\.env
    )
) else (
    echo ❌ .env file not found!
    echo Creating .env file...
    copy apps\api\.env.template apps\api\.env
)

echo.
echo ========================================
echo   Fix Complete!
echo ========================================
echo.
echo Now run: npm run dev:api
echo.
pause
