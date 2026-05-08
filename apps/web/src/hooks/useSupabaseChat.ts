'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@couple-connect/shared'

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

export function useSupabaseChat(roomId: string, userId: string, userName: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)

  // Subscribe to new messages
  useEffect(() => {
    if (!roomId) return

    console.log('🔌 Connecting to Supabase chat:', roomId)

    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('📨 New message:', payload)
          const newMessage = payload.new as any
          setMessages((prev) => {
            if (prev.some(m => m.id === newMessage.id)) return prev
            return [...prev, {
              id: newMessage.id,
              content: newMessage.content,
              senderId: newMessage.sender_id,
              receiverId: newMessage.receiver_id,
              createdAt: newMessage.created_at,
              seenAt: newMessage.seen_at,
              replyTo: newMessage.reply_to,
              reactions: newMessage.reactions || [],
              sender: {
                id: newMessage.sender_id,
                name: newMessage.sender_name || 'User',
                avatar: newMessage.sender_avatar
              }
            }]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('📝 Message updated:', payload)
          const updatedMessage = payload.new as any
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id
                ? {
                    ...msg,
                    seenAt: updatedMessage.seen_at,
                    reactions: updatedMessage.reactions || msg.reactions
                  }
                : msg
            )
          )
        }
      )
      .subscribe((status) => {
        console.log('✅ Supabase channel status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      console.log('🧹 Cleaning up Supabase channel')
      channel.unsubscribe()
    }
  }, [roomId])

  // Send message via Supabase
  const sendMessage = useCallback(async (content: string, receiverId: string, replyToId?: string) => {
    try {
      console.log('📤 Sending message to Supabase', { replyToId })
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: userId,
          receiver_id: receiverId,
          room_id: roomId,
          sender_name: userName,
          reply_to: replyToId || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }
      
      console.log('✅ Message sent:', data)
      return data
    } catch (error) {
      console.error('❌ Error sending message:', error)
      throw error
    }
  }, [userId, userName, roomId])

  // Mark message as seen
  const markAsSeen = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ seen_at: new Date().toISOString() })
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking message as seen:', error)
    }
  }, [])

  // Load message history
  const loadMessages = useCallback(async (limit = 50) => {
    try {
      console.log('📥 Loading messages from Supabase')
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(limit)

      if (error) {
        console.error('❌ Supabase error:', error)
        throw error
      }

      console.log('✅ Loaded messages:', data?.length || 0)
      
      const formattedMessages = (data || []).map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        createdAt: msg.created_at,
        seenAt: msg.seen_at,
        replyTo: msg.reply_to,
        reactions: msg.reactions || [],
        sender: {
          id: msg.sender_id,
          name: msg.sender_name || 'User',
          avatar: msg.sender_avatar
        }
      }))
      
      setMessages(formattedMessages)
    } catch (error) {
      console.error('❌ Error loading messages:', error)
    }
  }, [roomId])

  return {
    messages,
    setMessages,
    isConnected,
    sendMessage,
    markAsSeen,
    loadMessages
  }
}
