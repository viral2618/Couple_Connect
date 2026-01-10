'use client'

import { useState } from 'react'
import VideoCall from './VideoCall'
import { useVideoCall } from '../hooks/useVideoCall'

export default function VideoCallExample() {
  const { callState, startCall, endCall } = useVideoCall()
  const [roomId, setRoomId] = useState('')
  const [userId] = useState(() => Math.random().toString(36).substring(7))

  const handleStartCall = () => {
    if (roomId.trim()) {
      startCall(roomId, 'partner')
    }
  }

  if (callState.isCallActive) {
    return (
      <div className="w-full h-screen">
        <VideoCall
          roomId={callState.roomId!}
          userId={userId}
          onCallEnd={endCall}
          className="w-full h-full"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Video Call</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleStartCall}
            disabled={!roomId.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Start Video Call
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-600 text-center">
          <p>Your User ID: {userId}</p>
        </div>
      </div>
    </div>
  )
}