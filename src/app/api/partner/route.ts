import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { partnerId: true }
    })

    if (!user?.partnerId) {
      return NextResponse.json({ partner: null })
    }

    const partner = await prisma.user.findUnique({
      where: { id: user.partnerId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isVerified: true,
        isPremium: true,
        createdAt: true
      }
    })

    if (!partner) {
      return NextResponse.json({ partner: null })
    }

    const messageCount = await prisma.message.count({
      where: {
        OR: [
          { senderId: session.userId!, receiverId: partner.id },
          { senderId: partner.id, receiverId: session.userId! }
        ]
      }
    })

    const partnership = await prisma.partnership.findFirst({
      where: {
        OR: [
          { user1Id: session.userId!, user2Id: partner.id },
          { user1Id: partner.id, user2Id: session.userId! }
        ]
      },
      select: { createdAt: true }
    })

    return NextResponse.json({
      partner: {
        id: partner.id,
        name: partner.name,
        email: partner.email,
        avatar: partner.avatar ?? null,
        isVerified: partner.isVerified,
        isPremium: partner.isPremium,
        joinedAt: partner.createdAt.toISOString(),
        connectedSince: partnership?.createdAt.toISOString() ?? null,
        messageCount
      }
    })
  } catch (error) {
    console.error('Partner fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch partner' }, { status: 500 })
  }
}
