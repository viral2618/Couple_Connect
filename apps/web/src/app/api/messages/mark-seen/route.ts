import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@couple-connect/shared'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions)
    
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = await req.json()

    console.log('📖 Marking messages as seen:', { userId: session.userId, partnerId })

    // Mark all messages from partner as seen in Supabase
    const { data, error } = await supabase
      .from('messages')
      .update({ seen_at: new Date().toISOString() })
      .eq('sender_id', partnerId)
      .eq('receiver_id', session.userId)
      .is('seen_at', null)

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    console.log('✅ Messages marked as seen:', data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Mark seen error:', error)
    return NextResponse.json({ error: 'Failed to mark messages as seen' }, { status: 500 })
  }
}