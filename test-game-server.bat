@echo off
echo ========================================
echo   Testing Game Server Connection
echo ========================================
echo.

echo [1/2] Checking if server is running on port 4000...
curl -s http://localhost:4000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Server is running!
    echo.
    curl http://localhost:4000/health
) else (
    echo ❌ Server is NOT running on port 4000
    echo.
    echo Starting server...
    cd apps\api
    start "Backend API" cmd /k "npm run dev"
    timeout /t 5 /nobreak >nul
    cd ..\..
)

echo.
echo [2/2] Testing Socket.IO connection...
echo Open your browser console and check for socket connection logs
echo.

echo ========================================
echo   Instructions:
echo ========================================
echo 1. Backend API should be running on port 4000
echo 2. Next.js app should be running on port 3001
echo 3. Open http://localhost:3001/games
echo 4. Check browser console for connection logs
echo.
pause
