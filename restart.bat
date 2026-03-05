@echo off
echo Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting server...
npm run dev
