import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const TRIAL_DAYS = 14

export async function GET() {
  try {
    const session = await getSession()
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { trialStartedAt: true, isPremium: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const trialEndsAt = new Date((user.trialStartedAt ?? new Date()).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    const now = new Date()
    const daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

    return NextResponse.json({
      isPremium: user.isPremium,
      isActive: !user.isPremium && daysRemaining > 0,
      isExpired: !user.isPremium && daysRemaining === 0,
      daysRemaining,
      endsAt: trialEndsAt.toISOString()
    })
  } catch (error) {
    console.error('Trial status error:', error)
    return NextResponse.json({ error: 'Failed to get trial status' }, { status: 500 })
  }
}
