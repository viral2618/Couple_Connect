'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  seenAt?: string
  replyTo?: string
  reactions?: { emoji: string; userId: string }[]
  sender: {
    id: string
    name: string
    avatar?: string
  }
}

export function useSocketChat(roomId: string, userId: string, userName: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!roomId || !userId) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'
    console.log('🔌 Connecting to chat server:', socketUrl)
    
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('✅ Chat socket connected:', socket.id)
      setIsConnected(true)
      
      socket.emit('join-room', roomId)
      console.log('📥 Joined chat room:', roomId)
    })

    socket.on('disconnect', () => {
      console.log('❌ Chat socket disconnected')
      setIsConnected(false)
    })

    socket.on('receive-message', (message: any) => {
      console.log('📨 Received message:', message)
      setMessages((prev) => {
        if (prev.some(m => m.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
    })

    return () => {
      console.log('🧹 Cleaning up chat socket')
      socket.emit('leave-room', { roomId, userId })
      socket.disconnect()
    }
  }, [roomId, userId])

  const sendMessage = useCallback(async (content: string, receiverId: string) => {
    if (!socketRef.current || !socketRef.current.connected) {
      console.error('❌ Socket not connected')
      throw new Error('Not connected to chat server')
    }

    const message: any = {
      id: `${Date.now()}-${Math.random()}`,
      content,
      senderId: userId,
      receiverId,
      createdAt: new Date().toISOString(),
      sender: {
        id: userId,
        name: userName,
      },
      roomId,
    }

    console.log('📤 Sending message:', message)
    socketRef.current.emit('send-message', message)
    
    setMessages((prev) => [...prev, message])
  }, [userId, userName, roomId])

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages?roomId=${roomId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('📥 Loaded messages:', data.length)
        setMessages(data)
      }
    } catch (error) {
      console.error('❌ Error loading messages:', error)
    }
  }, [roomId])

  const markAsSeen = useCallback(async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/seen`, {
        method: 'POST',
      })
    } catch (error) {
      console.error('Error marking message as seen:', error)
    }
  }, [])

  return {
    messages,
    isConnected,
    sendMessage,
    markAsSeen,
    loadMessages,
  }
}
