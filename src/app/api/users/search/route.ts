import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '@/lib/search-service'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 1) {
      return NextResponse.json([])
    }

    // Try custom search engine first
    const searchResult = await searchService.searchUsers(query, {
      limit: 10,
      attributesToRetrieve: ['id', 'name', 'email', 'avatar'],
      attributesToHighlight: ['name', 'email']
    })

    if (searchResult.success && searchResult.data) {
      return NextResponse.json(searchResult.data.hits)
    }

    // Fallback to database search if custom engine fails
    console.warn('Custom search engine failed, falling back to database:', searchResult.error)
    
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
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}