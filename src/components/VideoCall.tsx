'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Peer from 'simple-peer'
import { io, Socket } from 'socket.io-client'

interface VideoCallProps {
  roomId: string
  userId: string
  onClose: () => void
}

export default function VideoCall({ roomId, userId, onClose }: VideoCallProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [peer, setPeer] = useState<Peer.Instance | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [callDuration, setCallDuration] = useState(0)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const callStartTimeRef = useRef<number>(Date.now())

  const initializeMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      
      setStream(mediaStream)
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream
      }
    } catch (error: any) {
      console.error('Media error:', error)
      setError(`Camera/Microphone access denied: ${error.message}`)
    }
  }, [])

  const createPeer = useCallback((initiator: boolean, stream: MediaStream, targetSocket: Socket) => {
    const newPeer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    })

    newPeer.on('signal', (signal) => {
      targetSocket.emit('signal', { signal, roomId, userId })
    })

    newPeer.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
      setIsConnected(true)
    })

    newPeer.on('error', (err) => {
      console.error('Peer error:', err)
      setError(`Connection error: ${err.message}`)
    })

    return newPeer
  }, [roomId, userId])

  useEffect(() => {
    if (!stream) return
    
    const newSocket = io(window.location.origin, {
      path: '/socket.io/',
      transports: ['websocket', 'polling']
    })
    
    setSocket(newSocket)

    newSocket.on('connect', () => {
      newSocket.emit('join-video-room', { roomId, userId })
    })

    newSocket.on('video-room-joined', ({ otherUsers }) => {
      if (otherUsers.length > 0 && stream) {
        const newPeer = createPeer(true, stream, newSocket)
        setPeer(newPeer)
      }
    })

    newSocket.on('user-joined-video', () => {
      if (stream && !peer) {
        const newPeer = createPeer(false, stream, newSocket)
        setPeer(newPeer)
      }
    })

    newSocket.on('signal', ({ signal, userId: senderId }) => {
      if (senderId !== userId && peer && !peer.destroyed) {
        peer.signal(signal)
      }
    })

    newSocket.on('user-left-video', () => {
      setIsConnected(false)
      if (peer && !peer.destroyed) {
        peer.destroy()
      }
      setPeer(null)
    })

    return () => {
      if (peer && !peer.destroyed) {
        peer.destroy()
      }
      newSocket.emit('leave-video-room', { roomId, userId })
      newSocket.disconnect()
    }
  }, [stream, roomId, userId, createPeer, peer])

  useEffect(() => {
    initializeMedia()
    
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
    }, 1000)
    
    return () => {
      clearInterval(timer)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [initializeMedia])

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

  const endCall = () => {
    stream?.getTracks().forEach(track => track.stop())
    peer?.destroy()
    socket?.emit('leave-video-room', { roomId, userId })
    socket?.disconnect()
    onClose()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 z-50 flex flex-col">
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-white font-medium">{formatDuration(callDuration)}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl z-20">
          {error}
        </div>
      )}

      <div className="flex-1 relative p-4">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gray-800">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20">
              <span className="font-medium">💕 Your Partner</span>
            </div>
          </div>
        </div>

        <div className="absolute top-8 right-8 w-48 h-48 z-10">
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-800">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              You
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-8">
        <div className="flex justify-center items-center gap-6">
          <button
            onClick={toggleMute}
            className={`w-16 h-16 rounded-full transition-all ${isMuted ? 'bg-red-500' : 'bg-white/20'}`}
          >
            <svg className="w-7 h-7 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <button
            onClick={endCall}
            className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-2xl"
          >
            <svg className="w-9 h-9 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
          </button>

          <button
            onClick={toggleVideo}
            className={`w-16 h-16 rounded-full transition-all ${isVideoOff ? 'bg-red-500' : 'bg-white/20'}`}
          >
            <svg className="w-7 h-7 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
