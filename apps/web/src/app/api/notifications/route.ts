import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET — build notifications from real data (recent messages + partnership events)
export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = session.userId!

    // Fetch recent unread messages sent to this user
    const recentMessages = await prisma.message.findMany({
      where: {
        receiverId: userId,
        seenAt: null
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Fetch partnership record
    const partnership = await prisma.partnership.findFirst({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    const notifications: {
      id: string
      type: string
      title: string
      body: string
      href?: string
      read: boolean
      createdAt: string
      senderName?: string
      senderAvatar?: string | null
    }[] = []

    // One notification per sender (group messages)
    const seenSenders = new Set<string>()
    for (const msg of recentMessages) {
      if (seenSenders.has(msg.sender.id)) continue
      seenSenders.add(msg.sender.id)
      const count = recentMessages.filter(m => m.sender.id === msg.sender.id).length
      notifications.push({
        id: `msg-${msg.sender.id}`,
        type: 'message',
        title: `New message from ${msg.sender.name}`,
        body: count > 1
          ? `You have ${count} unread messages`
          : msg.content.length > 80 ? msg.content.slice(0, 80) + '…' : msg.content,
        href: `/chat/${msg.sender.id}`,
        read: false,
        createdAt: msg.createdAt.toISOString(),
        senderName: msg.sender.name,
        senderAvatar: msg.sender.avatar ?? null
      })
    }

    // Partnership connected notification
    if (partnership) {
      notifications.push({
        id: `partnership-${partnership.id}`,
        type: 'partner_request',
        title: 'You are connected with your partner 💕',
        body: 'Your partnership is active. Start chatting, video calling and playing games together!',
        href: '/partner',
        read: true,
        createdAt: partnership.createdAt.toISOString()
      })
    }

    // Welcome system notification
    notifications.push({
      id: 'system-welcome',
      type: 'system',
      title: 'Welcome to Couple Connect 💖',
      body: 'Stay connected with your partner no matter the distance.',
      href: '/home',
      read: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    })

    // Sort newest first
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// PATCH — mark all notifications read (marks all messages as seen)
export async function PATCH() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await prisma.message.updateMany({
      where: { receiverId: session.userId!, seenAt: null },
      data: { seenAt: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Mark read error:', error)
    return NextResponse.json({ error: 'Failed to mark read' }, { status: 500 })
  }
}
