@echo off
echo ========================================
echo Installing Video Calling Dependencies
echo ========================================
echo.

echo Installing MediaSoup packages...
call npm install mediasoup@^3.13.0 mediasoup-client@^3.7.0

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Set MEDIASOUP_ANNOUNCED_IP in .env file
echo 2. Run: npm run dev
echo 3. Open chat screen and click video icon
echo.
pause
