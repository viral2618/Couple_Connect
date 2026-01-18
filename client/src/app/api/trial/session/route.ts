import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const TRIAL_DURATION = 20 * 60 // 20 minutes in seconds

export async function POST(request: NextRequest) {
  try {
    const { fingerprint, resetTimer } = await request.json()

    if (!fingerprint) {
      return NextResponse.json({ error: 'Fingerprint required' }, { status: 400 })
    }

    // Check if session exists
    let session = await prisma.trialSession.findUnique({
      where: { fingerprint }
    })

    if (!session) {
      // Create new session
      session = await prisma.trialSession.create({
        data: {
          fingerprint,
          usedSeconds: 0
        }
      })
    } else if (resetTimer && session.usedSeconds < TRIAL_DURATION) {
      // Only allow reset if trial hasn't been fully used
      session = await prisma.trialSession.update({
        where: { fingerprint },
        data: { usedSeconds: 0 }
      })
    } else if (resetTimer && session.usedSeconds >= TRIAL_DURATION) {
      // Trial already fully used, cannot reset
      return NextResponse.json({
        timeRemaining: 0,
        isExpired: true,
        trialExhausted: true,
        sessionId: session.id
      })
    }

    const timeRemaining = Math.max(0, TRIAL_DURATION - session.usedSeconds)
    const isExpired = timeRemaining === 0

    return NextResponse.json({
      timeRemaining,
      isExpired,
      trialExhausted: session.usedSeconds >= TRIAL_DURATION,
      sessionId: session.id
    })
  } catch (error) {
    console.error('Trial session error:', error)
    return NextResponse.json({ error: 'Failed to manage trial session' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { fingerprint, secondsUsed } = await request.json()

    if (!fingerprint || typeof secondsUsed !== 'number') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Update session with server-side validation
    const session = await prisma.trialSession.findUnique({
      where: { fingerprint }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Calculate time since last update to prevent manipulation
    const now = new Date()
    const timeSinceUpdate = Math.floor((now.getTime() - session.updatedAt.getTime()) / 1000)
    const maxAllowedIncrease = Math.min(timeSinceUpdate + 5, 65) // Allow 5s buffer, max 65s per update

    const actualSecondsToAdd = Math.min(secondsUsed, maxAllowedIncrease)
    const newUsedSeconds = Math.min(session.usedSeconds + actualSecondsToAdd, TRIAL_DURATION)

    await prisma.trialSession.update({
      where: { fingerprint },
      data: { usedSeconds: newUsedSeconds }
    })

    const timeRemaining = Math.max(0, TRIAL_DURATION - newUsedSeconds)
    const isExpired = timeRemaining === 0

    return NextResponse.json({
      timeRemaining,
      isExpired,
      usedSeconds: newUsedSeconds
    })
  } catch (error) {
    console.error('Trial session update error:', error)
    return NextResponse.json({ error: 'Failed to update trial session' }, { status: 500 })
  }
}