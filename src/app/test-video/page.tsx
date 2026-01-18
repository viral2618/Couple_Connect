'use client'

import { useState } from 'react'
import VideoCallTester from '@/components/VideoCallTester'
import FullPageChat from '@/components/FullPageChat'

export default function TestVideoCallPage() {
  const [testMode, setTestMode] = useState<'tester' | 'user1' | 'user2'>('tester')

  const user1 = {
    id: 'test-user-1',
    name: 'Alice',
    avatar: '/avatars/alice.jpg'
  }

  const user2 = {
    id: 'test-user-2', 
    name: 'Bob',
    avatar: '/avatars/bob.jpg'
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-4">Video Call System Test</h1>
          
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => setTestMode('tester')}
              className={`px-4 py-2 rounded-lg ${
                testMode === 'tester' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              System Tester
            </button>
            <button
              onClick={() => setTestMode('user1')}
              className={`px-4 py-2 rounded-lg ${
                testMode === 'user1' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Test as Alice
            </button>
            <button
              onClick={() => setTestMode('user2')}
              className={`px-4 py-2 rounded-lg ${
                testMode === 'user2' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Test as Bob
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {testMode === 'tester' && <VideoCallTester />}
          
          {testMode === 'user1' && (
            <div className="h-[600px]">
              <div className="bg-green-100 p-3 text-center">
                <span className="text-green-800 font-semibold">Testing as Alice</span>
              </div>
              <FullPageChat currentUser={user1} partner={user2} />
            </div>
          )}
          
          {testMode === 'user2' && (
            <div className="h-[600px]">
              <div className="bg-purple-100 p-3 text-center">
                <span className="text-purple-800 font-semibold">Testing as Bob</span>
              </div>
              <FullPageChat currentUser={user2} partner={user1} />
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Testing Instructions:</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>First, run the "System Tester" to verify all components are working</li>
            <li>Open two browser windows/tabs</li>
            <li>In one window, select "Test as Alice"</li>
            <li>In another window, select "Test as Bob"</li>
            <li>Click the video call button in either chat to start a call</li>
            <li>Verify both users can see and hear each other</li>
            <li>Test all call controls (mute, camera, end call)</li>
          </ol>
        </div>
      </div>
    </div>
  )
}