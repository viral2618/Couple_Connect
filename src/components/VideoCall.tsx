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

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const initializeMedia = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setStream(mediaStream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }, [])

  const createPeer = useCallback((initiator: boolean, stream: MediaStream) => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    })

    peer.on('signal', (signal) => {
      console.log('Sending signal:', signal)
      socket?.emit('signal', { signal, roomId, userId })
    })

    peer.on('stream', (remoteStream) => {
      console.log('Received remote stream')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
      setIsConnected(true)
    })

    peer.on('connect', () => {
      console.log('Peer connected')
      setIsConnected(true)
    })

    peer.on('close', () => {
      console.log('Peer closed')
      setIsConnected(false)
    })

    peer.on('error', (err) => {
      console.error('Peer error:', err)
    })

    return peer
  }, [socket, roomId, userId])

  useEffect(() => {
    if (!stream) return
    
    const newSocket = io()
    setSocket(newSocket)

    newSocket.emit('join-room', roomId)

    newSocket.on('user-joined', ({ userId: joinedUserId }) => {
      if (joinedUserId !== userId && stream) {
        const newPeer = createPeer(true, stream)
        setPeer(newPeer)
      }
    })

    newSocket.on('signal', ({ signal, userId: senderId }) => {
      if (senderId !== userId) {
        if (!peer && stream) {
          const newPeer = createPeer(false, stream)
          setPeer(newPeer)
          setIsIncoming(true)
          newPeer.signal(signal)
        } else if (peer) {
          peer.signal(signal)
        }
      }
    })

    newSocket.on('user-left', () => {
      setIsConnected(false)
      peer?.destroy()
      setPeer(null)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [stream, roomId, userId, createPeer])

  useEffect(() => {
    initializeMedia()
    
    return () => {
      stream?.getTracks().forEach(track => track.stop())
      peer?.destroy()
      socket?.disconnect()
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
    socket?.emit('leave-room', { roomId, userId })
    socket?.disconnect()
    onCallEnd?.()
  }

  return (
    <div className={`relative w-full h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Local Video */}
      <video
        ref={localVideoRef}
        autoPlay
        playsInline
        muted
        className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg object-cover border-2 border-white"
      />

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>{isIncoming ? 'Connecting...' : 'Waiting for partner...'}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-600' : 'bg-gray-600'} text-white hover:opacity-80`}
          >
            {isMuted ? '🔇' : '🎤'}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-600' : 'bg-gray-600'} text-white hover:opacity-80`}
          >
            {isVideoOff ? '📹' : '📷'}
          </button>
          
          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-600 text-white hover:opacity-80"
          >
            📞
          </button>
        </div>
      )}
    </div>
  )
}