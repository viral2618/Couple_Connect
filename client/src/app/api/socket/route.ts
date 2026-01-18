import { NextRequest } from 'next/server'

// Socket.io is now handled by the custom server.js file
export async function GET(req: NextRequest) {
  return new Response('Socket server is handled by custom server', { status: 200 })
}