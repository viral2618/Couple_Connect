# Production Deployment Checklist - Video Calling

Use this checklist to ensure video calling works correctly in production.

## Pre-Deployment

### Environment Setup
- [ ] Server has public IP address
- [ ] Domain name configured (optional but recommended)
- [ ] SSL certificate installed (REQUIRED for camera/microphone access)
- [ ] Docker and Docker Compose installed
- [ ] Ports 80, 443, 3000 accessible

### Configuration Files
- [ ] `.env.production` file exists
- [ ] Database connection string configured
- [ ] JWT and session secrets set
- [ ] Email configuration complete
- [ ] MeiliSearch configuration set

### Video Calling Specific
- [ ] `MEDIASOUP_ANNOUNCED_IP` set to server's public IP (NOT 0.0.0.0)
- [ ] `MEDIASOUP_MIN_PORT` set to 10000
- [ ] `MEDIASOUP_MAX_PORT` set to 10100
- [ ] MediaSoup dependencies installed (`mediasoup`, `mediasoup-client`)

## Deployment Steps

### 1. Initial Setup
```bash
# Clone repository
git clone <your-repo-url>
cd Couple_Connect

# Run video setup script
chmod +x setup-video-production.sh
./setup-video-production.sh
```
- [ ] Setup script completed successfully
- [ ] Public IP detected and set in .env.production

### 2. Firewall Configuration
```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 10000:10100/udp
sudo ufw allow 10000:10100/tcp
sudo ufw enable
```
- [ ] Port 80 (HTTP) open
- [ ] Port 443 (HTTPS) open
- [ ] Port 3000 (App) open
- [ ] Ports 10000-10100 UDP open
- [ ] Ports 10000-10100 TCP open

### 3. Cloud Provider Firewall (if applicable)

#### AWS EC2
- [ ] Security group allows inbound on port 80
- [ ] Security group allows inbound on port 443
- [ ] Security group allows inbound on port 3000
- [ ] Security group allows inbound on ports 10000-10100 (UDP)
- [ ] Security group allows inbound on ports 10000-10100 (TCP)

#### Google Cloud
```bash
gcloud compute firewall-rules create couple-connect-http --allow tcp:80,tcp:443,tcp:3000
gcloud compute firewall-rules create couple-connect-mediasoup --allow udp:10000-10100,tcp:10000-10100
```
- [ ] HTTP/HTTPS firewall rule created
- [ ] MediaSoup firewall rule created

#### Azure
- [ ] Network Security Group allows ports 80, 443, 3000
- [ ] Network Security Group allows ports 10000-10100 (UDP/TCP)

### 4. Build and Deploy
```bash
# Build Docker image
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d
```
- [ ] Docker build completed without errors
- [ ] All containers started successfully
- [ ] No error messages in logs

### 5. SSL Certificate (if not done)
```bash
# Using Let's Encrypt
sudo certbot --nginx -d your-domain.com
```
- [ ] SSL certificate installed
- [ ] Auto-renewal configured
- [ ] HTTPS working

## Post-Deployment Verification

### 1. Run Diagnostics
```bash
npm run check-video
```
- [ ] All checks pass with ✓
- [ ] MEDIASOUP_ANNOUNCED_IP shows correct IP
- [ ] All dependencies present
- [ ] All files exist

### 2. Check Server Logs
```bash
docker-compose -f docker-compose.prod.yml logs app | grep MediaSoup
```

Expected output:
- [ ] "Initializing MediaSoup workers..."
- [ ] "MediaSoup worker created [pid:XXXX]"
- [ ] "All MediaSoup workers initialized successfully"
- [ ] NO errors about "MEDIASOUP_ANNOUNCED_IP not set"

### 3. Check Application Health
```bash
curl http://localhost:3000/api/health
```
- [ ] Returns 200 OK
- [ ] Database connected
- [ ] No errors

### 4. Check Socket.IO
```bash
curl http://localhost:3000/socket.io/
```
- [ ] Returns: `{"code":0,"message":"Transport unknown"}`
- [ ] Socket.IO is responding

### 5. Test Video Calling

#### Browser Console Test
1. Open application in browser
2. Open Developer Console (F12)
3. Create/join a room
4. Start video call

Expected console logs:
- [ ] `[VideoCall] Socket connected: <socket-id>`
- [ ] `[VideoCall] Joining room: <room-id>`
- [ ] `[VideoCall] Getting RTP capabilities for room: <room-id>`
- [ ] `[VideoCall] RTP capabilities received`
- [ ] `[Send Transport] State: connecting`
- [ ] `[Send Transport] State: connected`
- [ ] `[Recv Transport] State: connecting`
- [ ] `[Recv Transport] State: connected`

