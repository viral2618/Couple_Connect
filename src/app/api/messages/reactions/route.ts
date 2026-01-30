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

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'Message ID and emoji required' }, { status: 400 })
    }

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { sender: true, receiver: true }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user is part of this conversation
    if (message.senderId !== session.userId && message.receiverId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const reactions = message.reactions as { emoji: string; userId: string }[]
    const existingReactionIndex = reactions.findIndex(r => r.userId === session.userId && r.emoji === emoji)

    if (existingReactionIndex >= 0) {
      // Remove reaction if it exists
      reactions.splice(existingReactionIndex, 1)
    } else {
      // Add new reaction
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
    console.error('Reaction error:', error)
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 })
  }
}