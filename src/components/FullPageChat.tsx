'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import ChatHeader from './chat/ChatHeader'
import MessageList from './chat/MessageList'
import ChatInput from './chat/ChatInput'
import VideoCallManager from './VideoCallManager'
import { useVideoCall } from '@/hooks/useVideoCall'

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
  
  const { callState, startCall, endCall } = useVideoCall()

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
        
        if (socket) {
          const roomId = [currentUser.id, partner.id].sort().join('-')
          socket.emit('send-message', {
            ...savedMessage,
            roomId
          })
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

  const handleVideoCall = () => {
    const roomId = [currentUser.id, partner.id].sort().join('-')
    startCall(roomId, partner.id)
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
      <ChatHeader partner={partner} isOnline={isOnline} onVideoCall={handleVideoCall} />
      
      <div className="flex-1 overflow-hidden relative">
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
      
      {/* Video Call Modal */}
      {callState.isCallActive && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="w-full max-w-6xl h-full max-h-[95vh] bg-gray-900 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-full flex flex-col">
              <div className="bg-gray-900 text-white p-3 sm:p-4 flex justify-between items-center flex-shrink-0 border-b border-gray-700">
                <h3 className="text-sm sm:text-lg font-semibold truncate flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                  </svg>
                  <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
                    Video Call with {partner.name}
                  </span>
                </h3>
                <button
                  onClick={endCall}
                  className="text-gray-400 hover:text-white p-1 sm:p-2 text-lg sm:text-xl hover:bg-red-500/20 rounded-full transition-colors group"
                  title="End Call"
                >
                  <svg className="w-5 h-5 group-hover:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <VideoCallManager
                  roomId={callState.roomId!}
                  userId={currentUser.id}
                  partnerName={partner.name}
                  onCallEnd={endCall}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}