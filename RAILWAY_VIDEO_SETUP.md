# Railway Video Calling Setup

## Critical Steps for Video Calling on Railway

### 1. Set Environment Variables in Railway Dashboard

Go to your Railway project → Variables tab and add:

```
MEDIASOUP_ANNOUNCED_IP=coupleconnect-production-35ae.up.railway.app
MEDIASOUP_MIN_PORT=10000
MEDIASOUP_MAX_PORT=10100
```

### 2. Deploy the Updated Code

```bash
git add .
git commit -m "Fix video calling for Railway"
git push
```

### 3. Important Notes

- Railway **does NOT support UDP**, so MediaSoup is configured for **TCP only**
- This may result in slightly lower video quality but will work
- The video calling uses WebRTC over TCP with TURN fallback
- Make sure your Railway service is using the Dockerfile for deployment

### 4. Testing

After deployment:
1. Open your app: https://coupleconnect-production-35ae.up.railway.app
2. Start a video call
3. Check Railway logs for MediaSoup initialization messages
4. Look for: `[MediaSoup] Using announcedIp: coupleconnect-production-35ae.up.railway.app`

### 5. If Still Not Working

Railway has limitations with WebRTC. Consider:
- Using a TURN server (Twilio, Metered.ca)
- Switching to a VPS (DigitalOcean, AWS EC2) that supports UDP
- Using a managed video service (Agora, Daily.co)
