const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSearch() {
  try {
    console.log('Testing user search functionality...')
    
    // First, let's see what users exist
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    })
    
    console.log('All users in database:', allUsers)
    
    // Test search with name
    const searchByName = await prisma.user.findMany({
      where: {
        name: { contains: 'test', mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    })
    
    console.log('Search by name "test":', searchByName)
    
    // Test search with email
    const searchByEmail = await prisma.user.findMany({
      where: {
        email: { contains: 'test', mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    })
    
    console.log('Search by email "test":', searchByEmail)
    
  } catch (error) {
    console.error('Test error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSearch()