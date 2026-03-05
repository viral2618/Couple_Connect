'use client'

import { useEffect, useRef, useState } from 'react'
import { Device } from 'mediasoup-client'
import { io, Socket } from 'socket.io-client'

interface VideoCallProps {
  roomId: string
  userId: string
  onClose: () => void
}

export default function VideoCall({ roomId, userId, onClose }: VideoCallProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const deviceRef = useRef<Device | null>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const sendTransportRef = useRef<any>(null)
  const recvTransportRef = useRef<any>(null)
  const producersRef = useRef<Map<string, any>>(new Map())
  const consumersRef = useRef<Map<string, any>>(new Map())

  useEffect(() => {
    initializeCall()
    return () => cleanup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initializeCall = async () => {
    try {
      console.log('[VideoCall] Initializing call for room:', roomId)
      
      // Connect to socket
      socketRef.current = io(window.location.origin, { path: '/socket.io/' })

      socketRef.current.on('connect', async () => {
        console.log('[VideoCall] Socket connected:', socketRef.current?.id)
        try {
          await joinRoom()
        } catch (err: any) {
          console.error('[VideoCall] Failed to join room:', err)
          setError('Failed to join video room: ' + err.message)
        }
      })

      socketRef.current.on('newProducer', async ({ producerId, peerId, kind }) => {
        console.log('New producer:', producerId, kind)
        await consumeMedia(producerId, kind)
      })

      socketRef.current.on('peerClosed', ({ peerId }) => {
        console.log('Peer closed:', peerId)
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null
        }
      })

      socketRef.current.on('connect_error', (err) => {
        setError('Connection failed: ' + err.message)
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  const joinRoom = async () => {
    try {
      console.log('[VideoCall] Requesting router RTP capabilities for room:', roomId)
      
      // Get router RTP capabilities
      const response = await emitAsync('getRouterRtpCapabilities', { roomId })
      
      console.log('[VideoCall] Received response:', response)
      
      if (!response || !response.rtpCapabilities) {
        throw new Error('MediaSoup server not available. Please ensure the server is running with MediaSoup enabled.')
      }

      console.log('[VideoCall] Creating MediaSoup device...')
      // Create device
      deviceRef.current = new Device()
      await deviceRef.current.load({ routerRtpCapabilities: response.rtpCapabilities })
      console.log('[VideoCall] Device loaded successfully')

      console.log('[VideoCall] Creating transports...')
      // Create transports
      await createTransports()

      console.log('[VideoCall] Requesting user media...')
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('[VideoCall] Got user media, tracks:', stream.getTracks().length)
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }

      console.log('[VideoCall] Producing media...')
      // Produce media
      const videoTrack = stream.getVideoTracks()[0]
      const audioTrack = stream.getAudioTracks()[0]

      if (videoTrack) await produceMedia(videoTrack, 'video')
      if (audioTrack) await produceMedia(audioTrack, 'audio')

      console.log('[VideoCall] Getting existing producers...')
      // Get existing producers
      const producersResponse = await emitAsync('getProducers', { roomId })
      if (producersResponse && producersResponse.producers) {
        console.log('[VideoCall] Found', producersResponse.producers.length, 'existing producers')
        for (const { producerId, kind } of producersResponse.producers) {
          await consumeMedia(producerId, kind)
        }
      }

      console.log('[VideoCall] Call initialized successfully')
      setIsConnected(true)
    } catch (err: any) {
      console.error('[VideoCall] Error in joinRoom:', err)
      setError(err.message)
    }
  }

  const createTransports = async () => {
    // Send transport
    const sendTransportData = await emitAsync('createWebRtcTransport', {
      roomId,
      direction: 'send'
    })

    sendTransportRef.current = deviceRef.current!.createSendTransport(sendTransportData)

    sendTransportRef.current.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
      try {
        await emitAsync('connectWebRtcTransport', {
          roomId,
          transportId: sendTransportRef.current.id,
          dtlsParameters
        })
        callback()
      } catch (err) {
        errback(err)
      }
    })

    sendTransportRef.current.on('produce', async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
      try {
        const { id } = await emitAsync('produce', {
          roomId,
          transportId: sendTransportRef.current.id,
          kind,
          rtpParameters
        })
        callback({ id })
      } catch (err) {
        errback(err)
      }
    })

    // Receive transport
    const recvTransportData = await emitAsync('createWebRtcTransport', {
      roomId,
      direction: 'recv'
    })

    recvTransportRef.current = deviceRef.current!.createRecvTransport(recvTransportData)

    recvTransportRef.current.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
      try {
        await emitAsync('connectWebRtcTransport', {
          roomId,
          transportId: recvTransportRef.current.id,
          dtlsParameters
        })
        callback()
      } catch (err) {
        errback(err)
      }
    })
  }

  const produceMedia = async (track: MediaStreamTrack, kind: 'audio' | 'video') => {
    try {
      const params: any = { track }
      
      if (kind === 'video') {
        params.encodings = [
          { maxBitrate: 500000, scaleResolutionDownBy: 1 }
        ]
        params.codecOptions = {
          videoGoogleStartBitrate: 1000
        }
      }
      
      const producer = await sendTransportRef.current.produce(params)
      producersRef.current.set(kind, producer)
    } catch (err) {
      console.error(`Failed to produce ${kind}:`, err)
      throw err
    }
  }

  const consumeMedia = async (producerId: string, kind: string) => {
    const { id, rtpParameters } = await emitAsync('consume', {
      roomId,
      transportId: recvTransportRef.current.id,
      producerId,
      rtpCapabilities: deviceRef.current!.rtpCapabilities
    })

    const consumer = await recvTransportRef.current.consume({
      id,
      producerId,
      kind,
      rtpParameters
    })

    consumersRef.current.set(id, consumer)

    await emitAsync('resumeConsumer', { roomId, consumerId: id })

    if (remoteVideoRef.current) {
      const stream = new MediaStream([consumer.track])
      if (kind === 'video') {
        remoteVideoRef.current.srcObject = stream
      } else {
        const audioStream = remoteVideoRef.current.srcObject as MediaStream
        if (audioStream) {
          audioStream.addTrack(consumer.track)
        } else {
          remoteVideoRef.current.srcObject = stream
        }
      }
    }
  }

  const emitAsync = (event: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      socketRef.current?.emit(event, data, (response: any) => {
        if (response.error) reject(new Error(response.error))
        else resolve(response)
      })
    })
  }

  const toggleMute = () => {
    const audioProducer = producersRef.current.get('audio')
    if (audioProducer) {
      if (isMuted) audioProducer.resume()
      else audioProducer.pause()
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    const videoProducer = producersRef.current.get('video')
    if (videoProducer) {
      if (isVideoOff) videoProducer.resume()
      else videoProducer.pause()
      setIsVideoOff(!isVideoOff)
    }
  }

  const cleanup = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop())
    producersRef.current.forEach(producer => producer.close())
    consumersRef.current.forEach(consumer => consumer.close())
    sendTransportRef.current?.close()
    recvTransportRef.current?.close()
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
          {isMuted ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleEndCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full transition-colors ${
            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {isVideoOff ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
