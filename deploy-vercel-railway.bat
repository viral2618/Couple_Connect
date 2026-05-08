@echo off
echo ========================================
echo   COUPLE CONNECT DEPLOYMENT
echo   Vercel (Frontend) + Railway (Backend)
echo ========================================
echo.

echo This script will help you deploy your app in 2 parts:
echo 1. Backend to Railway
echo 2. Frontend to Vercel
echo.
pause

echo.
echo ========================================
echo   PART 1: BACKEND DEPLOYMENT (Railway)
echo ========================================
echo.

echo [Step 1] Installing Railway CLI...
where railway >nul 2>nul
if %errorlevel% neq 0 (
    echo Railway CLI not found! Installing...
    npm install -g @railway/cli
) else (
    echo Railway CLI already installed!
)

echo.
echo [Step 2] Login to Railway...
railway login

echo.
echo [Step 3] Create new Railway project...
echo Go to https://railway.app and:
echo 1. Click "New Project"
echo 2. Select "Deploy from GitHub repo"
echo 3. Choose your repository
echo 4. Railway will auto-detect and deploy
echo.
echo After deployment, you'll get a URL like:
echo https://yourapp.railway.app
echo.
echo SAVE THIS URL! You'll need it for Vercel.
echo.
pause

echo.
echo [Step 4] Set Environment Variables in Railway Dashboard...
echo Go to Railway Dashboard ^> Variables and add:
echo.
echo DATABASE_URL=mongodb+srv://viral:viral12@coupleconnect.crvqwnd.mongodb.net/couple-connect
echo JWT_SECRET=your-super-secure-random-string
echo SESSION_SECRET=another-super-secure-random-string
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_USER=viralmak32@gmail.com
echo EMAIL_PASS=lavp aedm agwl gabw
echo MEDIASOUP_ANNOUNCED_IP=yourapp.railway.app
echo MEDIASOUP_MIN_PORT=10000
echo MEDIASOUP_MAX_PORT=10100
echo.
pause

echo.
echo ========================================
echo   PART 2: FRONTEND DEPLOYMENT (Vercel)
echo ========================================
echo.

echo [Step 1] Installing Vercel CLI...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Vercel CLI not found! Installing...
    npm install -g vercel
) else (
    echo Vercel CLI already installed!
)

echo.
echo [Step 2] Login to Vercel...
vercel login

echo.
echo [Step 3] Deploy to Vercel...
echo.
set /p RAILWAY_URL="Enter your Railway backend URL (from Part 1): "
echo.
echo Deploying frontend to Vercel...
cd apps\web
vercel --prod

echo.
echo [Step 4] Set Environment Variables in Vercel...
echo Go to Vercel Dashboard ^> Settings ^> Environment Variables
echo.
echo Add these variables:
echo NEXT_PUBLIC_API_URL=%RAILWAY_URL%
echo NEXT_PUBLIC_SOCKET_URL=%RAILWAY_URL%
echo NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
echo DATABASE_URL=mongodb+srv://viral:viral12@coupleconnect.crvqwnd.mongodb.net/couple-connect
echo.
pause

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your app is now live:
echo - Frontend: Check Vercel dashboard for URL
echo - Backend: %RAILWAY_URL%
echo.
echo IMPORTANT: Update these files with your actual URLs:
echo 1. apps\web\vercel.json - Replace "your-railway-backend.railway.app"
echo 2. apps\api\src\server.js - Add your Vercel domain to CORS
echo.
echo Then redeploy:
echo - Railway: git push (auto-deploys)
echo - Vercel: vercel --prod
echo.
pause
