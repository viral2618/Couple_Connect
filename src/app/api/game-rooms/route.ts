import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { action, roomId, playerId, playerName } = await request.json()
    
    if (action === 'create') {
      const gameRoom = await prisma.gameRoom.create({
        data: {
          roomId,
          hostId: playerId,
          players: [{ id: playerId, name: playerName, socketId: '' }],
          scores: { [playerId]: 0 }
        }
      })
      
      return NextResponse.json({ success: true, room: gameRoom })
    }
    
    if (action === 'join') {
      const gameRoom = await prisma.gameRoom.findUnique({
        where: { roomId }
      })
      
      if (!gameRoom) {
        return NextResponse.json({ success: false, error: 'Room not found' }, { status: 404 })
      }
      
      return NextResponse.json({ success: true, room: gameRoom })
    }
    
    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}