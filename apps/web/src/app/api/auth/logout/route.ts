import { NextResponse } from 'next/server'
import { logout } from '@/lib/session'

export async function POST() {
  try {
    await logout()
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}