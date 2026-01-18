export const VIDEO_CALL_CONFIG = {
  // TURN/STUN servers for NAT traversal
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:your-turn-server.com:3478',
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || 'default',
      credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || 'default'
    }
  ],
  
  // Security settings
  security: {
    enforceHttps: process.env.NODE_ENV === 'production',
    maxCallDuration: 3600000, // 1 hour in ms
    allowedOrigins: ['localhost:3000', 'your-domain.com'],
    encryptionRequired: true
  },
  
  // Media constraints
  mediaConstraints: {
    video: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 60 }
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    }
  },
  
  // Connection settings
  connection: {
    iceConnectionTimeout: 10000,
    reconnectAttempts: 3,
    reconnectDelay: 2000
  }
}

export const validateSecurityConfig = () => {
  const errors: string[] = []
  
  if (VIDEO_CALL_CONFIG.security.enforceHttps && typeof window !== 'undefined') {
    if (!window.location.protocol.includes('https') && !window.location.hostname.includes('localhost')) {
      errors.push('HTTPS is required for video calls in production')
    }
  }
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    errors.push('Media devices API not supported')
  }
  
  return { isValid: errors.length === 0, errors }
}