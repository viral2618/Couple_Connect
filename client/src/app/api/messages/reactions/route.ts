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

    const { messageId, emoji } = await req.json()

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { reactions: true }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    const reactions = message.reactions as { emoji: string; userId: string }[]
    const existingReactionIndex = reactions.findIndex(r => r.userId === session.userId)

    if (existingReactionIndex >= 0) {
      reactions[existingReactionIndex] = { emoji, userId: session.userId }
    } else {
      reactions.push({ emoji, userId: session.userId })
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { reactions },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      }
    })

    return NextResponse.json(updatedMessage)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 })
  }
}