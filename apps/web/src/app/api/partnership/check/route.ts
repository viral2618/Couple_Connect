import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const partnerId = searchParams.get('partnerId')

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 })
    }

    // Allow test users to chat without any checks
    if (partnerId.startsWith('test-user-')) {
      return NextResponse.json({ canChat: true })
    }

    const session = await getSession()
    
    // Also allow if current user is test user
    if (session?.userId?.startsWith('test-user-')) {
      return NextResponse.json({ canChat: true })
    }
    
    if (!session?.isLoggedIn || !session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if both users exist
    const [currentUser, partner] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, isVerified: true, partnerId: true }
      }),
      prisma.user.findUnique({
        where: { id: partnerId },
        select: { id: true, isVerified: true, partnerId: true }
      })
    ])

    if (!currentUser) {
      return NextResponse.json({ 
        canChat: false, 
        reason: 'Current user not found' 
      })
    }

    if (!partner) {
      return NextResponse.json({ 
        canChat: false, 
        reason: 'Partner not found' 
      })
    }

    // Check if they are already partners
    const existingPartnership = await prisma.partnership.findFirst({
      where: {
        OR: [
          { user1Id: session.userId, user2Id: partnerId },
          { user1Id: partnerId, user2Id: session.userId }
        ],
        status: 'ACCEPTED'
      }
    })

    if (existingPartnership) {
      return NextResponse.json({ canChat: true })
    }

    // Check mutual partner IDs
    if (currentUser.partnerId === partnerId && partner.partnerId === session.userId) {
      return NextResponse.json({ canChat: true })
    }

    return NextResponse.json({ 
      canChat: false, 
      reason: 'Partnership verification required'
    })

  } catch (error) {
    console.error('Partnership check error:', error)
    return NextResponse.json({ 
      canChat: false, 
      error: 'Failed to check partnership' 
    }, { status: 500 })
  }
}