'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@couple-connect/shared'

export function useSupabaseTyping(roomId: string, userId: string, userName: string) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    if (!roomId) return

    console.log('👀 Setting up typing presence:', roomId)

    const channel = supabase
      .channel(`presence:${roomId}`, {
        config: {
          presence: {
            key: userId
          }
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        console.log('👥 Presence state:', state)
        
        const typing: string[] = []
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            console.log('🔍 Checking presence:', presence)
            if (presence.isTyping && presence.userId !== userId) {
              console.log('✅ User is typing:', presence.userName)
              typing.push(presence.userName)
            }
          })
        })
        
        console.log('📝 Typing users:', typing)
        setTypingUsers(typing)
      })
      .subscribe(async (status) => {
        console.log('✅ Presence channel status:', status)
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId,
            userName,
            isTyping: false,
            online_at: new Date().toISOString()
          })
        }
      })

    channelRef.current = channel

    return () => {
      console.log('🧹 Cleaning up presence channel')
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [roomId, userId, userName])

  const setTyping = useCallback(async (isTyping: boolean) => {
    try {
      console.log('⌨️ Setting typing:', isTyping, 'for user:', userName)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      if (!channelRef.current) {
        console.warn('⚠️ Channel not ready')
        return
      }

      await channelRef.current.track({
        userId,
        userName,
        isTyping,
        online_at: new Date().toISOString()
      })

      console.log('✅ Typing status sent:', isTyping)

      if (isTyping) {
        typingTimeoutRef.current = setTimeout(async () => {
          if (channelRef.current) {
            await channelRef.current.track({
              userId,
              userName,
              isTyping: false,
              online_at: new Date().toISOString()
            })
            console.log('⏰ Auto-stopped typing')
          }
        }, 3000)
      }
    } catch (error) {
      console.error('❌ Typing error:', error)
    }
  }, [userId, userName])

  return {
    typingUsers,
    setTyping
  }
}
