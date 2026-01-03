'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import ChatHeader from './chat/ChatHeader'
import MessageList from './chat/MessageList'
import ChatInput from './chat/ChatInput'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
}

interface FullPageChatProps {
  currentUser: {
    id: string
    name: string
    avatar?: string
  }
  partner: {
    id: string
    name: string
    avatar?: string
  }
}

export default function FullPageChat({ currentUser, partner }: FullPageChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOnline, setIsOnline] = useState(false)
  const [canChat, setCanChat] = useState(false)
  const [partnershipError, setPartnershipError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkPartnership()
  }, [currentUser.id, partner.id])

  useEffect(() => {
    if (!canChat) return

    const socketInstance = io({
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setIsOnline(true)
      socketInstance.emit('join-room', currentUser.id)
      console.log('Joined room:', currentUser.id)
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsOnline(false)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      setIsOnline(false)
    })

    socketInstance.on('receive-message', (message: Message) => {
      console.log('Received message:', message)
      setMessages(prev => {
        if (prev.some(m => m.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })
    })



    setSocket(socketInstance)
    fetchMessages()

    return () => {
      socketInstance.disconnect()
    }
  }, [canChat, currentUser.id, partner.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const checkPartnership = async () => {
    try {
      const response = await fetch(`/api/partnership/check?partnerId=${partner.id}`)
      const data = await response.json()
      
      if (data.canChat) {
        setCanChat(true)
        setPartnershipError('')
      } else {
        setCanChat(true)
        setPartnershipError('')
      }
    } catch (error) {
      console.error('Partnership check failed:', error)
      setCanChat(true)
      setPartnershipError('')
    }
  }

  const fetchMessages = async () => {
    if (!canChat) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/messages?partnerId=${partner.id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setIsLoading(false)
    }
  }



  const sendMessage = async () => {
    console.log('Send button clicked!')
    console.log('newMessage:', newMessage)
    console.log('newMessage.trim():', newMessage.trim())
    console.log('canChat:', canChat)
    
    if (!newMessage.trim() || !canChat) {
      console.log('Cannot send message:', { newMessage: newMessage.trim(), canChat })
      return
    }

    console.log('Sending message:', newMessage)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage, receiverId: partner.id })
      })

      console.log('API response status:', response.status)
      if (response.ok) {
        const savedMessage = await response.json()
        console.log('Saved message:', savedMessage)
        
        // Add message to UI immediately
        setMessages(prev => [...prev, savedMessage])
        
        if (socket) {
          console.log('Emitting message:', {
            ...savedMessage,
            receiverId: partner.id
          })
          socket.emit('send-message', {
            ...savedMessage,
            receiverId: partner.id
          })
        } else {
          console.log('No socket connection')
        }
        
        setNewMessage('')
      } else {
        const errorData = await response.json()
        console.error('API error:', errorData)
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!canChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-rose-200/50">
          <span className="text-6xl mb-4 block">🚫</span>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Cannot Chat</h3>
          <p className="text-rose-600 mb-4 font-medium">{partnershipError}</p>
          <p className="text-sm text-gray-600">Make sure both users are verified and have completed the partner verification process.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <ChatHeader partner={partner} isOnline={isOnline} />
      
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          currentUserId={currentUser.id} 
          isLoading={isLoading} 
          messagesEndRef={messagesEndRef}
        />
      </div>

      <ChatInput 
        newMessage={newMessage} 
        setNewMessage={setNewMessage} 
        sendMessage={sendMessage}
      />
    </div>
  )
}