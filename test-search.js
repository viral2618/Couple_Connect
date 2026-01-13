require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testSearch() {
  try {
    console.log('Testing database connection...')
    
    // Check if there are any users
    const userCount = await prisma.user.count()
    console.log(`Total users in database: ${userCount}`)
    
    if (userCount === 0) {
      console.log('No users found in database!')
      return
    }
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      },
      take: 5
    })
    
    console.log('Sample users:')
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`)
    })
    
    // Test search functionality
    const searchQuery = 'jainil'
    const searchResults = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } }
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
    
    console.log(`\nSearch results for "${searchQuery}":`)
    searchResults.forEach(user => {
      console.log(`- ${user.name} (${user.email})`)
    })
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSearch()