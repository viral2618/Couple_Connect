@echo off
echo ========================================
echo   COUPLE CONNECT - RAILWAY DEPLOYMENT
echo ========================================
echo.

echo [1/5] Checking Railway CLI...
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo Railway CLI not found! Installing...
    npm install -g @railway/cli
)

echo.
echo [2/5] Logging into Railway...
railway login

echo.
echo [3/5] Linking to Railway project...
railway link

echo.
echo [4/5] Setting environment variables...
echo Please set these in Railway Dashboard:
echo - DATABASE_URL (MongoDB connection string)
echo - JWT_SECRET (secure random string)
echo - SESSION_SECRET (secure random string)
echo - EMAIL_HOST, EMAIL_USER, EMAIL_PASS
echo - MEDIASOUP_ANNOUNCED_IP (Railway domain)
echo.
pause

echo.
echo [5/5] Deploying to Railway...
railway up

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your app will be available at:
railway domain

pause
