#!/bin/bash

# Production Environment Setup Script for Couple Connect
# Run this script on your production server

set -e

echo "🚀 Setting up Couple Connect Production Environment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (for SSL termination)
echo "🌐 Installing Nginx..."
sudo apt install nginx -y

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/couple-connect
sudo chown $USER:$USER /opt/couple-connect

# Clone repository (you'll need to update this with your actual repo)
echo "📥 Cloning repository..."
cd /opt/couple-connect
git clone https://github.com/YOUR_USERNAME/couple-connect.git .

# Set up environment file
echo "⚙️ Setting up environment..."
cp .env.production .env

# Install dependencies and generate Prisma client
echo "📦 Installing dependencies and generating Prisma client..."
npm install
npx prisma generate

echo "🔐 Please update the following in your .env file:"
echo "- DATABASE_URL (your MongoDB connection string)"
echo "- JWT_SECRET (generate a secure secret)"
echo "- SESSION_SECRET (generate a secure secret)"
echo "- MEILISEARCH_MASTER_KEY (generate a secure key)"
echo "- Email configuration"
echo "- Domain configuration"

# Generate SSL certificates (Let's Encrypt)
echo "🔒 Setting up SSL certificates..."
sudo apt install certbot python3-certbot-nginx -y

echo "📋 Next steps:"
echo "1. Update your .env file with production values"
echo "2. Update nginx.conf with your domain name"
echo "3. Run: sudo certbot --nginx -d your-domain.com"
echo "4. Run: docker-compose -f docker-compose.prod.yml up -d"
echo "5. Set up GitHub Actions secrets for CI/CD"

echo "✅ Production environment setup complete!"
echo "🔧 Don't forget to configure your firewall and monitoring!"