import { v2 as cloudinary } from 'cloudinary'
import sharp from 'sharp'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export type ImageFolder = 'profile' | 'couple' | 'sharing'

// Compress with Sharp → WebP buffer
async function compressToWebP(input: Buffer, quality = 80): Promise<Buffer> {
  return sharp(input)
    .webp({ quality })
    .toBuffer()
}

// Strip data:image/...;base64, prefix and return raw Buffer
function base64ToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '')
  return Buffer.from(base64, 'base64')
}

// Upload buffer to Cloudinary as a stream
function uploadBuffer(
  buffer: Buffer,
  folder: string,
  publicId: string
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        format: 'webp',
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'))
        resolve({ secure_url: result.secure_url, public_id: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

/**
 * Full pipeline:
 * 1. Decode base64 → Buffer
 * 2. Sharp compress → WebP
 * 3. Upload to temp/<folder>/<id>
 * 4. Copy to <folder>/<id>  (migrate to main)
 * 5. Delete temp copy
 * 6. Return final WebP URL
 */
export async function uploadImage(
  dataUrl: string,
  folder: ImageFolder,
  userId: string
): Promise<string> {
  const rawBuffer = base64ToBuffer(dataUrl)
  const webpBuffer = await compressToWebP(rawBuffer)

  const timestamp = Date.now()
  const publicId = `${userId}_${timestamp}`

  // Step 1 — upload to temp folder
  const tempResult = await uploadBuffer(
    webpBuffer,
    `couple-connect/temp/${folder}`,
    publicId
  )

  // Step 2 — migrate: upload same buffer to main folder
  const mainResult = await uploadBuffer(
    webpBuffer,
    `couple-connect/${folder}`,
    publicId
  )

  // Step 3 — delete temp copy (fire-and-forget, don't block response)
  cloudinary.uploader.destroy(tempResult.public_id).catch(() => {})

  return mainResult.secure_url
}

/**
 * Delete an image from Cloudinary by its URL.
 * Derives the public_id from the URL.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    // Extract public_id: everything after /upload/vXXXXX/ up to (not including) extension
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
    if (!match) return
    await cloudinary.uploader.destroy(match[1])
  } catch {
    // non-critical
  }
}
