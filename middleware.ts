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

    // Redirect to home if logged in and trying to access login page
    if (pathname === '/' && session.isLoggedIn === true) {
      return NextResponse.redirect(new URL('/home', request.url))
    }

    // Redirect to login if not logged in and trying to access protected routes
    if ((pathname.startsWith('/home') || pathname.startsWith('/chat')) && session.isLoggedIn !== true) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware session error:', error)
    // If session check fails, redirect to login for protected routes
    if (pathname.startsWith('/home') || pathname.startsWith('/chat')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}