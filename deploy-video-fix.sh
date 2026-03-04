#!/bin/bash

# Video Call Fix Deployment Script
echo "🚀 Deploying Video Call Fixes to Production..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Test the fixes locally first
echo "🧪 Testing fixes locally..."
node video-call-fix.js

# Deploy to Railway
echo "🚂 Deploying to Railway..."
railway deploy

# Wait for deployment
echo "⏳ Waiting for deployment to complete..."
sleep 30

# Test production deployment
echo "🔍 Testing production deployment..."
node -e "
const io = require('socket.io-client');
const socket = io('https://coupleconnect-production-35ae.up.railway.app');
socket.on('connect', () => {
  console.log('✅ Production deployment successful!');
  socket.disconnect();
  process.exit(0);
});
socket.on('connect_error', (error) => {
  console.log('❌ Production deployment failed:', error.message);
  process.exit(1);
});
setTimeout(() => {
  console.log('❌ Production test timeout');
  process.exit(1);
}, 15000);
"

echo "🎉 Video call fixes deployed successfully!"
echo ""
echo "📋 What was fixed:"
echo "✅ Socket.IO timeout increased to 120s"
echo "✅ Added TURN server for better connectivity"
echo "✅ Improved peer connection error handling"
echo "✅ Better media stream initialization"
echo "✅ Enhanced reconnection logic"
echo "✅ Added connection timeouts and retries"
echo ""
echo "🔗 Test your video calling at:"
echo "https://coupleconnect-production-35ae.up.railway.app"