'use client'

import { useState } from 'react'
import VideoCall from '@/components/VideoCall'

export default function VideoTestPage() {
  const [roomId, setRoomId] = useState('')
  const [userId, setUserId] = useState('')
  const [isInCall, setIsInCall] = useState(false)

  const startCall = () => {
    if (roomId.trim() && userId.trim()) {
      setIsInCall(true)
    }
  }

  const endCall = () => {
    setIsInCall(false)
  }

  if (isInCall) {
    return (
      <div className="min-h-screen bg-gray-900">
        <VideoCall 
          roomId={roomId}
          userId={userId}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Video Call Test</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Room ID</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID"
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
          <button
            onClick={startCall}
            disabled={!roomId.trim() || !userId.trim()}
            className="w-full bg-blue-600 text-white p-3 rounded-lg disabled:bg-gray-400"
          >
            Start Video Call
          </button>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Instructions:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Enter the same Room ID on both devices</li>
            <li>Use different names for each person</li>
            <li>Allow camera and microphone permissions</li>
            <li>Maximum 2 people per room</li>
          </ul>
        </div>
      </div>
    </div>
  )
}