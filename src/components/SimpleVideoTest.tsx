'use client'

import { useState, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import Peer from 'simple-peer'

export default function SimpleVideoTest() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [peer, setPeer] = useState<Peer.Instance | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [roomId, setRoomId] = useState('test-room-123')
  const [userId, setUserId] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [otherUsers, setOtherUsers] = useState<string[]>([])

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
    console.log(message)
  }

  const initializeMedia = async () => {
    try {
      addLog('Requesting camera and microphone access...')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      
      setStream(mediaStream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream
      }
      addLog('✅ Media access granted')
      return mediaStream
    } catch (error: any) {
      addLog(`❌ Media access failed: ${error.message}`)
      throw error
    }
  }

  const connectSocket = () => {
    addLog('Connecting to socket server...')
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      addLog('✅ Socket connected')
      setSocket(newSocket)
    })

    newSocket.on('connect_error', (error) => {
      addLog(`❌ Socket connection failed: ${error.message}`)
    })

    newSocket.on('video-room-joined', ({ otherUsers: users, totalUsers }) => {
      addLog(`✅ Joined room. Total users: ${totalUsers}`)
      setOtherUsers(users)
      
      // If there are other users, initiate connection
      if (users.length > 0 && stream) {
        addLog('Other users found, initiating peer connection...')
        createPeer(true, stream, newSocket)
      }
    })

    newSocket.on('user-joined-video', ({ userId: joinedUserId }) => {
      addLog(`👤 User ${joinedUserId} joined the room`)
      setOtherUsers(prev => [...prev, joinedUserId])
    })

    newSocket.on('video-signal', ({ signal, userId: senderId }) => {
      addLog(`📡 Received ${signal.type || 'candidate'} from ${senderId}`)
      
      if (senderId !== userId) {
        if (!peer && stream) {
          addLog('Creating receiver peer...')
          const newPeer = createPeer(false, stream, newSocket)
          newPeer.signal(signal)
        } else if (peer) {
          peer.signal(signal)
        }
      }
    })

    newSocket.on('user-left-video', ({ userId: leftUserId }) => {
      addLog(`👋 User ${leftUserId} left the room`)
      setOtherUsers(prev => prev.filter(id => id !== leftUserId))
      setIsConnected(false)
    })

    newSocket.on('video-error', ({ message }) => {
      addLog(`❌ Video error: ${message}`)
    })

    return newSocket
  }

  const createPeer = (initiator: boolean, mediaStream: MediaStream, socketInstance: Socket) => {
    addLog(`Creating peer (initiator: ${initiator})`)
    
    const newPeer = new Peer({
      initiator,
      trickle: false,
      stream: mediaStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    })

    newPeer.on('signal', (signal) => {
      addLog(`📤 Sending ${signal.type || 'candidate'}`)
      socketInstance.emit('video-signal', { signal, roomId, userId })
    })

    newPeer.on('stream', (remoteStream) => {
      addLog('🎥 Received remote stream')
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream
      }
      setIsConnected(true)
    })

    newPeer.on('connect', () => {
      addLog('🔗 Peer connected!')
      setIsConnected(true)
    })

    newPeer.on('error', (error) => {
      addLog(`❌ Peer error: ${error.message}`)
    })

    setPeer(newPeer)
    return newPeer
  }

  const joinRoom = async () => {
    if (!userId.trim()) {
      addLog('❌ Please enter a user ID')
      return
    }

    try {
      const mediaStream = await initializeMedia()
      const socketInstance = connectSocket()
      
      // Wait for socket to connect then join room
      socketInstance.on('connect', () => {
        addLog(`Joining room ${roomId} as ${userId}`)
        socketInstance.emit('join-video-room', { roomId, userId })
      })
      
    } catch (error) {
      addLog('❌ Failed to initialize')
    }
  }

  const leaveRoom = () => {
    addLog('Leaving room...')
    
    if (peer) {
      peer.destroy()
      setPeer(null)
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    if (socket) {
      socket.emit('leave-video-room', { roomId, userId })
      socket.disconnect()
      setSocket(null)
    }
    
    setIsConnected(false)
    setOtherUsers([])
    addLog('✅ Left room')
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Simple Video Call Test</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={!!socket}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Your User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g., user1, user2"
              className="w-full p-2 border rounded"
              disabled={!!socket}
            />
          </div>
          
          <div className="flex gap-2">
            {!socket ? (
              <button
                onClick={joinRoom}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Join Room
              </button>
            ) : (
              <button
                onClick={leaveRoom}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Leave Room
              </button>
            )}
          </div>
          
          <div className="p-3 bg-gray-100 rounded">
            <div className="text-sm">
              <div>Socket: {socket ? '🟢 Connected' : '🔴 Disconnected'}</div>
              <div>Peer: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
              <div>Other Users: {otherUsers.length}</div>
            </div>
          </div>
        </div>
        
        {/* Videos */}
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Your Video</h3>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-32 bg-gray-200 rounded"
            />
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Remote Video</h3>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-32 bg-gray-200 rounded"
            />
          </div>
        </div>
      </div>
      
      {/* Logs */}
      <div className="mt-6">
        <h3 className="font-medium mb-2">Connection Logs</h3>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded">
        <h4 className="font-medium text-blue-800 mb-2">Testing Instructions:</h4>
        <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
          <li>Open two browser windows/tabs</li>
          <li>In first window: Enter "user1" as User ID, click "Join Room"</li>
          <li>In second window: Enter "user2" as User ID, click "Join Room"</li>
          <li>Allow camera/microphone permissions in both windows</li>
          <li>Watch the logs to see connection progress</li>
          <li>Both videos should appear when connected</li>
        </ol>
      </div>
    </div>
  )
}