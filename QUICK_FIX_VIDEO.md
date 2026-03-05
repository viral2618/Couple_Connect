# 🚀 Quick Fix: Video Calling Not Working in Production

## The Problem
Video calling works locally but fails in production with errors like:
- "Unable to join room"
- "MediaSoup not available"
- "Connection timeout"
- "Request timeout"

## The Root Cause
**MEDIASOUP_ANNOUNCED_IP is not configured correctly** in your production environment.

## The Solution (3 Steps)

### Step 1: Find Your Server's Public IP
```bash
curl ifconfig.me
```
Copy the IP address shown (e.g., `123.45.67.89`)

### Step 2: Update .env.production
Edit `.env.production` and set:
```env
MEDIASOUP_ANNOUNCED_IP=123.45.67.89
```
Replace `123.45.67.89` with YOUR actual server IP from Step 1.

### Step 3: Open Firewall Ports
```bash
# For Ubuntu/Debian
sudo ufw allow 10000:10100/udp
sudo ufw allow 10000:10100/tcp

# For AWS EC2 - Add to Security Group:
# - Custom UDP: 10000-10100, Source: 0.0.0.0/0
# - Custom TCP: 10000-10100, Source: 0.0.0.0/0
```

### Step 4: Restart Application
```bash
docker-compose -f docker-compose.prod.yml restart
```

## Automated Setup (Recommended)
```bash
chmod +x setup-video-production.sh
./setup-video-production.sh
```

## Verify It's Working
```bash
# Check configuration
npm run check-video

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app | grep MediaSoup

# You should see:
# ✓ MediaSoup workers initialized successfully
# [MediaSoup] Creating transport with announcedIp: YOUR_IP
```

## Platform-Specific Notes

### Railway
```bash
# Railway may have UDP limitations
# Set in Railway dashboard:
MEDIASOUP_ANNOUNCED_IP=<your-railway-domain-ip>
```

### Vercel
⚠️ **Vercel doesn't support MediaSoup** (no WebSocket/UDP support)
- Deploy backend to VPS or Railway
- Use Vercel only for frontend

### AWS EC2 / DigitalOcean / Linode
✅ **Fully supported** - Just follow the 4 steps above

### Google Cloud / Azure
✅ **Fully supported** - Follow steps + configure firewall rules

## Still Not Working?

1. **Run diagnostics:**
   ```bash
   npm run check-video
   ```

2. **Check detailed guide:**
   See [VIDEO_CALLING_TROUBLESHOOTING.md](VIDEO_CALLING_TROUBLESHOOTING.md)

3. **Check logs:**
   ```bash
   docker-compose -f docker-compose.prod.yml logs --tail=100 app
   ```

## Key Points to Remember

✅ **MUST SET:** `MEDIASOUP_ANNOUNCED_IP` to your server's PUBLIC IP
✅ **MUST OPEN:** Ports 10000-10100 (UDP and TCP)
✅ **MUST HAVE:** HTTPS enabled (required for camera/microphone access)
✅ **MUST USE:** VPS or dedicated server (not serverless platforms)

## Quick Test

1. Open your app in browser
2. Open browser console (F12)
3. Start a video call
4. Look for these logs:
   ```
   [VideoCall] Socket connected
   [VideoCall] Joining room
   [VideoCall] RTP capabilities received
   ```

If you see these, video calling is working! 🎉

## Need Help?

Run diagnostics and share the output:
```bash
npm run check-video > video-diagnostics.txt
docker-compose -f docker-compose.prod.yml logs --tail=100 app > server-logs.txt
```
