'use client'

import { useState, useCallback } from 'react'
import VideoCall from './VideoCall'
import VideoCallPermissions from './VideoCallPermissions'

interface VideoCallManagerProps {
  roomId: string
  userId: string
  partnerName: string
  onCallEnd: () => void
  className?: string
}

type CallState = 'permissions' | 'connecting' | 'connected' | 'error' | 'ended'

export default function VideoCallManager({
  roomId,
  userId,
  partnerName,
  onCallEnd,
  className = ''
}: VideoCallManagerProps) {
  const [callState, setCallState] = useState<CallState>('permissions')
  const [error, setError] = useState<string | null>(null)
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'unknown'>('unknown')

  const handlePermissionsGranted = useCallback(() => {
    setCallState('connecting')
    setError(null)
  }, [])

  const handlePermissionsDenied = useCallback((errorMessage: string) => {
    setCallState('error')
    setError(errorMessage)
  }, [])

  const handleCallEnd = useCallback(() => {
    setCallState('ended')
    onCallEnd()
  }, [onCallEnd])

  const handleRetry = useCallback(() => {
    setCallState('permissions')
    setError(null)
  }, [])

  // Connection quality monitoring
  const updateConnectionQuality = useCallback((quality: 'excellent' | 'good' | 'poor') => {
    setConnectionQuality(quality)
  }, [])

  if (callState === 'permissions') {
    return (
      <VideoCallPermissions
        onPermissionsGranted={handlePermissionsGranted}
        onPermissionsDenied={handlePermissionsDenied}
      />
    )
  }

  if (callState === 'error') {
    return (
      <div className={`relative w-full h-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center text-white p-8 max-w-md">
          <div className="text-6xl mb-6">⚠️</div>
          <h3 className="text-2xl font-bold mb-4">Call Failed</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 font-medium"
            >
              Try Again
            </button>
            
            <button
              onClick={handleCallEnd}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 font-medium"
            >
              End Call
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-gray-800 rounded-xl text-left">
            <h4 className="font-semibold mb-2">Troubleshooting Tips:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Ensure camera/microphone aren't used by other apps</li>
              <li>• Try refreshing the page</li>
              <li>• Check browser permissions in settings</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (callState === 'ended') {
    return (
      <div className={`relative w-full h-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-6">📞</div>
          <h3 className="text-2xl font-bold mb-4">Call Ended</h3>
          <p className="text-gray-300 mb-6">Your video call with {partnerName} has ended.</p>
          
          <button
            onClick={onCallEnd}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 font-medium"
          >
            Back to Chat
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Connection Quality Indicator */}
      {connectionQuality !== 'unknown' && (
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionQuality === 'excellent' ? 'bg-green-500' :
              connectionQuality === 'good' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="capitalize">{connectionQuality} Connection</span>
          </div>
        </div>
      )}

      {/* Partner Name Display */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Calling {partnerName}</span>
        </div>
      </div>

      <VideoCall
        roomId={roomId}
        userId={userId}
        onCallEnd={handleCallEnd}
        className="w-full h-full"
        showControls={true}
      />
    </div>
  )
}