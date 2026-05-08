'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocketTyping(roomId: string, userId: string, userName: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const socketRef = useRef<Socket | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!roomId || !userId) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('✅ Typing socket connected')
      socket.emit('join-room', roomId)
    })

    // Listen for typing events
    socket.on('user-typing', ({ userId: typingUserId, userName: typingUserName, isTyping }) => {
      console.log('👀 Received typing event:', { typingUserId, typingUserName, isTyping, myUserId: userId, myUserName: userName })
      
      // Ignore own typing - compare with current user's ID
      if (typingUserId === userId) {
        console.log('⏭️ Ignoring own typing')
        return
      }

      setTypingUsers((prev) => {
        if (isTyping) {
          // Add user if not already in list
          if (!prev.includes(typingUserName)) {
            console.log('➕ Adding typing user:', typingUserName)
            return [...prev, typingUserName]
          }
        } else {
          // Remove user from list
          console.log('➖ Removing typing user:', typingUserName)
          return prev.filter(name => name !== typingUserName)
        }
        return prev
      })
    })

    return () => {
      socket.disconnect()
    }
  }, [roomId, userId])

  const setTyping = useCallback((isTyping: boolean) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.log('⚠️ Socket not connected, cannot send typing status')
      return
    }

    console.log('📤 Emitting typing status:', { isTyping, userId, userName, roomId })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Emit typing event
    socketRef.current.emit('user-typing', {
      roomId,
      userId,
      userName,
      isTyping,
    })

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        console.log('⏱️ Auto-stopping typing after 3s')
        if (socketRef.current) {
          socketRef.current.emit('user-typing', {
            roomId,
            userId,
            userName,
            isTyping: false,
          })
        }
      }, 3000)
    }
  }, [roomId, userId, userName])

  return {
    typingUsers,
    setTyping,
  }
}
