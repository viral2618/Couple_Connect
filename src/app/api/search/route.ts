import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '@/lib/search-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc'
    const highlight = searchParams.get('highlight') === 'true'

    const searchResult = await searchService.searchUsers(query, {
      limit,
      attributesToRetrieve: ['id', 'name', 'email', 'avatar', 'isVerified', 'createdAt'],
      attributesToHighlight: highlight ? ['name', 'email'] : []
    })

    if (searchResult.success) {
      return NextResponse.json({
        ...searchResult.data,
        query,
        limit,
        sortBy,
        sortOrder
      })
    } else {
      return NextResponse.json(
        { error: searchResult.error || 'Search failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Enhanced search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      query = '', 
      filters = {}, 
      limit = 10, 
      sortBy, 
      sortOrder = 'desc',
      attributesToRetrieve,
      attributesToHighlight = []
    } = body

    // This would be implemented in the search engine for more complex filtering
    const searchResult = await searchService.searchUsers(query, {
      limit,
      attributesToRetrieve: attributesToRetrieve || ['id', 'name', 'email', 'avatar', 'isVerified'],
      attributesToHighlight
    })

    if (searchResult.success) {
      return NextResponse.json({
        ...searchResult.data,
        query,
        filters,
        limit,
        sortBy,
        sortOrder
      })
    } else {
      return NextResponse.json(
        { error: searchResult.error || 'Search failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Enhanced search POST error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}