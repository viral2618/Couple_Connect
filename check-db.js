const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('Connecting to database...')
    
    // Check GameRoom table
    const gameRooms = await prisma.gameRoom.findMany()
    console.log(`\n📊 GameRoom table: ${gameRooms.length} records`)
    
    if (gameRooms.length > 0) {
      console.log('Sample GameRoom data:')
      gameRooms.forEach((room, index) => {
        console.log(`  ${index + 1}. Room ID: ${room.roomId}, Players: ${room.players?.length || 0}, State: ${room.gameState}`)
      })
    }
    
    // Check if there are other tables by trying common ones
    try {
      const users = await prisma.user?.findMany() || []
      console.log(`\n👤 User table: ${users.length} records`)
    } catch (e) {
      console.log('\n👤 User table: Not found or no access')
    }
    
    console.log('\n✅ Database check completed!')
    
  } catch (error) {
    console.error('❌ Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()