import { NextRequest, NextResponse } from 'next/server'
import { MeiliSearch } from 'meilisearch'
import { prisma } from '@/lib/prisma'

const meiliClient = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_MASTER_KEY
})

export async function POST(req: NextRequest) {
  try {
    // Get all users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    })

    // Get or create users index
    const index = meiliClient.index('users')
    
    // Configure searchable attributes
    await index.updateSearchableAttributes(['name', 'email'])
    await index.updateFilterableAttributes(['id'])

    // Add documents to MeiliSearch
    await index.addDocuments(users)

    return NextResponse.json({ 
      message: 'Users synced successfully', 
      count: users.length 
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync users' }, 
      { status: 500 }
    )
  }
}