'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import ChatHeader from './chat/ChatHeader'
import MessageList from './chat/MessageList'
import ChatInput from './chat/ChatInput'
import VideoCall from './VideoCall'
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

    const socketInstance = io({
      transports: ['websocket', 'polling']
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setIsOnline(true)
      // Use the same room ID for both chat and video calls
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
        
        // Don't add to UI immediately - let socket handle it
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
      <ChatHeader partner={partner} isOnline={isOnline} onVideoCall={handleVideoCall} />
      
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
      
      {/* Video Call Modal */}
      {callState.isCallActive && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl h-3/4 bg-white rounded-lg overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Video Call with {partner.name}</h3>
                <button
                  onClick={endCall}
                  className="text-red-400 hover:text-red-300"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1">
                <VideoCall
                  roomId={callState.roomId!}
                  userId={currentUser.id}
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