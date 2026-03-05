'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

interface SimpleVideoCallProps {
  roomId: string
  userId: string
  onClose: () => void
}

export default function SimpleVideoCall({ roomId, userId, onClose }: SimpleVideoCallProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)

  const socketRef = useRef<Socket | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    initCall()
    return () => cleanup()
  }, [])

  const initCall = async () => {
    try {
      // Get user media first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      // Connect socket
      socketRef.current = io(window.location.origin, {
        path: '/socket.io/',
        transports: ['websocket', 'polling']
      })

      socketRef.current.on('connect', () => {
        console.log('[WebRTC] Connected')
        socketRef.current?.emit('join-video-room', { roomId, userId })
      })

      socketRef.current.on('user-joined', async ({ userId: remoteUserId }) => {
        console.log('[WebRTC] User joined:', remoteUserId)
        await createOffer()
      })

      socketRef.current.on('offer', async ({ offer, userId: remoteUserId }) => {
        console.log('[WebRTC] Received offer')
        await handleOffer(offer)
      })

      socketRef.current.on('answer', async ({ answer }) => {
        console.log('[WebRTC] Received answer')
        await handleAnswer(answer)
      })

      socketRef.current.on('ice-candidate', async ({ candidate }) => {
        console.log('[WebRTC] Received ICE candidate')
        await handleIceCandidate(candidate)
      })

      socketRef.current.on('user-left', () => {
        console.log('[WebRTC] User left')
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      })

      setIsConnecting(false)
    } catch (err: any) {
      console.error('[WebRTC] Init error:', err)
      setError(err.message)
      setIsConnecting(false)
    }
  }

  const createPeerConnection = () => {
    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    }

    const pc = new RTCPeerConnection(config)

    // Add local tracks
    localStreamRef.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!)
    })

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track')
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] Sending ICE candidate')
        socketRef.current?.emit('ice-candidate', {
          roomId,
          candidate: event.candidate
        })
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState)
      if (pc.connectionState === 'failed') {
        setError('Connection failed')
      }
    }

    peerConnectionRef.current = pc
    return pc
  }

  const createOffer = async () => {
    try {
      const pc = createPeerConnection()
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      socketRef.current?.emit('offer', {
        roomId,
        offer: pc.localDescription
      })
    } catch (err: any) {
      console.error('[WebRTC] Create offer error:', err)
      setError(err.message)
    }
  }

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      const pc = createPeerConnection()
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      socketRef.current?.emit('answer', {
        roomId,
        answer: pc.localDescription
      })
    } catch (err: any) {
      console.error('[WebRTC] Handle offer error:', err)
      setError(err.message)
    }
  }

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
      }
    } catch (err: any) {
      console.error('[WebRTC] Handle answer error:', err)
      setError(err.message)
    }
  }

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
      }
    } catch (err: any) {
      console.error('[WebRTC] Handle ICE candidate error:', err)
    }
  }

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    peerConnectionRef.current?.close()
    socketRef.current?.emit('leave-video-room', { roomId })
    socketRef.current?.disconnect()
  }

  const handleEndCall = () => {
    cleanup()
    onClose()
  }

  const [isPiP, setIsPiP] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const callStartTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const togglePiP = () => setIsPiP(!isPiP)

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              isConnecting ? 'bg-yellow-500' : 'bg-green-500'
            }`} />
            <span className="text-white font-medium">{formatDuration(callDuration)}</span>
          </div>
          <button
            onClick={togglePiP}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-500/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl z-20 animate-bounce">
          {error}
        </div>
      )}

      {/* Connecting Toast */}
      {isConnecting && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-500/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl z-20">
          Connecting...
        </div>
      )}

      {/* Video Grid */}
      <div className={`flex-1 relative ${isPiP ? 'p-0' : 'p-4'}`}>
        {/* Remote Video (Main) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
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

        {/* Local Video (PiP) */}
        <div className={`absolute ${isPiP ? 'bottom-24 right-4 w-32 h-32' : 'top-8 right-8 w-48 h-48'} transition-all duration-300 z-10`}>
          <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-gray-800">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {userId.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
              You
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-8">
        <div className="flex justify-center items-center gap-6">
          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className={`group relative w-16 h-16 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30'
            }`}
          >
            <svg className="w-7 h-7 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMuted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              )}
            </svg>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isMuted ? 'Unmute' : 'Mute'}
            </span>
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="group relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-2xl shadow-red-500/50 transition-all duration-300 transform hover:scale-110"
          >
            <svg className="w-9 h-9 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
            </svg>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              End Call
            </span>
          </button>

          {/* Video Toggle Button */}
          <button
            onClick={toggleVideo}
            className={`group relative w-16 h-16 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isVideoOff 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
                : 'bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30'
            }`}
          >
            <svg className="w-7 h-7 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isVideoOff ? (
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              )}
            </svg>
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {isVideoOff ? 'Turn On' : 'Turn Off'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
