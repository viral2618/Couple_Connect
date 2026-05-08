import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { partnerId: true }
  })

  if (!user?.partnerId) return NextResponse.json({ error: 'No partner linked' }, { status: 400 })

  const photos = await prisma.photo.findMany({
    where: {
      OR: [
        { senderId: session.userId!, receiverId: user.partnerId },
        { senderId: user.partnerId, receiverId: session.userId! }
      ]
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(photos)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { partnerId: true }
  })

  if (!user?.partnerId) return NextResponse.json({ error: 'No partner linked' }, { status: 400 })

  const { imageData, caption } = await req.json()

  if (!imageData || typeof imageData !== 'string' || !imageData.startsWith('data:image/')) {
    return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
  }

  // Upload: compress with Sharp → WebP → temp folder → main folder
  const imageUrl = await uploadImage(imageData, 'sharing', session.userId!)

  const photo = await prisma.photo.create({
    data: {
      imageUrl,
      caption: caption || '',
      senderId: session.userId!,
      receiverId: user.partnerId
    },
    include: {
      sender: { select: { id: true, name: true, avatar: true } }
    }
  })

  return NextResponse.json(photo)
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const photoId = searchParams.get('id')
  if (!photoId) return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })

  const photo = await prisma.photo.findUnique({ where: { id: photoId } })
  if (!photo || photo.senderId !== session.userId) {
    return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
  }

  // Delete from Cloudinary then DB
  await deleteImage(photo.imageUrl)
  await prisma.photo.delete({ where: { id: photoId } })

  return NextResponse.json({ success: true })
}
