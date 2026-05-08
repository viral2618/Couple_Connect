import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { avatar: true }
  })

  return NextResponse.json({ avatar: user?.avatar ?? null })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { avatar } = await request.json()

  if (!avatar || typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid avatar data' }, { status: 400 })
  }

  // Delete old avatar from Cloudinary if it exists
  const existing = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { avatar: true }
  })
  if (existing?.avatar && existing.avatar.includes('cloudinary')) {
    await deleteImage(existing.avatar)
  }

  // Compress with Sharp → WebP → upload to profile folder
  const avatarUrl = await uploadImage(avatar, 'profile', session.userId!)

  const user = await prisma.user.update({
    where: { id: session.userId },
    data: { avatar: avatarUrl },
    select: { avatar: true }
  })

  return NextResponse.json({ avatar: user.avatar })
}
