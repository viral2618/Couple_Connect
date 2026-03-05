# Video Calling - Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
npm install mediasoup@^3.13.0 mediasoup-client@^3.7.0

# Start server
npm run dev
```

## 📍 How It Works

1. User clicks **video icon** in chat header
2. `VideoCall` component loads
3. MediaSoup creates **send/receive transports**
4. User's camera/mic streams are **produced**
5. Partner's streams are **consumed**
6. Video displays in full-screen overlay

## 🎨 UI Components

### Video Call Button (ChatHeader)
```tsx
<button onClick={onVideoCall}>
  {/* Video camera icon */}
</button>
```

### Video Call Component
```tsx
<VideoCall 
  roomId="user1-user2"
  userId="currentUserId"
  onClose={() => setIsVideoCallActive(false)}
/>
```

## 🔌 Socket Events

### Client → Server
- `getRouterRtpCapabilities` - Get router capabilities
- `createWebRtcTransport` - Create transport
- `connectWebRtcTransport` - Connect transport
- `produce` - Start producing media
- `consume` - Start consuming media
- `resumeConsumer` - Resume consumer
- `getProducers` - Get existing producers

### Server → Client
- `newProducer` - New peer joined
- `peerClosed` - Peer left

## 📦 Key Files

```
mediasoup-server.js          # Server-side MediaSoup logic
src/components/VideoCall.tsx # Client-side video UI
server.js                    # Socket.IO integration
```

## 🎛️ Controls

| Button | Action |
|--------|--------|
| 🎤 | Mute/Unmute audio |
| 📹 | Turn video on/off |
| ❌ | End call |

## 🔧 Environment Variables

```env
# Production only - your server's public IP
MEDIASOUP_ANNOUNCED_IP=123.45.67.89

# Development - leave empty or use localhost
MEDIASOUP_ANNOUNCED_IP=
```

## 🌐 Network Requirements

- **Ports**: 10000-10100 (UDP/TCP)
- **Protocol**: WebRTC (DTLS-SRTP)
- **Bandwidth**: ~1-2 Mbps per call

## 💡 Tips

1. **HTTPS required** for camera/mic access
2. **Only 2 users** per video room (1-to-1 calls)
3. **Auto cleanup** when users disconnect
4. **Mobile friendly** - responsive design

## 🐛 Debug

```javascript
// Check MediaSoup workers
console.log('Workers initialized:', workers.length)

// Check room state
console.log('Active rooms:', rooms.size)

// Check peer connections
console.log('Peers in room:', room.peers.size)
```

## 📱 Browser Support

✅ Chrome/Edge (recommended)
✅ Firefox
✅ Safari (iOS 14.3+)
⚠️ Older browsers may not support WebRTC

## 🔐 Security

- ✅ End-to-end encrypted (DTLS-SRTP)
- ✅ Room-based isolation
- ✅ Partner verification required
- ✅ Automatic cleanup on disconnect

## 📈 Scaling

MediaSoup uses **SFU architecture**:
- Low CPU usage
- Efficient bandwidth
- Multiple workers for load balancing
- Horizontal scaling ready

## 🎯 Production Checklist

- [ ] Set `MEDIASOUP_ANNOUNCED_IP`
- [ ] Open ports 10000-10100
- [ ] Enable HTTPS
- [ ] Configure firewall
- [ ] Test on mobile devices
- [ ] Monitor server resources
