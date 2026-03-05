'use client'

import { useEffect, useRef, useState } from 'react'
import { Device } from 'mediasoup-client'
import { io, Socket } from 'socket.io-client'

interface EnhancedVideoCallProps {
  roomId: string
  userId: string
  onClose: () => void
}

export default function EnhancedVideoCall({ roomId, userId, onClose }: EnhancedVideoCallProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPiP, setIsPiP] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor'>('excellent')

  const socketRef = useRef<Socket | null>(null)
  const deviceRef = useRef<Device | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const sendTransportRef = useRef<any>(null)
  const recvTransportRef = useRef<any>(null)
  const producersRef = useRef<Map<string, any>>(new Map())
  const consumersRef = useRef<Map<string, any>>(new Map())
  const callStartTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    initializeCall()
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000))
    }, 1000)
    return () => {
      cleanup()
      clearInterval(timer)
    }
  }, [])

  const initializeCall = async () => {
    try {
      socketRef.current = io(window.location.origin, { 
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })

      socketRef.current.on('connect', async () => {
        socketRef.current?.emit('join-video-room', { roomId, userId })
        try {
          await joinRoom()
        } catch (err: any) {
          setError('Failed to join: ' + err.message)
        }
      })

      socketRef.current.on('newProducer', async ({ producerId, kind }) => {
        try {
          await consumeMedia(producerId, kind)
        } catch (err) {
          console.error('[VideoCall] Consume error:', err)
        }
      })

      socketRef.current.on('peerClosed', () => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      })

      socketRef.current.on('connect_error', (err) => {
        setError('Connection error: ' + err.message)
        setConnectionQuality('poor')
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  const joinRoom = async () => {
    try {
      const response = await emitAsync('getRouterRtpCapabilities', { roomId })
      
      if (!response?.rtpCapabilities) {
        throw new Error('Video calling service is not available')
      }

      deviceRef.current = new Device()
      await deviceRef.current.load({ routerRtpCapabilities: response.rtpCapabilities })

      await createTransports()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })

      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      const videoTrack = stream.getVideoTracks()[0]
      const audioTrack = stream.getAudioTracks()[0]

      if (videoTrack) await produceMedia(videoTrack, 'video')
      if (audioTrack) await produceMedia(audioTrack, 'audio')

      const producersResponse = await emitAsync('getProducers', { roomId })
      if (producersResponse?.producers) {
        for (const { producerId, kind } of producersResponse.producers) {
          await consumeMedia(producerId, kind)
        }
      }

      setIsConnected(true)
      setConnectionQuality('excellent')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const createTransports = async () => {
    const sendTransportData = await emitAsync('createWebRtcTransport', { roomId, direction: 'send' })
    sendTransportRef.current = deviceRef.current!.createSendTransport(sendTransportData)

    sendTransportRef.current.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
      try {
        await emitAsync('connectWebRtcTransport', { roomId, transportId: sendTransportRef.current.id, dtlsParameters })
        callback()
      } catch (err) {
        errback(err)
      }
    })

    sendTransportRef.current.on('produce', async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
      try {
        const { id } = await emitAsync('produce', { roomId, transportId: sendTransportRef.current.id, kind, rtpParameters })
        callback({ id })
      } catch (err) {
        errback(err)
      }
    })

    sendTransportRef.current.on('connectionstatechange', (state: string) => {
      if (state === 'failed' || state === 'closed') {
        setError('Connection failed')
        setConnectionQuality('poor')
      } else if (state === 'connected') {
        setConnectionQuality('excellent')
      }
    })

    const recvTransportData = await emitAsync('createWebRtcTransport', { roomId, direction: 'recv' })
    recvTransportRef.current = deviceRef.current!.createRecvTransport(recvTransportData)

    recvTransportRef.current.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
      try {
        await emitAsync('connectWebRtcTransport', { roomId, transportId: recvTransportRef.current.id, dtlsParameters })
        callback()
      } catch (err) {
        errback(err)
      }
    })
  }

  const produceMedia = async (track: MediaStreamTrack, kind: 'audio' | 'video') => {
    const producer = await sendTransportRef.current.produce({ track })
    producersRef.current.set(kind, producer)
  }

  const consumeMedia = async (producerId: string, kind: string) => {
    const { id, rtpParameters } = await emitAsync('consume', {
      roomId,
      transportId: recvTransportRef.current.id,
      producerId,
      rtpCapabilities: deviceRef.current!.rtpCapabilities
    })

    const consumer = await recvTransportRef.current.consume({ id, producerId, kind, rtpParameters })
    consumersRef.current.set(id, consumer)

    const stream = new MediaStream([consumer.track])
    
    if (remoteVideoRef.current) {
      if (kind === 'video') {
        remoteVideoRef.current.srcObject = stream
      } else if (kind === 'audio') {
        const existingStream = remoteVideoRef.current.srcObject as MediaStream
        if (existingStream) {
          existingStream.addTrack(consumer.track)
        } else {
          remoteVideoRef.current.srcObject = stream
        }
      }
    }

    consumer.resume()
  }

  const emitAsync = (event: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) return reject(new Error('Socket not connected'))
      const timeout = setTimeout(() => reject(new Error('Request timeout')), 10000)
      socketRef.current.emit(event, data, (response: any) => {
        clearTimeout(timeout)
        response?.error ? reject(new Error(response.error)) : resolve(response)
      })
    })
  }

  const toggleMute = () => {
    const audioProducer = producersRef.current.get('audio')
    if (audioProducer) {
      isMuted ? audioProducer.resume() : audioProducer.pause()
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    const videoProducer = producersRef.current.get('video')
    if (videoProducer) {
      isVideoOff ? videoProducer.resume() : videoProducer.pause()
      setIsVideoOff(!isVideoOff)
    }
  }

  const togglePiP = () => setIsPiP(!isPiP)

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    producersRef.current.forEach(producer => producer.close())
    consumersRef.current.forEach(consumer => consumer.close())
    sendTransportRef.current?.close()
    recvTransportRef.current?.close()
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave-video-room', { roomId, userId })
    }
    socketRef.current?.disconnect()
  }

  const handleEndCall = () => {
    cleanup()
    onClose()
  }

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
              connectionQuality === 'excellent' ? 'bg-green-500' : 
              connectionQuality === 'good' ? 'bg-yellow-500' : 'bg-red-500'
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
