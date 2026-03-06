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
        console.log('[VideoCall] Socket connected:', socketRef.current?.id)
        console.log('[VideoCall] Joining room:', roomId)
        
        // CRITICAL: Join the socket room first
        socketRef.current?.emit('join-video-room', { roomId, userId })
        
        try {
          await joinRoom()
        } catch (err: any) {
          console.error('[VideoCall] Join error:', err)
          setError('Failed to join: ' + err.message)
        }
      })

      socketRef.current.on('newProducer', async ({ producerId, kind }) => {
        console.log('[VideoCall] New producer:', kind)
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
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  const joinRoom = async () => {
    try {
      console.log('[VideoCall] Getting RTP capabilities for room:', roomId)
      const response = await emitAsync('getRouterRtpCapabilities', { roomId })
      
      if (!response?.rtpCapabilities) {
        throw new Error('Video calling service is not available on this server. Please contact support.')
      }
      
      console.log('[VideoCall] RTP capabilities received')

      deviceRef.current = new Device()
      await deviceRef.current.load({ routerRtpCapabilities: response.rtpCapabilities })

      await createTransports()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
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
    } catch (err: any) {
      console.error('[VideoCall] Join error:', err)
      setError(err.message)
    }
  }

  const createTransports = async () => {
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

    sendTransportRef.current.on('connectionstatechange', (state: string) => {
      console.log('[Send Transport] State:', state)
      if (state === 'failed' || state === 'closed') {
        setError('Connection failed')
      }
    })

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

    recvTransportRef.current.on('connectionstatechange', (state: string) => {
      console.log('[Recv Transport] State:', state)
      if (state === 'failed' || state === 'closed') {
        setError('Connection failed')
      }
    })
  }

  const produceMedia = async (track: MediaStreamTrack, kind: 'audio' | 'video') => {
    try {
      const producer = await sendTransportRef.current.produce({ track })
      producersRef.current.set(kind, producer)
      
      producer.on('transportclose', () => {
        console.log(`[${kind}] Producer transport closed`)
      })
      
      producer.on('trackended', () => {
        console.log(`[${kind}] Track ended`)
      })
    } catch (err) {
      console.error(`Failed to produce ${kind}:`, err)
      throw err
    }
  }

  const consumeMedia = async (producerId: string, kind: string) => {
    try {
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
    } catch (err) {
      console.error('Consume error:', err)
      throw err
    }
  }

  const emitAsync = (event: string, data: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) {
        return reject(new Error('Socket not connected'))
      }
      
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'))
      }, 10000)
      
      socketRef.current.emit(event, data, (response: any) => {
        clearTimeout(timeout)
        if (response?.error) {
          reject(new Error(response.error))
        } else {
          resolve(response)
        }
      })
    })
  }

  const toggleMute = () => {
    const audioProducer = producersRef.current.get('audio')
    if (audioProducer) {
      if (isMuted) {
        audioProducer.resume()
      } else {
        audioProducer.pause()
      }
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    const videoProducer = producersRef.current.get('video')
    if (videoProducer) {
      if (isVideoOff) {
        videoProducer.resume()
      } else {
        videoProducer.pause()
      }
      setIsVideoOff(!isVideoOff)
    }
  }

  const cleanup = () => {
    try {
      console.log('[VideoCall] Cleaning up...')
      localStreamRef.current?.getTracks().forEach(track => track.stop())
      producersRef.current.forEach(producer => producer.close())
      consumersRef.current.forEach(consumer => consumer.close())
      sendTransportRef.current?.close()
      recvTransportRef.current?.close()
      
      // Leave the room before disconnecting
      if (socketRef.current?.connected) {
        socketRef.current.emit('leave-video-room', { roomId, userId })
      }
      
      socketRef.current?.disconnect()
      console.log('[VideoCall] Cleanup complete')
    } catch (err) {
      console.error('Cleanup error:', err)
    }
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
