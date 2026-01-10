'use client'

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'

export default function GameTest() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [roomId, setRoomId] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [gameState, setGameState] = useState<any>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const newSocket = io()
    setSocket(newSocket)

    newSocket.on('connect', () => {
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      setConnected(false)
    })

    newSocket.on('roomCreated', (data) => {
      setRoomId(data.roomId)
      setGameState(data.gameState)
    })

    newSocket.on('roomJoined', (data) => {
      setRoomId(data.roomId)
      setGameState(data.gameState)
    })

    newSocket.on('gameUpdate', (data) => {
      setGameState(data.gameState)
    })

    newSocket.on('error', (error) => {
      console.error('Game error:', error)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const createRoom = () => {
    if (socket && playerName) {
      socket.emit('createRoom', { playerName, gameType: 'darkdesire' })
    }
  }

  const joinRoom = () => {
    if (socket && playerName && roomId) {
      socket.emit('joinRoom', { roomId, playerName })
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Game Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className={`inline-block px-3 py-1 rounded-full text-sm ${
          connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Player Setup</h2>
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4"
        />
        
        <div className="flex gap-4">
          <button
            onClick={createRoom}
            disabled={!connected || !playerName}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
          >
            Create Room
          </button>
          
          <input
            type="text"
            placeholder="Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded-lg"
          />
          
          <button
            onClick={joinRoom}
            disabled={!connected || !playerName || !roomId}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300"
          >
            Join Room
          </button>
        </div>
      </div>

      {gameState && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Game State</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(gameState, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}