const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initializeSearch() {
  try {
    console.log('🔍 Initializing search engine...')
    
    // Fetch users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
        isVerified: true
      }
    })

    console.log(`📊 Found ${users.length} users in database`)

    // Make API call to sync search engine
    const response = await fetch('http://localhost:3000/api/search/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Search engine synchronized successfully:', result)
    } else {
      console.error('❌ Failed to sync search engine:', await response.text())
    }

  } catch (error) {
    console.error('❌ Error initializing search:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

initializeSearch()