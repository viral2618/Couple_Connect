import { NextRequest, NextResponse } from 'next/server'
import { searchService } from '@/lib/search-service'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting search sync...')
    
    const result = await searchService.syncUsers()
    
    if (result.success) {
      console.log(`✅ Search sync completed: ${result.count} users indexed`)
      return NextResponse.json({
        success: true,
        message: `Successfully synced ${result.count} users`,
        count: result.count
      })
    } else {
      console.error('❌ Search sync failed:', result.error)
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Search sync error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const stats = searchService.getIndexStats()
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('❌ Failed to get search stats:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}