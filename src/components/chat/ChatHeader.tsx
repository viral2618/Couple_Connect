'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { io } from 'socket.io-client'
import UserAvatar from '@/components/UserAvatar'

interface ChatHeaderProps {
  partner: {
    id: string
    name: string
    avatar?: string
  }
  isOnline: boolean
  onVideoCall?: () => void
  onBack?: () => void
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

export default function ChatHeader({ partner, isOnline, onVideoCall, onBack }: ChatHeaderProps) {
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
    <div className="bg-white border-b border-gray-100 px-3 sm:px-4 py-3 flex items-center justify-between z-10">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {onBack && (
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-xl transition-all flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="relative flex-shrink-0">
          <UserAvatar name={partner.name} avatar={partner.avatar} size={40} />
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg truncate">{partner.name}</h3>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <p className={`text-xs sm:text-sm font-semibold ${
              isOnline ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
            {currentRoom && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full font-bold shadow-md"
              >
                Room: {currentRoom}
              </motion.span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
        {onVideoCall && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onVideoCall}
            className="p-2 sm:p-3 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300"
            title="Start Video Call"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </motion.button>
        )}
        
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowRoomMenu(!showRoomMenu)}
            className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-xl sm:rounded-2xl hover:shadow-2xl transition-all duration-300"
            title="Room Options"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </motion.button>
          
          {showRoomMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-rose-100 p-4 z-50"
            >
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createRoom}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2.5 px-4 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Room
                </motion.button>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border-2 border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    maxLength={6}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={joinRoom}
                    disabled={!roomCode.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                  >
                    Join
                  </motion.button>
                </div>
                
                <button
                  onClick={() => setShowRoomMenu(false)}
                  className="w-full text-gray-500 text-sm hover:text-gray-700 font-medium py-2"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
