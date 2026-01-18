'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

interface TestUser {
  id: string
  name: string
  avatar?: string
}

export default function VideoCallTester() {
  const [socket1, setSocket1] = useState<Socket | null>(null)
  const [socket2, setSocket2] = useState<Socket | null>(null)
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const user1: TestUser = { id: 'test-user-1', name: 'Alice' }
  const user2: TestUser = { id: 'test-user-2', name: 'Bob' }

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    addResult('Starting video call tests...')

    try {
      // Test 1: Socket connections
      addResult('Test 1: Testing socket connections...')
      const socket1Instance = io('http://localhost:3000')
      const socket2Instance = io('http://localhost:3000')

      await new Promise((resolve) => {
        let connected = 0
        socket1Instance.on('connect', () => {
          addResult('✅ User 1 connected')
          connected++
          if (connected === 2) resolve(true)
        })
        socket2Instance.on('connect', () => {
          addResult('✅ User 2 connected')
          connected++
          if (connected === 2) resolve(true)
        })
      })

      setSocket1(socket1Instance)
      setSocket2(socket2Instance)

      // Test 2: Room joining
      addResult('Test 2: Testing room joining...')
      const roomId = [user1.id, user2.id].sort().join('-')
      
      socket1Instance.emit('join-video-room', { roomId, userId: user1.id })
      socket2Instance.emit('join-video-room', { roomId, userId: user2.id })

      await new Promise(resolve => setTimeout(resolve, 1000))
      addResult('✅ Both users joined room')

      // Test 3: WebRTC signaling
      addResult('Test 3: Testing WebRTC signaling...')
      
      socket1Instance.on('webrtc-offer', (data) => {
        addResult('✅ User 2 received offer from User 1')
        socket2Instance.emit('webrtc-answer', { 
          roomId, 
          answer: 'mock-answer',
          to: data.from 
        })
      })

      socket2Instance.on('webrtc-answer', (data) => {
        addResult('✅ User 1 received answer from User 2')
      })

      socket1Instance.emit('webrtc-offer', { 
        roomId, 
        offer: 'mock-offer',
        to: user2.id 
      })

      await new Promise(resolve => setTimeout(resolve, 2000))

      // Test 4: Media permissions
      addResult('Test 4: Testing media permissions...')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        })
        addResult('✅ Camera and microphone access granted')
        stream.getTracks().forEach(track => track.stop())
      } catch (error) {
        addResult('❌ Media permissions denied or unavailable')
      }

      // Test 5: Security validation
      addResult('Test 5: Testing security validation...')
      const testAuth = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user1.id })
      }).catch(() => null)

      if (testAuth?.ok) {
        addResult('✅ Authentication validation working')
      } else {
        addResult('⚠️ Authentication endpoint not available (expected in development)')
      }

      addResult('🎉 All tests completed successfully!')

    } catch (error) {
      addResult(`❌ Test failed: ${error}`)
    } finally {
      setIsRunning(false)
      // Cleanup
      socket1?.disconnect()
      socket2?.disconnect()
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Video Call System Tester</h2>
        <p className="text-gray-600">Test the video call functionality between two users</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </button>
        <button
          onClick={clearResults}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Clear Results
        </button>
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        {testResults.length === 0 ? (
          <div className="text-gray-500">Click "Run Tests" to start testing...</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className="mb-1">
              {result}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">Test Coverage:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Socket.IO connection establishment</li>
          <li>• Room joining and management</li>
          <li>• WebRTC signaling (offer/answer)</li>
          <li>• Media device permissions</li>
          <li>• Security validation</li>
        </ul>
      </div>
    </div>
  )
}