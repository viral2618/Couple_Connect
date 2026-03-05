'use client'

import { useState } from 'react'
import { io } from 'socket.io-client'

interface ChatHeaderProps {
  partner: {
    id: string
    name: string
    avatar?: string
  }
  isOnline: boolean
  onVideoCall?: () => void
}

interface RoomData {
  roomCode: string
  room: {
    id: string
    code: string
    host: { id: string }
    guest?: { id: string }
    players: Array<{ id: string; name: string }>
    gameState: string
    currentGame: string
    scores: Record<string, number>
  }
}

interface ErrorData {
  message: string
}

export default function ChatHeader({ partner, isOnline, onVideoCall }: ChatHeaderProps) {
  const [showRoomMenu, setShowRoomMenu] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)

  const createRoom = () => {
    const socket = io()
    socket.emit('create_room', { playerName: partner.name })
    
    socket.on('room_created', (data: RoomData) => {
      setCurrentRoom(data.roomCode)
      setShowRoomMenu(false)
      console.log('Room created:', data.roomCode)
      socket.disconnect()
    })
  }

  const joinRoom = () => {
    if (!roomCode.trim()) return
    
    const socket = io()
    socket.emit('join_room', { roomCode: roomCode.toUpperCase(), playerName: partner.name })
    
    socket.on('room_joined', (data: RoomData) => {
      setCurrentRoom(data.roomCode)
      setShowRoomMenu(false)
      setRoomCode('')
      console.log('Joined room:', data.roomCode)
      socket.disconnect()
    })
    
    socket.on('error', (error: ErrorData) => {
      alert(error.message)
      socket.disconnect()
    })
  }

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-rose-200/50 px-3 sm:px-4 py-3 flex items-center justify-between shadow-lg sticky top-0 z-10">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg ring-2 ring-white">
            {partner.avatar ? (
              <img src={partner.avatar} alt={partner.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-sm sm:text-base">{partner.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full animate-pulse shadow-sm"></div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{partner.name}</h3>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <p className={`text-xs sm:text-sm font-medium ${
              isOnline ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
            {currentRoom && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Room: {currentRoom}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        {onVideoCall && (
          <button
            onClick={onVideoCall}
            className="p-2 sm:p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            title="Start Video Call"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
        
        <div className="relative">
          <button
            onClick={() => setShowRoomMenu(!showRoomMenu)}
            className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95"
            title="Room Options"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </button>
          
          {showRoomMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
              <div className="space-y-3">
                <button
                  onClick={createRoom}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create Room
                </button>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    maxLength={6}
                  />
                  <button
                    onClick={joinRoom}
                    disabled={!roomCode.trim()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                  >
                    Join
                  </button>
                </div>
                
                <button
                  onClick={() => setShowRoomMenu(false)}
                  className="w-full text-gray-500 text-sm hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}