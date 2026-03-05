# Video Calling System Setup Guide

## 📦 Installation

1. **Install dependencies:**
```bash
npm install mediasoup@^3.13.0 mediasoup-client@^3.7.0
```

2. **Environment variables (.env):**
```env
# Add this to your .env file
MEDIASOUP_ANNOUNCED_IP=your-server-public-ip
# For local development, leave it empty or use 127.0.0.1
```

## 🚀 Usage

The video calling system is now integrated into your chat screen. Users can:

1. **Start a video call** by clicking the video camera icon in the chat header
2. **Mute/unmute** audio during the call
3. **Turn video on/off** during the call
4. **End the call** at any time

## 🏗️ Architecture

```
┌─────────────────┐
│   Chat Screen   │
│  (React/Next)   │
└────────┬────────┘
         │
         ├─── VideoCall Component (mediasoup-client)
         │
         ├─── Socket.IO (signaling)
         │
         ├─── MediaSoup Server (media routing)
         │
         └─── WebRTC (peer connection)
```

## 📁 Files Created/Modified

### New Files:
- `mediasoup-server.js` - MediaSoup server configuration
- `src/components/VideoCall.tsx` - Video call UI component

### Modified Files:
- `server.js` - Added MediaSoup handlers
- `src/components/FullPageChat.tsx` - Integrated video call
- `src/components/chat/ChatHeader.tsx` - Added video call button
- `package.json` - Added mediasoup dependencies

## 🔧 Configuration

### Port Configuration
MediaSoup uses ports 10000-10100 for RTC. Ensure these are open:

```bash
# For Ubuntu/Linux
sudo ufw allow 10000:10100/udp
sudo ufw allow 10000:10100/tcp
```

### Production Setup

1. **Set announced IP** in `.env.production`:
```env
MEDIASOUP_ANNOUNCED_IP=your-public-ip
```

2. **Update Docker** (if using):
```yaml
# docker-compose.prod.yml
services:
  app:
    ports:
      - "3000:3000"
      - "10000-10100:10000-10100/udp"
      - "10000-10100:10000-10100/tcp"
```

3. **Nginx configuration** (add to nginx.conf):
```nginx
# WebRTC traffic
location /socket.io/ {
    proxy_pass http://app:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

## 🎯 Features

✅ **1-to-1 video calling** between partners
✅ **Audio mute/unmute** control
✅ **Video on/off** control
✅ **Automatic reconnection** handling
✅ **Mobile responsive** design
✅ **Low latency** with MediaSoup SFU
✅ **Scalable** architecture

## 🐛 Troubleshooting

### Video not showing
- Check camera/microphone permissions in browser
- Ensure HTTPS is enabled (required for getUserMedia)
- Check browser console for errors

### Connection issues
- Verify ports 10000-10100 are open
- Check MEDIASOUP_ANNOUNCED_IP is set correctly
- Ensure Socket.IO is connected

### Audio issues
- Check microphone permissions
- Verify audio track is being produced
- Check browser audio settings

## 📊 Performance

- **Latency**: < 200ms typical
- **Bandwidth**: ~1-2 Mbps per call
- **CPU**: Low (SFU architecture)
- **Scalability**: Supports multiple concurrent calls

## 🔒 Security

- All media is encrypted (DTLS-SRTP)
- Signaling over secure WebSocket
- Room-based isolation
- Partner verification required

## 📝 Next Steps

1. Run `npm install` to install new dependencies
2. Set `MEDIASOUP_ANNOUNCED_IP` in your environment
3. Restart your server: `npm run dev`
4. Test video calling in the chat screen

## 🆘 Support

For issues:
1. Check browser console logs
2. Check server logs: `docker logs couple-connect_app_1`
3. Verify MediaSoup workers are initialized
4. Test with different browsers/devices
