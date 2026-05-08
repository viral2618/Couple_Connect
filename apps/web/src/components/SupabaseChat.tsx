'use client'

import { useState, useEffect, useRef } from 'react'
import { useSupabaseChat } from '@/hooks/useSupabaseChat'
import { useSupabaseTyping } from '@/hooks/useSupabaseTyping'

interface SupabaseChatProps {
  roomId: string
  userId: string
  userName: string
  partnerId: string
  partnerName: string
}

export default function SupabaseChat({ 
  roomId, 
  userId, 
  userName,
  partnerId,
  partnerName 
}: SupabaseChatProps) {
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { 
    messages, 
    isConnected, 
    sendMessage, 
    markAsSeen,
    loadMessages 
  } = useSupabaseChat(roomId, userId)
  
  const { typingUsers, setTyping } = useSupabaseTyping(roomId, userId, userName)

  // Load messages on mount
  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value)
    setTyping(e.target.value.length > 0)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    try {
      await sendMessage(inputMessage, partnerId)
      setInputMessage('')
      setTyping(false)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{partnerName}</h2>
            <p className="text-sm opacity-90">
              {isConnected ? '🟢 Connected via Supabase' : '🔴 Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === userId
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isMine
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="break-words">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                  {msg.seenAt && isMine && ' ✓✓'}
                </p>
              </div>
            </div>
          )
        })}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3 text-gray-600 text-sm">
              {typingUsers[0]} is typing...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || !isConnected}
            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