#### Server Logs Test
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

Expected server logs:
- [ ] `[MediaSoup] Getting RTP capabilities for room: <room-id>`
- [ ] `[MediaSoup] Room created/retrieved: <room-id>`
- [ ] `[MediaSoup] Creating transport with announcedIp: <your-ip>`
- [ ] NO "Room not found" errors
- [ ] NO "Transport not found" errors

#### Functional Test
- [ ] Camera permission requested
- [ ] Microphone permission requested
- [ ] Local video visible
- [ ] Can mute/unmute audio
- [ ] Can turn video on/off
- [ ] Second user can join
- [ ] Remote video visible
- [ ] Audio working both ways
- [ ] Video working both ways
- [ ] Can end call cleanly

## Troubleshooting

If any checks fail, refer to:
- [ ] [QUICK_FIX_VIDEO.md](QUICK_FIX_VIDEO.md) - Quick solutions
- [ ] [VIDEO_CALLING_TROUBLESHOOTING.md](VIDEO_CALLING_TROUBLESHOOTING.md) - Detailed guide
- [ ] [FIXES_APPLIED.md](FIXES_APPLIED.md) - Technical details

## Common Issues Checklist

### "Unable to join room" or "MediaSoup not available"
- [ ] Check MEDIASOUP_ANNOUNCED_IP is set correctly
- [ ] Check MediaSoup workers initialized in logs
- [ ] Restart application

### "Connection timeout" or "Request timeout"
- [ ] Verify MEDIASOUP_ANNOUNCED_IP is server's PUBLIC IP (not 0.0.0.0)
- [ ] Check ports 10000-10100 are open
- [ ] Check cloud provider firewall

### "Room not found"
- [ ] Check socket.io connection in browser console
- [ ] Verify socket room join in server logs
- [ ] Check for socket connection errors

### Video connects but no video/audio
- [ ] Verify ports 10000-10100 UDP are open
- [ ] Check browser permissions for camera/microphone
- [ ] Verify HTTPS is enabled
- [ ] Check for WebRTC errors in console

## Monitoring

### Set up monitoring for:
- [ ] Server CPU usage (MediaSoup can be CPU intensive)
- [ ] Memory usage
- [ ] Network bandwidth (especially UDP traffic)
- [ ] Port availability (10000-10100)
- [ ] Application logs for errors
- [ ] Socket.io connection count

### Recommended Tools:
- [ ] Prometheus + Grafana for metrics
- [ ] ELK Stack for log aggregation
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Error tracking (Sentry)

## Performance Optimization

### For Production:
- [ ] Consider multiple MediaSoup workers (currently 1)
- [ ] Set up load balancing if needed
- [ ] Configure CDN for static assets
- [ ] Enable Gzip compression
- [ ] Optimize database queries
- [ ] Set up Redis for session storage (optional)

### MediaSoup Tuning:
```javascript
// In mediasoup-server.js
const numWorkers = require('os').cpus().length; // Use all CPU cores
```
- [ ] Adjust worker count based on server capacity
- [ ] Monitor CPU usage per worker
- [ ] Adjust bitrate settings if needed

## Security Checklist

- [ ] HTTPS enabled (required)
- [ ] JWT secrets are strong and unique
- [ ] Database credentials secured
- [ ] Firewall configured (only necessary ports open)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] No sensitive data in logs
- [ ] Regular security updates scheduled

## Backup and Recovery

- [ ] Database backup strategy in place
- [ ] Application files backed up
- [ ] .env.production backed up securely
- [ ] SSL certificates backed up
- [ ] Rollback plan documented
- [ ] Recovery procedure tested

## Documentation

- [ ] Production URL documented
- [ ] Server credentials secured
- [ ] Deployment process documented
- [ ] Troubleshooting guide accessible
- [ ] Team trained on deployment process

## Sign-off

Deployment completed by: ___________________
Date: ___________________
Production URL: ___________________
Server IP: ___________________

Verified by: ___________________
Date: ___________________

## Notes

Additional notes or issues encountered:
_____________________________________________
_____________________________________________
_____________________________________________
_____________________________________________

## Next Steps

After successful deployment:
1. Monitor logs for 24 hours
2. Test with real users
3. Gather feedback
4. Optimize based on usage patterns
5. Set up automated monitoring alerts
6. Schedule regular maintenance windows

---

**Remember:** Video calling requires:
1. ✅ MEDIASOUP_ANNOUNCED_IP = Your server's PUBLIC IP
2. ✅ Ports 10000-10100 (UDP/TCP) open
3. ✅ HTTPS enabled
4. ✅ Proper socket room joining

Good luck with your deployment! 🚀
