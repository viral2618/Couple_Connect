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

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg z-10">
          {error}
        </div>
      )}

      {isConnecting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg z-10">
          Connecting...
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            Partner
          </div>
        </div>

        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            You {isVideoOff && '(Video Off)'}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 p-4 flex justify-center items-center gap-4">
        <button
          onClick={toggleMute}
          className={`p-4 rounded-full transition-colors ${
            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isMuted ? '🔇' : '🎤'}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
        >
          ❌
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVideoOff ? '📷' : '📹'}
        </button>
      </div>
    </div>
  )
}
