import { NextRequest, NextResponse } from 'next/server'
import { MeiliSearch } from 'meilisearch'
import { prisma } from '@/lib/prisma'

const meiliClient = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_API_KEY
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json([])
    }

    try {
      // Try MeiliSearch first
      const index = meiliClient.index('users')
      const searchResults = await index.search(query, {
        limit: 10,
        attributesToRetrieve: ['id', 'name', 'email', 'avatar']
      })
      return NextResponse.json(searchResults.hits)
    } catch (meiliError) {
      console.log('MeiliSearch unavailable, falling back to database search')
      
      // Fallback to Prisma if MeiliSearch fails
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
      return NextResponse.json(users)
    }
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json([])
  }
}