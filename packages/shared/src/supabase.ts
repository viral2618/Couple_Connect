import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Realtime channel helpers
export const createChatChannel = (roomId: string) => {
  return supabase.channel(`chat:${roomId}`)
}

export const createTypingChannel = (roomId: string) => {
  return supabase.channel(`typing:${roomId}`)
}

export const createPresenceChannel = (roomId: string) => {
  return supabase.channel(`presence:${roomId}`, {
    config: {
      presence: {
        key: roomId
      }
    }
  })
}
