import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(req, NextResponse.next(), sessionOptions)
    
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { partnerId } = await req.json()

    // Mark all messages from partner as seen
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: session.userId,
        seenAt: null
      },
      data: {
        seenAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark all seen error:', error)
    return NextResponse.json({ error: 'Failed to mark messages as seen' }, { status: 500 })
  }
}