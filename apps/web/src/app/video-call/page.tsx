'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SimpleVideoCall from '@/components/SimpleVideoCall'

export default function VideoCallPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    router.push('/login')
    return null
  }

  const isPremium = user.isPremium || user.trial?.isActive

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 w-full max-w-md p-8 text-center">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Premium Feature
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Video Call</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            See each other face to face with HD video calling. Upgrade to Premium to unlock this feature.
          </p>

          <div className="space-y-3 text-left mb-8">
            {['HD video & audio quality', 'Unlimited call duration', 'Works across all devices'].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-sm text-gray-700">
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {feat}
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/home')}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 text-white font-semibold py-3 rounded-2xl text-sm transition-all"
          >
            Upgrade to Premium
          </button>
          <button
            onClick={() => router.back()}
            className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm py-2 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    )
  }

  const roomId = user.partner
    ? [user.id, user.partner.id].sort().join('-')
    : user.id

  return (
    <SimpleVideoCall
      roomId={roomId}
      userId={user.id}
      isPremium={isPremium}
      onClose={() => router.push('/home')}
    />
  )
}
