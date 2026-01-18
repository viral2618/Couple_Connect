import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { getSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, partnerId, code } = await request.json()

    // Validate that the requesting user matches the session
    if (userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Store verification code with encryption
    const encryptedCode = crypto.createHash('sha256').update(code).digest('hex')
    
    await prisma.verificationCode.create({
      data: {
        userId,
        partnerId,
        code: encryptedCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Verification store error:', error)
    return NextResponse.json({ error: 'Failed to store verification' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, partnerId, enteredCode } = await request.json()

    // Validate that the requesting user matches the session
    if (userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Hash entered code
    const hashedCode = crypto.createHash('sha256').update(enteredCode).digest('hex')
    
    // Find the verification code created by the partner for this user
    const verification = await prisma.verificationCode.findFirst({
      where: {
        userId: partnerId, // Code was created by partner
        partnerId: userId, // For this user
        code: hashedCode,
        expiresAt: { gt: new Date() }
      }
    })

    if (!verification) {
      return NextResponse.json({ success: false, verified: false, message: 'Invalid or expired verification code. Please try again.' })
    }

    // Check if partnership already exists
    const existingPartnership = await prisma.partnership.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: partnerId },
          { user1Id: partnerId, user2Id: userId }
        ]
      }
    })

    if (!existingPartnership) {
      // Create partnership
      await prisma.partnership.create({
        data: {
          user1Id: userId,
          user2Id: partnerId,
          status: 'VERIFIED'
        }
      })
    }

    // Update both users to set each other as partners
    await prisma.user.update({
      where: { id: userId },
      data: { partnerId: partnerId }
    })
    
    await prisma.user.update({
      where: { id: partnerId },
      data: { partnerId: userId }
    })

    // Delete the used verification code
    await prisma.verificationCode.deleteMany({
      where: {
        userId: partnerId,
        partnerId: userId,
        code: hashedCode
      }
    })

    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}