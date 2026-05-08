import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  try {
    const session = await getIronSession<SessionData>(request, response, sessionOptions)
    const isLoggedIn = session.isLoggedIn === true

    // Redirect logged-in users away from landing/login pages
    if ((pathname === '/' || pathname === '/login') && isLoggedIn) {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    // Redirect unauthenticated users away from protected routes
    const protectedRoutes = ['/home', '/chat', '/profile', '/settings', '/partner', '/photos', '/games', '/video-call', '/notifications']
    if (protectedRoutes.some(r => pathname.startsWith(r)) && !isLoggedIn) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware session error:', error)
    // On session error, only block protected routes — send to login, not landing
    const protectedRoutes = ['/home', '/chat', '/profile', '/settings', '/partner', '/photos', '/games', '/video-call', '/notifications']
    if (protectedRoutes.some(r => pathname.startsWith(r))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}