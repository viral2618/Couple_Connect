#!/bin/bash

# Railway deployment script
echo "🚀 Deploying to Railway..."

# Set environment variables for Railway
echo "Setting environment variables..."

# Copy production env file
cp .env.production .env

# Build the application
echo "📦 Building application..."
npm run build

echo "✅ Build complete! Ready for Railway deployment."
echo "🌐 Your app will be available at: https://coupleconnect-production-35ae.up.railway.app"