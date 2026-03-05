# Video Calling Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: "Unable to join room" or "MediaSoup not available"

**Cause:** MediaSoup server is not properly configured or not running.

**Solution:**
```bash
# 1. Check if MediaSoup is initialized
docker-compose -f docker-compose.prod.yml logs app | grep MediaSoup

# You should see:
# ✓ MediaSoup workers initialized successfully

# 2. If not, check for errors:
docker-compose -f docker-compose.prod.yml logs app | grep -i error
```

### Issue 2: "Connection timeout" or "Request timeout"

**Cause:** MEDIASOUP_ANNOUNCED_IP is not set correctly.

**Solution:**
```bash
# 1. Run the setup script
chmod +x setup-video-production.sh
./setup-video-production.sh

# 2. Or manually set your public IP
# Edit .env.production and set:
MEDIASOUP_ANNOUNCED_IP=YOUR_SERVER_PUBLIC_IP

# 3. Find your public IP:
curl ifconfig.me

# 4. Restart the application
docker-compose -f docker-compose.prod.yml restart
```

### Issue 3: Video call connects but no video/audio

**Cause:** Firewall blocking MediaSoup RTC ports (10000-10100).

**Solution:**

**For Ubuntu/Debian with UFW:**
```bash
sudo ufw allow 10000:10100/udp
sudo ufw allow 10000:10100/tcp
sudo ufw reload
```

**For AWS EC2:**
1. Go to EC2 Console → Security Groups
2. Add Inbound Rules:
   - Type: Custom UDP, Port Range: 10000-10100, Source: 0.0.0.0/0
   - Type: Custom TCP, Port Range: 10000-10100, Source: 0.0.0.0/0

**For Google Cloud:**
```bash
gcloud compute firewall-rules create mediasoup-rtc \
  --allow udp:10000-10100,tcp:10000-10100 \
  --source-ranges 0.0.0.0/0
```

**For Azure:**
```bash
az network nsg rule create \
  --resource-group YOUR_RESOURCE_GROUP \
  --nsg-name YOUR_NSG \
  --name MediaSoup-RTC \
  --priority 1000 \
  --source-address-prefixes '*' \
  --destination-port-ranges 10000-10100 \
  --protocol '*'
```

### Issue 4: Works locally but not in production

**Cause:** Environment differences between local and production.

**Solution:**
```bash
# 1. Check environment variables
node check-video-setup.js

# 2. Compare local vs production settings
cat .env.local
cat .env.production

# 3. Ensure production has:
# - Correct MEDIASOUP_ANNOUNCED_IP (your server's public IP)
# - Ports 10000-10100 open
# - MediaSoup dependencies installed
```

### Issue 5: "Room not found" error

**Cause:** Socket connection issue or room not created properly.

**Solution:**
```bash
# 1. Check socket connection in browser console
# Should see: [VideoCall] Socket connected: <socket-id>
# Should see: [VideoCall] Joining room: <room-id>

# 2. Check server logs
docker-compose -f docker-compose.prod.yml logs -f app

# 3. Verify socket.io is working
curl http://YOUR_DOMAIN/socket.io/
# Should return: {"code":0,"message":"Transport unknown"}
```

### Issue 6: Railway/Vercel Deployment Issues

**Important:** Railway and Vercel have limitations with UDP traffic.

**For Railway:**
```bash
# 1. Set environment variable in Railway dashboard:
MEDIASOUP_ANNOUNCED_IP=<your-railway-app-domain-ip>

# 2. Railway may not support UDP well, consider using:
# - Dedicated VPS (DigitalOcean, Linode, AWS EC2)
# - Or use simple WebRTC peer-to-peer (already implemented as fallback)
```

**For Vercel:**
- Vercel Serverless functions don't support WebSocket/MediaSoup
- Deploy to a VPS or use Vercel for frontend + separate backend

## Diagnostic Commands

### Check if MediaSoup is running:
```bash
docker-compose -f docker-compose.prod.yml exec app node -e "
const mediasoup = require('mediasoup');
console.log('MediaSoup version:', mediasoup.version);
"
```

### Check port availability:
```bash
# Check if ports are listening
netstat -tuln | grep -E ':(3000|10000|10100)'

# Test UDP port
nc -u -v YOUR_SERVER_IP 10000
```

### Check Docker network:
```bash
docker network inspect couple-connect_couple-connect-network
```

### View real-time logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f app | grep -E '(MediaSoup|VideoCall|WebRTC)'
```

## Quick Diagnostic Script

Run this to check your setup:
```bash
node check-video-setup.js
```

## Production Checklist

- [ ] MEDIASOUP_ANNOUNCED_IP set to server's public IP
- [ ] Ports 10000-10100 (UDP/TCP) open in firewall
- [ ] Ports 10000-10100 (UDP/TCP) open in cloud provider security group
- [ ] MediaSoup dependencies installed (mediasoup, mediasoup-client)
- [ ] Docker container has ports mapped correctly
- [ ] SSL/HTTPS enabled (required for getUserMedia)
- [ ] Socket.io connection working
- [ ] No proxy/load balancer blocking UDP traffic

## Testing Video Calling

1. **Open browser console** (F12)
2. **Create a room** and start video call
3. **Check console logs** for:
   ```
   [VideoCall] Socket connected: <id>
   [VideoCall] Joining room: <room-id>
   [VideoCall] Getting RTP capabilities
   [VideoCall] RTP capabilities received
   [MediaSoup] Creating transport with announcedIp: <your-ip>
   ```

4. **If you see errors**, check:
   - Network tab for failed requests
   - Console for JavaScript errors
   - Server logs for backend errors

## Still Not Working?

1. **Check server logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs --tail=100 app
   ```

2. **Verify environment:**
   ```bash
   docker-compose -f docker-compose.prod.yml exec app env | grep MEDIASOUP
   ```

3. **Test basic connectivity:**
   ```bash
   # From your local machine
   telnet YOUR_SERVER_IP 3000
   ```

4. **Consider alternatives:**
   - Use SimpleVideoCall component (peer-to-peer WebRTC without MediaSoup)
   - Deploy to a VPS with full network control
   - Use a managed video calling service (Twilio, Agora, etc.)

## Contact Support

If issues persist, provide:
- Server logs (last 100 lines)
- Browser console errors
- Output of `node check-video-setup.js`
- Your deployment platform (AWS, GCP, Railway, etc.)
- Network configuration details
