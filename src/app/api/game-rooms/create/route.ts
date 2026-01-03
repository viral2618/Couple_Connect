import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { roomId, hostId, hostName } = await request.json()

    const gameRoom = await prisma.gameRoom.create({
      data: {
        roomId,
        hostId,
        players: [{ id: hostId, name: hostName, socketId: 'mock' }],
        gameState: 'waiting',
        currentRound: 1,
        statements: {},
        scores: {}
      }
    })

    return NextResponse.json({ success: true, room: gameRoom })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json({ success: false, error: 'Failed to create room' }, { status: 500 })
  }
}