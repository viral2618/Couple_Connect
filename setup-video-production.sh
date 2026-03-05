#!/bin/bash

echo "=========================================="
echo "Couple Connect - Video Calling Setup"
echo "=========================================="
echo ""

# Detect public IP
echo "Detecting your server's public IP address..."
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || curl -s ipecho.net/plain)

if [ -z "$PUBLIC_IP" ]; then
    echo "❌ Could not detect public IP automatically"
    echo "Please enter your server's public IP address manually:"
    read -p "Public IP: " PUBLIC_IP
fi

echo "✓ Detected IP: $PUBLIC_IP"
echo ""

# Update .env.production
echo "Updating .env.production with MediaSoup configuration..."

if [ -f ".env.production" ]; then
    # Check if MEDIASOUP_ANNOUNCED_IP exists
    if grep -q "MEDIASOUP_ANNOUNCED_IP=" .env.production; then
        # Update existing line
        sed -i "s/MEDIASOUP_ANNOUNCED_IP=.*/MEDIASOUP_ANNOUNCED_IP=$PUBLIC_IP/" .env.production
        echo "✓ Updated MEDIASOUP_ANNOUNCED_IP in .env.production"
    else
        # Add new line
        echo "MEDIASOUP_ANNOUNCED_IP=$PUBLIC_IP" >> .env.production
        echo "✓ Added MEDIASOUP_ANNOUNCED_IP to .env.production"
    fi
else
    echo "❌ .env.production file not found!"
    exit 1
fi

echo ""
echo "=========================================="
echo "Firewall Configuration"
echo "=========================================="
echo ""
echo "Opening required ports for video calling..."

# Check if ufw is available
if command -v ufw &> /dev/null; then
    echo "Configuring UFW firewall..."
    sudo ufw allow 10000:10100/udp comment 'MediaSoup RTC UDP'
    sudo ufw allow 10000:10100/tcp comment 'MediaSoup RTC TCP'
    echo "✓ Firewall rules added"
else
    echo "⚠ UFW not found. Please manually open ports 10000-10100 (UDP/TCP)"
fi

echo ""
echo "=========================================="
echo "Configuration Complete!"
echo "=========================================="
echo ""
echo "MediaSoup Announced IP: $PUBLIC_IP"
echo "RTC Port Range: 10000-10100 (UDP/TCP)"
echo ""
echo "Next steps:"
echo "1. Restart your application: docker-compose -f docker-compose.prod.yml restart"
echo "2. Check logs: docker-compose -f docker-compose.prod.yml logs -f app"
echo "3. Test video calling from your application"
echo ""
echo "If video calling still doesn't work:"
echo "- Verify ports 10000-10100 are open on your cloud provider's firewall"
echo "- Check that $PUBLIC_IP is the correct public IP"
echo "- Review application logs for MediaSoup errors"
echo ""
