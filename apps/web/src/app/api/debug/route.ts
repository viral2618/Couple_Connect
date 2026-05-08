import { NextResponse } from 'next/server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || 3000,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL,
      databaseUrl: process.env.DATABASE_URL ? 'Connected' : 'Not configured',
      status: 'Server is running'
    }
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 })
  }
}