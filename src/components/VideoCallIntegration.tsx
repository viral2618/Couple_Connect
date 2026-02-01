'use client'

import { useState } from 'react'
import VideoCall from './VideoCall'

interface VideoCallIntegrationProps {
  roomId: string
  userId: string
  partnerName?: string
  className?: string
}

export default function VideoCallIntegration({ 
  roomId, 
  userId, 
  partnerName = 'Partner',
  className = '' 
}: VideoCallIntegrationProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isCallStarting, setIsCallStarting] = useState(false)

  const startVideoCall = () => {
    setIsCallStarting(true)
    // Small delay to show loading state
    setTimeout(() => {
      setIsCallActive(true)
      setIsCallStarting(false)
    }, 500)
  }

  const endVideoCall = () => {
    setIsCallActive(false)
    setIsCallStarting(false)
  }

  if (isCallActive) {
    return (
      <div className={`w-full h-full ${className}`}>
        <VideoCall
          roomId={roomId}
          userId={userId}
          onCallEnd={endVideoCall}
          className="w-full h-full"
          showControls={true}
        />
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg ${className}`}>
      <div className="text-center text-white p-8">
        <div className="text-6xl mb-4">📹</div>
        <h3 className="text-2xl font-bold mb-2">Video Call</h3>
        <p className="text-purple-100 mb-6">
          Start a video call with {partnerName}
        </p>
        
        {isCallStarting ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/20 border-t-white mr-3"></div>
            <span>Starting call...</span>
          </div>
        ) : (
          <button
            onClick={startVideoCall}
            className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-full hover:bg-purple-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Video Call
          </button>
        )}
        
        <div className="mt-6 text-sm text-purple-200">
          <p>✓ HD Video Quality</p>
          <p>✓ Crystal Clear Audio</p>
          <p>✓ Secure & Private</p>
        </div>
      </div>
    </div>
  )
}