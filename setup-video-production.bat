@echo off
echo ==========================================
echo Couple Connect - Video Calling Setup
echo ==========================================
echo.

echo Detecting your server's public IP address...
echo.

REM Try to get public IP using PowerShell
for /f %%i in ('powershell -Command "(Invoke-WebRequest -Uri 'https://ifconfig.me' -UseBasicParsing).Content"') do set PUBLIC_IP=%%i

if "%PUBLIC_IP%"=="" (
    echo Could not detect public IP automatically
    echo Please enter your server's public IP address manually:
    set /p PUBLIC_IP="Public IP: "
)

echo Detected IP: %PUBLIC_IP%
echo.

echo Updating .env.production with MediaSoup configuration...

if exist .env.production (
    REM Create a temporary file with updated content
    powershell -Command "(Get-Content .env.production) -replace 'MEDIASOUP_ANNOUNCED_IP=.*', 'MEDIASOUP_ANNOUNCED_IP=%PUBLIC_IP%' | Set-Content .env.production.tmp"
    
    REM Check if the line exists
    findstr /C:"MEDIASOUP_ANNOUNCED_IP=" .env.production.tmp >nul
    if errorlevel 1 (
        echo MEDIASOUP_ANNOUNCED_IP=%PUBLIC_IP% >> .env.production.tmp
        echo Added MEDIASOUP_ANNOUNCED_IP to .env.production
    ) else (
        echo Updated MEDIASOUP_ANNOUNCED_IP in .env.production
    )
    
    REM Replace original file
    move /y .env.production.tmp .env.production >nul
    
    echo Configuration updated successfully!
) else (
    echo ERROR: .env.production file not found!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo Configuration Complete!
echo ==========================================
echo.
echo MediaSoup Announced IP: %PUBLIC_IP%
echo RTC Port Range: 10000-10100 (UDP/TCP)
echo.
echo Next steps:
echo 1. If deploying to cloud (AWS/GCP/Azure):
echo    - Open ports 10000-10100 (UDP and TCP) in your cloud firewall
echo.
echo 2. Restart your application:
echo    docker-compose -f docker-compose.prod.yml restart
echo.
echo 3. Check logs:
echo    docker-compose -f docker-compose.prod.yml logs -f app
echo.
echo 4. Verify setup:
echo    npm run check-video
echo.
echo 5. Test video calling from your application
echo.
echo If video calling still doesn't work:
echo - Verify ports 10000-10100 are open on your cloud provider's firewall
echo - Check that %PUBLIC_IP% is the correct public IP
echo - Review application logs for MediaSoup errors
echo - See VIDEO_CALLING_TROUBLESHOOTING.md for detailed help
echo.
pause
