'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Peer from 'simple-peer'
import { io, Socket } from 'socket.io-client'

interface VideoCallProps {
  roomId: string
  userId: string
  onCallEnd?: () => void
  className?: string
  showControls?: boolean
}

interface CallStats {
  connectionState: string
  audioLevel: number
  videoQuality: string
}

export default function VideoCall({ 
  roomId, 
  userId, 
  onCallEnd, 
  className = '',
  showControls = true 
}: VideoCallProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [peer, setPeer] = useState<Peer.Instance | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isIncoming, setIsIncoming] = useState(false)
  const [callStats, setCallStats] = useState<CallStats>({ connectionState: 'new', audioLevel: 0, videoQuality: 'HD' })
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  const initializeMedia = useCallback(async () => {
    try {
      console.log('Initializing media for user:', userId)
      const constraints = {
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          frameRate: { ideal: 15, max: 30 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log('Media stream obtained:', mediaStream.getTracks().length, 'tracks')
      setStream(mediaStream)
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream
      }
      
      setupAudioAnalysis(mediaStream)
      
    } catch (error: any) {
      console.error('Error accessing media devices:', error)
      setError(`Camera/Microphone access denied: ${error.message}`)
    }
  }, [userId])

  const setupAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      // Monitor audio levels
      const monitorAudio = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setCallStats(prev => ({ ...prev, audioLevel: average }))
        }
        requestAnimationFrame(monitorAudio)
      }
      monitorAudio()
    } catch (error) {
      console.warn('Audio analysis setup failed:', error)
    }
  }

  const createPeer = useCallback((initiator: boolean, stream: MediaStream, targetSocket: Socket) => {
    console.log(`Creating peer - initiator: ${initiator}, roomId: ${roomId}, userId: ${userId}`)
    
    // Destroy existing peer if any
    if (peer) {
      console.log('Destroying existing peer before creating new one')
      peer.destroy()
      setPeer(null)
    }
    
    const newPeer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      }
    })

    newPeer.on('signal', (signal) => {
      console.log('Sending signal:', signal.type || 'candidate')
      targetSocket.emit('video-signal', { signal, roomId, userId })
    })

    newPeer.on('stream', (remoteStream) => {
      console.log('Received remote stream')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
      setIsConnected(true)
      setCallStats(prev => ({ ...prev, connectionState: 'connected' }))
    })

    newPeer.on('connect', () => {
      console.log('Peer connected')
      setIsConnected(true)
      setCallStats(prev => ({ ...prev, connectionState: 'connected' }))
    })

    newPeer.on('close', () => {
      console.log('Peer connection closed')
      setIsConnected(false)
      setCallStats(prev => ({ ...prev, connectionState: 'disconnected' }))
    })

    newPeer.on('error', (err) => {
      console.error('Peer error:', err)
      setError(`Connection error: ${err.message}`)
      setCallStats(prev => ({ ...prev, connectionState: 'failed' }))
    })

    return newPeer
  }, [roomId, userId, peer])

  useEffect(() => {
    if (!stream) return
    
    const newSocket = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
      : 'http://localhost:3000', {
      transports: ['websocket'],
      timeout: 20000,
      forceNew: true
    })
    
    setSocket(newSocket)
    console.log(`Joining video room: ${roomId} as user: ${userId}`)

    newSocket.on('connect', () => {
      console.log('Socket connected, joining video room')
      newSocket.emit('join-video-room', { roomId, userId })
    })

    newSocket.on('user-joined-video', ({ userId: joinedUserId }) => {
      console.log(`User joined video: ${joinedUserId}`)
      if (joinedUserId !== userId && stream) {
        console.log('Creating initiator peer for joined user')
        const newPeer = createPeer(true, stream, newSocket)
        setPeer(newPeer)
        setCallStats(prev => ({ ...prev, connectionState: 'connecting' }))
      }
    })

    newSocket.on('video-signal', ({ signal, userId: senderId }) => {
      console.log(`Received signal from ${senderId}:`, signal.type || 'candidate')
      if (senderId !== userId) {
        setPeer(currentPeer => {
          if (!currentPeer && stream) {
            console.log('Creating receiver peer for signal')
            const newPeer = createPeer(false, stream, newSocket)
            setIsIncoming(true)
            setCallStats(prev => ({ ...prev, connectionState: 'connecting' }))
            newPeer.signal(signal)
            return newPeer
          } else if (currentPeer) {
            console.log('Signaling existing peer')
            try {
              currentPeer.signal(signal)
            } catch (error) {
              console.error('Error signaling peer:', error)
            }
            return currentPeer
          }
          return currentPeer
        })
      }
    })

    newSocket.on('user-left-video', ({ userId: leftUserId }) => {
      console.log(`User left video: ${leftUserId}`)
      if (leftUserId !== userId) {
        setIsConnected(false)
        setPeer(currentPeer => {
          if (currentPeer) {
            currentPeer.destroy()
          }
          return null
        })
        setCallStats(prev => ({ ...prev, connectionState: 'disconnected' }))
      }
    })

    newSocket.on('video-error', ({ message }) => {
      console.error('Video error:', message)
      setError(message)
    })

    // If socket is already connected, join immediately
    if (newSocket.connected) {
      newSocket.emit('join-video-room', { roomId, userId })
    }

    return () => {
      console.log('Cleaning up video call')
      setPeer(currentPeer => {
        if (currentPeer) {
          currentPeer.destroy()
        }
        return null
      })
      newSocket.emit('leave-video-room', { roomId, userId })
      newSocket.disconnect()
    }
  }, [stream, roomId, userId, createPeer])

  useEffect(() => {
    initializeMedia()
    
    return () => {
      console.log('VideoCall component unmounting, cleaning up...')
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop()
          console.log('Stopped track:', track.kind)
        })
      }
      if (peer) {
        peer.destroy()
        console.log('Destroyed peer connection')
      }
      if (socket) {
        socket.emit('leave-video-room', { roomId, userId })
        socket.disconnect()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, []) // Remove dependencies to prevent recreation

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const endCall = () => {
    stream?.getTracks().forEach(track => track.stop())
    peer?.destroy()
    socket?.emit('leave-video-room', { roomId, userId })
    socket?.disconnect()
    audioContextRef.current?.close()
    onCallEnd?.()
  }

  if (error) {
    return (
      <div className={`relative w-full h-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center text-white p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Call Error</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={endCall}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            End Call
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Local Video */}
      <div className="absolute top-4 right-4 group">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className={`bg-gray-800 rounded-lg object-cover border-2 border-white/20 transition-all duration-300 ${
            isFullscreen ? 'w-48 h-36' : 'w-32 h-24'
          } ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
        />
        {isVideoOff && (
          <div className={`absolute inset-0 bg-gray-800 rounded-lg border-2 border-white/20 flex items-center justify-center ${
            isFullscreen ? 'w-48 h-36' : 'w-32 h-24'
          }`}>
            <span className="text-white text-2xl">📹</span>
          </div>
        )}
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-white text-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">
              {isIncoming ? 'Connecting...' : 'Waiting for partner...'}
            </h3>
            <p className="text-gray-300">Connection state: {callStats.connectionState}</p>
          </div>
        </div>
      )}

      {/* Call Stats */}
      {showStats && isConnected && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
          <div>Status: {callStats.connectionState}</div>
          <div>Audio: {callStats.audioLevel.toFixed(0)}dB</div>
          <div>Quality: {callStats.videoQuality}</div>
        </div>
      )}

      {/* Audio Level Indicator */}
      {!isMuted && callStats.audioLevel > 10 && (
        <div className="absolute bottom-20 left-4 flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-6 rounded-full transition-all duration-100 ${
                callStats.audioLevel > (i + 1) * 20 ? 'bg-green-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-3 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full transition-all duration-200 ${
                isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
              } text-white`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                {isMuted ? (
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.617l3.766-2.793a1 1 0 011.617.793zm7.617 2.924a1 1 0 011.414 0 9.972 9.972 0 010 14.1 1 1 0 11-1.414-1.414 7.971 7.971 0 000-11.272 1 1 0 010-1.414z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.617l3.766-2.793a1 1 0 011.617.793zM12 6a1 1 0 011.414 0 3.972 3.972 0 010 5.656 1 1 0 01-1.414-1.414 1.972 1.972 0 000-2.828A1 1 0 0112 6z" clipRule="evenodd" />
                )}
              </svg>
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full transition-all duration-200 ${
                isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
              } text-white`}
              title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                {isVideoOff ? (
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a2 2 0 00-3.53-1.235L12 8.236V7a2 2 0 00-2-2H7.764l4.543-4.543z" clipRule="evenodd" />
                ) : (
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                )}
              </svg>
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200"
              title="Toggle fullscreen"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-3 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200"
              title="Toggle stats"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </button>
            
            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
              title="End call"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}