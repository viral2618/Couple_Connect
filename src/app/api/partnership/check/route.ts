import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const partnerId = searchParams.get('partnerId')

    if (!partnerId) {
      return NextResponse.json({ error: 'Partner ID required' }, { status: 400 })
    }

    // Check if both users exist
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, isVerified: true, partnerId: true }
    })

    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: { id: true, isVerified: true, partnerId: true }
    })

    if (!currentUser || !partner) {
      return NextResponse.json({ 
        canChat: false, 
        reason: 'User not found' 
      })
    }

    // Check if they are already partners
    const existingPartnership = await prisma.partnership.findFirst({
      where: {
        OR: [
          { user1Id: session.userId, user2Id: partnerId },
          { user1Id: partnerId, user2Id: session.userId }
        ]
      }
    })

    if (existingPartnership || 
        (currentUser.partnerId === partnerId && partner.partnerId === session.userId)) {
      return NextResponse.json({ 
        canChat: true
      })
    }

    // For unverified users, allow trial chat with verification
    return NextResponse.json({ 
      canChat: false, 
      reason: 'Partnership verification required'
    })

  } catch (error) {
    console.error('Partnership check error:', error)
    return NextResponse.json({ error: 'Failed to check partnership' }, { status: 500 })
  }
}