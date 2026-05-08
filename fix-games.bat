@echo off
echo ========================================
echo   Starting Couple Connect Servers
echo ========================================
echo.

echo [1/3] Stopping any running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/3] Starting backend server on port 4000...
cd apps\api
start "Backend API" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Next.js app on port 3001...
cd ..\web
start "Next.js App" cmd /k "npm run dev"

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:4000
echo Next.js App: http://localhost:3001
echo.
echo Games: http://localhost:3001/games
echo.
pause
