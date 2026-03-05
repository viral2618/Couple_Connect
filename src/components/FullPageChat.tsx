'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import ChatHeader from './chat/ChatHeader'
import MessageList from './chat/MessageList'
import ChatInput from './chat/ChatInput'
import dynamic from 'next/dynamic'

const VideoCall = dynamic(() => import('./SimpleVideoCall'), { ssr: false })

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
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkPartnership()
  }, [currentUser.id, partner.id])

  useEffect(() => {
    if (!canChat) return

    const socketInstance = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
      : 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setIsOnline(true)
      const roomId = [currentUser.id, partner.id].sort().join('-')
      socketInstance.emit('join-room', roomId)
      console.log('Joined room:', roomId)
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
      setMessages(prev => [...prev, message])
    })

    socketInstance.on('message-reaction', (data: { messageId: string; reactions: { emoji: string; userId: string }[] }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, reactions: data.reactions } : msg
      ))
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
        body: JSON.stringify({ 
          content: newMessage, 
          receiverId: partner.id,
          replyTo: replyingTo?.id
        })
      })

      console.log('API response status:', response.status)
      if (response.ok) {
        const savedMessage = await response.json()
        console.log('Saved message:', savedMessage)
        
        if (socket) {
          const roomId = [currentUser.id, partner.id].sort().join('-')
          socket.emit('send-message', {
            ...savedMessage,
            roomId
          })
        }
        
        setNewMessage('')
        setReplyingTo(null)
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

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch('/api/messages/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji })
      })

      if (response.ok) {
        const updatedMessage = await response.json()
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, reactions: updatedMessage.reactions } : msg
        ))
        
        // Emit reaction update via socket
        if (socket) {
          const roomId = [currentUser.id, partner.id].sort().join('-')
          socket.emit('message-reaction', {
            roomId,
            messageId,
            reactions: updatedMessage.reactions
          })
        }
      }
    } catch (error) {
      console.error('Failed to update reaction:', error)
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
  }

  const startVideoCall = () => {
    setIsVideoCallActive(true)
  }

  const endVideoCall = () => {
    setIsVideoCallActive(false)
  }

  if (!canChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4">
        <div className="text-center p-6 sm:p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-rose-200/50 max-w-md mx-auto">
          <span className="text-4xl sm:text-6xl mb-4 block">🚫</span>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Cannot Chat</h3>
          <p className="text-rose-600 mb-4 font-medium text-sm sm:text-base">{partnershipError}</p>
          <p className="text-xs sm:text-sm text-gray-600">Make sure both users are verified and have completed the partner verification process.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-rose-50/80 via-pink-50/80 to-purple-50/80">
      {isVideoCallActive && (
        <VideoCall 
          roomId={[currentUser.id, partner.id].sort().join('-')}
          userId={currentUser.id}
          onClose={endVideoCall}
        />
      )}
      
      <ChatHeader partner={partner} isOnline={isOnline} onVideoCall={startVideoCall} />
      
      <div className="flex-1 overflow-hidden relative">
        <MessageList 
          messages={messages} 
          currentUserId={currentUser.id} 
          isLoading={isLoading} 
          messagesEndRef={messagesEndRef}
          onReaction={handleReaction}
          onReply={handleReply}
        />
      </div>

      <ChatInput 
        newMessage={newMessage} 
        setNewMessage={setNewMessage} 
        sendMessage={sendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  )
}