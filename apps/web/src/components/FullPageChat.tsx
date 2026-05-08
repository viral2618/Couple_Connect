'use client'

import { useState, useEffect, useRef } from 'react'
import { useSupabaseChat } from '@/hooks/useSupabaseChat'
import { supabase } from '@couple-connect/shared'
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
  onBack?: () => void
}

export default function FullPageChat({ currentUser, partner, onBack }: FullPageChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [canChat, setCanChat] = useState(false)
  const [partnershipError, setPartnershipError] = useState('')
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [isVideoCallActive, setIsVideoCallActive] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const roomId = [currentUser.id, partner.id].sort().join('-')
  
  // Use Supabase for chat
  const { 
    messages,
    setMessages,
    isConnected, 
    sendMessage: sendSupabaseMessage, 
    loadMessages 
  } = useSupabaseChat(roomId, currentUser.id, currentUser.name)

  useEffect(() => {
    checkPartnership()
  }, [currentUser.id, partner.id])

  useEffect(() => {
    if (!canChat) return
    setIsLoading(true)
    loadMessages().finally(() => setIsLoading(false))
  }, [canChat, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
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
      await loadMessages()
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !canChat) return

    try {
      await sendSupabaseMessage(newMessage, partner.id, replyingTo?.id)
      setNewMessage('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }
  
  const handleInputChange = (value: string) => {
    setNewMessage(value)
  }

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      console.log('Adding reaction:', { messageId, emoji, userId: currentUser.id })
      
      // Get current message
      const message = messages.find(m => m.id === messageId)
      if (!message) return

      const reactions = message.reactions || []
      const existingReaction = reactions.find(r => r.emoji === emoji && r.userId === currentUser.id)

      let newReactions
      if (existingReaction) {
        // Remove reaction
        newReactions = reactions.filter(r => !(r.emoji === emoji && r.userId === currentUser.id))
      } else {
        // Add reaction
        newReactions = [...reactions, { emoji, userId: currentUser.id }]
      }

      // Update in Supabase
      const { error } = await supabase
        .from('messages')
        .update({ reactions: newReactions })
        .eq('id', messageId)

      if (error) throw error

      // Update local state immediately
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, reactions: newReactions } : m
      ))
    } catch (error) {
      console.error('Failed to add reaction:', error)
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
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">Cannot Chat</h3>
          <p className="text-rose-600 mb-4 font-medium text-sm sm:text-base">{partnershipError}</p>
          <p className="text-xs sm:text-sm text-gray-600">Make sure both users are verified and have completed the partner verification process.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {isVideoCallActive && (
        <VideoCall 
          roomId={[currentUser.id, partner.id].sort().join('-')}
          userId={currentUser.id}
          isPremium={false}
          onClose={endVideoCall}
        />
      )}
      
      <ChatHeader partner={partner} isOnline={isConnected} onVideoCall={startVideoCall} onBack={onBack} />
      
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
        setNewMessage={handleInputChange} 
        sendMessage={sendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />
    </div>
  )
}