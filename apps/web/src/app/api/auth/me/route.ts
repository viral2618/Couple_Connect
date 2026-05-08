import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isVerified: true,
        trialStartedAt: true,
        isPremium: true,
        partnerId: true,
        partner: {
          select: { id: true, name: true, avatar: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const TRIAL_DAYS = 14
    const trialStartedAt = user.trialStartedAt ?? new Date()
    const trialEndsAt = new Date(trialStartedAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000)
    const now = new Date()
    const daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    const isTrialActive = !user.isPremium && daysRemaining > 0
    const isTrialExpired = !user.isPremium && daysRemaining === 0

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar ?? null,
      isVerified: user.isVerified,
      isPremium: user.isPremium,
      partner: user.partner ? {
        id: user.partner.id,
        name: user.partner.name,
        avatar: user.partner.avatar ?? undefined
      } : undefined,
      trial: {
        isActive: isTrialActive,
        isExpired: isTrialExpired,
        daysRemaining,
        endsAt: trialEndsAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}