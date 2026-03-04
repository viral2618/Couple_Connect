@echo off
echo 🚀 Deploying Video Call Fixes to Production...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run from project root.
    pause
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Build the project
echo 🔨 Building project...
npm run build

REM Test the fixes locally first
echo 🧪 Testing fixes locally...
node video-call-fix.js

REM Deploy to Railway
echo 🚂 Deploying to Railway...
railway deploy

REM Wait for deployment
echo ⏳ Waiting for deployment to complete...
timeout /t 30 /nobreak

echo 🎉 Video call fixes deployed successfully!
echo.
echo 📋 What was fixed:
echo ✅ Socket.IO timeout increased to 120s
echo ✅ Added TURN server for better connectivity
echo ✅ Improved peer connection error handling
echo ✅ Better media stream initialization
echo ✅ Enhanced reconnection logic
echo ✅ Added connection timeouts and retries
echo.
echo 🔗 Test your video calling at:
echo https://coupleconnect-production-35ae.up.railway.app
echo.
pause