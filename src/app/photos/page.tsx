'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface Photo {
  id: string
  imageUrl: string
  caption: string
  createdAt: string
  sender: { id: string; name: string; avatar?: string }
}

export default function PhotosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<Photo | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    setLoading(true)
    const res = await fetch('/api/photos')
    if (res.ok) {
      const data = await res.json()
      setPhotos(data)
    }
    setLoading(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!preview) return
    setUploading(true)
    setError('')
    const res = await fetch('/api/photos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData: preview, caption })
    })
    if (res.ok) {
      const newPhoto = await res.json()
      setPhotos(prev => [newPhoto, ...prev])
      setPreview(null)
      setCaption('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } else {
      const data = await res.json()
      setError(data.error || 'Upload failed.')
    }
    setUploading(false)
  }

  const handleDelete = async (photoId: string) => {
    const res = await fetch(`/api/photos?id=${photoId}`, { method: 'DELETE' })
    if (res.ok) {
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      if (lightbox?.id === photoId) setLightbox(null)
    }
  }

  const cancelPreview = () => {
    setPreview(null)
    setCaption('')
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fff0f6 0%, #ffffff 40%, #f0f4ff 100%)' }}>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-pink-100/60">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="p-2 rounded-xl hover:bg-pink-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-base leading-tight">Shared Photos</h1>
              <p className="text-xs text-gray-400">Beautiful memories together</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Upload Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {!preview ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-amber-200 rounded-xl py-10 flex flex-col items-center gap-3 hover:border-amber-400 hover:bg-amber-50/50 transition-all"
            >
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700 text-sm">Share a photo</p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, GIF · Max 10MB · Auto-compressed</p>
              </div>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-gray-100 max-h-72 flex items-center justify-center">
                <img src={preview} alt="Preview" className="max-h-72 w-full object-contain" />
              </div>
              <input
                type="text"
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Add a caption... (optional)"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={cancelPreview}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {uploading ? 'Sending...' : 'Send Photo 💛'}
                </button>
              </div>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>

        {/* Gallery */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading photos...</div>
        ) : photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-600">No photos yet</p>
            <p className="text-sm text-gray-400 mt-1">Share your first photo with your partner!</p>
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 gap-3 space-y-3">
            {photos.map(photo => (
              <div
                key={photo.id}
                className="break-inside-avoid bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group cursor-pointer"
                onClick={() => setLightbox(photo)}
              >
                <div className="relative">
                  <img src={photo.imageUrl} alt={photo.caption || 'Shared photo'} className="w-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                        {photo.sender.name[0].toUpperCase()}
                      </div>
                      <span className="text-xs text-gray-500 truncate">{photo.sender.id === user?.id ? 'You' : photo.sender.name}</span>
                    </div>
                    {photo.sender.id === user?.id && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(photo.id) }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-50 text-red-400 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {photo.caption && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{photo.caption}</p>}
                  <p className="text-[10px] text-gray-300 mt-1">{new Date(photo.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
            <img src={lightbox.imageUrl} alt={lightbox.caption || ''} className="w-full rounded-2xl object-contain max-h-[75vh]" />
            <div className="mt-3 flex items-center justify-between">
              <div>
                {lightbox.caption && <p className="text-white text-sm font-medium">{lightbox.caption}</p>}
                <p className="text-white/50 text-xs mt-0.5">
                  {lightbox.sender.id === user?.id ? 'You' : lightbox.sender.name} · {new Date(lightbox.createdAt).toLocaleDateString()}
                </p>
              </div>
              {lightbox.sender.id === user?.id && (
                <button
                  onClick={() => handleDelete(lightbox.id)}
                  className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
