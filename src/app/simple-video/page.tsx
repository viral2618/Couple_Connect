'use client'

import { useState } from 'react'
import VideoCall from '../../components/VideoCall'

export default function SimpleVideoPage() {
  const [roomId, setRoomId] = useState('')
  const [userId, setUserId] = useState('')
  const [inCall, setInCall] = useState(false)

  const startCall = () => {
    if (roomId && userId) {
      setInCall(true)
    }
  }

  const endCall = () => {
    setInCall(false)
  }

  if (inCall) {
    return (
      <VideoCall
        roomId={roomId}
        userId={userId}
        onCallEnd={endCall}
      />
    )
  }

  return (
    <div className="simple-video-page">
      <h1>Simple Video Call</h1>
      <div className="form">
        <input
          type="text"
          placeholder="Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your Name"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={startCall} disabled={!roomId || !userId}>
          Start Call
        </button>
      </div>
    </div>
  )
}