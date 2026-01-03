const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSearchAPI() {
  try {
    console.log('Testing search API functionality...')
    
    // Test the search logic directly
    const query = 'viral'
    
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      },
      take: 10
    })
    
    console.log(`Search results for "${query}":`, users)
    
    // Test with partial match
    const partialQuery = 'vir'
    const partialUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: partialQuery, mode: 'insensitive' } },
          { email: { contains: partialQuery, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      },
      take: 10
    })
    
    console.log(`Search results for "${partialQuery}":`, partialUsers)
    
  } catch (error) {
    console.error('Search test error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSearchAPI()