'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { io } from 'socket.io-client'
import { useRouter } from 'next/navigation'

interface ChatHeaderProps {
  partner: {
    id: string
    name: string
    avatar?: string
  }
  isOnline: boolean
  onVideoCall?: () => void
  currentUser?: {
    id: string
    name: string
  }
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

export default function ChatHeader({ partner, isOnline, onVideoCall, currentUser }: ChatHeaderProps) {
  const [showRoomMenu, setShowRoomMenu] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const router = useRouter()

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

  const handleBackClick = () => {
    if (currentUser?.id) {
      localStorage.removeItem(`verifiedPartner_${currentUser.id}`)
    }
    window.location.href = '/home'
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl border-b border-rose-200/50 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 flex items-center justify-between shadow-xl sticky top-0 z-10">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBackClick}
          className="text-rose-600 hover:text-rose-700 p-1.5 sm:p-2 hover:bg-rose-50 rounded-lg sm:rounded-xl transition-all duration-200 flex-shrink-0"
          title="Back to partner selection"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        
        <div className="relative flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-xl ring-2 sm:ring-4 ring-white"
          >
            {partner.avatar ? (
              <img src={partner.avatar} alt={partner.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xs sm:text-sm lg:text-base">{partner.name.charAt(0).toUpperCase()}</span>
            )}
          </motion.div>
          {isOnline && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 bg-green-500 border-2 border-white rounded-full shadow-lg"
            >
              <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
            </motion.div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg truncate">{partner.name}</h3>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <p className={`text-xs sm:text-sm font-semibold ${
              isOnline ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isOnline ? 'Online' : 'Offline'}
            </p>
            {currentRoom && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full font-bold shadow-md hidden sm:inline-block"
              >
                Room: {currentRoom}
              </motion.span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 flex-shrink-0">
        {onVideoCall && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onVideoCall}
            className="p-1.5 sm:p-2 lg:p-3 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-lg sm:rounded-xl lg:rounded-2xl hover:shadow-2xl transition-all duration-300"
            title="Start Video Call"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </motion.button>
        )}
        
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowRoomMenu(!showRoomMenu)}
            className="p-1.5 sm:p-2 lg:p-3 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-lg sm:rounded-xl lg:rounded-2xl hover:shadow-2xl transition-all duration-300"
            title="Room Options"
          >
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </motion.button>
          
          {showRoomMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white rounded-xl sm:rounded-2xl shadow-2xl border-2 border-rose-100 p-3 sm:p-4 z-50"
            >
              <div className="space-y-2 sm:space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createRoom}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl hover:shadow-lg transition-all font-semibold text-sm sm:text-base"
                >
                  🎮 Create Room
                </motion.button>
                
                <div className="flex gap-1.5 sm:gap-2">
                  <input
                    type="text"
                    placeholder="Room Code"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 border-2 border-rose-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent"
                    maxLength={6}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={joinRoom}
                    disabled={!roomCode.trim()}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-xs sm:text-sm"
                  >
                    Join
                  </motion.button>
                </div>
                
                <button
                  onClick={() => setShowRoomMenu(false)}
                  className="w-full text-gray-500 text-xs sm:text-sm hover:text-gray-700 font-medium py-1.5 sm:py-2"
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